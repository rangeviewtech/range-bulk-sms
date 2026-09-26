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

export async function PATCH(req: Request) {
  try {
    const session = await requirePermission('sms.schedule');
    const body = await req.json().catch(() => ({}));
    const { id, action, message, scheduledAt, senderId, status: targetStatusParam } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Scheduled message ID is required' },
        { status: 400 }
      );
    }

    const scheduled = await prisma.scheduledMessage.findFirst({
      where: { id, userId: session.userId },
      include: {
        senderId: {
          select: { id: true, senderId: true },
        },
      },
    });

    if (!scheduled) {
      return NextResponse.json(
        { success: false, error: 'Scheduled message not found or unauthorized' },
        { status: 404 }
      );
    }

    if (scheduled.status === 'COMPLETED' || scheduled.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: `Cannot modify a message that is already ${scheduled.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    const now = Date.now();
    const scheduledTimeMs = new Date(scheduled.scheduledAt).getTime();
    const msUntilScheduled = scheduledTimeMs - now;

    // Action 1: 'pause_for_edit'
    // While the user is editing, safely pause the message to prevent accidental dispatch
    if (action === 'pause_for_edit') {
      // 10-second rule: editing only allowed when at least 10s before scheduled time (if status is SCHEDULED)
      if (scheduled.status === 'SCHEDULED' && msUntilScheduled < 10_000) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot edit message within 10 seconds of scheduled transmission. The dispatch window has already started.',
            code: 'TRANSMISSION_WINDOW_LOCKED',
          },
          { status: 400 }
        );
      }

      // If scheduled, set to PAUSED so background dispatchers won't transmit
      const updated = scheduled.status === 'SCHEDULED'
        ? await prisma.scheduledMessage.update({
            where: { id },
            data: { status: 'PAUSED' },
            include: { senderId: { select: { id: true, senderId: true } } },
          })
        : scheduled;

      return NextResponse.json({
        success: true,
        message: 'Message paused for editing to prevent accidental transmission.',
        data: updated,
      });
    }

    // Action 2: 'toggle_status' (Manual Pause or Resume)
    if (action === 'toggle_status') {
      const nextStatus = scheduled.status === 'SCHEDULED' ? 'PAUSED' : 'SCHEDULED';
      if (nextStatus === 'SCHEDULED') {
        // If resuming, must verify scheduled time hasn't passed and is at least 10s in the future
        if (msUntilScheduled < 10_000) {
          return NextResponse.json(
            {
              success: false,
              error: 'Cannot resume message whose scheduled time has passed or is within 10 seconds. Please edit and update the scheduled time first.',
              code: 'SCHEDULED_TIME_PASSED',
            },
            { status: 400 }
          );
        }
      }

      const updated = await prisma.scheduledMessage.update({
        where: { id },
        data: { status: nextStatus },
        include: { senderId: { select: { id: true, senderId: true } } },
      });

      return NextResponse.json({
        success: true,
        status: nextStatus,
        data: updated,
      });
    }

    // Action 3: Edit message and/or reschedule time
    // If original status was SCHEDULED, enforce 10s cutoff rule
    if (scheduled.status === 'SCHEDULED' && msUntilScheduled < 10_000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot edit message within 10 seconds of scheduled transmission.',
          code: 'TRANSMISSION_WINDOW_LOCKED',
        },
        { status: 400 }
      );
    }

    const targetScheduledAt = scheduledAt ? new Date(scheduledAt) : scheduled.scheduledAt;
    const targetScheduledMs = targetScheduledAt.getTime();

    if (isNaN(targetScheduledMs)) {
      return NextResponse.json(
        { success: false, error: 'Invalid scheduled date and time format' },
        { status: 400 }
      );
    }

    const targetStatus = targetStatusParam || 'SCHEDULED';

    // If saving with status SCHEDULED, enforce that targetScheduledAt must be at least 10 seconds in the future
    if (targetStatus === 'SCHEDULED') {
      if (targetScheduledMs <= now + 10_000) {
        return NextResponse.json(
          {
            success: false,
            error: 'The scheduled time has passed or is within 10 seconds. You are required to update the time and date to a future time before scheduling.',
            code: 'TIME_UPDATE_REQUIRED',
          },
          { status: 400 }
        );
      }
    }

    let validSenderIdId = scheduled.senderIdId;
    if (senderId && senderId !== scheduled.senderIdId) {
      const validSender = await prisma.senderId.findFirst({
        where: {
          OR: [{ id: senderId }, { senderId }],
          userId: session.userId,
          status: 'APPROVED',
        },
      });
      if (validSender) {
        validSenderIdId = validSender.id;
      }
    }

    const updatedMessage = typeof message === 'string' && message.trim() ? message.trim() : scheduled.message;
    const charCount = updatedMessage.length;
    const isUnicode = /[^\x00-\x7F]/.test(updatedMessage);
    const maxPerSegment = isUnicode ? 70 : 160;
    const segmentCount = charCount > 0 ? Math.ceil(charCount / maxPerSegment) : 1;
    const encoding = isUnicode ? 'UCS-2' : 'GSM-7';

    const updated = await prisma.scheduledMessage.update({
      where: { id },
      data: {
        message: updatedMessage,
        scheduledAt: targetScheduledAt,
        status: targetStatus,
        senderIdId: validSenderIdId,
        encoding,
        segmentCount,
      },
      include: {
        senderId: {
          select: { id: true, senderId: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: targetStatus === 'SCHEDULED'
        ? 'Scheduled message updated and queued for delivery.'
        : 'Scheduled message updated and kept paused.',
      data: updated,
    });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

