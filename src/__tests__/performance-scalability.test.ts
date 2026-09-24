import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redisCache, redisLock } from '@/lib/redis';
import { JobWorker } from '@/lib/queue/worker';
import { prisma } from '@/lib/prisma';

// Mock Prisma for JobWorker tests
vi.mock('@/lib/prisma', () => ({
  prisma: {
    job: {
      create: vi.fn(),
      createMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      groupBy: vi.fn(),
    },
  },
  prismaRead: {
    job: {
      groupBy: vi.fn(),
    },
  },
  JobPriority: {
    LOW: 'LOW',
    NORMAL: 'NORMAL',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
  },
}));

describe('Performance and Scalability Optimization Suite', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Clear test keys
    await redisCache.delByPattern('test:*');
  });

  describe('Cache-Aside Single-Flight Stampede Coalescing', () => {
    it('executes the underlying fetcher only once during concurrent requests for the same key', async () => {
      let fetchCount = 0;
      const fetcher = async () => {
        fetchCount++;
        // Simulate async I/O latency
        await new Promise((resolve) => setTimeout(resolve, 30));
        return { data: 'heavy-query-result', timestamp: Date.now() };
      };

      const key = 'test:single-flight-key';

      // Launch 10 concurrent requests at the exact same moment
      const concurrentRequests = Array.from({ length: 10 }).map(() =>
        redisCache.remember(key, 60, fetcher)
      );

      const results = await Promise.all(concurrentRequests);

      // Verify fetcher was executed exactly once
      expect(fetchCount).toBe(1);

      // Verify all 10 callers received the identical payload
      expect(results).toHaveLength(10);
      for (const res of results) {
        expect(res.data).toBe('heavy-query-result');
        expect(res.timestamp).toBe(results[0].timestamp);
      }

      // Subsequent call retrieves directly from cache
      const cachedResult = await redisCache.remember(key, 60, fetcher);
      expect(fetchCount).toBe(1);
      expect(cachedResult.data).toBe('heavy-query-result');
    });

    it('isolates errors so in-flight map is cleanly purged on failure', async () => {
      let callCount = 0;
      const failingFetcher = async () => {
        callCount++;
        await new Promise((resolve) => setTimeout(resolve, 10));
        throw new Error('Database connection failed');
      };

      const key = 'test:failing-flight-key';

      const calls = [
        redisCache.remember(key, 60, failingFetcher).catch((err: Error) => err.message),
        redisCache.remember(key, 60, failingFetcher).catch((err: Error) => err.message),
      ];

      const outcomes = await Promise.all(calls);
      expect(callCount).toBe(1);
      expect(outcomes[0]).toBe('Database connection failed');
      expect(outcomes[1]).toBe('Database connection failed');

      // Subsequent attempt should retry fetcher rather than hanging on old rejected promise
      const recoveryFetcher = async () => ({ status: 'recovered' });
      const recoveryResult = await redisCache.remember(key, 60, recoveryFetcher);
      expect(recoveryResult.status).toBe('recovered');
    });
  });

  describe('Wildcard Cache Invalidation (delByPattern)', () => {
    it('invalidates matching keys while preserving non-matching keys', async () => {
      await redisCache.set('test:reports:metrics:tenant-1', { count: 100 }, 60);
      await redisCache.set('test:reports:metrics:tenant-2', { count: 200 }, 60);
      await redisCache.set('test:users:profile:tenant-1', { name: 'Admin' }, 60);

      // Delete only the reports namespace
      const deletedCount = await redisCache.delByPattern('test:reports:metrics:*');
      expect(deletedCount).toBe(2);

      const report1 = await redisCache.get('test:reports:metrics:tenant-1');
      const report2 = await redisCache.get('test:reports:metrics:tenant-2');
      const userProfile = await redisCache.get('test:users:profile:tenant-1');

      expect(report1).toBeNull();
      expect(report2).toBeNull();
      expect(userProfile).toEqual({ name: 'Admin' });
    });
  });

  describe('Distributed Mutex (redisLock)', () => {
    it('acquires and releases locks safely with token ownership validation', async () => {
      const lockKey = 'test:export-job-lock';

      // 1. First worker acquires lock
      const lock1 = await redisLock.acquire(lockKey, 10);
      expect(lock1.acquired).toBe(true);
      expect(lock1.token).toBeTruthy();

      // 2. Second worker tries to acquire same lock simultaneously -> must be denied
      const lock2 = await redisLock.acquire(lockKey, 10);
      expect(lock2.acquired).toBe(false);
      expect(lock2.token).toBe('');

      // 3. Worker 2 attempts to release Worker 1's lock with invalid token -> fails
      const fraudRelease = await redisLock.release(lockKey, 'invalid-token-1234');
      expect(fraudRelease).toBe(false);

      // 4. Worker 1 releases with valid token -> succeeds
      const validRelease = await redisLock.release(lockKey, lock1.token);
      expect(validRelease).toBe(true);

      // 5. Worker 2 can now acquire the lock
      const lock3 = await redisLock.acquire(lockKey, 10);
      expect(lock3.acquired).toBe(true);
      await redisLock.release(lockKey, lock3.token);
    });
  });

  describe('Batch Queue Enqueueing (JobWorker.enqueueMany)', () => {
    it('handles empty job arrays efficiently without querying database', async () => {
      const result = await JobWorker.enqueueMany([]);
      expect(result).toEqual({ count: 0 });
      expect(prisma.job.createMany).not.toHaveBeenCalled();
    });

    it('batches multiple jobs into a single createMany operation with skipDuplicates', async () => {
      const mockResult = { count: 3 };
      vi.mocked(prisma.job.createMany).mockResolvedValueOnce(mockResult);

      const jobs = [
        { type: 'sms.dispatch', payload: { recipientId: 'r-1' }, queue: 'sms-high' },
        { type: 'sms.dispatch', payload: { recipientId: 'r-2' }, queue: 'sms-high' },
        { type: 'sms.dispatch', payload: { recipientId: 'r-3' }, queue: 'sms-high' },
      ];

      const result = await JobWorker.enqueueMany(jobs);

      expect(result).toEqual(mockResult);
      expect(prisma.job.createMany).toHaveBeenCalledTimes(1);
      expect(prisma.job.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ type: 'sms.dispatch', queue: 'sms-high' }),
        ]),
        skipDuplicates: true,
      });
    });
  });

  describe('Queue Observability Metrics (JobWorker.getQueueMetrics)', () => {
    it('queries queue backlog distribution by queue and status', async () => {
      const mockMetrics = [
        { queue: 'sms-high', status: 'PENDING', _count: { _all: 45 } },
        { queue: 'sms-dispatch', status: 'PROCESSING', _count: { _all: 12 } },
        { queue: 'webhooks', status: 'FAILED', _count: { _all: 3 } },
      ];

      vi.mocked(prisma.job.groupBy).mockResolvedValueOnce(mockMetrics);

      const metrics = await JobWorker.getQueueMetrics();

      expect(prisma.job.groupBy).toHaveBeenCalledWith({
        by: ['queue', 'status'],
        _count: { _all: true },
      });
      expect(metrics).toEqual(mockMetrics);
    });
  });
});
