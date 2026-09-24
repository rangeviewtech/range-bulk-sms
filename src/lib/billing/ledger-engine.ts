import { prisma, Prisma } from "@/lib/prisma";

export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

export interface JournalLine {
  accountName: string;
  accountType: AccountType;
  entityId?: string; // userId, walletId, or providerId
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntryParams {
  reference: string;
  description: string;
  campaignId?: string;
  messageId?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
  lines: JournalLine[];
}

export interface ReservationResult {
  success: boolean;
  reservationId: string;
  heldUnits: number;
  error?: string;
}

export interface SettlementResult {
  success: boolean;
  settledUnits: number;
  refundedUnits: number;
  error?: string;
}

/**
 * Enterprise Double-Entry Accounting and Ledger Engine.
 * Enforces strict debit/credit balancing, serializable database transactions,
 * wallet credit reservations, and duplicate-proof payment reconciliation.
 */
export class LedgerEngine {
  /**
   * Validates that a journal entry is mathematically balanced (Debits === Credits).
   */
  static validateJournalBalance(lines: JournalLine[]): void {
    if (!lines || lines.length < 2) {
      throw new Error("Double-entry accounting requires at least two journal lines.");
    }

    const totalDebits = lines.reduce((sum, line) => sum + Math.round((line.debit || 0) * 10000), 0);
    const totalCredits = lines.reduce((sum, line) => sum + Math.round((line.credit || 0) * 10000), 0);

    if (totalDebits !== totalCredits) {
      throw new Error(
        `Unbalanced journal entry! Total Debits (${totalDebits / 10000}) must equal Total Credits (${totalCredits / 10000}).`
      );
    }
  }

  /**
   * Atomically holds a credit reservation before dispatching messages.
   * Prevents double-spending and credit starvation during concurrent campaign execution.
   */
  static async reserveCredits(
    userId: string,
    campaignId: string,
    unitsToReserve: number,
    idempotencyKey?: string
  ): Promise<ReservationResult> {
    if (unitsToReserve <= 0) {
      return { success: true, reservationId: `zero_res_${campaignId}`, heldUnits: 0 };
    }

    const key = idempotencyKey || `res_${campaignId}_${unitsToReserve}`;

    return await prisma.$transaction(
      async (tx) => {
        // 1. Check idempotency to prevent duplicate reservation
        const existingTx = await tx.transaction.findUnique({
          where: { idempotencyKey: key },
        });

        if (existingTx) {
          const meta = existingTx.metadata as Record<string, unknown> | null;
          return {
            success: true,
            reservationId: existingTx.reference,
            heldUnits: Number(meta?.heldUnits || unitsToReserve),
          };
        }

        // 2. Fetch and lock wallet
        const wallet = await tx.wallet.findUnique({
          where: { userId },
        });

        if (!wallet) {
          return { success: false, reservationId: "", heldUnits: 0, error: "User wallet not found" };
        }

        if (wallet.smsCredits < unitsToReserve) {
          return {
            success: false,
            reservationId: "",
            heldUnits: 0,
            error: `Insufficient credits. Available: ${wallet.smsCredits}, Required: ${unitsToReserve}`,
          };
        }

        // 3. Atomically move credits from Available to Reserved
        const updateResult = await tx.wallet.updateMany({
          where: { id: wallet.id, smsCredits: { gte: unitsToReserve } },
          data: {
            smsCredits: { decrement: unitsToReserve },
          },
        });

        if (updateResult.count === 0) {
          return {
            success: false,
            reservationId: "",
            heldUnits: 0,
            error: "Concurrent reservation conflict: Insufficient credits available",
          };
        }

        const updatedWallet = (await tx.wallet.findUnique({
          where: { id: wallet.id },
        })) || wallet;

        const reference = `RES_HOLD_${campaignId}_${Date.now()}`;

        // 4. Construct Balanced Double-Entry Journal Lines
        // Debit: Customer Available Liability (reduced obligation for on-demand withdrawal)
        // Credit: Customer Reserved Liability (obligation held for active campaign execution)
        const journalLines: JournalLine[] = [
          {
            accountName: `CustomerAvailable:${userId}`,
            accountType: "LIABILITY",
            entityId: wallet.id,
            debit: unitsToReserve,
            credit: 0,
            description: `Hold ${unitsToReserve} units for Campaign ${campaignId}`,
          },
          {
            accountName: `CustomerReserved:${userId}`,
            accountType: "LIABILITY",
            entityId: wallet.id,
            debit: 0,
            credit: unitsToReserve,
            description: `Reserved ${unitsToReserve} units for in-flight dispatch`,
          },
        ];

        this.validateJournalBalance(journalLines);

        // 5. Record Transaction record with journal metadata
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            userId,
            type: "DEDUCTION",
            amount: new Prisma.Decimal(unitsToReserve),
            balanceBefore: wallet.balance,
            balanceAfter: updatedWallet.balance,
            currency: wallet.currency,
            reference,
            campaignId,
            idempotencyKey: key,
            description: `Reservation hold of ${unitsToReserve} SMS credit(s) for Campaign ${campaignId}`,
            metadata: {
              type: "RESERVATION_HOLD",
              heldUnits: unitsToReserve,
              journal: journalLines,
            } as unknown as Prisma.InputJsonValue,
          },
        });

