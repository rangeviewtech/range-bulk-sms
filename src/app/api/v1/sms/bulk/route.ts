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
      const { countSms } = await import('@/lib/sms/counter');
      const { analyzePhone } = await import('@/lib/sms/phone-analyzer');
      const { PricingEngine } = await import('@/lib/wallet/pricing');

      let totalRecipients = 0;
      let totalCostNum = 0;
      
      const pricingCache = new Map<string, import('@/generated/prisma/client').Prisma.Decimal>();
      
      // We will need to store recipient pricing for the create step
      // itemIndex -> recipientPhone -> { units, cost }
      const batchRecipientDetails = new Map<number, { phone: string, units: number, cost: number }[]>();

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const { segments } = countSms(msg.message);
        totalRecipients += msg.recipients.length;
        
        const recDetails = [];
        
        for (const phone of msg.recipients) {
          const analysis = analyzePhone(phone);
          const countryCode = analysis.country?.calling_code ? `+${analysis.country.calling_code}` : '+256';
          
          let costPerUnit = pricingCache.get(countryCode);
          if (!costPerUnit) {
             const priceInfo = await PricingEngine.getPrice({ countryCode, clientId });
             costPerUnit = priceInfo.sellingPrice;
             pricingCache.set(countryCode, costPerUnit);
          }
          
          const units = segments;
          const recCost = costPerUnit.mul(units);
          totalCostNum += recCost.toNumber();
          
          recDetails.push({ phone, units, cost: recCost.toNumber() });
        }
        batchRecipientDetails.set(i, recDetails);
      }

      const decimalCost = new Prisma.Decimal(totalCostNum);

      const wallet = await WalletService.getOrCreateWallet({ userId, clientId });
      await WalletService.deduct(wallet.id, decimalCost, {
        userId,
        description: `v1 API Bulk SMS (${messages.length} messages, ${totalRecipients} recipients)`,
        idempotencyKey: batchIdempotencyKey ? `v1-bulk-${batchIdempotencyKey}` : undefined,
      });

      const messageIds: string[] = [];

      for (let i = 0; i < messages.length; i++) {
        const item = messages[i];
        
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

        const recDetails = batchRecipientDetails.get(i) || [];
        const msgUnits = recDetails.reduce((acc, r) => acc + r.units, 0);
        const msgCost = recDetails.reduce((acc, r) => acc + r.cost, 0);

        const msgRecord = await prisma.message.create({
          data: {
            userId: messageUserId,
            senderIdId: item.senderId || null,
            message: item.message,
            recipientCount: item.recipients.length,
            totalUnits: msgUnits,
            totalCost: msgCost,
            status: 'QUEUED',
            idempotencyKey: item.idempotencyKey,
          },
        });

        messageIds.push(msgRecord.id);

        await prisma.messageRecipient.createMany({
          data: recDetails.map((rec) => ({
            messageId: msgRecord.id,
            phone: rec.phone,
            status: 'PENDING',
            cost: rec.cost,
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
