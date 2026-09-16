import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { scheduleSmsSchema } from '@/lib/validations/sms';
import { AppError } from '@/lib/errors';

export async function POST(req: Request) {
  try {
    const session = await requirePermission('sms.schedule');
    const body = await req.json().catch(() => ({}));
    
    const parsed = scheduleSmsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: parsed.error.format() },
        { status: 400 }
      );
    }
    
    const { senderId, recipients, message, scheduledAt, timezone, isRecurring, cronExpression } = parsed.data;

    const units = recipients.length;
    const estimatedCost = units * 10; 

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.userId },
      });

      if (!wallet || wallet.balance.toNumber() < estimatedCost) {
        throw new AppError('Insufficient wallet balance for scheduled message', 400);
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: estimatedCost } },
      });

      const schedMsg = await tx.scheduledMessage.create({
        data: {
          userId: session.userId,
          message,
          recipients,
          recipientCount: recipients.length,
          totalUnits: units,
          estimatedCost,
          scheduledAt: new Date(scheduledAt),
          timezone,
          isRecurring,
          cronExpression,
          status: 'SCHEDULED'
        }
      });

      return schedMsg;
    });

    return NextResponse.json({ success: true, scheduledMessageId: result.id, status: 'SCHEDULED' });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status }
    );
  }
}