        return {
          success: true,
          reservationId: reference,
          heldUnits: unitsToReserve,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  }

  /**
   * Settles a previously held reservation based on actual confirmed provider submissions.
   * Any unused reservation is automatically released back to the user's available credits.
   */
  static async settleReservation(
    userId: string,
    campaignId: string,
    actualUnitsDelivered: number,
    totalReservedUnits: number
  ): Promise<SettlementResult> {
    const unspentUnits = Math.max(0, totalReservedUnits - actualUnitsDelivered);
    const idempotencyKey = `settle_${campaignId}_${actualUnitsDelivered}_${totalReservedUnits}`;

    return await prisma.$transaction(
      async (tx) => {
        const existingTx = await tx.transaction.findUnique({
          where: { idempotencyKey },
        });
        if (existingTx) {
          return { success: true, settledUnits: actualUnitsDelivered, refundedUnits: unspentUnits };
        }

        const wallet = await tx.wallet.findUnique({
          where: { userId },
        });

        if (!wallet) {
          throw new Error("Wallet not found for settlement");
        }

        // 1. If unspent units remain, restore them to the available balance
        if (unspentUnits > 0) {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              smsCredits: { increment: unspentUnits },
            },
          });
        }

        const reference = `SETTLE_${campaignId}_${Date.now()}`;

        // 2. Double-entry journal for settled units (Liability -> Revenue)
        const journalLines: JournalLine[] = [
          {
            accountName: `CustomerReserved:${userId}`,
            accountType: "LIABILITY",
            entityId: wallet.id,
            debit: totalReservedUnits,
            credit: 0,
            description: `Clear reservation hold for Campaign ${campaignId}`,
          },
          {
            accountName: "PlatformRevenue:SMS",
            accountType: "REVENUE",
            debit: 0,
            credit: actualUnitsDelivered,
            description: `Recognize revenue for ${actualUnitsDelivered} SMS delivered`,
          },
        ];

        // If unused units returned to customer:
        if (unspentUnits > 0) {
          journalLines.push({
            accountName: `CustomerAvailable:${userId}`,
            accountType: "LIABILITY",
            entityId: wallet.id,
            debit: 0,
            credit: unspentUnits,
            description: `Return unspent ${unspentUnits} units to available balance`,
          });
        }

