import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiKey } from '@/lib/api-keys/service';
import { prisma } from '@/lib/prisma';

const periodSchema = z.enum(['24H', '7D', '30D', 'ALL']).default('7D');

export async function GET(req: NextRequest) {
  return withApiKey(req, '', async (_request, context) => {
    if (!context.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized context' }, { status: 401 });
    }

    const parsedPeriod = periodSchema.safeParse(
      req.nextUrl.searchParams.get('period') ?? undefined
    );
    if (!parsedPeriod.success) {
      return NextResponse.json(
        { success: false, error: 'Period must be 24H, 7D, 30D, or ALL.' },
        { status: 400 }
      );
    }

    try {
      const period = parsedPeriod.data;
      const now = new Date();
      const periodStart =
        period === '24H'
          ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
          : period === '7D'
            ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            : period === '30D'
              ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
              : undefined;
      const where = {
        message: {
          userId: context.userId,
          ...(periodStart ? { createdAt: { gte: periodStart, lte: now } } : {}),
        },
      };

      const [recipientCount, groupedStatuses, messageCount] = await Promise.all([
        prisma.messageRecipient.count({ where }),
        prisma.messageRecipient.groupBy({ by: ['status'], where, _count: { _all: true } }),
        prisma.message.count({
          where: {
            userId: context.userId,
            ...(periodStart ? { createdAt: { gte: periodStart, lte: now } } : {}),
          },
        }),
      ]);

      const counts = Object.fromEntries(
        groupedStatuses.map(({ status, _count }) => [status, _count._all])
      );
      const delivered = counts.DELIVERED || 0;
      const failed = (counts.FAILED || 0) + (counts.EXPIRED || 0) + (counts.REJECTED || 0);
      const inProgress = recipientCount - delivered - failed;
      const completed = delivered + failed;

      return NextResponse.json({
        success: true,
        period,
        generatedAt: now.toISOString(),
        summary: {
          broadcasts: messageCount,
          recipients: recipientCount,
          delivered,
          failed,
          inProgress,
          deliveryRate: completed > 0 ? Number(((delivered / completed) * 100).toFixed(1)) : null,
        },
      });
    } catch (error: unknown) {
      console.error('Report summary query failed', error);
      return NextResponse.json(
        { success: false, error: 'Unable to load report data.' },
        { status: 500 }
      );
    }
  });
}
