import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const requests = await prisma.apiRequest.findMany({
      where: {
        apiKey: { userId: session.userId },
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        statusCode: true,
        durationMs: true,
        createdAt: true,
      },
    });

    const dayMap: { [key: string]: { requests: number; success: number; errors: number; avgLatency: number; totalLatency: number } } = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      dayMap[label] = { requests: 0, success: 0, errors: 0, avgLatency: 0, totalLatency: 0 };
    }

    for (const r of requests) {
      const d = new Date(r.createdAt);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      if (dayMap[label]) {
        dayMap[label].requests += 1;
        if (r.statusCode >= 200 && r.statusCode < 400) {
          dayMap[label].success += 1;
        } else {
          dayMap[label].errors += 1;
        }
        if (r.durationMs) {
          dayMap[label].totalLatency += r.durationMs;
        }
      }
    }

    const usageData = Object.entries(dayMap).map(([day, stats]) => ({
      day,
      requests: stats.requests,
      success: stats.success,
      errors: stats.errors,
      avgLatency: stats.requests > 0 ? Math.round(stats.totalLatency / stats.requests) : 45,
    }));

    const totalRequests = requests.length;
    const totalErrors = requests.filter((r) => r.statusCode >= 400).length;
    const errorRate = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : '0.00';

    return NextResponse.json({
      metrics: {
        totalRequests,
        totalErrors,
        errorRate,
      },
      usageData,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
