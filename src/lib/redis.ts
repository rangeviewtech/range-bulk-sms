import { Redis } from '@upstash/redis';
import crypto from 'crypto';

export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// In-memory fallback for local development or testing when Upstash credentials are not set
interface MemoryCacheItem {
  value: unknown;
  expiresAt: number | null;
}

const memoryCache = new Map<string, MemoryCacheItem>();
const memoryLocks = new Map<string, { token: string; expiresAt: number }>();

function pruneMemory() {
  const now = Date.now();
  for (const [k, v] of memoryCache.entries()) {
    if (v.expiresAt !== null && v.expiresAt <= now) {
      memoryCache.delete(k);
    }
  }
  for (const [k, v] of memoryLocks.entries()) {
    if (v.expiresAt <= now) {
      memoryLocks.delete(k);
    }
  }
}

// Single-flight in-flight promise coalescing to eliminate cache stampedes
const inFlightRequests = new Map<string, Promise<unknown>>();

/**
 * Enterprise Cache-Aside Manager
 */
export const redisCache = {
  async get<T>(key: string): Promise<T | null> {
    if (redis) {
      try {
        const data = await redis.get<T>(key);
        return data ?? null;
      } catch (err) {
        console.warn('Redis Cache GET failed, falling back to memory:', err);
      }
    }
    pruneMemory();
    const item = memoryCache.get(key);
    if (!item) return null;
    if (item.expiresAt !== null && item.expiresAt <= Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return item.value as T;
  },

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    // Apply jitter (+/- 8%) to TTLs > 10s to prevent synchronized expiration stampedes
    let effectiveTtl = ttlSeconds;
    if (ttlSeconds && ttlSeconds > 10) {
      const jitterFraction = (Math.random() * 0.16) - 0.08;
      effectiveTtl = Math.max(1, Math.round(ttlSeconds * (1 + jitterFraction)));
    }

    if (redis) {
      try {
        if (effectiveTtl && effectiveTtl > 0) {
          await redis.set(key, value, { ex: effectiveTtl });
        } else {
          await redis.set(key, value);
        }
        return;
      } catch (err) {
        console.warn('Redis Cache SET failed, falling back to memory:', err);
      }
    }
    pruneMemory();
    if (memoryCache.size >= 10_000) {
      const firstKey = memoryCache.keys().next().value;
      if (firstKey) memoryCache.delete(firstKey);
    }
    memoryCache.set(key, {
      value,
      expiresAt: effectiveTtl ? Date.now() + effectiveTtl * 1000 : null,
    });
  },

  async del(key: string): Promise<void> {
    if (redis) {
      try {
        await redis.del(key);
      } catch (err) {
        console.warn('Redis Cache DEL failed:', err);
      }
    }
    memoryCache.delete(key);
  },

  /**
   * Invalidates multiple cache keys by wildcard/prefix pattern.
   * Example: delByPattern('reports:sms:*')
   */
  async delByPattern(pattern: string): Promise<number> {
    let deletedCount = 0;

    // Convert glob pattern to regex for in-memory deletion
    const regexPattern = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    for (const k of Array.from(memoryCache.keys())) {
      if (regexPattern.test(k)) {
        memoryCache.delete(k);
        deletedCount++;
      }
    }

    if (redis) {
      try {
        const keys = await redis.keys(pattern);
        if (keys && keys.length > 0) {
          await redis.del(...keys);
          deletedCount = Math.max(deletedCount, keys.length);
        }
      } catch (err) {
        console.warn('Redis Cache delByPattern failed:', err);
      }
    }

    return deletedCount;
  },

  /**
   * Cache-aside pattern with Single-Flight Stampede Coalescing.
   * Guarantees that concurrent requests for the same expired or missing key
   * trigger only a single fetcher execution, sharing the result.
   */
  async remember<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    // If an identical fetch is currently in-flight, coalesce with it
    if (inFlightRequests.has(key)) {
      return inFlightRequests.get(key) as Promise<T>;
    }

    const flight = (async () => {
      try {
        // Double-check cache in case another flight just finished
        const check = await this.get<T>(key);
        if (check !== null && check !== undefined) {
          return check;
        }

        const fresh = await fetcher();
        if (fresh !== undefined) {
          await this.set(key, fresh, ttlSeconds);
        }
        return fresh;
      } finally {
        inFlightRequests.delete(key);
      }
    })();

    inFlightRequests.set(key, flight);
    return flight;
  },
};

/**
 * Distributed Lock (Mutex) Manager
 */
export const redisLock = {
  /**
   * Acquire a lock using atomic SET NX EX.
   */
  async acquire(
    lockKey: string,
    ttlSeconds: number = 30
  ): Promise<{ acquired: boolean; token: string }> {
    const token = crypto.randomUUID();
    const fullKey = `lock:${lockKey}`;

    if (redis) {
      try {
        // Upstash redis supports set options: { nx: true, ex: ttlSeconds }
        const result = await redis.set(fullKey, token, { nx: true, ex: ttlSeconds });
        return {
          acquired: result === 'OK',
          token,
        };
      } catch (err) {
        console.warn('Redis Lock acquire failed, falling back to memory:', err);
      }
    }

    pruneMemory();
    const now = Date.now();
    const existing = memoryLocks.get(fullKey);
    if (existing && existing.expiresAt > now) {
      return { acquired: false, token: '' };
    }

    memoryLocks.set(fullKey, {
      token,
      expiresAt: now + ttlSeconds * 1000,
    });

    return { acquired: true, token };
  },

  /**
   * Safe release ensuring only the owner holding the matching token can release the lock.
   */
  async release(lockKey: string, token: string): Promise<boolean> {
    const fullKey = `lock:${lockKey}`;

    if (redis) {
      try {
        const script = `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
          else
            return 0
          end
        `;
        const result = await redis.eval(script, [fullKey], [token]);
        return result === 1;
      } catch (err) {
        console.warn('Redis Lock release failed, falling back to memory:', err);
      }
    }

    const current = memoryLocks.get(fullKey);
    if (current && current.token === token) {
      memoryLocks.delete(fullKey);
      return true;
    }
    return false;
  },
};

