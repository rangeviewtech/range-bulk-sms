import { MessageStatus } from '@/generated/prisma/client';
import type { PrismaTransactionClient } from '@/lib/prisma';

const finalStatuses = new Set<MessageStatus>(['DELIVERED', 'FAILED', 'EXPIRED', 'REJECTED']);

export function rollupMessageStatus(statuses: MessageStatus[]): MessageStatus {
  if (statuses.length === 0) return 'QUEUED';
  if (statuses.every((status) => finalStatuses.has(status))) {
    if (statuses.every((status) => status === 'DELIVERED')) return 'DELIVERED';
    if (statuses.every((status) => status !== 'DELIVERED')) return 'FAILED';
    return 'PARTIAL';
  }
  if (statuses.some((status) => status === 'SENT' || status === 'DELIVERED')) return 'SENT';
  if (statuses.some((status) => status === 'SUBMITTED')) return 'SUBMITTED';
  return 'QUEUED';
}

export async function reconcileMessageStatus(
  tx: PrismaTransactionClient,
  messageId: string,
  details: { providerMessageId?: string; failureReason?: string } = {}
): Promise<MessageStatus> {
  const recipients = await tx.messageRecipient.findMany({
    where: { messageId },
    select: { status: true },
  });
  const status = rollupMessageStatus(recipients.map(({ status }) => status));
  const now = new Date();

  await tx.message.update({
    where: { id: messageId },
    data: {
      status,
      sentAt: status === 'SENT' ? now : undefined,
      deliveredAt: status === 'DELIVERED' ? now : undefined,
      failedAt: status === 'FAILED' || status === 'PARTIAL' ? now : undefined,
      failureReason:
        status === 'FAILED' || status === 'PARTIAL' ? details.failureReason : undefined,
      providerMessageId: details.providerMessageId,
    },
  });
  return status;
}
