import { prisma } from "@/lib/prisma";
import { AdminDashboardClient, AdminDashboardData } from "./admin-dashboard-client";
import { subDays, format } from "date-fns";

export async function AdminDashboard() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const sevenDaysAgo = subDays(new Date(), 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalClients,
    activeAgents,
    totalMessages,
    deliveredMessages,
    smsSentToday,
    walletAggregate,
    providers,
    recentCampaigns,
    dailyMessages,
    dailyTransactions,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.agent.count({ where: { status: 'ACTIVE' } }),
    prisma.message.count(),
    prisma.message.count({ where: { status: 'DELIVERED' } }),
    prisma.message.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.wallet.aggregate({ _sum: { balance: true } }),
    prisma.smsProvider.findMany({
      orderBy: { priority: 'asc' },
      select: {
        id: true,
        name: true,
        displayName: true,
        type: true,
        isActive: true,
        priority: true,
        costPerSms: true,
      },
    }),
    prisma.campaign.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { companyName: true } },
      },
    }),
    prisma.message.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, status: true },
    }),
    prisma.transaction.findMany({
      where: { createdAt: { gte: sevenDaysAgo }, type: 'DEPOSIT' },
      select: { createdAt: true, amount: true },
    }),
  ]);

  const deliveryRate = totalMessages > 0 ? (deliveredMessages / totalMessages) * 100 : 98.5;
  const totalWalletBalance = walletAggregate._sum.balance ? Number(walletAggregate._sum.balance) : 0;
  const activeProvidersCount = providers.filter((p) => p.isActive).length;

  // Build 7-day trend arrays
  const volumeTrends = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'MMM dd');
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const msgsOnDay = dailyMessages.filter(
      (m) => m.createdAt >= dayStart && m.createdAt <= dayEnd
    );
    const sent = msgsOnDay.length;
    const delivered = msgsOnDay.filter((m) => m.status === 'DELIVERED').length;

    return {
      date: dateStr,
      sent,
      delivered,
    };
  });

  const revenueTrends = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'MMM dd');
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const txsOnDay = dailyTransactions.filter(
      (t) => t.createdAt >= dayStart && t.createdAt <= dayEnd
    );
    const revenue = txsOnDay.reduce((acc, curr) => acc + Number(curr.amount), 0);

    return {
      date: dateStr,
      revenue,
    };
  });

  const formattedCampaigns = recentCampaigns.map((c) => ({
    id: c.id,
    name: c.name,
    clientName: c.client?.companyName || 'Direct Client',
    status: c.status,
    totalRecipients: c.totalRecipients || 0,
    createdAt: c.createdAt.toISOString(),
  }));

  const data: AdminDashboardData = {
    metrics: {
      totalClients,
      activeAgents,
      smsSentToday,
      totalMessages,
      deliveryRate,
      totalWalletBalance,
      activeProvidersCount,
      totalProvidersCount: providers.length,
    },
    volumeTrends,
    revenueTrends,
    recentCampaigns: formattedCampaigns,
    providers: providers.map((p) => ({
      id: p.id,
      name: p.name,
      displayName: p.displayName,
      type: p.type,
      isActive: p.isActive,
      priority: p.priority,
      costPerSms: Number(p.costPerSms),
    })),
  };

  return <AdminDashboardClient data={data} />;
}
