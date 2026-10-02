import { NextRequest } from 'next/server';
import { withApiKey } from '@/lib/api-keys/service';
import { sendSmsSchema } from '@/lib/validations/sms';
import { prisma, Prisma } from '@/lib/prisma';
import { WalletService } from '@/lib/wallet/service';
import { enqueueJob } from '@/lib/jobs/db';
import { isSandboxRequest, handleDeterministicSms } from '@/lib/sms/sandbox';

export async function POST(req: NextRequest) {
  return withApiKey(req, 'sms.send', async (request, context) => {
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

      const parsed = sendSmsSchema.safeParse(bodyWithRecipients);
      if (!parsed.success) {
        return Response.json(
          { success: false, error: 'Invalid request data', details: parsed.error.format() },
          { status: 400 }
        );
      }

      const { senderId, recipients, message, idempotencyKey } = parsed.data;

      // Check if request is sandbox execution or targeting non-routable test numbers
      const sandbox = isSandboxRequest({
        headers: request.headers,
        recipients,
      });

      if (sandbox) {
        const simResult = handleDeterministicSms(recipients, senderId);
        if (simResult) {
          return Response.json(simResult.body, { status: simResult.status });
        }
      }

      if (idempotencyKey) {
        const existing = await prisma.message.findUnique({
          where: { idempotencyKey },
        });
        if (existing) {
          return Response.json({ success: true, messageId: existing.id, status: existing.status });
        }
      }

      // Validate senderId ownership and approval if supplied
      if (senderId) {
        const validSender = await prisma.senderId.findFirst({
          where: {
            id: senderId,
            status: 'APPROVED',
            OR: [
              ...(userId ? [{ userId }] : []),
              ...(clientId ? [{ clientId }] : []),
            ],
          },
        });
        if (!validSender) {
          return Response.json(
            { success: false, error: 'Specified Sender ID is invalid, unapproved, or does not belong to you' },
            { status: 400 }
          );
        }
      }

      // Calculate segments and dynamically price each recipient
      const { countSms } = await import('@/lib/sms/counter');
      const { analyzePhone } = await import('@/lib/sms/phone-analyzer');
      const { PricingEngine } = await import('@/lib/wallet/pricing');

      const { segments } = countSms(message);
      
      let totalCostNum = 0;
      let totalUnitsNum = 0;
      const pricingCache = new Map<string, import('@/generated/prisma/client').Prisma.Decimal>();
      const recipientDetails = [];
      
      for (const phone of recipients) {
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
        totalUnitsNum += units;
        totalCostNum += recCost.toNumber();
        
        recipientDetails.push({
           phone,
           units,
           cost: recCost.toNumber()
        });
      }

      const decimalCost = new Prisma.Decimal(totalCostNum);

      const wallet = await WalletService.getOrCreateWallet({ userId, clientId });
      await WalletService.deduct(wallet.id, decimalCost, {
        userId,
        description: `v1 API SMS Dispatch (${totalUnitsNum} units across ${recipients.length} recipients)`,
        idempotencyKey: idempotencyKey ? `v1-wallet-${idempotencyKey}` : undefined,
      });

      // Target user ID for the message record
      let messageUserId = userId;
      if (!messageUserId && clientId) {
        const client = await prisma.client.findUnique({ where: { id: clientId }, select: { userId: true } });
        if (client) messageUserId = client.userId;
      }

      if (!messageUserId) {
        return Response.json({ error: 'Unable to associate message with an active user account' }, { status: 400 });
      }

      const msg = await prisma.message.create({
        data: {
          userId: messageUserId,
          senderIdId: senderId || null,
          message,
          recipientCount: recipients.length,
          totalUnits: totalUnitsNum,
          totalCost: totalCostNum,
          status: 'QUEUED',
          idempotencyKey,
        },
      });

      await prisma.messageRecipient.createMany({
        data: recipientDetails.map((rec) => ({
          messageId: msg.id,
          phone: rec.phone,
          status: 'PENDING',
          cost: rec.cost,
        })),
      });

      const recipientRecords = await prisma.messageRecipient.findMany({
        where: { messageId: msg.id },
      });

      for (const rec of recipientRecords) {
        await enqueueJob({
          type: 'send-sms',
          queue: 'sms-default',
          priority: 'NORMAL',
          payload: {
            recipient: rec.phone,
            template: 'direct',
            templateData: { body: message },
            messageId: msg.id,
            recipientId: rec.id,
          },
          idempotencyKey: idempotencyKey ? `v1-job-${idempotencyKey}-${rec.id}` : undefined,
        });
      }

      return Response.json({
        success: true,
        messageId: msg.id,
        status: 'QUEUED',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return Response.json({ error: message }, { status: 400 });
    }
  });
}
