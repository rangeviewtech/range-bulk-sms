import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function GET(_req: Request) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'system.monitor'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const [
    totalUsers,
    totalClients,
    totalAgents,
    totalMessages,
    totalCampaigns,
    providers,
    gatewaysCount,
    recentLogs
  ] = await Promise.all([
    prisma.user.count(),
    prisma.client.count(),
    prisma.agent.count(),
    prisma.message.count(),
    prisma.campaign.count(),
    prisma.smsProvider.findMany({ select: { name: true, displayName: true, type: true, isActive: true, priority: true } }),
    prisma.gateway.count(),
    prisma.auditLog.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
  ]);

  const mem = process.memoryUsage();

  return NextResponse.json({
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    metrics: {
      totalUsers,
      totalClients,
      totalAgents,
      totalMessages,
      totalCampaigns,
      gatewaysCount,
    },
    providers,
    recentLogs,
    system: {
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      memoryUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      memoryTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      environment: process.env.NODE_ENV,
    }
  });
}
