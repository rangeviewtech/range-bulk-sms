import cronParser from 'cron-parser';
import { Prisma } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';
import type { PrismaTransactionClient } from '@/lib/prisma';
import { enqueueJobs, enqueueScheduledSmsOccurrence, cancelScheduledSmsOccurrences } from '@/lib/jobs/db';
import { InvalidSmsRecipientsError, quoteSms } from '@/lib/sms/quote';
import { WalletService } from '@/lib/wallet/service';

type RecurrenceData = {
  cron: string;
  frequency?: string;
  interval?: number;
  endType?: 'NEVER' | 'ON_DATE' | 'AFTER_COUNT';
  endDate?: string;
  maxOccurrences?: number;
  occurrencesCompleted?: number;
};

class ScheduledSmsConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScheduledSmsConfigurationError';
  }
}

function parseRecurrence(cronExpression: string): { data: RecurrenceData; serialized: boolean } {
  if (cronExpression.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(cronExpression) as Partial<RecurrenceData>;
      if (typeof parsed.cron !== 'string') throw new Error('Recurring schedule is missing a cron expression.');
      return { data: { ...parsed, cron: parsed.cron }, serialized: true };
    } catch (error) {
      throw new ScheduledSmsConfigurationError(error instanceof Error ? error.message : 'Invalid recurrence rule.');
    }
  }
  return { data: { cron: cronExpression, endType: 'NEVER', occurrencesCompleted: 0 }, serialized: false };
}

