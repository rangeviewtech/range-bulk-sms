import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { prisma, Prisma } from '@/lib/prisma';
import { withApiKey } from '@/lib/api-keys/service';
import { z } from 'zod';
import { enqueueJob } from '@/lib/jobs/db';
import { BillingService } from '@/lib/billing/billing-service';
import { countSms } from '@/lib/sms/counter';
import { FraudPrevention } from '@/lib/security/fraud-prevention';
import { RegulatoryEngine } from '@/lib/compliance/regulatory-engine';
import { verifyAuthenticatedSession } from '@/lib/auth/session';

const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** Authenticated mobile session message history. API-key dispatch remains POST-only. */
export async function GET(req: Request) {
  const session = await verifyAuthenticatedSession();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
  }

  const parsed = historyQuerySchema.safeParse({
    page: new URL(req.url).searchParams.get('page') ?? undefined,
    limit: new URL(req.url).searchParams.get('limit') ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Page and limit must be valid positive numbers; limit cannot exceed 100.' }, { status: 400 });
  }

  try {
    const { page, limit } = parsed.data;
    const where = { userId: session.userId };
    const [items, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          message: true,
          status: true,
          recipientCount: true,
          totalUnits: true,
          createdAt: true,
          senderId: { select: { senderId: true } },
        },
      }),
      prisma.message.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: items.map((item) => ({
        id: item.id,
        message: item.message,
        status: item.status,
        recipientCount: item.recipientCount,
        totalUnits: item.totalUnits,
        createdAt: item.createdAt.toISOString(),
        senderId: item.senderId?.senderId ?? null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[API_V1_MESSAGE_HISTORY_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Unable to load message history.' }, { status: 500 });
  }
}

// Payload schema for sending a direct message via API
const sendDirectMessageSchema = z.object({
  recipients: z.array(z.string().min(1)).min(1).max(100),
  message: z.string().min(1).max(1600),
  senderId: z.string().min(1).max(11),
  gatewayId: z.string().optional(),
  purpose: z.enum(["MARKETING", "TRANSACTIONAL", "SYSTEM"]).default("TRANSACTIONAL"),
  externalId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  return withApiKey(req, 'sms.send', async (request, context) => {
    try {
    const userId = context.userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'An account is required to send messages.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = sendDirectMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid payload', details: parsed.error.format() }, { status: 400 });
    }

    const { recipients, message, senderId, purpose } = parsed.data;

    // 2. Validate Sender ID
    const validSender = await prisma.senderId.findFirst({
      where: { OR: [{ id: senderId }, { senderId }], userId, status: 'APPROVED' }
    });

    if (!validSender) {
      return NextResponse.json({ success: false, error: 'Invalid or unapproved Sender ID' }, { status: 400 });
    }

    const eligibleRecipients: string[] = [];
    const rejectedRecipients: { phone: string; reason: string }[] = [];

    for (const phone of recipients) {
      // Premium Rate / Toll Fraud Check
      const destCheck = FraudPrevention.checkDestination(phone);
      if (destCheck.isFraudulent) {
        console.warn(`[FRAUD_PREVENTION] Blocked destination: ${phone}`);
        rejectedRecipients.push({ phone, reason: 'High risk destination blocked by fraud prevention' });
        continue;
      }

      // OTP Pumping / Velocity Check
      const velocityCheck = await FraudPrevention.checkVelocity(userId, phone);
      if (velocityCheck.isFraudulent) {
        console.warn(`[FRAUD_PREVENTION] OTP Pumping detected for user ${userId} to ${phone}`);
        return NextResponse.json({ success: false, error: 'Fraud protection triggered: Too many messages to the same destination.' }, { status: 429 });
      }

      // Pre-Dispatch Regulatory & UCC Compliance Check
      const compliance = await RegulatoryEngine.verifyPreDispatchCompliance({
        phone,
        message,
        purpose,
        tenantId: userId,
      });

      if (!compliance.allowed) {
        rejectedRecipients.push({ phone, reason: compliance.reason || 'Blocked by regulatory compliance policy' });
        continue;
      }

      eligibleRecipients.push(phone);
    }

    if (eligibleRecipients.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No eligible recipients met compliance and fraud policies',
        rejected: rejectedRecipients 
      }, { status: 400 });
    }

    // 3. Billing & Wallet Reservation
    const { segments } = countSms(message);
    const totalCost = eligibleRecipients.length * segments;

    const batchRef = `api_batch_${randomUUID()}`;
    const dispatch = await prisma.$transaction(async (tx) => {
      // Reserve funds and persist the campaign, messages, and dispatch jobs
      // together. A failed write cannot leave funds held or only part of the
      // requested batch queued.
      const reservation = await BillingService.reserveCredits(
        userId,
        batchRef,
        totalCost,
        batchRef,
        tx
      );
      if (!reservation.success) return { reservation, campaignId: null };

      const campaign = await tx.campaign.create({
        data: {
          userId,
          name: `API Batch: ${new Date().toISOString()}`,
          senderIdId: validSender.id,
          gatewayId: parsed.data.gatewayId,
          message,
          status: 'RUNNING',
          totalRecipients: eligibleRecipients.length,
          totalSmsUnits: totalCost,
          pendingCount: eligibleRecipients.length,
          type: 'BROADCAST',
          metadata: {
            reservationId: reservation.reservationId,
            purpose,
            externalId: parsed.data.externalId,
          },
        },
      });

      for (const phone of eligibleRecipients) {
        const messageRecord = await tx.message.create({
          data: {
            campaignId: campaign.id,
            userId,
            senderIdId: validSender.id,
            gatewayId: parsed.data.gatewayId,
            message,
            status: 'PENDING',
            segmentCount: segments,
            recipientCount: 1,
            totalUnits: segments,
            metadata: { purpose },
            recipients: { create: { phone, status: 'PENDING' } },
          },
        });

        await enqueueJob({
          tx,
          type: 'sms.dispatch',
          payload: { messageId: messageRecord.id },
          priority: 'HIGH',
          idempotencyKey: `sms-dispatch:${messageRecord.id}`,
        });
      }

      return { reservation, campaignId: campaign.id };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if (!dispatch.reservation.success || !dispatch.campaignId) {
      return NextResponse.json(
        { success: false, error: dispatch.reservation.error || 'Unable to reserve message credits.' },
        { status: 402 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Messages queued for delivery', 
      acceptedCount: eligibleRecipients.length,
      rejectedCount: rejectedRecipients.length,
      rejected: rejectedRecipients.length > 0 ? rejectedRecipients : undefined,
      campaignId: dispatch.campaignId,
      reservedUnits: totalCost
    }, { status: 202 });

  } catch (error) {
    console.error("[API_V1_MESSAGES_ERROR]", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
  });
}
