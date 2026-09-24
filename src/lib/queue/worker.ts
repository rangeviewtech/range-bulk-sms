import { prisma } from "@/lib/prisma";
import { JobPriority } from "@/lib/prisma";
import { redisLock } from "@/lib/redis";
import { expandCampaignHandler } from "./handlers/campaign-expander";
import { dispatchSmsHandler } from "./handlers/sms-dispatcher";
import { WebhookDispatcher } from "./handlers/webhook-dispatcher";
import { ProviderCircuitBreaker } from "@/lib/sms/circuit-breaker";

type JobHandler = (payload: Record<string, unknown>, jobId: string) => Promise<void>;

const handlers: Record<string, JobHandler> = {
  "campaign.expand": expandCampaignHandler,
  "sms.dispatch": dispatchSmsHandler,
  "webhook.dispatch": async (payload, jobId) => await WebhookDispatcher.handle({ id: jobId, payload }),
};

export class JobWorker {
  /**
   * Enqueues a new job into the database.
   */
  static async enqueue(
    type: string,
    payload: Record<string, unknown>,
    options?: {
      queue?: string;
      priority?: JobPriority;
      availableAt?: Date;
      idempotencyKey?: string;
    }
  ) {
    if (options?.idempotencyKey) {
      const existing = await prisma.job.findUnique({
        where: { idempotencyKey: options.idempotencyKey },
      });
      if (existing) return existing;
    }

    return await prisma.job.create({
      data: {
        type,
        payload: payload as import('@/lib/prisma').Prisma.InputJsonValue,
        queue: options?.queue ?? "default",
        priority: options?.priority ?? "NORMAL",
        availableAt: options?.availableAt ?? new Date(),
        idempotencyKey: options?.idempotencyKey,
      },
    });
  }

  /**
   * Enqueues multiple jobs in a single batched database transaction.
   * Eliminates loop N+1 query overhead for bulk campaign expansion.
   */
  static async enqueueMany(
    jobs: Array<{
      type: string;
      payload: Record<string, unknown>;
      queue?: string;
      priority?: JobPriority;
      availableAt?: Date;
      idempotencyKey?: string;
    }>
  ) {
    if (jobs.length === 0) return { count: 0 };
    return await prisma.job.createMany({
      data: jobs.map((j) => ({
        type: j.type,
        payload: j.payload as import('@/lib/prisma').Prisma.InputJsonValue,
        queue: j.queue ?? 'default',
        priority: j.priority ?? 'NORMAL',
        availableAt: j.availableAt ?? new Date(),
        idempotencyKey: j.idempotencyKey,
      })),
      skipDuplicates: true,
    });
  }

  /**
   * Sweeps and recovers stale/crashed jobs whose worker lock expired.
   * Ensures zero dropped jobs even if a worker process terminates abruptly.
   */
  static async recoverStaleJobs(leaseTimeoutMs: number = 180000): Promise<number> {
    const cutoff = new Date(Date.now() - leaseTimeoutMs);

    const staleJobs = await prisma.job.updateMany({
      where: {
        status: "PROCESSING",
        lockedAt: { lte: cutoff },
      },
      data: {
        status: "RETRYING",
        lockedAt: null,
        lastError: "Worker lease expired. Automatically recovered by lease sweeper.",
        availableAt: new Date(),
      },
    });

    if (staleJobs.count > 0) {
      console.warn(`[JOB_WORKER] Recovered ${staleJobs.count} orphaned/crashed job(s).`);
    }

    return staleJobs.count;
  }

  /**
   * Returns current queue backlog and status distribution for observability.
   */
  static async getQueueMetrics() {
    return await prisma.job.groupBy({
      by: ['queue', 'status'],
      _count: { _all: true },
    });
  }

