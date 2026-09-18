import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withDeviceAuth } from '@/lib/gateways/device-auth';
import { MessageStatus } from '@/generated/prisma/client';

export const POST = async (req: NextRequest) => {
  return withDeviceAuth(req, async (req, { gatewayId }) => {
    try {
      const { attemptId, status, providerMsgId, errorCode, errorMessage } = await req.json();

      if (!attemptId || !status) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Valid statuses from device: SUBMITTED_TO_MODEM, SENT, DELIVERED, FAILED
      const validStatuses = ['SUBMITTED_TO_MODEM', 'SENT', 'DELIVERED', 'FAILED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      const attempt = await prisma.messageAttempt.findUnique({
        where: { id: attemptId }
      });

      if (!attempt || attempt.gatewayId !== gatewayId) {
        return NextResponse.json({ error: 'Attempt not found or unauthorized' }, { status: 404 });
      }

      const updateData: import("@/generated/prisma/client").Prisma.MessageAttemptUpdateInput = {
        status,
        providerMsgId,
        errorCode,
        errorMessage
      };

      if (status === 'SUBMITTED_TO_MODEM') {
        updateData.submittedAt = new Date();
      } else {
        updateData.finalizedAt = new Date();
      }

      await prisma.messageAttempt.update({
        where: { id: attemptId },
        data: updateData
      });

      // Update parent message and recipient status if final
      if (['SENT', 'DELIVERED', 'FAILED'].includes(status)) {
        const messageStatus = status === 'FAILED' ? 'FAILED' : status;
        
        // Find recipient ID based on attempt
        // Note: this assumes 1 attempt = 1 message (or we update all recipients)
        // For accurate tracking, we update the parent message status.
        
        const parentMessage = await prisma.message.findUnique({
          where: { id: attempt.messageId },
          include: { recipients: true }
        });

        if (parentMessage) {
          const now = new Date();
          await prisma.message.update({
            where: { id: parentMessage.id },
            data: {
              status: messageStatus as MessageStatus,
              sentAt: status === 'SENT' ? now : undefined,
              deliveredAt: status === 'DELIVERED' ? now : undefined,
              failedAt: status === 'FAILED' ? now : undefined,
              failureReason: errorMessage
            }
          });

          await prisma.messageRecipient.updateMany({
            where: { messageId: parentMessage.id },
            data: {
              status: messageStatus as MessageStatus,
              sentAt: status === 'SENT' ? now : undefined,
              deliveredAt: status === 'DELIVERED' ? now : undefined,
              failedAt: status === 'FAILED' ? now : undefined,
              failureReason: errorMessage,
              providerMsgId
            }
          });
        }
      }

      return NextResponse.json({ success: true });

    } catch (error: unknown) {
      console.error('Gateway Result Error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
};

