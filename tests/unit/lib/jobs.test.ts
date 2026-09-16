// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processJobsBatch } from '@/lib/jobs/processor';
import { prismaMock } from '../prismaMock';
import { SmtpProvider } from '@/lib/providers/smtp';
import type { Job } from '@/generated/prisma';
vi.mock('@/lib/providers/smtp', () => ({
  SmtpProvider: { send: vi.fn().mockResolvedValue({ success: true }) },
}));
vi.mock('@/lib/notifications/templates', () => ({
  NotificationTemplateService: {
    resolveTemplate: vi.fn().mockResolvedValue({ subject: 'Welcome', body: 'Welcome' }),
  },
}));
const now = new Date();
const job: Job = {
  id: 'j1',
  type: 'send-email',
  queue: 'email-default',
  priority: 'NORMAL',
  status: 'PROCESSING',
  payload: { recipient: 'user@example.com', template: 'auth.welcome' },
  attempts: 0,
  maxAttempts: 3,
  availableAt: now,
  startedAt: now,
  completedAt: null,
  failedAt: null,
  lockedAt: now,
  lockedBy: 'worker',
  lastError: null,
  idempotencyKey: null,
  createdAt: now,
  updatedAt: now,
};

describe('Job processor', () => {
  beforeEach(() => {
    prismaMock.job.updateMany.mockResolvedValue({ count: 1 });
    vi.mocked(SmtpProvider.send).mockReset().mockResolvedValue({ success: true, messageId: 'm1' });
  });
  it('does not send a job after losing its lease', async () => {
    prismaMock.$queryRaw.mockResolvedValue([job]);
    prismaMock.job.updateMany.mockResolvedValue({ count: 0 });
    await processJobsBatch();
    expect(SmtpProvider.send).not.toHaveBeenCalled();
  });
  it('completes a delivered job and releases its lease', async () => {
    prismaMock.$queryRaw.mockResolvedValue([job]);
    expect(await processJobsBatch()).toBe(1);
    expect(prismaMock.job.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'j1', lockedBy: expect.any(String) }),
        data: expect.objectContaining({ status: 'SUCCEEDED', lockedAt: null, lockedBy: null }),
      })
    );
  });
  it('retries delivery failures and dead-letters exhausted jobs', async () => {
    vi.mocked(SmtpProvider.send).mockRejectedValue(new Error('Delivery failed'));
    prismaMock.$queryRaw.mockResolvedValue([job, { ...job, id: 'j2', attempts: 2 }]);
    await processJobsBatch();
    expect(prismaMock.job.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'j1' }),
        data: expect.objectContaining({ status: 'RETRYING' }),
      })
    );
    expect(prismaMock.job.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'j2' }),
        data: expect.objectContaining({ status: 'DEAD_LETTER' }),
      })
    );
  });
  it('never reports unsupported jobs as successful', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ ...job, type: 'unknown', attempts: 2 }]);
    await processJobsBatch();
    expect(prismaMock.job.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'DEAD_LETTER',
          lastError: 'Unsupported job type: unknown',
        }),
      })
    );
  });
});
