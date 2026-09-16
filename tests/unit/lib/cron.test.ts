// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CronScheduler } from '@/lib/cron/scheduler';
import { prismaMock } from '../prismaMock';
import type { ScheduledJob } from '@/generated/prisma';
const now = new Date('2026-09-07T12:00:00Z');
const job: ScheduledJob = {
  id: 'job-1',
  name: 'test',
  cronExpression: '* * * * *',
  runAt: null,
  type: 'send-in-app',
  payload: {},
  active: true,
  lastRunAt: null,
  nextRunAt: now,
  createdAt: now,
  updatedAt: now,
};
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  prismaMock.$transaction.mockImplementation(async (callback) =>
    typeof callback === 'function' ? callback(prismaMock) : Promise.all(callback)
  );
});
afterEach(() => vi.useRealTimers());
describe('CronScheduler', () => {
  it('atomically queues an occurrence using its scheduled timestamp', async () => {
    prismaMock.scheduledJob.findMany.mockResolvedValue([job]);
    prismaMock.scheduledJob.updateMany.mockResolvedValue({ count: 1 });
    expect(await CronScheduler.tick()).toBe(1);
    expect(prismaMock.job.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { idempotencyKey: 'cron_job-1_' + now.getTime() },
        create: expect.objectContaining({ type: 'send-in-app' }),
      })
    );
    expect(prismaMock.scheduledJob.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ nextRunAt: new Date('2026-09-07T12:01:00Z') }),
      })
    );
  });
  it('does not enqueue when another worker claimed the occurrence', async () => {
    prismaMock.scheduledJob.findMany.mockResolvedValue([job]);
    prismaMock.scheduledJob.updateMany.mockResolvedValue({ count: 0 });
    expect(await CronScheduler.tick()).toBe(0);
    expect(prismaMock.job.upsert).not.toHaveBeenCalled();
  });
  it('does nothing when no job is due', async () => {
    prismaMock.scheduledJob.findMany.mockResolvedValue([]);
    expect(await CronScheduler.tick()).toBe(0);
    expect(prismaMock.job.upsert).not.toHaveBeenCalled();
  });
});
