import { NextRequest } from 'next/server';
import { withApiKey } from '@/lib/api-keys/service';
import { sendSmsSchema } from '@/lib/validations/sms';
import { prisma, Prisma } from '@/lib/prisma';
import { WalletService } from '@/lib/wallet/service';
import { enqueueJob } from '@/lib/jobs/db';
import { isSandboxRequest, handleDeterministicSms } from '@/lib/sms/sandbox';
import { AppError } from '@/lib/errors';

async function getIdempotentMessageResponse(params: {
  idempotencyKey?: string;
  userId: string;
  recipients: string[];
  message: string;
  senderId?: string;
  gatewayId?: string;
}) {
  if (!params.idempotencyKey) return null;
  const existing = await prisma.message.findUnique({
    where: { idempotencyKey: params.idempotencyKey },
    include: {
      recipients: { select: { phone: true } },
      senderId: { select: { senderId: true } },
    },
  });
  if (!existing) return null;

  const requestedRecipients = [...params.recipients].sort();
  const existingRecipients = existing.recipients.map(({ phone }) => phone).sort();
  const matches = existing.userId === params.userId &&
    existing.message === params.message &&
    (existing.senderIdId === (params.senderId ?? null) || existing.senderId?.senderId === params.senderId) &&
    existing.gatewayId === (params.gatewayId ?? null) &&
    requestedRecipients.length === existingRecipients.length &&
    requestedRecipients.every((phone, index) => phone === existingRecipients[index]);

  if (!matches) {
    return Response.json({ success: false, error: 'This idempotency key was already used for different message details.' }, { status: 409 });
  }

  return Response.json({
    success: true,
    messageId: existing.id,
    status: existing.status,
    recipientCount: existing.recipientCount,
    totalUnits: existing.totalUnits,
  });
}

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

      const { senderId, gatewayId, recipients, message, idempotencyKey } = parsed.data;

      let messageUserId = userId;
      if (!messageUserId && clientId) {
        const client = await prisma.client.findUnique({
          where: { id: clientId },
          select: { userId: true },
        });
        if (client) messageUserId = client.userId;
      }
      if (!messageUserId) {
        return Response.json(
          { error: 'Unable to associate message with an active user account' },
          { status: 400 }
        );
      }

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
        const existingResponse = await getIdempotentMessageResponse({
          idempotencyKey,
          userId: messageUserId,
          recipients,
          message,
          senderId,
          gatewayId,
        });
        if (existingResponse) return existingResponse;
      }

      // Validate gatewayId if provided
      let validGatewayId: string | undefined = undefined;
      let isHardwareGateway = false;
      if (gatewayId) {
        const gateway = await prisma.gateway.findUnique({
          where: { id: gatewayId },
          include: { devices: true },
        });

        if (!gateway || gateway.userId !== messageUserId) {
          return Response.json(
            { success: false, error: 'Specified Gateway is invalid or does not belong to you' },
            { status: 400 }
          );
        }

        let isOnline = gateway.status === 'ONLINE';
        if (isOnline && (gateway.type === 'ESP32_GSM' || gateway.type === 'ANDROID')) {
          const lastHeartbeat = gateway.devices?.[0]?.lastHeartbeatAt;
          if (
            !lastHeartbeat ||
            new Date().getTime() - new Date(lastHeartbeat).getTime() > 2 * 60 * 1000
          ) {
            isOnline = false;
          }
        }

        if (!isOnline) {
          return Response.json(
            {
              success: false,
              error: `The selected gateway "${gateway.name}" is currently offline.`,
            },
            { status: 400 }
          );
        }

        validGatewayId = gateway.id;
        isHardwareGateway = gateway.type === 'ESP32_GSM' || gateway.type === 'ANDROID';
        if (!isHardwareGateway) {
          return Response.json(
            {
              success: false,
              error:
                'Cloud and SMPP gateway selection is not supported by this dispatch route yet. Omit the gateway to use the configured cloud SMS provider, or select an Android/ESP32 gateway.',
            },
            { status: 400 }
          );
        }
      }

      if (!validGatewayId && !senderId) {
        return Response.json(
          {
            success: false,
            error: 'A Sender ID is required when routing through the cloud system.',
          },
          { status: 400 }
        );
      }

      // Validate senderId ownership and approval if supplied
      let validSenderId: string | undefined;
      if (senderId && !isHardwareGateway) {
        const validSender = await prisma.senderId.findFirst({
          where: {
            id: senderId,
            status: 'APPROVED',
            OR: [...(userId ? [{ userId }] : []), ...(clientId ? [{ clientId }] : [])],
          },
        });
        if (!validSender) {
          return Response.json(
            {
              success: false,
              error: 'Specified Sender ID is invalid, unapproved, or does not belong to you',
            },
            { status: 400 }
          );
        }
        validSenderId = validSender.id;
      }

      // Calculate segments and dynamically price each recipient
      const { countSms } = await import('@/lib/sms/counter');
      const { analyzePhone } = await import('@/lib/sms/phone-analyzer');
      const { PricingEngine } = await import('@/lib/wallet/pricing');

      const { segments } = countSms(message);
      const analyzedRecipients = recipients.map((phone) => analyzePhone(phone));
      const invalidRecipients = analyzedRecipients
        .map((analysis, index) => ({ analysis, index }))
        .filter(({ analysis }) => analysis.validity !== 'valid_pattern' || !analysis.e164)
        .map(({ analysis, index }) => ({ index, reason: analysis.error || 'Invalid telephone number' }));
      if (invalidRecipients.length > 0) {
        return Response.json({
          success: false,
          error: 'One or more recipients have an invalid telephone number.',
          invalidRecipients: invalidRecipients.slice(0, 50),
          truncated: invalidRecipients.length > 50,
        }, { status: 400 });
      }

      let totalCost = new Prisma.Decimal(0);
      let totalUnitsNum = 0;
      const pricingCache = new Map<string, import('@/generated/prisma/client').Prisma.Decimal>();
      const recipientDetails = [];

      for (const [index, phone] of recipients.entries()) {
        const analysis = analyzedRecipients[index];
        const countryCode = analysis.country?.calling_code
          ? `+${analysis.country.calling_code}`
          : '+256';

        let costPerUnit = pricingCache.get(countryCode);
        if (!costPerUnit) {
          const priceInfo = await PricingEngine.getPrice({ countryCode, clientId });
          costPerUnit = priceInfo.sellingPrice;
          pricingCache.set(countryCode, costPerUnit);
        }

        const units = segments;
        const recCost = costPerUnit.mul(units);
        totalUnitsNum += units;
        totalCost = totalCost.plus(recCost);

        recipientDetails.push({
          phone,
          units,
          cost: recCost,
        });
      }

      const wallet = await WalletService.getOrCreateWallet({ userId, clientId });
      let msg;
      try {
        msg = await prisma.$transaction(async (tx) => {
          await WalletService.deduct(wallet.id, totalCost, {
            userId,
            description: `v1 API SMS Dispatch (${totalUnitsNum} units across ${recipients.length} recipients)`,
            idempotencyKey: idempotencyKey ? `v1-wallet-${idempotencyKey}` : undefined,
            tx,
          });

          const createdMessage = await tx.message.create({
            data: {
              userId: messageUserId,
              senderIdId: validSenderId ?? null,
              gatewayId: validGatewayId,
              message,
              encoding: countSms(message).encoding,
              segmentCount: segments,
              recipientCount: recipients.length,
              totalUnits: totalUnitsNum,
              totalCost,
              status: 'QUEUED',
              idempotencyKey,
            },
          });

          await tx.messageRecipient.createMany({
            data: recipientDetails.map((recipient) => ({
              messageId: createdMessage.id,
              phone: recipient.phone,
              status: 'PENDING',
              cost: recipient.cost,
            })),
          });

          const recipientRecords = await tx.messageRecipient.findMany({
            where: { messageId: createdMessage.id },
            select: { id: true, phone: true },
          });

          if (isHardwareGateway && validGatewayId) {
            const { assignRecipientsToHardwareGateway } = await import('@/lib/gateways/dispatch');
            await assignRecipientsToHardwareGateway(
              createdMessage.id,
              validGatewayId,
              recipientRecords.map((recipient) => recipient.id),
              tx,
            );
          } else {
            for (const recipient of recipientRecords) {
              await enqueueJob({
                tx,
                type: 'send-sms',
                queue: 'sms-default',
                priority: 'NORMAL',
                payload: {
                  recipient: recipient.phone,
                  template: 'direct',
                  templateData: { body: message },
                  messageId: createdMessage.id,
                  recipientId: recipient.id,
                },
                idempotencyKey: idempotencyKey ? `v1-job-${idempotencyKey}-${recipient.id}` : undefined,
              });
            }
          }

          return createdMessage;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      } catch (error) {
        if (idempotencyKey && error instanceof Prisma.PrismaClientKnownRequestError &&
          ['P2002', 'P2034'].includes(error.code)) {
          const existingResponse = await getIdempotentMessageResponse({
            idempotencyKey,
            userId: messageUserId,
            recipients,
            message,
            senderId,
            gatewayId,
          });
          if (existingResponse) return existingResponse;
        }
        throw error;
      }

      return Response.json({
        success: true,
        messageId: msg.id,
        status: 'QUEUED',
        recipientCount: recipients.length,
        totalUnits: totalUnitsNum,
      });
    } catch (error: unknown) {
      if (error instanceof AppError && error.statusCode < 500) {
        return Response.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode });
      }
      if (error instanceof Error && error.message === 'Insufficient funds') {
        return Response.json({ success: false, error: 'Your wallet does not have enough funds for this message.' }, { status: 400 });
      }
      console.error('[API_V1_SMS_SEND_ERROR]', error);
      return Response.json({ success: false, error: 'Unable to send messages right now. Please try again.' }, { status: 500 });
    }
  });
}
