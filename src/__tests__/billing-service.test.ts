import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillingService } from '@/lib/billing/billing-service';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    wallet: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    transaction: {
      findUnique: vi.fn(),
      create: vi.fn()
    },
    $transaction: vi.fn((callback) => callback({
      wallet: { findUnique: vi.fn(), update: vi.fn() },
      transaction: { findUnique: vi.fn(), create: vi.fn() }
    }))
  },
  Prisma: {
    TransactionIsolationLevel: {
      Serializable: 'Serializable'
    }
  }
}));

describe('BillingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasSufficientFunds', () => {
    it('should return true if user has enough balance', async () => {
      // @ts-expect-error Mocking prisma method
      prisma.wallet.findUnique.mockResolvedValue({ smsCredits: 100 });
      
      const result = await BillingService.hasSufficientFunds('user-1', 50);
      expect(result).toBe(true);
    });

    it('should return false if user does not have enough balance', async () => {
      // @ts-expect-error Mocking prisma method
      prisma.wallet.findUnique.mockResolvedValue({ smsCredits: 10 });
      
      const result = await BillingService.hasSufficientFunds('user-1', 50);
      expect(result).toBe(false);
    });

    it('should return false if wallet does not exist', async () => {
      // @ts-expect-error Mocking prisma method
      prisma.wallet.findUnique.mockResolvedValue(null);
      
      const result = await BillingService.hasSufficientFunds('user-1', 50);
      expect(result).toBe(false);
    });
  });

  describe('deductMessageCost', () => {
    it('should prevent double deduction (idempotency)', async () => {
      // Mock the transaction returning an existing record
      const txPrisma = {
        transaction: {
          findUnique: vi.fn().mockResolvedValue({ id: 'tx-1' }), // Already exists
          create: vi.fn()
        },
        wallet: {
          update: vi.fn()
        }
      };

      // @ts-expect-error Mocking prisma transaction
      prisma.$transaction.mockImplementationOnce(async (callback) => {
        return callback(txPrisma);
      });

      await BillingService.deductMessageCost('user-1', 'msg-1', 1);

      // Should not update wallet or create a new transaction
      expect(txPrisma.wallet.update).not.toHaveBeenCalled();
      expect(txPrisma.transaction.create).not.toHaveBeenCalled();
    });
  });
});
