import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: System health check and readiness probe
 *     description: Returns the health status of the application. Supports shallow liveness (default) and deep readiness (?type=readiness) checking database and Redis connectivity.
 *     tags:
 *       - System
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [liveness, readiness]
 *         description: Check type (liveness returns 200 immediately, readiness validates downstream databases)
 *     responses:
 *       200:
 *         description: System is healthy and operational
 *       503:
 *         description: Service unavailable (database or dependency unreachable)
 */
export async function GET(req?: NextRequest | Request) {
  const checkType = req?.url ? new URL(req.url).searchParams.get('type') : null;


  if (checkType === 'readiness') {
    const startTime = performance.now();
    const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};
    let isHealthy = true;

    // 1. Check PostgreSQL via Prisma
    const dbStart = performance.now();
    try {
      await prisma.$queryRaw`SELECT 1 as healthy`;
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

    // 2. Check Redis if configured
    if (redis) {
      const redisStart = performance.now();
      try {
        await redis.ping();
        checks.redis = {
          status: 'healthy',
          latencyMs: Math.round(performance.now() - redisStart),
        };
      } catch (error) {
        checks.redis = {
          status: 'degraded',
          error: error instanceof Error ? error.message : 'Redis ping failed',
        };
      }
    } else {
      checks.redis = {
        status: 'not_configured',
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

  // Shallow liveness probe
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}

