import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@/generated/prisma/client';
import { ConflictError } from '@/lib/errors';

const db = vi.hoisted(() => ({
  transaction: { findFirst: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma: db }));

describe('wallet deposit idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.$transaction.mockImplementation((callback) => callback({ transaction: db.transaction }));
  });

  it('rejects reuse of an idempotency key for another wallet or amount', async () => {
    db.transaction.findFirst.mockResolvedValue({
      walletId: 'wallet-original',
      userId: 'user-1',
      type: 'DEPOSIT',
      amount: new Prisma.Decimal(5000),
      balanceBefore: new Prisma.Decimal(0),
      balanceAfter: new Prisma.Decimal(5000),
      reference: 'transaction-original',
    });

    const { WalletService } = await import('@/lib/wallet/service');
    await expect(WalletService.deposit('wallet-other', new Prisma.Decimal(7000), {
      userId: 'user-1',
      idempotencyKey: 'payment-reference',
    })).rejects.toBeInstanceOf(ConflictError);
  });

  it('runs deductions on the caller transaction without opening a nested transaction', async () => {
    const tx = {
      transaction: { findFirst: vi.fn().mockResolvedValue(null), create: vi.fn() },
      $queryRaw: vi.fn().mockResolvedValue([{ id: 'wallet-1', balance: new Prisma.Decimal(20) }]),
      wallet: { update: vi.fn() },
    };

    const { WalletService } = await import('@/lib/wallet/service');
    const result = await WalletService.deduct('wallet-1', new Prisma.Decimal(5), {
      userId: 'user-1',
      idempotencyKey: 'sms-request',
      tx: tx as never,
    });

    expect(result.balanceAfter.equals(new Prisma.Decimal(15))).toBe(true);
    expect(tx.transaction.create).toHaveBeenCalledOnce();
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a deduction idempotency key reused for different billing details', async () => {
    db.transaction.findFirst.mockResolvedValue({
      walletId: 'wallet-original',
      userId: 'user-1',
      type: 'DEDUCTION',
      amount: new Prisma.Decimal(5),
      balanceBefore: new Prisma.Decimal(20),
      balanceAfter: new Prisma.Decimal(15),
      reference: 'transaction-original',
    });

    const { WalletService } = await import('@/lib/wallet/service');
    await expect(WalletService.deduct('wallet-other', new Prisma.Decimal(8), {
      userId: 'user-1',
      idempotencyKey: 'sms-request',
    })).rejects.toBeInstanceOf(ConflictError);
  });
});
