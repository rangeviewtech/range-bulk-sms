import { Decimal } from '@/generated/prisma/runtime/library';
import prisma from '@/lib/prisma';
import { generateTransactionReference } from '@/lib/sms/idempotency';

export interface WalletOperationResult {
  success: boolean;
  walletId: string;
  balanceBefore: Decimal;
  balanceAfter: Decimal;
  transactionRef: string;
  error?: string;
}

export const WalletService = {
  async getOrCreateWallet(params: { userId?: string; clientId?: string; agentId?: string; currency?: string }) {
    const currency = params.currency || 'UGX';
    
    let wallet = await prisma.wallet.findFirst({
      where: {
        OR: [
          { userId: params.userId },
          { clientId: params.clientId },
          { agentId: params.agentId }
        ].filter(Boolean)
      }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: params.userId,
          clientId: params.clientId,
          agentId: params.agentId,
          currency,
          balance: new Decimal(0),
          smsCredits: 0
        }
      });
    }

    return wallet;
  },

  async getBalance(walletId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId }
    });
    if (!wallet) throw new Error('Wallet not found');

    return {
      balance: wallet.balance,
      smsCredits: wallet.smsCredits,
      currency: wallet.currency
    };
  },

  async deposit(walletId: string, amount: Decimal, params: { userId?: string; description?: string; paymentMethod?: string; paymentRef?: string; idempotencyKey?: string }): Promise<WalletOperationResult> {
    return await prisma.$transaction(async (tx) => {
      if (params.idempotencyKey) {
        const existingTx = await tx.transaction.findFirst({
          where: { idempotencyKey: params.idempotencyKey }
        });
        if (existingTx) {
          return {
            success: true,
            walletId,
            balanceBefore: existingTx.balanceBefore,
            balanceAfter: existingTx.balanceAfter,
            transactionRef: existingTx.reference
          };
        }
      }

      const wallets = await tx.$queryRaw<{ id: string; balance: Decimal }[]>`
        SELECT id, balance FROM "Wallet" WHERE id = ${walletId} FOR UPDATE
      `;
      if (!wallets || wallets.length === 0) throw new Error('Wallet not found');
      
      const balanceBefore = new Decimal(wallets[0].balance);
      const balanceAfter = balanceBefore.plus(amount);
      const transactionRef = generateTransactionReference();

      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: balanceAfter }
      });

      await tx.transaction.create({
        data: {
          walletId,
          type: 'DEPOSIT',
          amount,
          balanceBefore,
          balanceAfter,
          reference: transactionRef,
          description: params.description,
          userId: params.userId,
          idempotencyKey: params.idempotencyKey,
          status: 'COMPLETED'
        }
      });

      return {
        success: true,
        walletId,
        balanceBefore,
        balanceAfter,
        transactionRef
      };
    });
  },

  async deduct(walletId: string, amount: Decimal, params: { userId?: string; description?: string; campaignId?: string; messageId?: string; idempotencyKey?: string }): Promise<WalletOperationResult> {
    return await prisma.$transaction(async (tx) => {
      if (params.idempotencyKey) {
        const existingTx = await tx.transaction.findFirst({
          where: { idempotencyKey: params.idempotencyKey }
        });
        if (existingTx) {
          return {
            success: true,
            walletId,
            balanceBefore: existingTx.balanceBefore,
            balanceAfter: existingTx.balanceAfter,
            transactionRef: existingTx.reference
          };
        }
      }

      const wallets = await tx.$queryRaw<{ id: string; balance: Decimal }[]>`
        SELECT id, balance FROM "Wallet" WHERE id = ${walletId} FOR UPDATE
      `;
      if (!wallets || wallets.length === 0) throw new Error('Wallet not found');
      
      const balanceBefore = new Decimal(wallets[0].balance);
      
      if (balanceBefore.lessThan(amount)) {
        throw new Error('Insufficient funds');
      }
      
      const balanceAfter = balanceBefore.minus(amount);
      const transactionRef = generateTransactionReference();

      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: balanceAfter }
      });

      await tx.transaction.create({
        data: {
          walletId,
          type: 'DEDUCTION',
          amount,
          balanceBefore,
          balanceAfter,
          reference: transactionRef,
          description: params.description,
          userId: params.userId,
          campaignId: params.campaignId,
          idempotencyKey: params.idempotencyKey,
          status: 'COMPLETED'
        }
      });

      return {
        success: true,
        walletId,
        balanceBefore,
        balanceAfter,
        transactionRef
      };
    });
  },

  async refund(walletId: string, amount: Decimal, params: { userId?: string; description?: string; originalTransactionRef?: string; idempotencyKey?: string }): Promise<WalletOperationResult> {
    return await prisma.$transaction(async (tx) => {
      if (params.idempotencyKey) {
        const existingTx = await tx.transaction.findFirst({
          where: { idempotencyKey: params.idempotencyKey }
        });
        if (existingTx) {
          return {
            success: true,
            walletId,
            balanceBefore: existingTx.balanceBefore,
            balanceAfter: existingTx.balanceAfter,
            transactionRef: existingTx.reference
          };
        }
      }

      const wallets = await tx.$queryRaw<{ id: string; balance: Decimal }[]>`
        SELECT id, balance FROM "Wallet" WHERE id = ${walletId} FOR UPDATE
      `;
      if (!wallets || wallets.length === 0) throw new Error('Wallet not found');
      
      const balanceBefore = new Decimal(wallets[0].balance);
      const balanceAfter = balanceBefore.plus(amount);
      const transactionRef = generateTransactionReference();

      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: balanceAfter }
      });

      await tx.transaction.create({
        data: {
          walletId,
          type: 'REFUND',
          amount,
          balanceBefore,
          balanceAfter,
          reference: transactionRef,
          description: params.description,
          userId: params.userId,
          idempotencyKey: params.idempotencyKey,
          status: 'COMPLETED'
        }
      });

      return {
        success: true,
        walletId,
        balanceBefore,
        balanceAfter,
        transactionRef
      };
    });
  },

  async getTransactions(walletId: string, params: { page?: number; limit?: number; type?: any; startDate?: Date; endDate?: Date }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { walletId };
    if (params.type) where.type = params.type;
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.transaction.count({ where })
    ]);

    return {
      transactions,
      total,
      page,
      limit
    };
  }
};
