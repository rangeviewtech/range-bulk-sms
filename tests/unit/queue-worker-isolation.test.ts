// @vitest-environment node
import { expect, it, vi } from 'vitest';
import { prismaMock } from './prismaMock';
import { JobWorker } from '@/lib/queue/worker';

vi.mock('@/lib/redis', () => ({
  redisLock: {
    acquire: vi.fn().mockResolvedValue({ acquired: true, token: 'test-lock' }),
    release: vi.fn().mockResolvedValue(true),
  },
}));
vi.mock('@/lib/sms/circuit-breaker', () => ({
  ProviderCircuitBreaker: { isGloballyHalted: vi.fn().mockResolvedValue(false) },
}));
vi.mock('@/lib/queue/handlers/campaign-expander', () => ({ expandCampaignHandler: vi.fn() }));
vi.mock('@/lib/queue/handlers/sms-dispatcher', () => ({ dispatchSmsHandler: vi.fn() }));
vi.mock('@/lib/queue/handlers/webhook-dispatcher', () => ({ WebhookDispatcher: { handle: vi.fn() } }));

it('limits campaign worker claims and recovery to its registered job types', async () => {
  prismaMock.job.updateMany.mockResolvedValue({ count: 0 });
  prismaMock.job.findMany.mockResolvedValue([]);

  expect(await JobWorker.processQueue(10)).toEqual([]);
  const typeFilter = { in: ['campaign.expand', 'sms.dispatch', 'webhook.dispatch'] };
  expect(prismaMock.job.findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({ type: typeFilter }),
  }));
  expect(prismaMock.job.updateMany).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({ status: 'PROCESSING', type: typeFilter }),
    data: expect.objectContaining({ lockedAt: null, lockedBy: null }),
  }));
});
