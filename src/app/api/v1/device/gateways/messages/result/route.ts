import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withDeviceAuth, sendGatewayResponse } from '@/lib/gateways/device-auth';
import { MessageAttemptStatus, MessageStatus, Prisma } from '@/generated/prisma/client';
import { reconcileMessageStatus } from '@/lib/sms/reconcile-message-status';
import { z } from 'zod';

const deviceResultSchema = z.object({
  attemptId: z.string().min(1).max(64),
  status: z.enum(['SUBMITTED_TO_MODEM', 'SENT', 'DELIVERED', 'FAILED', 'SEND_UNCERTAIN']),
  providerMsgId: z.string().max(255).optional(),
  errorCode: z.string().max(128).optional(),
  errorMessage: z.string().max(1000).optional(),
  hasCarrierDlr: z.boolean().optional(),
  simSlot: z.number().int().min(0).max(9).optional(),
});
const terminalAttemptStatuses = new Set(['DELIVERED', 'FAILED', 'SEND_UNCERTAIN']);
const retryableGatewayErrors = new Set([
  'MODEM_NOT_READY',
  'NO_SERVICE',
  'SEND_ERROR',
  'TIMEOUT',
  'SEND_FAILED',
  'CMS_ERROR',
]);
const maxGatewayAttempts = 3;

function toRecipientStatus(status: string, hasCarrierDlr: boolean): MessageStatus {
  if (status === 'DELIVERED') return hasCarrierDlr ? 'DELIVERED' : 'SENT';
  if (status === 'FAILED' || status === 'SEND_UNCERTAIN') return 'FAILED';
  if (status === 'SENT') return 'SENT';
  return 'SUBMITTED';
}

