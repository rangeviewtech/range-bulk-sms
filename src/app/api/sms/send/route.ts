import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { sendSmsSchema } from '@/lib/validations/sms';
import { AppError } from '@/lib/errors';

export async function POST(req: Request) {
  try {
    const session = await requirePermission('sms.send');
    const body = await req.json().catch(() => ({}));
    
    const parsed = sendSmsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: parsed.error.format() },
        { status: 400 } as any
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

    // Cost calculation (simplified: 1 unit per recipient)
    const units = recipients.length;
    const cost = units * 10; // example cost 10 per unit

    // Check wallet and deduct in transaction
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.userId },
      });

      if (!wallet || wallet.balance.toNumber() < cost) {
        throw new AppError('Insufficient wallet balance', 400);
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: cost } },
      });

      // Create message
      const msg = await tx.message.create({
        data: {
          userId: session.userId,
          message,
          recipientCount: recipients.length,
          totalUnits: units,
          totalCost: cost,
          status: 'PENDING',
          idempotencyKey,
        }
      });

      // Create recipients
      await tx.messageRecipient.createMany({
        data: recipients.map((phone) => ({
          messageId: msg.id,
          phone,
          status: 'PENDING',
          cost: 10,
        }))
      });

      return msg;
    });

    // In a real system, we would push to queue / SMS engine here.
    
    return NextResponse.json({ success: true, messageId: result.id, status: 'PENDING' });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { success: false, error: error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : 'Internal Server Error' },
      { status }
    );
  }
}
