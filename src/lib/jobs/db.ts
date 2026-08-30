import { prisma as db } from '@/lib/prisma';
import { Job, JobStatus, JobPriority, Prisma } from '@/generated/prisma';

export interface EnqueueJobParams {
  type: string;
  queue?: string;
  priority?: JobPriority;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  availableAt?: Date;
  idempotencyKey?: string;
  maxAttempts?: number;
}

export async function enqueueJob(data: EnqueueJobParams) {
  // If idempotency key is provided, we can use an upsert or check first to avoid throwing errors on unique constraint violation.
  if (data.idempotencyKey) {
    const existing = await db.job.findUnique({
      where: { idempotencyKey: data.idempotencyKey }
    });
    if (existing) return existing;
  }

  return db.job.create({
    data: {
      type: data.type,
      queue: data.queue || 'default',
      priority: data.priority || 'NORMAL',
      payload: data.payload || {},
      availableAt: data.availableAt || new Date(),
      idempotencyKey: data.idempotencyKey,
      maxAttempts: data.maxAttempts || 3,
    },
  });
}

/**
 * Safely claims jobs using a Postgres FOR UPDATE SKIP LOCKED query.
 * Prioritizes CRITICAL jobs first, then by availableAt.
 */
export async function claimJobs(workerId: string, limit: number = 10, queues: string[] = ['email-critical', 'email-default', 'email-bulk', 'sms-critical', 'sms-default', 'sms-bulk', 'system']): Promise<Job[]> {
  if (queues.length === 0) return [];
  
  const queueList = Prisma.join(queues, ',');
  
  const jobs = await db.$queryRaw<Job[]>`
    UPDATE "Job"
    SET status = 'PROCESSING'::"JobStatus", "lockedAt" = NOW(), "startedAt" = NOW(), "lockedBy" = ${workerId}
    WHERE id IN (
      SELECT id FROM "Job"
      WHERE status IN ('PENDING'::"JobStatus", 'RETRYING'::"JobStatus")
        AND "availableAt" <= NOW()
        AND ("lockedAt" IS NULL)
        AND queue IN (${queueList})
      ORDER BY
        CASE priority
          WHEN 'CRITICAL'::"JobPriority" THEN 1
          WHEN 'HIGH'::"JobPriority" THEN 2
          WHEN 'NORMAL'::"JobPriority" THEN 3
          WHEN 'LOW'::"JobPriority" THEN 4
          WHEN 'BULK'::"JobPriority" THEN 5
          ELSE 6
        END ASC,
        "availableAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${limit}
    )
    RETURNING *;
  `;
  return jobs;
}

export async function completeJob(id: string) {
  return db.job.update({
    where: { id },
    data: {
      status: 'SUCCEEDED',
      completedAt: new Date(),
      lockedAt: null,
      lockedBy: null,
    },
  });
}

export async function failJob(id: string, error: string, retryDelayMs: number = 5000) {
  const job = await db.job.findUnique({ where: { id } });
  if (!job) return null;

  const newAttempts = job.attempts + 1;
  const isDeadLetter = newAttempts >= job.maxAttempts;

  return db.job.update({
    where: { id },
    data: {
      attempts: newAttempts,
      lastError: error,
      status: isDeadLetter ? 'DEAD_LETTER' : 'RETRYING',
      failedAt: new Date(),
      lockedAt: null,
      lockedBy: null,
      availableAt: isDeadLetter ? job.availableAt : new Date(Date.now() + retryDelayMs),
    },
  });
}

/**
 * Find jobs that have been locked for too long (crashed worker) and release them back.
 */
export async function recoverStuckJobs(staleMinutes: number = 10) {
  const staleDate = new Date(Date.now() - staleMinutes * 60 * 1000);
  
  return db.job.updateMany({
    where: {
      status: 'PROCESSING',
      lockedAt: { lte: staleDate }
    },
    data: {
      status: 'RETRYING',
      lockedAt: null,
      lockedBy: null,
      lastError: 'Worker crashed or timed out (recovered)',
    }
  });
}
