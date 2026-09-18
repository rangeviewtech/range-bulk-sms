import { NextRequest } from 'next/server';
import { withApiKey } from '@/lib/api-keys/service';
import { scheduleSmsSchema } from '@/lib/validations/sms';
import { prisma, Prisma } from '@/lib/prisma';
import { WalletService } from '@/lib/wallet/service';
import { isSandboxRequest } from '@/lib/sms/sandbox';

export async function POST(req: NextRequest) {
  return withApiKey(req, 'sms.schedule', async (request, context) => {
    try {
      const userId = context.userId;
      const clientId = context.clientId;
      if (!userId && !clientId) {
        return Response.json({ error: 'Context not found' }, { status: 400 });
      }

      const rawBody = await request.json().catch(() => ({}));
      const bodyWithRecipients = {
        ...rawBody,
        recipients: rawBody.recipients || (rawBody.to ? [rawBody.to] : undefined),
      };

      const parsed = scheduleSmsSchema.safeParse(bodyWithRecipients);
      if (!parsed.success) {
        return Response.json(
          { success: false, error: 'Invalid schedule request data', details: parsed.error.format() },
          { status: 400 }
        );
      }

      const { senderId, recipients, message, scheduledAt, timezone, isRecurring, cronExpression } = parsed.data;

      // Check if request is sandbox execution
      const sandbox = isSandboxRequest({
        headers: request.headers,
        recipients,
      });

      if (sandbox) {
        return Response.json({
          success: true,
          sandbox: true,
          scheduledMessageId: `sched_test_${crypto.randomUUID().slice(0, 12)}`,
          status: 'SCHEDULED',
          scheduledAt,
          recipientCount: recipients.length,
          cost: 0,
          currency: 'UGX',
          note: 'Sandbox simulated scheduled SMS. No charges incurred.',
        });
      }

      // Target user ID for the message record
      let messageUserId = userId;
      if (!messageUserId && clientId) {
        const client = await prisma.client.findUnique({ where: { id: clientId }, select: { userId: true } });
        if (client) messageUserId = client.userId;
      }

      if (!messageUserId) {
        return Response.json({ error: 'Unable to associate message with an active user account' }, { status: 400 });
      }

      const units = recipients.length;
      const estimatedCost = units * 10;
      const decimalCost = new Prisma.Decimal(estimatedCost);

      const wallet = await WalletService.getOrCreateWallet({ userId, clientId });
      await WalletService.deduct(wallet.id, decimalCost, {
        userId: messageUserId,
        description: `v1 API Scheduled SMS (${units} recipients)`,
      });

      const schedMsg = await prisma.scheduledMessage.create({
        data: {
          userId: messageUserId,
          senderIdId: senderId || null,
          message,
          recipients,
          recipientCount: recipients.length,
          totalUnits: units,
          estimatedCost,
          scheduledAt: new Date(scheduledAt),
          timezone,
          isRecurring,
          cronExpression,
          status: 'SCHEDULED',
        },
      });

      return Response.json({
        success: true,
        scheduledMessageId: schedMsg.id,
        status: 'SCHEDULED',
        scheduledAt: schedMsg.scheduledAt,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return Response.json({ error: message }, { status: 400 });
    }
  });
}
