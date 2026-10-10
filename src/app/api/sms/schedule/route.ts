import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { scheduleSmsSchema } from '@/lib/validations/sms';
import { AppError } from '@/lib/errors';
import { consumeDraftOnSend, resolveUserTenant } from '@/lib/sms/draft-service';
import { WalletService } from '@/lib/wallet/service';
import { enqueueScheduledSmsOccurrence, cancelScheduledSmsOccurrences } from '@/lib/jobs/db';
import { InvalidSmsRecipientsError, quoteSms } from '@/lib/sms/quote';
import { validateRecurringSchedule } from '@/lib/sms/scheduled-dispatcher';

export async function GET(req: Request) {
  try {
    const session = await requirePermission('sms.view');
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const single = await prisma.scheduledMessage.findFirst({
        where: { id, userId: session.userId },
        include: {
          senderId: {
            select: { id: true, senderId: true },
          },
        },
      });
      if (!single) {
        return NextResponse.json(
          { success: false, error: 'Scheduled message not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: single });
    }

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const status = searchParams.get('status');
    const recurringOnly = searchParams.get('recurring') === 'true';

    const where: Prisma.ScheduledMessageWhereInput = { userId: session.userId };
    if (status && status !== 'ALL') {
      where.status = status;
    } else {
      where.status = { notIn: ['COMPLETED', 'CANCELLED', 'SENT', 'DELIVERED', 'PARTIAL', 'FAILED'] };
    }

    if (recurringOnly) {
      where.isRecurring = true;
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
    const message = status < 500 && error instanceof Error
      ? error.message
      : 'Unable to load scheduled messages right now. Please try again.';
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
    
    const { senderId, recipients, message, scheduledAt, timezone, isRecurring, cronExpression, draftId, idempotencyKey } = parsed.data;

    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timezone });
      if (isRecurring) validateRecurringSchedule(cronExpression, timezone);
    } catch (error) {
      return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Invalid schedule settings.' }, { status: 400 });
    }

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

    if (idempotencyKey) {
      const existing = await prisma.scheduledMessage.findFirst({ where: { userId: session.userId, idempotencyKey } });
      if (existing) {
        const matches = existing.message === message && existing.senderIdId === validSenderIdId &&
          JSON.stringify(existing.recipients) === JSON.stringify(recipients) &&
          existing.scheduledAt.getTime() === new Date(scheduledAt).getTime() &&
          existing.isRecurring === isRecurring && existing.cronExpression === (cronExpression ?? null) &&
          existing.timezone === timezone;
        if (!matches) {
          return NextResponse.json({ success: false, error: 'This idempotency key was already used for a different scheduled message.' }, { status: 409 });
        }
        return NextResponse.json({ success: true, scheduledMessageId: existing.id, status: existing.status });
      }
    }

    let quote;
    try {
      quote = await quoteSms({ recipients, message });
    } catch (error) {
      if (error instanceof InvalidSmsRecipientsError) {
        return NextResponse.json({ success: false, error: error.message, invalidRecipients: error.invalidRecipients.slice(0, 50), truncated: error.invalidRecipients.length > 50 }, { status: 400 });
      }
      throw error;
    }

    const wallet = await WalletService.getOrCreateWallet({ userId: session.userId });
    const result = await prisma.$transaction(async (tx) => {
      const schedMsg = await tx.scheduledMessage.create({
        data: {
          userId: session.userId,
          idempotencyKey,
          senderIdId: validSenderIdId,
          message,
          recipients,
          recipientCount: recipients.length,
          totalUnits: quote.totalUnits,
          segmentCount: quote.segments,
          encoding: quote.encoding,
          estimatedCost: quote.totalCost,
          scheduledAt: new Date(scheduledAt),
          timezone,
          isRecurring,
          cronExpression,
          status: 'SCHEDULED',
        },
      });
      await WalletService.deduct(wallet.id, quote.totalCost, {
        tx,
        userId: session.userId,
        description: `Upfront charge for scheduled SMS ${schedMsg.id}`,
        idempotencyKey: `scheduled-initial-charge-${schedMsg.id}`,
      });
      await enqueueScheduledSmsOccurrence({ tx, scheduledMessageId: schedMsg.id, scheduledAt: schedMsg.scheduledAt });

      return schedMsg;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if (draftId) {
      const tenantContext = await resolveUserTenant(session.userId);
      await consumeDraftOnSend(tenantContext, draftId);
    }

    return NextResponse.json({ success: true, scheduledMessageId: result.id, status: 'SCHEDULED', estimatedCost: quote.totalCost.toString() });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    if (error instanceof Error && error.message === 'Insufficient funds') {
      return NextResponse.json({ success: false, error: 'Your wallet does not have enough funds for this scheduled message.' }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'This scheduled message was already submitted. Retry the request with the same idempotency key to retrieve it.' }, { status: 409 });
    }
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error && status < 500 ? error.message : 'Unable to schedule messages right now. Please try again.';
    return NextResponse.json({ success: false, error: message }, { status });
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
      where: { id, userId: session.userId, status: { in: ['SCHEDULED', 'PAUSED'] } },
    });

    if (!scheduled) {
      return NextResponse.json({ success: false, error: 'Scheduled message not found or cannot be cancelled' }, { status: 404 });
    }

    const refunded = !scheduled.executedAt && scheduled.estimatedCost.greaterThan(0);
    const cancelled = await prisma.$transaction(async (tx) => {
      const claim = await tx.scheduledMessage.updateMany({
        where: {
          id,
          userId: session.userId,
          status: scheduled.status,
          scheduledAt: scheduled.scheduledAt,
          updatedAt: scheduled.updatedAt,
        },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
      });
      if (claim.count !== 1) return false;

      await cancelScheduledSmsOccurrences({ tx, scheduledMessageId: id });
      if (refunded) {
        const wallet = scheduled.clientId
          ? await tx.wallet.findUnique({ where: { clientId: scheduled.clientId } })
          : await tx.wallet.findUnique({ where: { userId: session.userId } });
        if (!wallet) throw new Error('Wallet not found for scheduled message refund');
        await WalletService.refund(wallet.id, scheduled.estimatedCost, {
          tx,
          userId: session.userId,
          description: `Refund for scheduled SMS ${scheduled.id} before dispatch`,
          idempotencyKey: `scheduled-refund-${scheduled.id}`,
        });
      }
      return true;
    });

    if (!cancelled) {
      return NextResponse.json({ success: false, error: 'The message has entered dispatch and can no longer be cancelled.' }, { status: 409 });
    }

    return NextResponse.json({ success: true, message: refunded ? 'Scheduled message cancelled and refunded successfully' : 'Scheduled message cancelled successfully' });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = status < 500 && error instanceof Error
      ? error.message
      : 'Unable to cancel this scheduled message right now. Please try again.';
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
    const {
      id,
      action,
      message,
      scheduledAt,
      senderId,
      status: targetStatusParam,
      isRecurring,
      cronExpression,
      recipients,
    } = body;

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

    if (!['SCHEDULED', 'PAUSED'].includes(scheduled.status)) {
      return NextResponse.json(
        { success: false, error: 'This message has entered dispatch and can no longer be changed.' },
        { status: 409 }
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

      const updated = scheduled.status === 'SCHEDULED'
        ? await prisma.$transaction(async (tx) => {
            const claim = await tx.scheduledMessage.updateMany({
              where: { id, userId: session.userId, status: 'SCHEDULED', scheduledAt: scheduled.scheduledAt, updatedAt: scheduled.updatedAt },
              data: { status: 'PAUSED' },
            });
            if (claim.count !== 1) throw new AppError('The message entered dispatch before it could be paused.', 409);
            await cancelScheduledSmsOccurrences({ tx, scheduledMessageId: id });
            return tx.scheduledMessage.findUniqueOrThrow({
              where: { id },
              include: { senderId: { select: { id: true, senderId: true } } },
            });
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

      const updated = await prisma.$transaction(async (tx) => {
        const claim = await tx.scheduledMessage.updateMany({
          where: { id, userId: session.userId, status: scheduled.status, scheduledAt: scheduled.scheduledAt, updatedAt: scheduled.updatedAt },
          data: { status: nextStatus },
        });
        if (claim.count !== 1) throw new AppError('The message changed before this action could be completed.', 409);
        if (nextStatus === 'PAUSED') {
          await cancelScheduledSmsOccurrences({ tx, scheduledMessageId: id });
        } else {
          await enqueueScheduledSmsOccurrence({ tx, scheduledMessageId: id, scheduledAt: scheduled.scheduledAt });
        }
        return tx.scheduledMessage.findUniqueOrThrow({
          where: { id },
          include: { senderId: { select: { id: true, senderId: true } } },
        });
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
    if (targetStatus !== 'SCHEDULED' && targetStatus !== 'PAUSED') {
      return NextResponse.json({ success: false, error: 'Status must be SCHEDULED or PAUSED.' }, { status: 400 });
    }

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
    if (typeof senderId === 'string' && senderId !== scheduled.senderIdId) {
      const validSender = await prisma.senderId.findFirst({
        where: {
          OR: [{ id: senderId }, { senderId }],
          userId: session.userId,
          status: 'APPROVED',
        },
      });
      if (!validSender) {
        return NextResponse.json({ success: false, error: 'Specified Sender ID is invalid, unapproved, or does not belong to you.' }, { status: 400 });
      }
      validSenderIdId = validSender.id;
    }

    const updatedMessage = typeof message === 'string' && message.trim() ? message.trim() : scheduled.message;
    const updatedRecipients = Array.isArray(recipients) ? recipients : scheduled.recipients;
    if (updatedRecipients.some((phone) => typeof phone !== 'string' || phone.length === 0)) {
      return NextResponse.json({ success: false, error: 'Recipients must be non-empty phone numbers.' }, { status: 400 });
    }
    const nextIsRecurring = typeof isRecurring === 'boolean' ? isRecurring : scheduled.isRecurring;
    const nextCronExpression = typeof cronExpression === 'string' ? cronExpression : scheduled.cronExpression ?? undefined;
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: scheduled.timezone });
      if (nextIsRecurring) validateRecurringSchedule(nextCronExpression, scheduled.timezone);
    } catch (error) {
      return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Invalid schedule settings.' }, { status: 400 });
    }

    let quote;
    try {
      quote = await quoteSms({ recipients: updatedRecipients, message: updatedMessage, clientId: scheduled.clientId ?? undefined });
    } catch (error) {
      if (error instanceof InvalidSmsRecipientsError) {
        return NextResponse.json({ success: false, error: error.message, invalidRecipients: error.invalidRecipients.slice(0, 50) }, { status: 400 });
      }
      throw error;
    }

    const wallet = scheduled.clientId
      ? await WalletService.getOrCreateWallet({ userId: scheduled.userId, clientId: scheduled.clientId })
      : await WalletService.getOrCreateWallet({ userId: scheduled.userId });
    const adjustment = quote.totalCost.minus(scheduled.estimatedCost);
    const editIdempotencyKey = `scheduled-edit-${scheduled.id}-${scheduled.updatedAt.getTime()}`;
    const updated = await prisma.$transaction(async (tx) => {
      const claim = await tx.scheduledMessage.updateMany({
        where: { id, userId: session.userId, status: scheduled.status, scheduledAt: scheduled.scheduledAt, updatedAt: scheduled.updatedAt },
        data: { status: 'PROCESSING' },
      });
      if (claim.count !== 1) throw new AppError('The message entered dispatch before these changes could be saved.', 409);

      await cancelScheduledSmsOccurrences({ tx, scheduledMessageId: id });
      if (!scheduled.executedAt && adjustment.greaterThan(0)) {
        await WalletService.deduct(wallet.id, adjustment, {
          tx,
          userId: session.userId,
          description: `Additional upfront charge for edited scheduled SMS ${id}`,
          idempotencyKey: `${editIdempotencyKey}-charge`,
        });
      } else if (!scheduled.executedAt && adjustment.lessThan(0)) {
        await WalletService.refund(wallet.id, adjustment.abs(), {
          tx,
          userId: session.userId,
          description: `Pre-dispatch refund for edited scheduled SMS ${id}`,
          idempotencyKey: `${editIdempotencyKey}-refund`,
        });
      }

      const result = await tx.scheduledMessage.update({
        where: { id },
        data: {
          message: updatedMessage,
          recipients: updatedRecipients,
          recipientCount: updatedRecipients.length,
          totalUnits: quote.totalUnits,
          scheduledAt: targetScheduledAt,
          status: targetStatus,
          senderIdId: validSenderIdId,
          encoding: quote.encoding,
          segmentCount: quote.segments,
          estimatedCost: quote.totalCost,
          isRecurring: nextIsRecurring,
          cronExpression: nextCronExpression,
        },
        include: { senderId: { select: { id: true, senderId: true } } },
      });
      if (targetStatus === 'SCHEDULED') {
        await enqueueScheduledSmsOccurrence({ tx, scheduledMessageId: id, scheduledAt: targetScheduledAt });
      }
      return result;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({
      success: true,
      message: targetStatus === 'SCHEDULED'
        ? 'Scheduled message updated and queued for delivery.'
        : 'Scheduled message updated and kept paused.',
      data: updated,
    });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = status < 500 && error instanceof Error
      ? error.message
      : 'Unable to update this scheduled message right now. Please try again.';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

