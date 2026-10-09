// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@/generated/prisma/client';
import { prismaMock } from '../prismaMock';
import { dispatchScheduledSmsOccurrence, failScheduledSmsOccurrence } from '@/lib/sms/scheduled-dispatcher';
import { WalletService } from '@/lib/wallet/service';

vi.mock('@/lib/sms/quote', () => ({
  InvalidSmsRecipientsError: class InvalidSmsRecipientsError extends Error {},
  quoteSms: vi.fn(async () => ({
    segments: 2,
    encoding: 'GSM-7',
    totalCost: new Prisma.Decimal(20),
    totalUnits: 2,
    recipientDetails: [{ phone: '+256700000001', cost: new Prisma.Decimal(20), units: 2 }],
  })),
}));

vi.mock('@/lib/wallet/service', () => ({
  WalletService: {
    deduct: vi.fn().mockResolvedValue({ success: true }),
    refund: vi.fn().mockResolvedValue({ success: true }),
  },
}));

const scheduledAt = new Date('2030-01-01T09:00:00.000Z');
const schedule = {
  id: 'schedule-1',
  userId: 'user-1',
  clientId: null,
  idempotencyKey: null,
  senderIdId: null,
  message: 'A long enough scheduled reminder',
  recipients: ['+256700000001'],
  recipientCount: 1,
  encoding: 'GSM-7',
  segmentCount: 1,
  totalUnits: 1,
  estimatedCost: new Prisma.Decimal(20),
  scheduledAt,
  timezone: 'Africa/Kampala',
  isRecurring: false,
  cronExpression: null,
  status: 'SCHEDULED',
  executedAt: null,
  cancelledAt: null,
  resultMessageId: null,
  createdAt: scheduledAt,
  updatedAt: scheduledAt,
};

describe('scheduled SMS dispatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.scheduledMessage.findUnique
      .mockResolvedValueOnce(schedule as never)
      .mockResolvedValueOnce(schedule as never);
    prismaMock.scheduledMessage.updateMany.mockResolvedValue({ count: 1 } as never);
    prismaMock.wallet.findUnique.mockResolvedValue({ id: 'wallet-1' } as never);
    prismaMock.message.create.mockResolvedValue({ id: 'message-1' } as never);
    prismaMock.messageRecipient.createMany.mockResolvedValue({ count: 1 });
    prismaMock.messageRecipient.findMany.mockResolvedValue([
      { id: 'recipient-1', phone: '+256700000001' },
    ] as never);
    prismaMock.job.createMany.mockResolvedValue({ count: 1 });
  });

  it('creates a normal message and recipient send job when due', async () => {
    const result = await dispatchScheduledSmsOccurrence({
      scheduledMessageId: schedule.id,
      scheduledAt,
    });

    expect(result).toBe('dispatched');
    expect(prismaMock.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        idempotencyKey: `scheduled-message-${schedule.id}-${scheduledAt.getTime()}`,
        totalCost: new Prisma.Decimal(20),
      }),
    });
    expect(prismaMock.job.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({
        type: 'send-sms',
        idempotencyKey: `scheduled-message-${schedule.id}-${scheduledAt.getTime()}-recipient-1`,
      })],
      skipDuplicates: true,
    });
    expect(prismaMock.scheduledMessage.update).toHaveBeenCalledWith({
      where: { id: schedule.id },
      data: expect.objectContaining({ status: 'PROCESSING', resultMessageId: 'message-1' }),
    });
  });

  it('adjusts an old upfront estimate to the current quote before first dispatch', async () => {
    prismaMock.scheduledMessage.findUnique
      .mockReset()
      .mockResolvedValueOnce({ ...schedule, estimatedCost: new Prisma.Decimal(15) } as never)
      .mockResolvedValueOnce({ ...schedule, estimatedCost: new Prisma.Decimal(15) } as never);

    await dispatchScheduledSmsOccurrence({ scheduledMessageId: schedule.id, scheduledAt });

    expect(WalletService.deduct).toHaveBeenCalledWith('wallet-1', new Prisma.Decimal(5), expect.objectContaining({
      idempotencyKey: `scheduled-price-adjustment-${schedule.id}-${scheduledAt.getTime()}`,
    }));
  });

  it('charges each later recurring occurrence and queues the next run', async () => {
    const recurring = {
      ...schedule,
      isRecurring: true,
      cronExpression: JSON.stringify({
        cron: '0 9 * * *',
        frequency: 'DAILY',
        interval: 1,
        endType: 'NEVER',
        occurrencesCompleted: 1,
      }),
      executedAt: new Date('2029-12-31T09:00:00.000Z'),
    };
    prismaMock.scheduledMessage.findUnique
      .mockReset()
      .mockResolvedValueOnce(recurring as never)
      .mockResolvedValueOnce(recurring as never);
    prismaMock.job.findUnique.mockResolvedValue(null as never);

    const result = await dispatchScheduledSmsOccurrence({ scheduledMessageId: schedule.id, scheduledAt });

    expect(result).toBe('dispatched');
    expect(WalletService.deduct).toHaveBeenCalledWith('wallet-1', new Prisma.Decimal(20), expect.objectContaining({
      idempotencyKey: `scheduled-occurrence-charge-${schedule.id}-${scheduledAt.getTime()}`,
    }));
    expect(prismaMock.scheduledMessage.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        status: 'SCHEDULED',
        isRecurring: true,
        scheduledAt: new Date('2030-01-02T06:00:00.000Z'),
      }),
    }));
    expect(prismaMock.job.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        type: 'scheduled-sms.dispatch',
        availableAt: new Date('2030-01-02T06:00:00.000Z'),
      }),
    }));
  });

  it('ignores an outdated queue occurrence without claiming or charging it', async () => {
    prismaMock.scheduledMessage.findUnique.mockReset().mockResolvedValueOnce({
      ...schedule,
      scheduledAt: new Date('2030-01-02T09:00:00.000Z'),
    } as never);

    const result = await dispatchScheduledSmsOccurrence({ scheduledMessageId: schedule.id, scheduledAt });

    expect(result).toBe('stale');
    expect(prismaMock.scheduledMessage.updateMany).not.toHaveBeenCalled();
    expect(WalletService.deduct).not.toHaveBeenCalled();
  });

  it('refunds the upfront amount when the first occurrence fails before dispatch', async () => {
    prismaMock.scheduledMessage.findUnique.mockReset().mockResolvedValueOnce(schedule as never);
    prismaMock.scheduledMessage.updateMany.mockResolvedValueOnce({ count: 1 } as never);
    prismaMock.wallet.findUnique.mockResolvedValueOnce({ id: 'wallet-1' } as never);

    const failed = await failScheduledSmsOccurrence({ scheduledMessageId: schedule.id, scheduledAt });

    expect(failed).toBe(true);
    expect(WalletService.refund).toHaveBeenCalledWith('wallet-1', new Prisma.Decimal(20), expect.objectContaining({
      idempotencyKey: `scheduled-refund-${schedule.id}`,
    }));
  });
});
