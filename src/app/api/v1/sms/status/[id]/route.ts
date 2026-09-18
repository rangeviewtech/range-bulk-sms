import { NextRequest } from 'next/server';
import { withApiKey } from '@/lib/api-keys/service';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withApiKey(req, 'sms.status', async (_request, context) => {
    try {
      // Check if message ID is a sandbox test identifier
      if (id.startsWith('msg_test_') || id.startsWith('sched_test_')) {
        return Response.json({
          success: true,
          sandbox: true,
          messageId: id,
          status: 'DELIVERED',
          deliveredAt: new Date().toISOString(),
          note: 'Sandbox simulated message status query.',
        });
      }

      const userId = context.userId;
      const clientId = context.clientId;

      let targetUserId = userId;
      if (!targetUserId && clientId) {
        const client = await prisma.client.findUnique({ where: { id: clientId }, select: { userId: true } });
        if (client) targetUserId = client.userId;
      }

      const message = await prisma.message.findUnique({
        where: { id },
        include: {
          recipients: {
            select: {
              phone: true,
              status: true,
              deliveredAt: true,
              failedAt: true,
              failureReason: true,
            },
          },
        },
      });

      if (!message || (targetUserId && message.userId !== targetUserId)) {
        return Response.json(
          {
            type: 'https://docs.rangesms.com/errors/message-not-found',
            title: 'Message Not Found',
            status: 404,
            detail: `No message found with ID '${id}' in your account.`,
            code: 'message_not_found',
            requestId: `req_${crypto.randomUUID().slice(0, 8)}`,
          },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        messageId: message.id,
        status: message.status,
        recipientCount: message.recipientCount,
        totalUnits: message.totalUnits,
        totalCost: Number(message.totalCost),
        createdAt: message.createdAt.toISOString(),
        deliveredAt: message.deliveredAt?.toISOString() || null,
        failedAt: message.failedAt?.toISOString() || null,
        recipients: message.recipients,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      return Response.json({ error: msg }, { status: 400 });
    }
  });
}
