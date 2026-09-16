import { Decimal } from '@/generated/prisma/runtime/library';
import prisma from '@/lib/prisma';

type CommissionType = 'PERCENTAGE' | 'FIXED' | 'TIERED';

export const CommissionEngine = {
  async calculateCommission(params: { agentId: string; clientId: string; smsValue: Decimal; messageCount: number; campaignId?: string }) {
    const rule = await prisma.commissionRule.findFirst({
      where: {
        OR: [
          { agentId: params.agentId },
          { isDefault: true }
        ]
      },
      orderBy: { agentId: 'desc' }
    });

    if (!rule) {
      return { amount: new Decimal(0), rate: new Decimal(0), type: 'FIXED' as CommissionType };
    }

    let amount = new Decimal(0);
    const rate = new Decimal(rule.rate || 0);

    if (rule.type === 'PERCENTAGE') {
      amount = params.smsValue.mul(rate).div(100);
    } else if (rule.type === 'FIXED') {
      amount = rate.mul(params.messageCount);
    } else if (rule.type === 'TIERED') {
      const tier = await prisma.commissionTier.findFirst({
        where: {
          ruleId: rule.id,
          minVolume: { lte: params.messageCount },
          maxVolume: { gte: params.messageCount }
        }
      });
      if (tier) {
        amount = params.smsValue.mul(new Decimal(tier.rate)).div(100);
      }
    }

    return { amount, rate, type: rule.type as CommissionType, ruleId: rule.id };
  },
  
  async createCommission(params: { agentId: string; clientId: string; smsValue: Decimal; messageCount: number; campaignId?: string; idempotencyKey?: string }) {
    return await prisma.$transaction(async (tx) => {
      if (params.idempotencyKey) {
        const existing = await tx.commission.findFirst({
          where: { idempotencyKey: params.idempotencyKey }
        });
        if (existing) return existing;
      }

      const calc = await this.calculateCommission({
        agentId: params.agentId,
        clientId: params.clientId,
        smsValue: params.smsValue,
        messageCount: params.messageCount,
        campaignId: params.campaignId
      });

      return await tx.commission.create({
        data: {
          agentId: params.agentId,
          clientId: params.clientId,
          amount: calc.amount,
          status: 'PENDING',
          campaignId: params.campaignId,
          ruleId: calc.ruleId,
          idempotencyKey: params.idempotencyKey,
        }
      });
    });
  },
  
  async approveCommissions(commissionIds: string[], approvedBy: string) {
    const result = await prisma.commission.updateMany({
      where: {
        id: { in: commissionIds },
        status: 'PENDING'
      },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date()
      }
    });
    return result.count;
  },
  
  async payCommissions(commissionIds: string[]) {
    return await prisma.$transaction(async (tx) => {
      const commissions = await tx.commission.findMany({
        where: {
          id: { in: commissionIds },
          status: 'APPROVED'
        }
      });

      let paidCount = 0;
      for (const comm of commissions) {
        const wallet = await tx.wallet.findFirst({ where: { agentId: comm.agentId } });
        if (wallet) {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: comm.amount } }
          });
          
          await tx.commission.update({
            where: { id: comm.id },
            data: {
              status: 'PAID',
              paidAt: new Date()
            }
          });
          paidCount++;
        }
      }
      return paidCount;
    });
  },
  
  async getAgentCommissionSummary(agentId: string) {
    const results = await prisma.commission.groupBy({
      by: ['status'],
      where: { agentId },
      _sum: { amount: true }
    });

    const summary = {
      pending: new Decimal(0),
      approved: new Decimal(0),
      paid: new Decimal(0),
      total: new Decimal(0)
    };

    results.forEach(r => {
      const val = r._sum.amount || new Decimal(0);
      if (r.status === 'PENDING') summary.pending = new Decimal(val);
      if (r.status === 'APPROVED') summary.approved = new Decimal(val);
      if (r.status === 'PAID') summary.paid = new Decimal(val);
      summary.total = summary.total.plus(new Decimal(val));
    });

    return summary;
  }
};
