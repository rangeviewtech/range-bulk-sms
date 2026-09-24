import { prisma, Prisma } from "@/lib/prisma";
import { LedgerEngine, JournalLine } from "./ledger-engine";

export class BillingService {
  /**
   * Estimates the cost of a campaign in credits.
   */
  static async estimateCampaignCost(recipientCount: number): Promise<number> {
    return recipientCount * 1;
  }

  /**
   * Holds credits in reservation before campaign expansion or dispatch.
   */
  static async reserveCredits(userId: string, campaignId: string, units: number, idempotencyKey?: string) {
    return await LedgerEngine.reserveCredits(userId, campaignId, units, idempotencyKey);
  }

  /**
   * Settles previously reserved credits upon confirmed provider dispatch.
   */
  static async settleReservation(userId: string, campaignId: string, deliveredUnits: number, reservedUnits: number) {
    return await LedgerEngine.settleReservation(userId, campaignId, deliveredUnits, reservedUnits);
  }

  /**
   * Issues a refund for a failed or rejected message.
   */
  static async refundMessage(userId: string, messageId: string, units: number = 1, reason?: string) {
    return await LedgerEngine.refundMessage(userId, messageId, units, reason);
  }

  /**
   * Deducts credits from a user's wallet for a specific dispatch.
   * Validates idempotency and writes a balanced double-entry journal ledger entry.
   */
  static async deductMessageCost(userId: string, messageId: string, amount: number = 1): Promise<void> {
    const idempotencyKey = `deduct_msg_${messageId}`;

    // Proceed inside an interactive transaction with serializable isolation
    await prisma.$transaction(async (tx) => {
      // 1. Check idempotency key to prevent double charge
      const existingTx = await tx.transaction.findUnique({
        where: { idempotencyKey },
      });
      if (existingTx) {
        return; // Already billed
      }

      // 2. Fetch the wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error("Wallet not found for user");
      }

      if (wallet.smsCredits < amount) {
        throw new Error("Insufficient SMS credits");
      }

      // 3. Atomically decrement credits with concurrency guard
      const updateResult = await tx.wallet.updateMany({
        where: { id: wallet.id, smsCredits: { gte: amount } },
        data: {
          smsCredits: { decrement: amount }
        }
      });

      if (updateResult.count === 0) {
        throw new Error("Insufficient SMS credits (concurrent update conflict)");
      }

      const updatedWallet = (await tx.wallet.findUnique({
        where: { id: wallet.id },
      })) || wallet;

      // 4. Construct Balanced Double-Entry Journal Lines
      const journalLines: JournalLine[] = [
        {
          accountName: `CustomerAvailable:${userId}`,
          accountType: "LIABILITY",
          entityId: wallet.id,
          debit: amount,
          credit: 0,
          description: `Debit customer liability for message ${messageId}`,
        },
        {
          accountName: "PlatformRevenue:SMS",
          accountType: "REVENUE",
          debit: 0,
          credit: amount,
          description: `Recognize revenue for single SMS dispatch ${messageId}`,
        }
      ];

      LedgerEngine.validateJournalBalance(journalLines);

      // 5. Create the immutable ledger Transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId,
          type: "DEDUCTION",
          amount: new Prisma.Decimal(amount),
          balanceBefore: wallet.balance,
          balanceAfter: updatedWallet.balance,
          currency: wallet.currency,
          reference: `MSG_DEDUCT_${messageId}`,
          messageId,
          idempotencyKey,
          description: `Deduction of ${amount} SMS credit(s) for message ${messageId}`,
          metadata: {
            amountCredits: amount,
            journal: journalLines
          } as unknown as Prisma.InputJsonValue,
        }
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable, 
    });
  }

  /**
   * Checks if a user has enough credits to process a given amount.
   */
  static async hasSufficientFunds(userId: string, estimatedCredits: number): Promise<boolean> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { smsCredits: true }
    });
    
    if (!wallet) return false;
    return wallet.smsCredits >= estimatedCredits;
  }
}
