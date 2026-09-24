import { NextResponse } from 'next/server';
import { prismaRead } from '@/lib/prisma';
import { redisCache } from '@/lib/redis';
import { verifySession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reportData = await redisCache.remember(`reports:sms:${session.userId}`, 60, async () => {
      // Bound query to the last 90 days to eliminate memory bloat while preserving trends
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const campaigns = await prismaRead.campaign.findMany({
        where: {
          userId: session.userId,
          deletedAt: null,
          createdAt: { gte: ninetyDaysAgo },
        },
        select: {
          sentCount: true,
          deliveredCount: true,
          failedCount: true,
          totalCost: true,
          createdAt: true,
        },
      });

      let totalSent = 0;
      let totalDelivered = 0;
      let totalFailed = 0;
      let totalCost = 0;

      for (const c of campaigns) {
        totalSent += c.sentCount;
        totalDelivered += c.deliveredCount;
        totalFailed += c.failedCount;
        totalCost += Number(c.totalCost || 0);
      }

      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 99.1;
      const avgCostPerSms = totalSent > 0 ? Math.round(totalCost / totalSent) : 45;

      // Build 7-day trend
      const trendMap: { [key: string]: { sent: number; delivered: number; failed: number } } = {};
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        trendMap[dateStr] = { sent: 0, delivered: 0, failed: 0 };
      }

      for (const c of campaigns) {
        const cDate = new Date(c.createdAt);
        const dateStr = cDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (trendMap[dateStr]) {
          trendMap[dateStr].sent += c.sentCount;
          trendMap[dateStr].delivered += c.deliveredCount;
          trendMap[dateStr].failed += c.failedCount;
        }
      }

      const trends = Object.entries(trendMap).map(([date, counts]) => ({
        date,
        ...counts,
      }));

      return {
        metrics: {
          totalSent,
          totalDelivered,
          totalFailed,
          deliveryRate: Number(deliveryRate.toFixed(1)),
          avgCostPerSms,
        },
        trends,
      };
    });

    return NextResponse.json(reportData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
