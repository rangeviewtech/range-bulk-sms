import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

/**
 * Readiness probe: verifies that downstream critical services (DB, Redis) are healthy.
 * Returns 200 if ready to receive traffic, 503 if critical dependencies are down.
 */
export async function GET() {
  const startTime = performance.now();
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};
  let isHealthy = true;

  // 1. PostgreSQL check with 2500ms timeout
  const dbStart = performance.now();
  try {
    const dbPromise = prisma.$queryRaw`SELECT 1 as healthy`;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database ping timed out after 2500ms')), 2500)
    );

    await Promise.race([dbPromise, timeoutPromise]);
    checks.database = {
      status: 'healthy',
      latencyMs: Math.round(performance.now() - dbStart),
    };
  } catch (error) {
    isHealthy = false;
    checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database ping failed',
    };
  }

  // 2. Redis check if configured
  if (redis) {
    const redisStart = performance.now();
    try {
      const redisPromise = redis.ping();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis ping timed out after 2000ms')), 2000)
      );

      await Promise.race([redisPromise, timeoutPromise]);
      checks.redis = {
        status: 'healthy',
        latencyMs: Math.round(performance.now() - redisStart),
      };
    } catch (error) {
      // Degraded if Redis is unreachable (caching layer failure should not take down entire service if memory fallback exists)
      checks.redis = {
        status: 'degraded',
        error: error instanceof Error ? error.message : 'Redis ping failed',
      };
    }
  } else {
    checks.redis = {
      status: 'in_memory_fallback',
    };
  }

  const totalLatencyMs = Math.round(performance.now() - startTime);

  if (!isHealthy) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        latencyMs: totalLatencyMs,
        checks,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    latencyMs: totalLatencyMs,
    checks,
  });
}
