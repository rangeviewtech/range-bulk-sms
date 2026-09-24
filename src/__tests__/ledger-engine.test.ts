import { describe, it, expect, vi, beforeEach } from "vitest";
import { LedgerEngine, JournalLine } from "../lib/billing/ledger-engine";
import { prisma } from "../lib/prisma";

vi.mock("../lib/prisma", () => {
  const mockTx = {
    transaction: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    wallet: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    commission: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    agent: {
      findUnique: vi.fn(),
    },
  };

  return {
    prisma: {
      $transaction: vi.fn((callback) => callback(mockTx)),
      transaction: mockTx.transaction,
      wallet: mockTx.wallet,
      commission: mockTx.commission,
      agent: mockTx.agent,
    },
    Prisma: {
      Decimal: class MockDecimal {
        val: number;
        constructor(v: number) {
          this.val = v;
        }
        toString() {
          return String(this.val);
        }
        add(other: { val: number }) {
          return new MockDecimal(this.val + other.val);
        }
        sub(other: { val: number }) {
          return new MockDecimal(this.val - other.val);
        }
      },
      TransactionIsolationLevel: {
        Serializable: "Serializable",
      },
    },
  };
});

interface MockPrisma {
  $transaction: ReturnType<typeof vi.fn>;
  transaction: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  wallet: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
  };
  commission: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  agent: {
    findUnique: ReturnType<typeof vi.fn>;
  };
}

const mockPrisma = prisma as unknown as MockPrisma;

describe("LedgerEngine (Double-Entry Balanced Accounting)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateJournalBalance", () => {
    it("should accept a perfectly balanced journal entry", () => {
      const lines: JournalLine[] = [
        {
          accountName: "CustomerAvailable:user1",
          accountType: "LIABILITY",
          debit: 100,
          credit: 0,
        },
        {
          accountName: "PlatformRevenue:SMS",
          accountType: "REVENUE",
          debit: 0,
          credit: 100,
        },
      ];

      expect(() => LedgerEngine.validateJournalBalance(lines)).not.toThrow();
    });

    it("should reject an unbalanced journal entry", () => {
      const lines: JournalLine[] = [
        {
          accountName: "CustomerAvailable:user1",
          accountType: "LIABILITY",
          debit: 100,
          credit: 0,
        },
        {
          accountName: "PlatformRevenue:SMS",
          accountType: "REVENUE",
          debit: 0,
          credit: 80, // Mismatch!
        },
      ];

      expect(() => LedgerEngine.validateJournalBalance(lines)).toThrowError(
        /Unbalanced journal entry/
      );
    });

    it("should reject a single-legged journal entry", () => {
      const lines: JournalLine[] = [
        {
          accountName: "CustomerAvailable:user1",
          accountType: "LIABILITY",
          debit: 100,
          credit: 0,
        },
      ];

      expect(() => LedgerEngine.validateJournalBalance(lines)).toThrowError(
        /at least two journal lines/
      );
    });
  });

  describe("reserveCredits", () => {
    it("should atomically hold credits when user has sufficient balance", async () => {
      const mockWallet = {
        id: "wallet-123",
        userId: "user-1",
        smsCredits: 500,
        balance: { val: 50000 },
        currency: "UGX",
      };

      mockPrisma.wallet.findUnique.mockResolvedValueOnce(mockWallet);
      mockPrisma.transaction.findUnique.mockResolvedValueOnce(null);
      mockPrisma.wallet.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.wallet.findUnique.mockResolvedValueOnce({
        ...mockWallet,
        smsCredits: 300,
      });

      const result = await LedgerEngine.reserveCredits("user-1", "camp-1", 200);

      expect(result.success).toBe(true);
      expect(result.heldUnits).toBe(200);
      expect(mockPrisma.wallet.updateMany).toHaveBeenCalledWith({
        where: { id: "wallet-123", smsCredits: { gte: 200 } },
        data: { smsCredits: { decrement: 200 } },
      });
      expect(mockPrisma.transaction.create).toHaveBeenCalled();
    });

    it("should fail reservation when user has insufficient balance", async () => {
      const mockWallet = {
        id: "wallet-123",
        userId: "user-1",
        smsCredits: 50,
        balance: { val: 5000 },
        currency: "UGX",
      };

      mockPrisma.wallet.findUnique.mockResolvedValueOnce(mockWallet);
      mockPrisma.transaction.findUnique.mockResolvedValueOnce(null);

      const result = await LedgerEngine.reserveCredits("user-1", "camp-1", 200);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Insufficient credits/);
      expect(mockPrisma.wallet.update).not.toHaveBeenCalled();
    });

    it("should return existing reservation idempotently if already held", async () => {
      mockPrisma.transaction.findUnique.mockResolvedValueOnce({
        reference: "RES_HOLD_camp-1_existing",
        metadata: { heldUnits: 200 },
      });

      const result = await LedgerEngine.reserveCredits("user-1", "camp-1", 200, "res_key_1");

      expect(result.success).toBe(true);
      expect(result.reservationId).toBe("RES_HOLD_camp-1_existing");
      expect(mockPrisma.wallet.update).not.toHaveBeenCalled();
    });
  });

  describe("settleReservation", () => {
    it("should settle delivered units and restore unspent units to wallet", async () => {
      const mockWallet = {
        id: "wallet-123",
        userId: "user-1",
        balance: { val: 50000 },
        currency: "UGX",
      };

      mockPrisma.transaction.findUnique.mockResolvedValueOnce(null);
      mockPrisma.wallet.findUnique.mockResolvedValueOnce(mockWallet);

      // Reserved 200, but only 150 delivered. 50 should be returned!
      const result = await LedgerEngine.settleReservation("user-1", "camp-1", 150, 200);

      expect(result.success).toBe(true);
      expect(result.settledUnits).toBe(150);
      expect(result.refundedUnits).toBe(50);
      expect(mockPrisma.wallet.update).toHaveBeenCalledWith({
        where: { id: "wallet-123" },
        data: { smsCredits: { increment: 50 } },
      });
    });
  });

  describe("reconcilePayment", () => {
    it("should credit wallet and create balanced deposit transaction", async () => {
      const mockWallet = {
        id: "wallet-123",
        userId: "user-1",
        balance: { val: 10000, add: vi.fn((amt: { val: number }) => ({ val: 10000 + amt.val })) },
        currency: "UGX",
      };

      mockPrisma.transaction.findUnique.mockResolvedValueOnce(null);
      mockPrisma.wallet.findUnique.mockResolvedValueOnce(mockWallet);

      const result = await LedgerEngine.reconcilePayment({
        userId: "user-1",
        paymentRef: "MOMO_TRX_9921",
        fiatAmount: 50000,
        creditsToAdd: 2000,
        paymentMethod: "MTN_MOMO",
      });

      expect(result.success).toBe(true);
      expect(result.duplicate).toBe(false);
      expect(mockPrisma.wallet.update).toHaveBeenCalled();
    });

    it("should ignore duplicate payment callback without double crediting", async () => {
      mockPrisma.transaction.findUnique.mockResolvedValueOnce({
        id: "tx-existing",
      });

      const result = await LedgerEngine.reconcilePayment({
        userId: "user-1",
        paymentRef: "MOMO_TRX_9921",
        fiatAmount: 50000,
        creditsToAdd: 2000,
        paymentMethod: "MTN_MOMO",
      });

      expect(result.success).toBe(true);
      expect(result.duplicate).toBe(true);
      expect(mockPrisma.wallet.update).not.toHaveBeenCalled();
    });
  });
});
