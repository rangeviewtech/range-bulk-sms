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

      // Find MessageAttempts assigned to this gateway that are PENDING
      // In a real system we'd use a transaction lock to avoid race conditions.
      const pendingAttempts = await prisma.messageAttempt.findMany({
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

      if (pendingAttempts.length === 0) {
        return NextResponse.json({ success: true, messages: [] });
      }

      // Mark them as SENT_TO_GATEWAY
      const attemptIds = pendingAttempts.map(a => a.id);
      
      await prisma.messageAttempt.updateMany({
        where: { id: { in: attemptIds } },
        data: {
          status: 'SENT_TO_GATEWAY',
          sentToGatewayAt: new Date()
        }
      });

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

