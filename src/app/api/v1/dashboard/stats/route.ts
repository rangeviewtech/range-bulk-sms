import { NextRequest, NextResponse } from 'next/server';
import { withApiKey } from '@/lib/api-keys/service';
import { prisma } from '@/lib/prisma';
import { WalletService } from '@/lib/wallet/service';

export async function GET(req: NextRequest) {
  return withApiKey(req, 'dashboard.read', async (_request, context) => {
    try {
      if (!context.userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized context' }, { status: 401 });
      }

      const userId = context.userId;

      // 1. Fetch Message Statistics
      const [totalMessages, deliveredMessages, failedMessages, pendingMessages] = await Promise.all([
        prisma.message.count({ where: { userId } }),
        prisma.message.count({ where: { userId, status: 'DELIVERED' } }),
        prisma.message.count({ where: { userId, status: 'FAILED' } }),
        prisma.message.count({ where: { userId, status: { in: ['PENDING', 'QUEUED', 'SUBMITTED', 'SENT'] } } }),
      ]);

      // Calculate delivery rate
      const completedMessages = deliveredMessages + failedMessages;
      const deliveryRate = completedMessages > 0
        ? Number(((deliveredMessages / completedMessages) * 100).toFixed(1))
        : 100.0;

      // 2. Fetch Wallet Balance
      const wallet = await WalletService.getOrCreateWallet({ userId });
      const walletData = await WalletService.getBalance(wallet.id);

      // 3. Fetch Gateways Status
      const [onlineGateways, totalGateways] = await Promise.all([
        prisma.gateway.count({ where: { userId, status: 'ONLINE' } }),
        prisma.gateway.count({ where: { userId } }),
      ]);

      // 4. Fetch Recent Messages
      const recentMessages = await prisma.message.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          message: true,
          status: true,
          recipientCount: true,
          createdAt: true,
          senderId: {
            select: { senderId: true }
          }
        }
      });

      return NextResponse.json({
        success: true,
        stats: {
          totalMessages,
          deliveredMessages,
          failedMessages,
          pendingMessages,
          deliveryRate,
          balance: Number(walletData.balance),
          smsCredits: walletData.smsCredits,
          currency: walletData.currency,
          onlineGateways,
          totalGateways,
        },
        recentActivity: recentMessages.map((m) => ({
          id: m.id,
          recipient: `${m.recipientCount} recipient(s)`,
          message: m.message.length > 50 ? `${m.message.slice(0, 50)}...` : m.message,
          status: m.status,
          sender: m.senderId?.senderId || 'RANGE_SMS',
          date: m.createdAt.toISOString(),
        }))
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Internal Server Error';
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
