import { prisma } from '@/lib/prisma';
import { reconcileMessageStatus } from '@/lib/sms/reconcile-message-status';

const staleAfterMs = 5 * 60 * 1000;
const batchSize = 100;

/** Finalize attempts that disappeared after being handed to a gateway.
 * A timeout is ambiguous, so this records uncertainty and never resends SMS.
 */
export async function finalizeStaleGatewayAttempts(now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - staleAfterMs);
  const attempts = await prisma.messageAttempt.findMany({
    where: {
      status: 'SENT_TO_GATEWAY',
      finalizedAt: null,
      sentToGatewayAt: { lt: cutoff },
    },
    select: { id: true, messageId: true, messageRecipientId: true },
    orderBy: { sentToGatewayAt: 'asc' },
    take: batchSize,
  });

  let finalizedCount = 0;
  for (const attempt of attempts) {
    const finalized = await prisma.$transaction(async (tx) => {
      const result = await tx.messageAttempt.updateMany({
        where: {
          id: attempt.id,
          status: 'SENT_TO_GATEWAY',
          finalizedAt: null,
          sentToGatewayAt: { lt: cutoff },
        },
        data: {
          status: 'SEND_UNCERTAIN',
          errorCode: 'GATEWAY_TIMEOUT',
          errorMessage: 'Gateway did not report a final SMS status before the timeout.',
          finalizedAt: now,
        },
      });
      if (result.count !== 1) return false;

      if (attempt.messageRecipientId) {
        await tx.messageRecipient.updateMany({
          where: {
            id: attempt.messageRecipientId,
            messageId: attempt.messageId,
            status: { in: ['QUEUED', 'SUBMITTED'] },
          },
          data: {
            status: 'FAILED',
            failedAt: now,
            failureReason: 'Delivery status is unknown because the gateway stopped responding.',
          },
        });
        await reconcileMessageStatus(tx, attempt.messageId, {
          failureReason: 'One or more recipients have an unknown delivery status.',
        });
      } else {
        await tx.message.updateMany({
          where: { id: attempt.messageId, status: { in: ['QUEUED', 'SUBMITTED'] } },
          data: {
            status: 'FAILED',
            failedAt: now,
            failureReason: 'Delivery status is unknown because the gateway stopped responding.',
          },
        });
      }

      return true;
    });

    if (finalized) finalizedCount += 1;
  }

  return finalizedCount;
}
