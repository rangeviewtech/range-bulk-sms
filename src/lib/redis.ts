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
    if (redis) {
      try {
        if (ttlSeconds && ttlSeconds > 0) {
          await redis.set(key, value, { ex: ttlSeconds });
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
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
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
   * Cache-aside pattern: retrieves value from cache or executes fetcher and caches result.
   */
  async remember<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
    const fresh = await fetcher();
    if (fresh !== undefined) {
      await this.set(key, fresh, ttlSeconds);
    }
    return fresh;
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

