import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { scheduleSmsSchema } from '@/lib/validations/sms';
import { AppError } from '@/lib/errors';
import { consumeDraftOnSend, resolveUserTenant } from '@/lib/sms/draft-service';

export async function GET(req: Request) {
  try {
    const session = await requirePermission('sms.view');
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const status = searchParams.get('status');

    const where: Prisma.ScheduledMessageWhereInput = { userId: session.userId };
    if (status) {
      where.status = status;
    }

    const [scheduled, total] = await Promise.all([
      prisma.scheduledMessage.findMany({
        where,
        include: {
          senderId: {
            select: { id: true, senderId: true },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.scheduledMessage.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: scheduled,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}

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
    
    const { senderId, recipients, message, scheduledAt, timezone, isRecurring, cronExpression, draftId, } = parsed.data;

    let validSenderIdId: string | null = null;
    if (senderId) {
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
          senderIdId: validSenderIdId,
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

    if (draftId) {
      const tenantContext = await resolveUserTenant(session.userId);
      await consumeDraftOnSend(tenantContext, draftId);
    }

    return NextResponse.json({ success: true, scheduledMessageId: result.id, status: 'SCHEDULED' });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requirePermission('sms.schedule');
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Scheduled message ID is required' }, { status: 400 });
    }

    const scheduled = await prisma.scheduledMessage.findFirst({
      where: { id, userId: session.userId, status: 'SCHEDULED' },
    });

    if (!scheduled) {
      return NextResponse.json({ success: false, error: 'Scheduled message not found or cannot be cancelled' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.scheduledMessage.update({
        where: { id },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
      });

      await tx.wallet.update({
        where: { userId: session.userId },
        data: { balance: { increment: scheduled.estimatedCost } },
      });
    });

    return NextResponse.json({ success: true, message: 'Scheduled message cancelled and refunded successfully' });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
