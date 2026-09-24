import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withDeviceAuth } from '@/lib/gateways/device-auth';

export const GET = async (req: NextRequest) => {
  return withDeviceAuth(req, async (req, { gatewayId }) => {
    try {
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);
      
      // Get gateway to know its batch limits
      const gateway = await prisma.gateway.findUnique({
        where: { id: gatewayId }
      });
      
      if (!gateway || gateway.status !== 'ONLINE') {
        return NextResponse.json({ error: 'Gateway offline or not found' }, { status: 403 });
      }

      const batchSize = Math.min(limit, gateway.batchSize || 10, 50);

      // Atomic claim within transaction to prevent race conditions across concurrent pollers
      const pendingAttempts = await prisma.$transaction(async (tx) => {
        const attempts = await tx.messageAttempt.findMany({
          where: {
            gatewayId,
            status: 'ASSIGNED',
          },
          include: {
            message: {
              include: {
                recipients: true
              }
            }
          },
          take: batchSize,
          orderBy: {
            createdAt: 'asc'
          }
        });

        if (attempts.length === 0) {
          return [];
        }

        const attemptIds = attempts.map(a => a.id);
        await tx.messageAttempt.updateMany({
          where: {
            id: { in: attemptIds },
            status: 'ASSIGNED',
          },
          data: {
            status: 'SENT_TO_GATEWAY',
            sentToGatewayAt: new Date()
          }
        });

        return attempts;
      });

      if (pendingAttempts.length === 0) {
        return NextResponse.json({ success: true, messages: [] });
      }

      // Format for the device
      const messages = pendingAttempts.flatMap(attempt => {
        return attempt.message.recipients.map(recipient => ({
          attemptId: attempt.id,
          messageId: attempt.messageId,
          recipientId: recipient.id,
          phone: recipient.phone,
          message: attempt.message.message,
          encoding: attempt.message.encoding,
        }));
      });

      return NextResponse.json({ success: true, messages });

    } catch (error: unknown) {
      console.error('Gateway Queue Error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
};

