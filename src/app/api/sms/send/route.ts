import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { sendSmsSchema } from '@/lib/validations/sms';
import { WalletService } from '@/lib/wallet/service';
import { enqueueJob } from '@/lib/jobs/db';
import { AppError } from '@/lib/errors';
import { consumeDraftOnSend, resolveUserTenant } from '@/lib/sms/draft-service';

export async function POST(req: Request) {
  try {
    const session = await requirePermission('sms.send');
    const body = await req.json().catch(() => ({}));
    
    const parsed = sendSmsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: parsed.error.format() },
        { status: 400 }
      );
    }
    
    const { senderId, gatewayId, recipients, message, idempotencyKey, draftId, personalizedMessages } = parsed.data;

    if (idempotencyKey) {
      const existing = await prisma.message.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        return NextResponse.json({ success: true, messageId: existing.id, status: existing.status });
      }
    }

    // Validate gatewayId if provided
    let validGatewayId: string | undefined = undefined;
    if (gatewayId) {
      const gateway = await prisma.gateway.findUnique({
        where: { id: gatewayId },
        include: { devices: true }
      });
      
      if (!gateway || gateway.userId !== session.userId) {
        return NextResponse.json(
          { success: false, error: 'Specified Gateway is invalid or does not belong to you' },
          { status: 400 }
        );
      }

      // Check if it's explicitly OFFLINE or hasn't had a heartbeat in 2 minutes
      let isOnline = gateway.status !== 'OFFLINE' && gateway.status !== 'SUSPENDED';
      
      if (isOnline && (gateway.type === 'ESP32_GSM' || gateway.type === 'ANDROID')) {
        const lastHeartbeat = gateway.devices?.[0]?.lastHeartbeatAt;
        if (!lastHeartbeat || (new Date().getTime() - new Date(lastHeartbeat).getTime() > 2 * 60 * 1000)) {
          isOnline = false;
        }
      }

      if (!isOnline) {
        return NextResponse.json(
          { success: false, error: `The selected gateway "${gateway.name}" is currently offline. Please wait for it to connect or select a different route.` },
          { status: 400 }
        );
      }
      
      validGatewayId = gateway.id;
    }

    if (!validGatewayId && !senderId) {
      return NextResponse.json(
        { success: false, error: 'A Sender ID is required when routing through the cloud system.' },
        { status: 400 }
      );
    }
    
    // Check if the selected gateway is a hardware type that ignores sender ID
    let isHardwareGateway = false;
    if (gatewayId) {
      const g = await prisma.gateway.findUnique({ where: { id: gatewayId }});
      if (g && (g.type === 'ESP32_GSM' || g.type === 'ANDROID')) {
        isHardwareGateway = true;
      }
    }

    // Validate senderId ownership and approval status
    let validSenderIdId: string | null = null;
    if (senderId && !isHardwareGateway) {
      const validSender = await prisma.senderId.findFirst({
        where: {
          OR: [{ id: senderId }, { senderId }],
          userId: session.userId,
          status: 'APPROVED',
        },
      });
      if (!validSender) {
        return NextResponse.json(
          { success: false, error: 'Specified Sender ID is invalid, unapproved, or does not belong to you' },
          { status: 400 }
        );
      }
      validSenderIdId = validSender.id;
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
    
    const userClient = await prisma.user.findUnique({ where: { id: session.userId }, select: { client: { select: { id: true } } } });
    const clientId = userClient?.client?.id;

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
      
      recipientDetails.push({ phone, units, cost: recCost.toNumber() });
    }

    const decimalCost = new Prisma.Decimal(totalCostNum);

    // Enforce ledger integrity via WalletService.deduct with row-level locking
    const wallet = await WalletService.getOrCreateWallet({ userId: session.userId });
    await WalletService.deduct(wallet.id, decimalCost, {
      userId: session.userId,
      description: `SMS Outbound dispatch (${totalUnitsNum} units across ${recipients.length} recipients)`,
      idempotencyKey: idempotencyKey ? `sms-wallet-${idempotencyKey}` : undefined,
    });

    // Create Message record
    const msg = await prisma.message.create({
      data: {
        userId: session.userId,
        senderIdId: validSenderIdId,
        gatewayId: validGatewayId,
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
      const customMsg = personalizedMessages?.find(p => p.phone === rec.phone)?.message || message;
      await enqueueJob({
        type: 'send-sms',
        queue: 'sms-default',
        priority: 'NORMAL',
        payload: {
          recipient: rec.phone,
          template: 'direct',
          templateData: { body: customMsg },
          messageId: msg.id,
          recipientId: rec.id,
        },
        idempotencyKey: idempotencyKey ? `job-${idempotencyKey}-${rec.id}` : undefined,
      });
    }

    if (draftId) {
      const tenantContext = await resolveUserTenant(session.userId);
      await consumeDraftOnSend(tenantContext, draftId);
    }

    return NextResponse.json({ success: true, messageId: msg.id, status: 'QUEUED' });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
