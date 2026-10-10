import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';

export const authRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '15 m'), prefix: 'ratelimit:auth' })
  : null;
export const apiRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '1 m'), prefix: 'ratelimit:api' })
  : null;
const localWindows = new Map<string, { count: number; reset: number }>();
const isProduction = process.env.NODE_ENV === 'production';

export async function checkRateLimit(type: 'auth' | 'api', identifier: string) {
  const isProd = process.env.NODE_ENV === 'production';
  const limit = type === 'auth' ? 5 : (isProd ? 100 : 500);
  const duration = type === 'auth' ? 900_000 : 60_000;
  const now = Date.now();
  const limiter = type === 'auth' ? authRateLimit : apiRateLimit;
  if (limiter) {
    try {
      return await limiter.limit(identifier);
    } catch (err) {
      const errorName = err instanceof Error ? err.name : 'UnknownError';
      console.error(`[RateLimit] Redis check failed (${errorName}).`);
      if (isProduction) {
        return { success: false, limit: type === 'auth' ? 5 : 100, remaining: 0, reset: Date.now() + duration };
      }
    }
  } else if (isProduction) {
    // A per-process limit is bypassable across instances and is not a safe
    // substitute for the shared production abuse controls.
    return { success: false, limit: type === 'auth' ? 5 : 100, remaining: 0, reset: now + duration };
  }

  // Graceful fallback to local in-memory sliding window
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
      const patterns = identifier
        ? [`ratelimit:auth:${identifier}*`, `ratelimit:api:${identifier}*`]
        : ['ratelimit:auth*', 'ratelimit:api*'];
      for (const pattern of patterns) {
        let cursor = '0';
        do {
          const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 });
          cursor = String(nextCursor);
          if (keys.length > 0) await redis.del(...keys);
        }
        while (cursor !== '0');
      }
    } catch {
      // Reset is best-effort and does not weaken the live rate limiter.
    }
  }
}
