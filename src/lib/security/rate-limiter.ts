import { redis } from '@/lib/redis';
import { Ratelimit } from '@upstash/ratelimit';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Enterprise Rate Limiter supporting distributed Upstash Redis sliding windows.
 * Process-local fallback is limited to development and tests; production fails
 * closed when shared Redis is unavailable.
 */
export class RateLimiter {
  private static store = new Map<string, number[]>();
  private static upstashLimiters = new Map<string, Ratelimit>();
  private static readonly isProduction = process.env.NODE_ENV === 'production';

  /**
   * Check if a request is allowed based on the limit and window.
   * @param key Unique identifier (e.g. `api:key-123` or `ip:127.0.0.1`)
   * @param limit Max requests allowed in the window
   * @param windowSec Window size in seconds
   */
  static async check(key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
    if (redis) {
      try {
        const limiterKey = `${limit}:${windowSec}`;
        let limiter = this.upstashLimiters.get(limiterKey);
        if (!limiter) {
          limiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
            prefix: 'rl:token',
          });
          this.upstashLimiters.set(limiterKey, limiter);
        }

        const res = await limiter.limit(key);
        return {
          allowed: res.success,
          remaining: res.remaining,
          resetTime: res.reset,
        };
      } catch (err) {
        const errorName = err instanceof Error ? err.name : 'UnknownError';
        console.error(`[RateLimiter] Redis check failed (${errorName}).`);
        if (this.isProduction) {
          return { allowed: false, remaining: 0, resetTime: Date.now() + windowSec * 1000 };
        }
      }
    } else if (this.isProduction) {
      return { allowed: false, remaining: 0, resetTime: Date.now() + windowSec * 1000 };
    }

    // In-memory fallback
    const now = Date.now();
    const windowStart = now - windowSec * 1000;

    for (const [storedKey, timestamps] of this.store) {
      const active = timestamps.filter((time) => time > windowStart);
      if (active.length === 0) this.store.delete(storedKey);
      else if (active.length !== timestamps.length) this.store.set(storedKey, active);
    }

    if (!this.store.has(key) && this.store.size >= 10_000) {
      return { allowed: false, remaining: 0, resetTime: now + windowSec * 1000 };
    }

    let requests = this.store.get(key) || [];
    requests = requests.filter((time) => time > windowStart);

    const allowed = requests.length < limit;
    if (allowed) {
      requests.push(now);
    }
    this.store.set(key, requests);

    return {
      allowed,
      remaining: Math.max(0, limit - requests.length),
      resetTime: requests.length > 0 ? requests[0] + windowSec * 1000 : now + windowSec * 1000,
    };
  }

  static async reset(key: string): Promise<void> {
    this.store.delete(key);
    if (redis) {
      try {
        await redis.del(`rl:token:${key}`);
      } catch {
        // safe degradation
      }
    }
  }
}
