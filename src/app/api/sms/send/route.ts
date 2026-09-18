import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { sendSmsSchema } from '@/lib/validations/sms';
import { WalletService } from '@/lib/wallet/service';
import { enqueueJob } from '@/lib/jobs/db';
import { AppError } from '@/lib/errors';

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
    
    const { senderId, recipients, message, idempotencyKey } = parsed.data;

    if (idempotencyKey) {
      const existing = await prisma.message.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        return NextResponse.json({ success: true, messageId: existing.id, status: existing.status });
      }
    }

    // Validate senderId ownership and approval status
    if (senderId) {
      const validSender = await prisma.senderId.findFirst({
        where: { id: senderId, userId: session.userId, status: 'APPROVED' },
      });
      if (!validSender) {
        return NextResponse.json(
          { success: false, error: 'Specified Sender ID is invalid, unapproved, or does not belong to you' },
          { status: 400 }
        );
      }
    }

    // Cost calculation (10 units/currency per recipient)
    const units = recipients.length;
    const cost = units * 10;
    const decimalCost = new Prisma.Decimal(cost);

    // Enforce ledger integrity via WalletService.deduct with row-level locking
    const wallet = await WalletService.getOrCreateWallet({ userId: session.userId });
    await WalletService.deduct(wallet.id, decimalCost, {
      userId: session.userId,
      description: `SMS Outbound dispatch (${units} recipients)`,
      idempotencyKey: idempotencyKey ? `sms-wallet-${idempotencyKey}` : undefined,
    });

    // Create Message record
    const msg = await prisma.message.create({
      data: {
        userId: session.userId,
        senderIdId: senderId || null,
        message,
        recipientCount: recipients.length,
        totalUnits: units,
        totalCost: cost,
        status: 'QUEUED',
        idempotencyKey,
      },
    });

    await prisma.messageRecipient.createMany({
      data: recipients.map((phone) => ({
        messageId: msg.id,
        phone,
        status: 'PENDING',
        cost: 10,
      })),
    });

    const recipientRecords = await prisma.messageRecipient.findMany({
      where: { messageId: msg.id },
    });

    // Enqueue delivery jobs to the background job queue
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
        idempotencyKey: idempotencyKey ? `job-${idempotencyKey}-${rec.id}` : undefined,
      });
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
