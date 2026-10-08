import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@/generated/prisma/client';

const db = vi.hoisted(() => ({
  wallet: { findFirst: vi.fn(), update: vi.fn() },
  momoPayment: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  transaction: { create: vi.fn() },
  $queryRaw: vi.fn(),
  $transaction: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma: db }));

const pendingPayment = {
  id: '2c0f6cda-3022-4eed-8fb5-62c01b8cb5d1',
  walletId: 'wallet-1',
  userId: 'user-1',
  amount: new Prisma.Decimal(5000),
  currency: 'UGX',
  phone: '256772123456',
  status: 'PENDING',
  providerReference: '3d1f7d8b-c9e2-44cf-b70c-e41cc30f8b88',
  idempotencyKey: 'test-idempotency-key',
  providerStatus: null,
  failureReason: null,
  transactionId: null,
};

describe('MTN MoMo wallet settlement', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('MTN_MOMO_ENVIRONMENT', 'production');
    vi.stubEnv('MTN_MOMO_COLLECTION_SUBSCRIPTION_KEY', 'test-subscription');
    vi.stubEnv('MTN_MOMO_API_USER', 'test-user');
    vi.stubEnv('MTN_MOMO_API_KEY', 'test-api-key');
    vi.stubEnv('MTN_MOMO_CURRENCY', 'UGX');
    vi.stubEnv('NODE_ENV', 'test');
  });

  it('keeps an accepted request pending without crediting the wallet', async () => {
    db.wallet.findFirst.mockResolvedValue({ id: 'wallet-1', currency: 'UGX' });
    db.momoPayment.create.mockImplementation(async ({ data }) => ({ ...pendingPayment, ...data }));
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'access-token', expires_in: 300 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);

    const { MtnMomoService } = await import('@/lib/payments/mtn-momo');
    const result = await MtnMomoService.initiate({ userId: 'user-1', walletId: 'wallet-1', amount: 5000, phone: '0772 123 456' });

    expect(result.status).toBe('PENDING');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(db.wallet.update).not.toHaveBeenCalled();
    expect(db.transaction.create).not.toHaveBeenCalled();
  });

  it('returns the existing payment when concurrent requests race on one idempotency key', async () => {
    db.momoPayment.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(pendingPayment);
    db.wallet.findFirst.mockResolvedValue({ id: 'wallet-1', currency: 'UGX' });
    db.momoPayment.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: 'test' },
    ));
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { MtnMomoService } = await import('@/lib/payments/mtn-momo');
    const result = await MtnMomoService.initiate({
      userId: 'user-1',
      walletId: 'wallet-1',
      amount: 5000,
      phone: '0772 123 456',
      idempotencyKey: 'test-idempotency-key',
    });

    expect(result.id).toBe(pendingPayment.id);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('credits once only after a matching successful provider status', async () => {
    const tx = {
      $queryRaw: vi.fn().mockResolvedValue([{ balance: new Prisma.Decimal(1000) }]),
      momoPayment: {
        findUnique: vi.fn()
          .mockResolvedValueOnce(pendingPayment)
          .mockResolvedValueOnce({ ...pendingPayment, status: 'SUCCESSFUL', transactionId: 'transaction-1' }),
        update: vi.fn().mockResolvedValue(undefined),
      },
      transaction: { create: vi.fn().mockResolvedValue({ id: 'transaction-1' }) },
      wallet: { update: vi.fn().mockResolvedValue(undefined) },
    };
    db.momoPayment.findFirst
      .mockResolvedValueOnce(pendingPayment)
      .mockResolvedValueOnce({ ...pendingPayment, status: 'SUCCESSFUL', transactionId: 'transaction-1' });
    db.$transaction.mockImplementation(async (callback) => callback(tx));
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'access-token', expires_in: 300 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status: 'SUCCESSFUL',
        amount: '5000',
        currency: 'UGX',
        externalId: pendingPayment.id,
        financialTransactionId: 'mtn-financial-ref',
      }), { status: 200 })));

    const { MtnMomoService } = await import('@/lib/payments/mtn-momo');
    const first = await MtnMomoService.checkStatus(pendingPayment.id, pendingPayment.userId);
    const second = await MtnMomoService.checkStatus(pendingPayment.id, pendingPayment.userId);

    expect(first?.status).toBe('SUCCESSFUL');
    expect(second?.status).toBe('SUCCESSFUL');
    expect(tx.transaction.create).toHaveBeenCalledTimes(1);
    expect(tx.wallet.update).toHaveBeenCalledTimes(1);
    expect(tx.momoPayment.update).toHaveBeenCalledTimes(1);
  });
});
