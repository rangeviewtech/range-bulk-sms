import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withDeviceAuth, sendGatewayResponse } from '@/lib/gateways/device-auth';
import { MessageStatus } from '@/generated/prisma/client';

export const POST = async (req: NextRequest) => {
  return withDeviceAuth(req, async (req, { gatewayId, gatewaySecret, body, isE2EE }) => {
    try {
      const { attemptId, status, providerMsgId, errorCode, errorMessage, hasCarrierDlr, simSlot } = body;

      if (!attemptId || !status) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Valid statuses from hardware gateway: SUBMITTED_TO_MODEM, SENT, DELIVERED, FAILED
      const validStatuses = ['SUBMITTED_TO_MODEM', 'SENT', 'DELIVERED', 'FAILED', 'SEND_UNCERTAIN'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      const attempt = await prisma.messageAttempt.findUnique({
        where: { id: attemptId }
      });

      if (!attempt || attempt.gatewayId !== gatewayId) {
        return NextResponse.json({ error: 'Attempt not found or unauthorized' }, { status: 404 });
      }

      // Replay prevention: do not allow modifying attempts that have already reached terminal state
      const terminalStatuses = ['DELIVERED', 'FAILED'];
      if (attempt.finalizedAt || (terminalStatuses.includes(attempt.status) && status !== attempt.status)) {
        return NextResponse.json({
          error: 'Attempt has already reached a terminal state and cannot be modified',
          currentStatus: attempt.status
        }, { status: 409 });
      }

      const updateData: import("@/generated/prisma/client").Prisma.MessageAttemptUpdateInput = {
        status,
        providerMsgId,
        simSlot: simSlot !== undefined ? simSlot : undefined,
        errorCode,
        errorMessage
      };

      if (status === 'SUBMITTED_TO_MODEM') {
        updateData.submittedAt = new Date();
      } else {
        updateData.finalizedAt = new Date();
      }

      // Strict Telecom Classification Rule:
      // A local hardware modem send is proof of air transmission ('SENT'),
      // NOT handset delivery ('DELIVERED') unless explicit carrier DLR PDU is attached.
      let effectiveMessageStatus: MessageStatus;
      if (status === 'FAILED' || status === 'SEND_UNCERTAIN') {
        effectiveMessageStatus = 'FAILED';
      } else if (status === 'DELIVERED') {
        effectiveMessageStatus = hasCarrierDlr ? 'DELIVERED' : 'SENT';
      } else if (status === 'SENT') {
        effectiveMessageStatus = 'SENT';
      } else {
        effectiveMessageStatus = 'SUBMITTED';
      }

      const parentMessage = await prisma.message.findUnique({
        where: { id: attempt.messageId },
        include: { recipients: true }
      });

      await prisma.$transaction(async (tx) => {
        await tx.messageAttempt.update({
          where: { id: attemptId },
          data: updateData
        });

        if (parentMessage) {
          const now = new Date();
          await tx.message.update({
            where: { id: parentMessage.id },
            data: {
              status: effectiveMessageStatus,
              sentAt: effectiveMessageStatus === 'SENT' ? now : undefined,
              deliveredAt: effectiveMessageStatus === 'DELIVERED' ? now : undefined,
              failedAt: effectiveMessageStatus === 'FAILED' ? now : undefined,
              failureReason: errorMessage,
              providerMessageId: providerMsgId || undefined,
            }
          });

          await tx.messageRecipient.updateMany({
            where: { messageId: parentMessage.id },
            data: {
              status: effectiveMessageStatus,
              sentAt: effectiveMessageStatus === 'SENT' ? now : undefined,
              deliveredAt: effectiveMessageStatus === 'DELIVERED' ? now : undefined,
              failedAt: effectiveMessageStatus === 'FAILED' ? now : undefined,
              failureReason: errorMessage,
              providerMsgId: providerMsgId || undefined,
            }
          });
        }

        // Record first-class GatewayLog audit entry for real-time telemetry
        await tx.gatewayLog.create({
          data: {
            gatewayId,
            level: status === 'FAILED' ? 'ERROR' : 'INFO',
            event: `SMS_${status}`,
            message: `Message ${attempt.messageId} attempt ${attemptId} reported as ${status}${hasCarrierDlr ? ' (Carrier DLR verified)' : ''}${errorMessage ? ': ' + errorMessage : ''}`,
            metadata: {
              attemptId,
              messageId: attempt.messageId,
              status,
              hasCarrierDlr: Boolean(hasCarrierDlr),
              simSlot: simSlot !== undefined ? simSlot : attempt.simSlot,
              errorCode: errorCode || null,
              errorMessage: errorMessage || null,
              providerMsgId: providerMsgId || null,
            }
          }
        });
      });

      
      return sendGatewayResponse({ success: true, effectiveStatus: effectiveMessageStatus }, gatewaySecret, isE2EE);

    } catch (error: unknown) {
      console.error('Gateway Result Error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
};





