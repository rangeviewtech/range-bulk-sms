/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from 'vitest';
import { redisCache, redisLock } from '@/lib/redis';

describe('Redis Cache & Distributed Lock Engine', () => {
  describe('redisCache', () => {
    it('stores and retrieves cached data', async () => {
      await redisCache.set('test:key:1', { foo: 'bar', count: 42 }, 60);
      const data = await redisCache.get<{ foo: string; count: number }>('test:key:1');
      expect(data).toEqual({ foo: 'bar', count: 42 });
    });

    it('returns null for non-existent or expired keys', async () => {
      const data = await redisCache.get('test:key:missing');
      expect(data).toBeNull();
    });

    it('deletes cached keys on demand', async () => {
      await redisCache.set('test:key:to-delete', 'active-val', 60);
      expect(await redisCache.get('test:key:to-delete')).toBe('active-val');

      await redisCache.del('test:key:to-delete');
      expect(await redisCache.get('test:key:to-delete')).toBeNull();
    });

    it('executes remember cache-aside pattern once and returns cached value on subsequent calls', async () => {
      const fetcher = vi.fn().mockResolvedValue({ pricing: [45, 50, 60] });

      // First call: executes fetcher
      const result1 = await redisCache.remember('pricing:cache:test', 60, fetcher);
      expect(result1).toEqual({ pricing: [45, 50, 60] });
      expect(fetcher).toHaveBeenCalledTimes(1);

      // Second call: reads directly from cache, does not execute fetcher
      const result2 = await redisCache.remember('pricing:cache:test', 60, fetcher);
      expect(result2).toEqual({ pricing: [45, 50, 60] });
      expect(fetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('redisLock', () => {
    it('acquires a distributed lock with a unique token', async () => {
      const lock = await redisLock.acquire('sms:dispatch:123', 30);
      expect(lock.acquired).toBe(true);
      expect(lock.token).toBeDefined();
      expect(lock.token.length).toBeGreaterThan(10);

      // Clean up
      await redisLock.release('sms:dispatch:123', lock.token);
    });

    it('prevents concurrent acquisition while locked', async () => {
      const lock1 = await redisLock.acquire('sms:dispatch:exclusive', 30);
      expect(lock1.acquired).toBe(true);

      // Second attempt should fail
      const lock2 = await redisLock.acquire('sms:dispatch:exclusive', 30);
      expect(lock2.acquired).toBe(false);
      expect(lock2.token).toBe('');

      // Release first lock
      const released = await redisLock.release('sms:dispatch:exclusive', lock1.token);
      expect(released).toBe(true);

      // Now third attempt can acquire
      const lock3 = await redisLock.acquire('sms:dispatch:exclusive', 30);
      expect(lock3.acquired).toBe(true);

      await redisLock.release('sms:dispatch:exclusive', lock3.token);
    });

    it('rejects release if token does not match', async () => {
      const lock = await redisLock.acquire('sms:dispatch:token-check', 30);
      expect(lock.acquired).toBe(true);

      // Try release with wrong token
      const wrongRelease = await redisLock.release('sms:dispatch:token-check', 'wrong-token-xyz');
      expect(wrongRelease).toBe(false);

      // Lock should still be held
      const retry = await redisLock.acquire('sms:dispatch:token-check', 30);
      expect(retry.acquired).toBe(false);

      // Correct release
      await redisLock.release('sms:dispatch:token-check', lock.token);
    });
  });
});
