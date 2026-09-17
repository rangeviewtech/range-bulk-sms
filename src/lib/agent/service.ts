import { prisma } from '@/lib/prisma';
import { CommissionStatus, Prisma } from '@/generated/prisma/client';

export interface AgentMetrics {
  totalClients: number;
  clientSmsVolume: number;
  totalRevenue: number;
  pendingCommissions: number;
  totalEarnings: number;
  availableForPayout: number;
  monthlyTrends: Array<{
    month: string;
    volume: number;
    commissions: number;
  }>;
}

export const AgentService = {
  async getOrCreateAgent(userId: string) {
    let agent = await prisma.agent.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!agent) {
      agent = await prisma.agent.create({
        data: {
          userId,
          status: 'ACTIVE',
          commissionRate: new Prisma.Decimal(5.0),
          totalEarnings: new Prisma.Decimal(0),
          pendingPayout: new Prisma.Decimal(0),
        },
        include: { user: true },
      });
    }

    return agent;
  },

  async getOverview(agentId: string): Promise<AgentMetrics> {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        clients: {
          include: {
            campaigns: {
              select: {
                sentCount: true,
                totalCost: true,
                createdAt: true,
              },
            },
          },
        },
        commissions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    const totalClients = agent.clients.length;

    // Calculate total volume and revenue across clients
    let clientSmsVolume = 0;
    let totalRevenue = 0;
    for (const client of agent.clients) {
      for (const campaign of client.campaigns) {
        clientSmsVolume += campaign.sentCount;
        totalRevenue += Number(campaign.totalCost || 0);
      }
    }

    // Commissions breakdown
    let pendingCommissions = 0;
    let totalEarnings = 0;
    for (const comm of agent.commissions) {
      const amt = Number(comm.amount || 0);
      if (comm.status === CommissionStatus.PENDING || comm.status === CommissionStatus.APPROVED) {
        pendingCommissions += amt;
      }
      if (comm.status === CommissionStatus.PAID) {
        totalEarnings += amt;
      }
    }

    // Monthly trends (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyTrends: Array<{ month: string; volume: number; commissions: number }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      const mYear = d.getFullYear();

      let mVol = 0;
      let mComm = 0;

      for (const client of agent.clients) {
        for (const camp of client.campaigns) {
          const cDate = new Date(camp.createdAt);
          if (cDate.getMonth() === d.getMonth() && cDate.getFullYear() === mYear) {
            mVol += camp.sentCount;
          }
        }
      }

      for (const comm of agent.commissions) {
        const cDate = new Date(comm.createdAt);
        if (cDate.getMonth() === d.getMonth() && cDate.getFullYear() === mYear) {
          mComm += Number(comm.amount || 0);
        }
      }

      monthlyTrends.push({
        month: mName,
        volume: mVol,
        commissions: mComm,
      });
    }

    return {
      totalClients,
      clientSmsVolume,
      totalRevenue,
      pendingCommissions,
      totalEarnings,
      availableForPayout: pendingCommissions,
      monthlyTrends,
    };
  },

  async getClients(agentId: string) {
    const clients = await prisma.client.findMany({
      where: { agentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        campaigns: {
          select: {
            sentCount: true,
            totalCost: true,
          },
        },
        commissions: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return clients.map((c) => {
      const totalSms = c.campaigns.reduce((sum, camp) => sum + camp.sentCount, 0);
      const totalRevenue = c.campaigns.reduce((sum, camp) => sum + Number(camp.totalCost || 0), 0);
      const totalCommission = c.commissions.reduce((sum, comm) => sum + Number(comm.amount || 0), 0);

      return {
        id: c.id,
        name: c.companyName || c.user.name || 'Unnamed Client',
        email: c.user.email,
        joinedAt: c.createdAt.toISOString(),
        totalSms,
        totalRevenue,
        totalCommission,
        status: c.status,
      };
    });
  },

  async getCommissions(agentId: string, status?: CommissionStatus) {
    return await prisma.commission.findMany({
      where: {
        agentId,
        ...(status ? { status } : {}),
      },
      include: {
        client: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async requestPayout(agentId: string, amount: number, method: string, details: string) {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        commissions: {
          where: { status: CommissionStatus.APPROVED },
        },
      },
    });

    if (!agent) throw new Error('Agent not found');

    // Update pending commissions to PAID or mark payout request
    const approvedTotal = agent.commissions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    if (amount > approvedTotal && approvedTotal > 0) {
      throw new Error(`Requested amount exceeds approved commissions (UGX ${approvedTotal.toLocaleString()})`);
    }

    return await prisma.$transaction(async (tx) => {
      const updatedAgent = await tx.agent.update({
        where: { id: agentId },
        data: {
          pendingPayout: {
            decrement: amount,
          },
          totalEarnings: {
            increment: amount,
          },
        },
      });

      // Update approved commissions up to the requested amount
      let remaining = amount;
      for (const comm of agent.commissions) {
        if (remaining <= 0) break;
        const commAmt = Number(comm.amount || 0);
        await tx.commission.update({
          where: { id: comm.id },
          data: {
            status: CommissionStatus.PAID,
            paidAt: new Date(),
          },
        });
        remaining -= commAmt;
      }

      return {
        success: true,
        amount,
        method,
        details,
        agent: updatedAgent,
      };
    });
  },
};