export const POST = async (req: NextRequest) => {
  return withDeviceAuth(req, async (_req, { gatewayId, gatewaySecret, body, isE2EE }) => {
    try {
      const parsedBody = deviceResultSchema.safeParse(body);
      if (!parsedBody.success) {
        return NextResponse.json({ error: 'Invalid or missing attempt status' }, { status: 400 });
      }
      const { attemptId, status, providerMsgId, errorCode, errorMessage, hasCarrierDlr, simSlot } =
        parsedBody.data;

      const attempt = await prisma.messageAttempt.findUnique({ where: { id: attemptId } });
      if (!attempt || attempt.gatewayId !== gatewayId) {
        return NextResponse.json({ error: 'Attempt not found or unauthorized' }, { status: 404 });
      }
      const normalizedReportedStatus = status === 'DELIVERED' && !hasCarrierDlr ? 'SENT' : status;
      if (attempt.finalizedAt && normalizedReportedStatus === attempt.status) {
        // Device reports are at-least-once; acknowledge a replay of the same
        // terminal result without repeating campaign mutations or retries.
        return sendGatewayResponse(
          {
            success: true,
            effectiveStatus: attempt.status,
            retryScheduled: false,
            duplicate: true,
          },
          gatewaySecret,
          isE2EE
        );
      }
      if (
        attempt.finalizedAt ||
        (terminalAttemptStatuses.has(attempt.status) && normalizedReportedStatus !== attempt.status)
      ) {
        return NextResponse.json(
          {
            error: 'Attempt has already reached a terminal state and cannot be modified',
            currentStatus: attempt.status,
          },
          { status: 409 }
        );
      }

      const normalizedAttemptStatus: MessageAttemptStatus =
        status === 'DELIVERED' && !hasCarrierDlr ? 'SENT' : status;
      const now = new Date();
      const retryScheduled =
        status === 'FAILED' &&
        attempt.messageRecipientId !== null &&
        attempt.attemptNumber < maxGatewayAttempts &&
        typeof errorCode === 'string' &&
        retryableGatewayErrors.has(errorCode) &&
        (!attempt.expiresAt || attempt.expiresAt > now);
      const effectiveRecipientStatus = retryScheduled
        ? 'QUEUED'
        : toRecipientStatus(status, Boolean(hasCarrierDlr));
      const updateData: Prisma.MessageAttemptUpdateInput = {
        status: normalizedAttemptStatus,
        providerMsgId,
        simSlot: Number.isInteger(simSlot) ? simSlot : undefined,
        errorCode,
        errorMessage,
        ...(normalizedAttemptStatus === 'SUBMITTED_TO_MODEM' ? { submittedAt: now } : {}),
        ...(terminalAttemptStatuses.has(normalizedAttemptStatus) ? { finalizedAt: now } : {}),
      };

      const effectiveMessageStatus = await prisma.$transaction(async (tx) => {
        await tx.messageAttempt.update({ where: { id: attemptId }, data: updateData });

        await tx.gatewayLog.create({
          data: {
            gatewayId,
            level: status === 'FAILED' || status === 'SEND_UNCERTAIN' ? 'ERROR' : 'INFO',
            event: `SMS_${status}`,
            message: `Message ${attempt.messageId} attempt ${attemptId} reported as ${status}${hasCarrierDlr ? ' (Carrier DLR verified)' : ''}${errorMessage ? `: ${errorMessage}` : ''}`,
            metadata: {
              attemptId,
              messageId: attempt.messageId,
              messageRecipientId: attempt.messageRecipientId,
              status,
              hasCarrierDlr: Boolean(hasCarrierDlr),
              simSlot: Number.isInteger(simSlot) ? simSlot : attempt.simSlot,
              errorCode: typeof errorCode === 'string' ? errorCode : null,
              providerMsgId: typeof providerMsgId === 'string' ? providerMsgId : null,
            },
          },
        });

        if (attempt.messageRecipientId) {
          await tx.messageRecipient.updateMany({
            where: { id: attempt.messageRecipientId, messageId: attempt.messageId },
            data: {
              status: effectiveRecipientStatus,
              sentAt: effectiveRecipientStatus === 'SENT' ? now : undefined,
              deliveredAt: effectiveRecipientStatus === 'DELIVERED' ? now : undefined,
              failedAt: effectiveRecipientStatus === 'FAILED' ? now : undefined,
              failureReason: typeof errorMessage === 'string' ? errorMessage : undefined,
              providerMsgId: typeof providerMsgId === 'string' ? providerMsgId : undefined,
            },
          });
          if (retryScheduled) {
            await tx.messageAttempt.create({
              data: {
                messageId: attempt.messageId,
                messageRecipientId: attempt.messageRecipientId,
                gatewayId: attempt.gatewayId,
                attemptNumber: attempt.attemptNumber + 1,
                status: 'ASSIGNED',
                assignedAt: now,
                expiresAt: attempt.expiresAt,
              },
            });
          }
          return reconcileMessageStatus(tx, attempt.messageId, {
            failureReason:
              typeof errorMessage === 'string'
                ? errorMessage
                : 'One or more recipients could not be delivered',
            providerMessageId: typeof providerMsgId === 'string' ? providerMsgId : undefined,
          });
        }

        // Compatibility path for attempts created before recipient-level attempts.
        const legacyStatus = effectiveRecipientStatus;
        await tx.message.update({
          where: { id: attempt.messageId },
          data: {
            status: legacyStatus,
            sentAt: legacyStatus === 'SENT' ? now : undefined,
            deliveredAt: legacyStatus === 'DELIVERED' ? now : undefined,
            failedAt: legacyStatus === 'FAILED' ? now : undefined,
            failureReason: typeof errorMessage === 'string' ? errorMessage : undefined,
            providerMessageId: typeof providerMsgId === 'string' ? providerMsgId : undefined,
          },
        });
        await tx.messageRecipient.updateMany({
          where: { messageId: attempt.messageId },
          data: {
            status: legacyStatus,
            sentAt: legacyStatus === 'SENT' ? now : undefined,
            deliveredAt: legacyStatus === 'DELIVERED' ? now : undefined,
            failedAt: legacyStatus === 'FAILED' ? now : undefined,
            failureReason: typeof errorMessage === 'string' ? errorMessage : undefined,
            providerMsgId: typeof providerMsgId === 'string' ? providerMsgId : undefined,
          },
        });
        return legacyStatus;
      });

      return sendGatewayResponse(
        { success: true, effectiveStatus: effectiveMessageStatus, retryScheduled },
        gatewaySecret,
        isE2EE
      );
    } catch (error: unknown) {
      console.error('Gateway Result Error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
};
