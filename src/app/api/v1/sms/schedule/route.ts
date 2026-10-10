import { NextRequest } from 'next/server';
import { withApiKey } from '@/lib/api-keys/service';
import { scheduleSmsSchema } from '@/lib/validations/sms';
import { prisma, Prisma } from '@/lib/prisma';
import { WalletService } from '@/lib/wallet/service';
import { isSandboxRequest } from '@/lib/sms/sandbox';
import { AppError } from '@/lib/errors';
import { enqueueScheduledSmsOccurrence } from '@/lib/jobs/db';
import { InvalidSmsRecipientsError, quoteSms } from '@/lib/sms/quote';
import { validateRecurringSchedule } from '@/lib/sms/scheduled-dispatcher';

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

      const { senderId, recipients, message, scheduledAt, timezone, isRecurring, cronExpression, idempotencyKey } = parsed.data;

      try {
        new Intl.DateTimeFormat('en-US', { timeZone: timezone });
        if (isRecurring) validateRecurringSchedule(cronExpression, timezone);
      } catch (error) {
        return Response.json({ success: false, error: error instanceof Error ? error.message : 'Invalid schedule settings.' }, { status: 400 });
      }

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

      let validSenderId: string | null = null;
      if (senderId) {
        const sender = await prisma.senderId.findFirst({
          where: {
            status: 'APPROVED',
            AND: [
              { OR: [{ id: senderId }, { senderId }] },
              { OR: [...(userId ? [{ userId }] : []), ...(clientId ? [{ clientId }] : [])] },
            ],
          },
          select: { id: true },
        });
        if (!sender) {
          return Response.json({ success: false, error: 'Specified Sender ID is invalid, unapproved, or does not belong to you' }, { status: 400 });
        }
        validSenderId = sender.id;
      }

      if (idempotencyKey) {
        const existing = await prisma.scheduledMessage.findFirst({ where: { userId: messageUserId, idempotencyKey } });
        if (existing) {
          const matches = existing.clientId === (clientId ?? null) && existing.senderIdId === validSenderId &&
            existing.message === message && JSON.stringify(existing.recipients) === JSON.stringify(recipients) &&
            existing.scheduledAt.getTime() === new Date(scheduledAt).getTime() && existing.isRecurring === isRecurring &&
            existing.cronExpression === (cronExpression ?? null) && existing.timezone === timezone;
          if (!matches) {
            return Response.json({ success: false, error: 'This idempotency key was already used for a different scheduled message.' }, { status: 409 });
          }
          return Response.json({ success: true, scheduledMessageId: existing.id, status: existing.status, scheduledAt: existing.scheduledAt });
        }
      }

      let quote;
      try {
        quote = await quoteSms({ recipients, message, clientId });
      } catch (error) {
        if (error instanceof InvalidSmsRecipientsError) {
          return Response.json({ success: false, error: error.message, invalidRecipients: error.invalidRecipients.slice(0, 50), truncated: error.invalidRecipients.length > 50 }, { status: 400 });
        }
        throw error;
      }

      const wallet = await WalletService.getOrCreateWallet({ userId, clientId });
      const schedMsg = await prisma.$transaction(async (tx) => {
        const created = await tx.scheduledMessage.create({
          data: {
            userId: messageUserId,
            clientId: clientId ?? null,
            idempotencyKey,
            senderIdId: validSenderId,
            message,
            recipients,
            recipientCount: recipients.length,
            totalUnits: quote.totalUnits,
            segmentCount: quote.segments,
            encoding: quote.encoding,
            estimatedCost: quote.totalCost,
            scheduledAt: new Date(scheduledAt),
            timezone,
            isRecurring,
            cronExpression,
            status: 'SCHEDULED',
          },
        });
        await WalletService.deduct(wallet.id, quote.totalCost, {
          userId: messageUserId,
          tx,
          description: `Upfront charge for scheduled SMS ${created.id}`,
          idempotencyKey: `scheduled-initial-charge-${created.id}`,
        });
        await enqueueScheduledSmsOccurrence({ tx, scheduledMessageId: created.id, scheduledAt: created.scheduledAt });
        return created;
      });

      return Response.json({
        success: true,
        scheduledMessageId: schedMsg.id,
        status: 'SCHEDULED',
        scheduledAt: schedMsg.scheduledAt,
        estimatedCost: quote.totalCost.toString(),
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return Response.json({ success: false, error: 'This scheduled message was already submitted. Retry the request with the same idempotency key to retrieve it.' }, { status: 409 });
      }
      if (error instanceof AppError && error.statusCode < 500) {
        return Response.json({ success: false, error: error.message }, { status: error.statusCode });
      }
      if (error instanceof Error && error.message === 'Insufficient funds') {
        return Response.json({ success: false, error: 'Your wallet does not have enough funds for this scheduled message.' }, { status: 400 });
      }
      console.error('[API_V1_SMS_SCHEDULE_ERROR]', error);
      return Response.json({ success: false, error: 'Unable to schedule messages right now. Please try again.' }, { status: 500 });
    }
  });
}