        this.validateJournalBalance(journalLines);

        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            userId,
            type: unspentUnits > 0 ? "REFUND" : "DEDUCTION",
            amount: new Prisma.Decimal(actualUnitsDelivered),
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance,
            currency: wallet.currency,
            reference,
            campaignId,
            idempotencyKey,
            description: `Settled ${actualUnitsDelivered} unit(s); released ${unspentUnits} unspent unit(s) for Campaign ${campaignId}`,
            metadata: {
              type: "RESERVATION_SETTLED",
              settledUnits: actualUnitsDelivered,
              unspentUnits,
              journal: journalLines,
            } as unknown as Prisma.InputJsonValue,
          },
        });

        return {
          success: true,
          settledUnits: actualUnitsDelivered,
          refundedUnits: unspentUnits,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  }

  /**
   * Issues a direct refund for an individual failed or undeliverable message.
   * Guaranteed idempotent by unique reference and message ID.
   */
  static async refundMessage(
    userId: string,
    messageId: string,
    units: number = 1,
    reason: string = "Message delivery failure"
  ): Promise<boolean> {
    const idempotencyKey = `refund_msg_${messageId}`;

    return await prisma.$transaction(
      async (tx) => {
        const existingTx = await tx.transaction.findUnique({
          where: { idempotencyKey },
        });
        if (existingTx) return true; // Already refunded

        const wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet) return false;

        // Restore credits
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { smsCredits: { increment: units } },
        });

        // Double-entry journal: Debit PlatformRevenue, Credit CustomerAvailable
        const journalLines: JournalLine[] = [
          {
            accountName: "PlatformRevenue:SMS",
            accountType: "REVENUE",
            debit: units,
            credit: 0,
            description: `Reversal of revenue for failed message ${messageId}`,
          },
          {
            accountName: `CustomerAvailable:${userId}`,
            accountType: "LIABILITY",
            entityId: wallet.id,
            debit: 0,
            credit: units,
            description: `Refund ${units} credit(s) for message ${messageId}`,
          },
        ];

        this.validateJournalBalance(journalLines);

        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            userId,
            type: "REFUND",
            amount: new Prisma.Decimal(units),
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance,
            currency: wallet.currency,
            reference: `REFUND_${messageId}_${Date.now()}`,
            messageId,
            idempotencyKey,
            description: `Refund of ${units} credit(s): ${reason}`,
            metadata: {
              reason,
              journal: journalLines,
            } as unknown as Prisma.InputJsonValue,
          },
        });

        return true;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  }

  /**
   * Reconciles an external payment callback (e.g. MTN MoMo, Airtel Money, Stripe).
   * Ensures duplicate callbacks cannot create double credit postings.
   */
  static async reconcilePayment(params: {
    userId: string;
    paymentRef: string;
    fiatAmount: number;
    creditsToAdd: number;
    currency?: string;
    paymentMethod: string;
  }): Promise<{ success: boolean; duplicate: boolean }> {
    const idempotencyKey = `pay_cb_${params.paymentMethod}_${params.paymentRef}`;

    return await prisma.$transaction(
      async (tx) => {
        const existingTx = await tx.transaction.findUnique({
          where: { idempotencyKey },
        });

        if (existingTx) {
          return { success: true, duplicate: true };
        }

        const wallet = await tx.wallet.findUnique({
          where: { userId: params.userId },
        });

        if (!wallet) {
          throw new Error("Wallet not found for user");
        }

        const newBalance = wallet.balance.add(new Prisma.Decimal(params.fiatAmount));

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: newBalance,
            smsCredits: { increment: params.creditsToAdd },
            lastTopUpAt: new Date(),
          },
        });

        // Double-entry journal: Debit BankSettlement (Asset), Credit CustomerAvailable (Liability)
        const journalLines: JournalLine[] = [
          {
            accountName: `BankSettlement:${params.paymentMethod}`,
            accountType: "ASSET",
            debit: params.fiatAmount,
            credit: 0,
            description: `Received payment ${params.paymentRef} via ${params.paymentMethod}`,
          },
          {
            accountName: `CustomerAvailable:${params.userId}`,
            accountType: "LIABILITY",
            entityId: wallet.id,
            debit: 0,
            credit: params.fiatAmount,
            description: `Credit customer balance with ${params.creditsToAdd} SMS credits`,
          },
        ];

        this.validateJournalBalance(journalLines);

        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            userId: params.userId,
            type: "DEPOSIT",
            amount: new Prisma.Decimal(params.fiatAmount),
            balanceBefore: wallet.balance,
            balanceAfter: newBalance,
            currency: params.currency || wallet.currency,
            reference: `DEP_${params.paymentRef}`,
            paymentMethod: params.paymentMethod,
            paymentRef: params.paymentRef,
            idempotencyKey,
            description: `Deposit via ${params.paymentMethod} (${params.creditsToAdd} SMS credits added)`,
            metadata: {
              creditsAdded: params.creditsToAdd,
              journal: journalLines,
            } as unknown as Prisma.InputJsonValue,
          },
        });

        return { success: true, duplicate: false };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  }

  /**
   * Reverses an accrued agent commission if the corresponding message was refunded.
   */
  static async reverseCommission(commissionId: string, reason: string): Promise<boolean> {
    return await prisma.$transaction(async (tx) => {
      const commission = await tx.commission.findUnique({
        where: { id: commissionId },
      });

      if (!commission || commission.status === "REVERSED") {
        return false;
      }

      await tx.commission.update({
        where: { id: commissionId },
        data: {
          status: "REVERSED",
        },
      });

      // If agent has a wallet, deduct the commission amount from pending/balance
      if (commission.agentId) {
        const agent = await tx.agent.findUnique({
          where: { id: commission.agentId },
          include: { user: { include: { wallets: true } } },
        });

        if (agent?.user?.wallets) {
          await tx.transaction.create({
            data: {
              walletId: agent.user.wallets.id,
              userId: agent.userId,
              type: "ADJUSTMENT",
              amount: commission.amount,
              balanceBefore: agent.user.wallets.balance,
              balanceAfter: agent.user.wallets.balance.sub(commission.amount),
              currency: agent.user.wallets.currency,
              reference: `REV_COMM_${commission.id}_${Date.now()}`,
              description: `Reversal of commission ${commission.id}: ${reason}`,
              metadata: { originalCommissionId: commission.id, reason } as Prisma.InputJsonValue,
            },
          });
        }
      }

      return true;
    });
  }
}
