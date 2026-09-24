import { redis } from '@/lib/redis';
import { Ratelimit } from '@upstash/ratelimit';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Enterprise Rate Limiter supporting distributed Upstash Redis sliding windows
 * with in-memory fallback for local development or disconnected modes.
 */
export class RateLimiter {
  private static store = new Map<string, number[]>();
  private static upstashLimiters = new Map<string, Ratelimit>();

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
        console.warn('Upstash rate limiter error, falling back to local window:', err);
      }
    }

    // In-memory fallback
    const now = Date.now();
    const windowStart = now - windowSec * 1000;

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
