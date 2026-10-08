import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withDeviceAuth, sendGatewayResponse } from '@/lib/gateways/device-auth';

export const GET = async (req: NextRequest) => {
  return withDeviceAuth(req, async (req, { gatewayId, gatewaySecret, isE2EE }) => {
    try {
      const url = new URL(req.url);
      const requestedLimit = Number.parseInt(url.searchParams.get('limit') || '10', 10);
      const limit = Number.isFinite(requestedLimit)
        ? Math.min(50, Math.max(1, requestedLimit))
        : 10;

      // Get gateway to know its batch limits
      const gateway = await prisma.gateway.findUnique({
        where: { id: gatewayId },
      });

      if (!gateway || gateway.status !== 'ONLINE') {
        return NextResponse.json({ error: 'Gateway offline or not found' }, { status: 403 });
      }

      const configuredBatchSize = Number.isInteger(gateway.batchSize) && gateway.batchSize > 0
        ? gateway.batchSize
        : 10;
      const batchSize = Math.min(limit, configuredBatchSize, 50);
      const maxThroughput = typeof gateway.maxThroughput === 'number'
        && Number.isInteger(gateway.maxThroughput)
        && gateway.maxThroughput > 0
        ? gateway.maxThroughput
        : undefined;

      // Atomic claim within transaction to prevent race conditions across concurrent pollers
      const pendingAttempts = await prisma.$transaction(async (tx) => {
        // Lock and claim in one transaction so concurrent device pollers cannot
        // receive the same recipient attempt.
        const claimed = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT id
          FROM "MessageAttempt"
          WHERE "gatewayId" = ${gatewayId} AND status = 'ASSIGNED'
          ORDER BY "createdAt" ASC
          LIMIT ${batchSize}
          FOR UPDATE SKIP LOCKED
        `;
        const attemptIds = claimed.map(({ id }) => id);
        if (attemptIds.length === 0) {
          return [];
        }

        await tx.messageAttempt.updateMany({
          where: {
            id: { in: attemptIds },
            status: 'ASSIGNED',
          },
          data: {
            status: 'SENT_TO_GATEWAY',
            sentToGatewayAt: new Date(),
          },
        });

        return tx.messageAttempt.findMany({
          where: { id: { in: attemptIds }, gatewayId, status: 'SENT_TO_GATEWAY' },
          include: {
            message: { include: { recipients: true } },
            messageRecipient: true,
          },
          orderBy: { createdAt: 'asc' },
        });
      });

      if (pendingAttempts.length === 0) {
        return sendGatewayResponse({ success: true, messages: [] }, gatewaySecret, isE2EE);
      }

      // Format for the device
      const messages = pendingAttempts.flatMap((attempt) => {
        const recipients = attempt.messageRecipient
          ? [attempt.messageRecipient]
          : attempt.message.recipients;
        return recipients.map((recipient) => ({
          attemptId: attempt.id,
          messageId: attempt.messageId,
          recipientId: recipient.id,
          phone: recipient.phone,
          message: attempt.message.message,
          expiresAt: attempt.expiresAt,
          encoding: attempt.message.encoding,
        }));
      });

      return sendGatewayResponse({ success: true, messages, maxThroughput }, gatewaySecret, isE2EE);
    } catch (error: unknown) {
      console.error('Gateway Queue Error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
};