function localDateString(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function validateRecurringSchedule(cronExpression: string | undefined, timeZone: string) {
  try {
    if (!cronExpression?.trim()) throw new Error('A recurrence rule is required for recurring messages.');
    const { data } = parseRecurrence(cronExpression);
    new Intl.DateTimeFormat('en-US', { timeZone });
    cronParser.parse(data.cron, { currentDate: new Date(), tz: timeZone });
    if (data.endType === 'AFTER_COUNT' && (!Number.isInteger(data.maxOccurrences) || (data.maxOccurrences ?? 0) < 1)) {
      throw new Error('Recurring schedule requires a valid occurrence limit.');
    }
    if (data.endType === 'ON_DATE' && !/^\d{4}-\d{2}-\d{2}$/.test(data.endDate ?? '')) {
      throw new Error('Recurring schedule requires a valid end date.');
    }
  } catch (error) {
    if (error instanceof ScheduledSmsConfigurationError) throw error;
    throw new ScheduledSmsConfigurationError(error instanceof Error ? error.message : 'Invalid recurrence rule.');
  }
}

function nextRecurringOccurrence(cronExpression: string, current: Date, timeZone: string) {
  const { data, serialized } = parseRecurrence(cronExpression);
  const interval = Math.max(1, data.interval ?? 1);
  const parts = data.cron.trim().split(/\s+/);
  let cron = data.cron;
  let skip = 0;

  if (data.frequency === 'DAILY' && interval > 1 && parts.length === 5) {
    cron = `${parts[0]} ${parts[1]} * * *`;
    skip = interval - 1;
  } else if (data.frequency === 'BIWEEKLY') {
    skip = 1;
  } else if (data.frequency === 'WEEKLY' && interval > 1) {
    skip = interval - 1;
  }

  const iterator = cronParser.parse(cron, { currentDate: current, tz: timeZone });
  let next: Date | null = null;
  for (let index = 0; index <= skip; index += 1) next = iterator.next().toDate();
  if (!next) return { next: null, cronExpression };

  const completed = (data.occurrencesCompleted ?? 0) + 1;
  if (data.endType === 'AFTER_COUNT' && completed >= (data.maxOccurrences ?? Number.MAX_SAFE_INTEGER)) {
    return { next: null, cronExpression: serialized ? JSON.stringify({ ...data, occurrencesCompleted: completed }) : cronExpression };
  }
  if (data.endType === 'ON_DATE' && data.endDate && localDateString(next, timeZone) > data.endDate) {
    return { next: null, cronExpression: serialized ? JSON.stringify({ ...data, occurrencesCompleted: completed }) : cronExpression };
  }

  return {
    next,
    cronExpression: serialized ? JSON.stringify({ ...data, occurrencesCompleted: completed }) : cronExpression,
  };
}

async function refundFirstOccurrence(tx: PrismaTransactionClient, schedule: {
  id: string;
  userId: string;
  clientId: string | null;
  estimatedCost: Prisma.Decimal;
  idempotencyKey: string | null;
}) {
  const wallet = schedule.clientId
    ? await tx.wallet.findUnique({ where: { clientId: schedule.clientId } })
    : await tx.wallet.findUnique({ where: { userId: schedule.userId } });
  if (!wallet || schedule.estimatedCost.lessThanOrEqualTo(0)) return;
  await WalletService.refund(wallet.id, schedule.estimatedCost, {
    tx,
    userId: schedule.userId,
    description: `Refund for scheduled SMS ${schedule.id} before dispatch`,
    idempotencyKey: `scheduled-refund-${schedule.id}`,
  });
}

export async function failScheduledSmsOccurrence(params: {
  scheduledMessageId: string;
  scheduledAt: Date;
}) {
  return prisma.$transaction(async (tx) => {
    const schedule = await tx.scheduledMessage.findUnique({ where: { id: params.scheduledMessageId } });
    if (!schedule || schedule.status !== 'SCHEDULED' || schedule.scheduledAt.getTime() !== params.scheduledAt.getTime()) return false;
    const firstOccurrence = !schedule.executedAt;
    const claim = await tx.scheduledMessage.updateMany({
      where: { id: schedule.id, status: 'SCHEDULED', scheduledAt: params.scheduledAt, updatedAt: schedule.updatedAt },
      data: { status: firstOccurrence ? 'FAILED' : 'PAUSED' },
    });
    if (claim.count !== 1) return false;
    await cancelScheduledSmsOccurrences({ tx, scheduledMessageId: schedule.id });
    if (firstOccurrence) await refundFirstOccurrence(tx, schedule);
    return true;
  });
}

export async function dispatchScheduledSmsOccurrence(params: {
  scheduledMessageId: string;
  scheduledAt: Date;
}) {
  const snapshot = await prisma.scheduledMessage.findUnique({ where: { id: params.scheduledMessageId } });
  if (!snapshot || snapshot.status !== 'SCHEDULED' || snapshot.scheduledAt.getTime() !== params.scheduledAt.getTime()) {
    return 'stale' as const;
  }

  let quote;
  let nextRun: ReturnType<typeof nextRecurringOccurrence> | null = null;
  try {
    quote = await quoteSms({ recipients: snapshot.recipients, message: snapshot.message, clientId: snapshot.clientId ?? undefined });
    if (snapshot.isRecurring) {
      validateRecurringSchedule(snapshot.cronExpression ?? undefined, snapshot.timezone);
      nextRun = nextRecurringOccurrence(snapshot.cronExpression ?? '', snapshot.scheduledAt, snapshot.timezone);
    }
  } catch (error) {
    if (!(error instanceof InvalidSmsRecipientsError) && !(error instanceof ScheduledSmsConfigurationError)) throw error;
    const failed = await failScheduledSmsOccurrence({
      scheduledMessageId: snapshot.id,
      scheduledAt: snapshot.scheduledAt,
    });
    return failed ? 'failed-before-dispatch' as const : 'stale' as const;
  }
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const claim = await tx.scheduledMessage.updateMany({
      where: {
        id: snapshot.id,
        status: 'SCHEDULED',
        scheduledAt: snapshot.scheduledAt,
        updatedAt: snapshot.updatedAt,
      },
      data: { status: 'PROCESSING' },
    });
    if (claim.count !== 1) return 'stale' as const;

    const schedule = await tx.scheduledMessage.findUnique({ where: { id: snapshot.id } });
    if (!schedule) return 'stale' as const;

    if (schedule.senderIdId) {
      const sender = await tx.senderId.findFirst({
        where: { id: schedule.senderIdId, userId: schedule.userId, status: 'APPROVED' },
        select: { id: true },
      });
      if (!sender) {
        const firstOccurrence = !schedule.executedAt;
        await tx.scheduledMessage.update({
          where: { id: schedule.id },
          data: { status: firstOccurrence ? 'FAILED' : 'PAUSED' },
        });
        await cancelScheduledSmsOccurrences({ tx, scheduledMessageId: schedule.id });
        if (firstOccurrence) await refundFirstOccurrence(tx, schedule);
        return 'failed-before-dispatch' as const;
      }
    }

    const firstOccurrence = !schedule.executedAt;
    const wallet = schedule.clientId
      ? await tx.wallet.findUnique({ where: { clientId: schedule.clientId } })
      : await tx.wallet.findUnique({ where: { userId: schedule.userId } });
    if (!wallet) {
      await tx.scheduledMessage.update({ where: { id: schedule.id }, data: { status: firstOccurrence ? 'FAILED' : 'PAUSED' } });
      if (firstOccurrence) await refundFirstOccurrence(tx, schedule);
      return firstOccurrence ? 'failed-before-dispatch' as const : 'paused-insufficient-funds' as const;
    }

    if (firstOccurrence) {
      const adjustment = quote.totalCost.minus(schedule.estimatedCost);
      if (adjustment.greaterThan(0)) {
        await WalletService.deduct(wallet.id, adjustment, {
          tx,
          userId: schedule.userId,
          description: `Scheduled SMS price adjustment ${schedule.id}`,
          idempotencyKey: `scheduled-price-adjustment-${schedule.id}-${schedule.scheduledAt.getTime()}`,
        });
      } else if (adjustment.lessThan(0)) {
        await WalletService.refund(wallet.id, adjustment.abs(), {
          tx,
          userId: schedule.userId,
          description: `Scheduled SMS price adjustment refund ${schedule.id}`,
          idempotencyKey: `scheduled-price-adjustment-refund-${schedule.id}-${schedule.scheduledAt.getTime()}`,
        });
      }
    }

    if (schedule.isRecurring && schedule.executedAt) {
      try {
        await WalletService.deduct(wallet.id, quote.totalCost, {
          tx,
          userId: schedule.userId,
          description: `Recurring scheduled SMS occurrence (${schedule.id})`,
          idempotencyKey: `scheduled-occurrence-charge-${schedule.id}-${schedule.scheduledAt.getTime()}`,
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'Insufficient funds') {
          await tx.scheduledMessage.update({ where: { id: schedule.id }, data: { status: 'PAUSED' } });
          return 'paused-insufficient-funds' as const;
        }
        throw error;
      }
    }

    const occurrenceKey = `scheduled-message-${schedule.id}-${schedule.scheduledAt.getTime()}`;
    const message = await tx.message.create({
      data: {
        userId: schedule.userId,
        senderIdId: schedule.senderIdId,
        message: schedule.message,
        encoding: quote.encoding,
        segmentCount: quote.segments,
        recipientCount: schedule.recipients.length,
        totalUnits: quote.totalUnits,
        costPerUnit: quote.totalCost.div(Math.max(1, quote.totalUnits)),
        totalCost: quote.totalCost,
        status: 'QUEUED',
        idempotencyKey: occurrenceKey,
        metadata: { scheduledMessageId: schedule.id, scheduledAt: schedule.scheduledAt.toISOString() },
      },
    });

    await tx.messageRecipient.createMany({
      data: quote.recipientDetails.map((recipient) => ({
        messageId: message.id,
        phone: recipient.phone,
        status: 'PENDING',
        cost: recipient.cost,
      })),
    });
    const messageRecipients = await tx.messageRecipient.findMany({
      where: { messageId: message.id },
      select: { id: true, phone: true },
    });
    await enqueueJobs(messageRecipients.map((recipient) => ({
      tx,
      type: 'send-sms',
      queue: 'sms-default',
      priority: 'NORMAL',
      payload: {
        recipient: recipient.phone,
        template: 'direct',
        templateData: { body: schedule.message },
        messageId: message.id,
        recipientId: recipient.id,
      },
      idempotencyKey: `${occurrenceKey}-${recipient.id}`,
    })));

    const recurringContinues = Boolean(schedule.isRecurring && nextRun?.next);
    await tx.scheduledMessage.update({
      where: { id: schedule.id },
      data: {
        resultMessageId: message.id,
        executedAt: now,
        estimatedCost: quote.totalCost,
        totalUnits: quote.totalUnits,
        recipientCount: schedule.recipients.length,
        segmentCount: quote.segments,
        encoding: quote.encoding,
        status: recurringContinues ? 'SCHEDULED' : 'PROCESSING',
        isRecurring: recurringContinues,
        ...(recurringContinues && nextRun
          ? { scheduledAt: nextRun.next!, cronExpression: nextRun.cronExpression }
          : {}),
      },
    });

    if (recurringContinues && nextRun?.next) {
      await enqueueScheduledSmsOccurrence({ tx, scheduledMessageId: schedule.id, scheduledAt: nextRun.next });
    }
    return 'dispatched' as const;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 10_000, timeout: 60_000 });
}
