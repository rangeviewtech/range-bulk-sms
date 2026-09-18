import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withApiKey } from '@/lib/api-keys/service';
import { prisma, Prisma } from '@/lib/prisma';
import { WalletService } from '@/lib/wallet/service';
import { enqueueJob } from '@/lib/jobs/db';

const bulkSmsSchema = z.object({
  messages: z
    .array(
      z.object({
        senderId: z.string().optional(),
        recipients: z.array(z.string().min(5)).min(1).max(1000),
        message: z.string().min(1).max(1600),
        idempotencyKey: z.string().optional(),
      })
    )
    .min(1)
    .max(100),
  batchIdempotencyKey: z.string().optional(),
});

export async function POST(req: NextRequest) {
  return withApiKey(req, 'sms.send', async (request, context) => {
    try {
      const userId = context.userId;
      const clientId = context.clientId;
      if (!userId && !clientId) {
        return Response.json({ error: 'Context not found' }, { status: 400 });
      }

      const rawBody = await request.json().catch(() => ({}));
      const parsed = bulkSmsSchema.safeParse(rawBody);
      if (!parsed.success) {
        return Response.json(
          { success: false, error: 'Invalid bulk SMS request', details: parsed.error.format() },
          { status: 400 }
        );
      }

      const { messages, batchIdempotencyKey } = parsed.data;

      // Target user ID for the message records
      let messageUserId = userId;
      if (!messageUserId && clientId) {
        const client = await prisma.client.findUnique({ where: { id: clientId }, select: { userId: true } });
        if (client) messageUserId = client.userId;
      }

      if (!messageUserId) {
        return Response.json({ error: 'Unable to associate message with an active user account' }, { status: 400 });
      }

      // Calculate total units & cost
      let totalRecipients = 0;
      for (const msg of messages) {
        totalRecipients += msg.recipients.length;
      }
      const totalCost = totalRecipients * 10;
      const decimalCost = new Prisma.Decimal(totalCost);

      const wallet = await WalletService.getOrCreateWallet({ userId, clientId });
      await WalletService.deduct(wallet.id, decimalCost, {
        userId,
        description: `v1 API Bulk SMS (${messages.length} messages, ${totalRecipients} recipients)`,
        idempotencyKey: batchIdempotencyKey ? `v1-bulk-${batchIdempotencyKey}` : undefined,
      });

      const messageIds: string[] = [];

      for (const item of messages) {
        // Validate senderId if present
        if (item.senderId) {
          const validSender = await prisma.senderId.findFirst({
            where: {
              id: item.senderId,
              status: 'APPROVED',
              OR: [
                ...(userId ? [{ userId }] : []),
                ...(clientId ? [{ clientId }] : []),
              ],
            },
          });
          if (!validSender) {
            continue; // Skip or fall back to default
          }
        }

        const msgRecord = await prisma.message.create({
          data: {
            userId: messageUserId,
            senderIdId: item.senderId || null,
            message: item.message,
            recipientCount: item.recipients.length,
            totalUnits: item.recipients.length,
            totalCost: item.recipients.length * 10,
            status: 'QUEUED',
            idempotencyKey: item.idempotencyKey,
          },
        });

        messageIds.push(msgRecord.id);

        await prisma.messageRecipient.createMany({
          data: item.recipients.map((phone) => ({
            messageId: msgRecord.id,
            phone,
            status: 'PENDING',
            cost: 10,
          })),
        });

        const recipientRecords = await prisma.messageRecipient.findMany({
          where: { messageId: msgRecord.id },
        });

        for (const rec of recipientRecords) {
          await enqueueJob({
            type: 'send-sms',
            queue: 'sms-bulk',
            priority: 'BULK',
            payload: {
              recipient: rec.phone,
              template: 'direct',
              templateData: { body: item.message },
              messageId: msgRecord.id,
              recipientId: rec.id,
            },
            idempotencyKey: item.idempotencyKey ? `bulk-job-${item.idempotencyKey}-${rec.id}` : undefined,
          });
        }
      }

      return Response.json({
        success: true,
        batchId: crypto.randomUUID(),
        count: messageIds.length,
        totalRecipients,
        messageIds,
        status: 'QUEUED',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return Response.json({ error: message }, { status: 400 });
    }
  });
}
