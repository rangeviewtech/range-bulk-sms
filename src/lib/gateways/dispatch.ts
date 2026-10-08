import { prisma } from '@/lib/prisma';

/**
 * Assign one hardware delivery attempt per recipient. The device queue uses
 * attempt IDs as idempotency keys, so a message-level attempt cannot safely
 * represent several recipients.
 */
export async function assignRecipientsToHardwareGateway(
  messageId: string,
  gatewayId: string,
  recipientIds: string[]
) {
  if (recipientIds.length === 0) return;

  await prisma.messageAttempt.createMany({
    data: recipientIds.map((messageRecipientId) => ({
      messageId,
      messageRecipientId,
      gatewayId,
      attemptNumber: 1,
      status: 'ASSIGNED',
      assignedAt: new Date(),
    })),
  });
}
