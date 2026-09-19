import { prisma } from '@/lib/prisma';
import cronParser from 'cron-parser';
import { logger } from '@/lib/logger';
import { cleanupExpiredTokens } from '@/lib/cron/cleanup-tokens';

export const CronScheduler = {
  async tick() {
    const now = new Date();

    // 1. Run automatic background token cleanup
    try {
      await cleanupExpiredTokens();
    } catch (cleanupErr) {
      await logger.error('Scheduled token cleanup failed', {
        error: cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr),
      });
    }

    // 2. Evaluate scheduled jobs
    const dueJobs = await prisma.scheduledJob.findMany({
      where: {
        active: true,
        OR: [{ nextRunAt: { lte: now } }, { nextRunAt: null, runAt: { lte: now } }],
      },
      orderBy: { nextRunAt: 'asc' },
      take: 100,
    });
    let queuedCount = 0;
    for (const job of dueJobs) {
      try {
        const nextRunAt = job.cronExpression
          ? cronParser.parse(job.cronExpression, { currentDate: now, tz: 'UTC' }).next().toDate()
          : null;
        const scheduledAt = job.nextRunAt ?? job.runAt;
        if (!scheduledAt) continue;
        const queued = await prisma.$transaction(async (tx) => {
          // Compare-and-set the occurrence. A competing tick either wins or sees count=0.
          const claim = await tx.scheduledJob.updateMany({
            where: { id: job.id, active: true, nextRunAt: job.nextRunAt, runAt: job.runAt },
            data: { lastRunAt: now, nextRunAt, active: Boolean(job.cronExpression) },
          });
          if (claim.count !== 1) return false;
          const idempotencyKey = 'cron_' + job.id + '_' + scheduledAt.getTime();
          await tx.job.upsert({
            where: { idempotencyKey },
            update: {},
            create: {
              type: job.type,
              queue: 'system',
              priority: 'NORMAL',
              payload: job.payload ?? {},
              idempotencyKey,
            },
          });
          await tx.cronExecution.create({
            data: {
              scheduledJobId: job.id,
              status: 'SUCCESS',
              durationMs: Date.now() - now.getTime(),
            },
          });
          return true;
        });
        if (queued) queuedCount++;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Scheduling failed';
        await logger.error('Failed to evaluate scheduled job', { jobId: job.id });
        await prisma.cronExecution.create({
          data: { scheduledJobId: job.id, status: 'FAILED', errorMsg: message },
        });
      }
    }
    return queuedCount;
  },
};

