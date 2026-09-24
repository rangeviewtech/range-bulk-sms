import { NextRequest, NextResponse } from 'next/server';
import { prismaRead, MessageStatus } from '@/lib/prisma';
import { redisCache } from '@/lib/redis';
import { requireAuth } from '@/lib/auth/session';
import { detectCarrier } from '@/lib/sms/normalizer';
import { AppError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const rawLimit = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Math.min(100, Math.max(1, isNaN(rawLimit) ? 50 : rawLimit));
    const statusParam = searchParams.get('status');
    const search = searchParams.get('search')?.trim();

    const skip = (page - 1) * limit;

    const whereClause: import('@/lib/prisma').Prisma.MessageRecipientWhereInput = {
      message: {
        userId: session.userId,
      },
    };

    if (statusParam && statusParam !== 'ALL') {
      whereClause.status = statusParam as MessageStatus;
    }

    if (search) {
      whereClause.OR = [
        { phone: { contains: search } },
        { message: { message: { contains: search, mode: 'insensitive' } } },
        { message: { campaign: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    // Retrieve paginated records from read replica and cached aggregate counts
    const [recipients, metrics] = await Promise.all([
      prismaRead.messageRecipient.findMany({
        where: whereClause,
        include: {
          message: {
            select: {
              message: true,
              segmentCount: true,
              campaign: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      redisCache.remember(`delivery-reports:metrics:${session.userId}`, 30, async () => {
        const [totalCount, deliveredCount, failedCount, pendingCount] = await Promise.all([
          prismaRead.messageRecipient.count({ where: { message: { userId: session.userId } } }),
          prismaRead.messageRecipient.count({ where: { message: { userId: session.userId }, status: 'DELIVERED' } }),
          prismaRead.messageRecipient.count({ where: { message: { userId: session.userId }, status: 'FAILED' } }),
          prismaRead.messageRecipient.count({
            where: {
              message: { userId: session.userId },
              status: { in: ['PENDING', 'SENT'] },
            },
          }),
        ]);
        return { totalCount, deliveredCount, failedCount, pendingCount };
      }),
    ]);

    const { totalCount, deliveredCount, failedCount, pendingCount } = metrics;

    const formatted = recipients.map((r) => {
      const segments = r.message?.segmentCount || 1;
      const cost = Number(r.cost) > 0 ? Number(r.cost) : segments * 35;
      const timeDate = r.deliveredAt || r.sentAt || r.createdAt;

      return {
        id: r.id,
        phone: r.phone,
        network: detectCarrier(r.phone),
        campaign: r.message?.campaign?.name || 'Direct SMS',
        status: (r.status === 'SENT' ? 'PENDING' : r.status) as 'DELIVERED' | 'FAILED' | 'PENDING',
        time: timeDate ? new Date(timeDate).toISOString().replace('T', ' ').substring(0, 19) : '-',
        cost,
        segments,
        failureReason: r.failureReason,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      metrics: {
        totalCount,
        deliveredCount,
        failedCount,
        pendingCount,
        successRate: totalCount > 0 ? Number(((deliveredCount / totalCount) * 100).toFixed(1)) : 100,
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
