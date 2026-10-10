import { afterEach, describe, expect, it, vi } from 'vitest';

describe('Redis production dependency policy', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('fails closed for rate limits and distributed locks when Redis is not configured', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');

    const [{ checkRateLimit }, { RateLimiter }, { redisLock }] = await Promise.all([
      import('@/lib/security/rate-limit'),
      import('@/lib/security/rate-limiter'),
      import('@/lib/redis'),
    ]);

    expect((await checkRateLimit('auth', 'test-user')).success).toBe(false);
    expect((await RateLimiter.check('api:test-key', 100, 60)).allowed).toBe(false);
    expect(await redisLock.acquire('worker:test', 30)).toEqual({ acquired: false, token: '' });
  });
});
