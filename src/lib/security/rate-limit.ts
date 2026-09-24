import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';

export const authRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '15 m'), prefix: 'ratelimit:auth' })
  : null;
export const apiRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '1 m'), prefix: 'ratelimit:api' })
  : null;
const localWindows = new Map<string, { count: number; reset: number }>();

export async function checkRateLimit(type: 'auth' | 'api', identifier: string) {
  const isProd = process.env.NODE_ENV === 'production';
  const limit = type === 'auth' ? 5 : (isProd ? 100 : 500);
  const duration = type === 'auth' ? 900_000 : 60_000;
  const now = Date.now();
  const limiter = type === 'auth' ? authRateLimit : apiRateLimit;
  if (limiter) {
    try {
      return await limiter.limit(identifier);
    } catch {
      if (process.env.NODE_ENV === 'production') {
        return { success: false, limit, remaining: 0, reset: now + duration };
      }
      // In development fallback to localWindows below
    }
  }
  // Production requires distributed enforcement; never substitute a dummy Redis client.
  if (process.env.NODE_ENV === 'production')
    return { success: false, limit, remaining: 0, reset: now + duration };
  for (const [key, value] of localWindows) if (value.reset <= now) localWindows.delete(key);
  const key = type + ':' + identifier;
  const current = localWindows.get(key) ?? { count: 0, reset: now + duration };
  if (!localWindows.has(key) && localWindows.size >= 10_000)
    return { success: false, limit, remaining: 0, reset: now + duration };
  current.count++;
  localWindows.set(key, current);
  return {
    success: current.count <= limit,
    limit,
    remaining: Math.max(0, limit - current.count),
    reset: current.reset,
  };
}

export async function resetRateLimits(identifier?: string) {
  if (identifier) {
    localWindows.delete(`auth:${identifier}`);
    localWindows.delete(`api:${identifier}`);
  } else {
    localWindows.clear();
  }

  if (redis) {
    try {
      if (identifier) {
        await redis.del(`ratelimit:auth:${identifier}`);
        await redis.del(`ratelimit:api:${identifier}`);
      } else {
        const keys = await redis.keys('ratelimit:*');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      }
    } catch {
      // Ignore redis error in reset
    }
  }
}