  /**
   * Manually replays a dead-letter job after root cause resolution.
   */
  static async replayDeadLetterJob(jobId: string): Promise<boolean> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.status !== "FAILED") {
      return false;
    }

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "PENDING",
        attempts: 0,
        availableAt: new Date(),
        failedAt: null,
        lockedAt: null,
        lastError: `Replayed by operator on ${new Date().toISOString()}`,
      },
    });

    return true;
  }

  /**
   * Polls the queue for a batch of jobs and processes them with:
   * 1. Global emergency shutdown check.
   * 2. Stale worker crash recovery.
   * 3. Tenant fairness interleaving.
   * 4. Multi-node per-queue distributed Redis locking with local fallback.
   * 5. Bounded concurrent batch processing.
   */
  static async processQueue(
    optionsOrBatchSize: number | { batchSize?: number; queue?: string; concurrency?: number } = 10
  ) {
    const batchSize = typeof optionsOrBatchSize === 'number' ? optionsOrBatchSize : (optionsOrBatchSize.batchSize ?? 10);
    const targetQueue = typeof optionsOrBatchSize === 'object' ? optionsOrBatchSize.queue : undefined;
    const concurrency = typeof optionsOrBatchSize === 'object' ? Math.min(Math.max(1, optionsOrBatchSize.concurrency ?? 5), 20) : 5;

    if (ProviderCircuitBreaker.isGloballyHalted()) {
      return [{ id: "global-halt", status: "SKIPPED", reason: "Global emergency dispatch halt is engaged." }];
    }

    // 1. Acquire per-queue distributed lock (prevents cross-queue worker starvation)
    const lockKey = targetQueue ? `worker:processQueue:${targetQueue}` : 'worker:processQueue:all';
    const lock = await redisLock.acquire(lockKey, 60);
    if (!lock.acquired) {
      return [{ id: 'worker-lock', status: 'SKIPPED', reason: `Lock currently held for ${lockKey}` }];
    }

    try {
      // 2. Recover any crashed/orphaned jobs before polling
      await this.recoverStaleJobs();

      // 3. Find jobs that are PENDING or RETRYING and available to run
      const whereCondition: import('@/lib/prisma').Prisma.JobWhereInput = {
        status: { in: ["PENDING", "RETRYING"] },
        availableAt: { lte: new Date() },
      };
      if (targetQueue) {
        whereCondition.queue = targetQueue;
      }

      const rawJobs = await prisma.job.findMany({
        where: whereCondition,
        orderBy: [
          { priority: "asc" },
          { availableAt: "asc" },
        ],
        take: batchSize * 2, // Fetch double to permit tenant-fair round-robin
      });

      // 4. Tenant Fairness Interleaving:
      // Prevent a single tenant with 50,000 jobs from starving other tenants
      const tenantBuckets = new Map<string, typeof rawJobs>();
      for (const job of rawJobs) {
        const payload = (job.payload as Record<string, unknown>) || {};
        const tenantKey = (payload.userId as string) || (payload.tenantId as string) || job.queue || "global";
        if (!tenantBuckets.has(tenantKey)) {
          tenantBuckets.set(tenantKey, []);
        }
        tenantBuckets.get(tenantKey)!.push(job);
      }

      const jobs: typeof rawJobs = [];
      const bucketIterators = Array.from(tenantBuckets.values());
      let index = 0;
      while (jobs.length < batchSize && bucketIterators.some((b) => b.length > index)) {
        for (const bucket of bucketIterators) {
          if (bucket[index] && jobs.length < batchSize) {
            jobs.push(bucket[index]);
          }
        }
        index++;
      }

      const results: Array<{ id: string; status: string }> = [];

      // 5. Bounded concurrent execution within the batch (concurrency chunking)
      for (let i = 0; i < jobs.length; i += concurrency) {
        const chunk = jobs.slice(i, i + concurrency);
        const chunkResults = await Promise.all(
          chunk.map(async (job) => {
            // Atomic job claiming with worker lock stamp
            const lockedJob = await prisma.job.update({
              where: { id: job.id, status: job.status }, // Optimistic concurrency check
              data: {
                status: "PROCESSING",
                startedAt: new Date(),
                lockedAt: new Date(),
                attempts: { increment: 1 },
              },
            }).catch(() => null);

            if (!lockedJob) return { id: job.id, status: "SKIPPED_CLAIM" };

            try {
              const handler = handlers[lockedJob.type];
              if (!handler) {
                throw new Error(`No handler registered for job type: ${lockedJob.type}`);
              }

              // Execute the handler
              await handler(lockedJob.payload as Record<string, unknown>, lockedJob.id);

              // Mark as Succeeded
              await prisma.job.update({
                where: { id: lockedJob.id },
                data: {
                  status: "SUCCEEDED",
                  completedAt: new Date(),
                  lockedAt: null,
                },
              });
              return { id: lockedJob.id, status: "SUCCEEDED" };
            } catch (error) {
              console.error(`[JOB_WORKER] Job ${lockedJob.id} failed:`, error);

              // Exponential Backoff Retries or Dead-Letter
              const maxAttempts = lockedJob.maxAttempts;
              const attempts = lockedJob.attempts;
              const isDead = attempts >= maxAttempts;

              await prisma.job.update({
                where: { id: lockedJob.id },
                data: {
                  status: isDead ? "FAILED" : "RETRYING",
                  failedAt: isDead ? new Date() : null,
                  lockedAt: null,
                  lastError: error instanceof Error ? error.message : String(error),
                  // Exponential backoff: 1min, 5min, 25min
                  availableAt: isDead ? undefined : new Date(Date.now() + Math.pow(5, Math.min(attempts, 3)) * 60000),
                },
              });
              return { id: lockedJob.id, status: isDead ? "DEAD_LETTER" : "RETRYING" };
            }
          })
        );

        results.push(...chunkResults);
      }

      return results;
    } finally {
      await redisLock.release(lockKey, lock.token);
    }
  }
}
