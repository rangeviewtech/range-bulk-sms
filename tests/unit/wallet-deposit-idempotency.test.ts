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
});
