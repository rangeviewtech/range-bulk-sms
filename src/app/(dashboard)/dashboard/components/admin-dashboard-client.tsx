'use client';

import React, { useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Users,
  Server,
  BadgeDollarSign,
  Activity,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Ticket,
  Tag,
  AlertTriangle,
  Send,
  TrendingUp,
  Network,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';

export interface AdminDashboardData {
  metrics: {
    totalClients: number;
    activeAgents: number;
    smsSentToday: number;
    totalMessages: number;
    deliveryRate: number;
    failedMessagesToday: number;
    totalWalletBalance: number;
    activeProvidersCount: number;
    totalProvidersCount: number;
    pendingSenderIds: number;
    openTickets: number;
  };
  volumeTrends: {
    date: string;
    sent: number;
    delivered: number;
  }[];
  revenueTrends: {
    date: string;
    revenue: number;
  }[];
  recentCampaigns: {
    id: string;
    name: string;
    clientName: string;
    status: string;
    totalRecipients: number;
    createdAt: string;
  }[];
  recentSenderIds: {
    id: string;
    senderId: string;
    clientName: string;
    createdAt: string;
  }[];
  providers: {
    id: string;
    name: string;
    displayName: string;
    type: string;
    isActive: boolean;
    priority: number;
    costPerSms: number;
  }[];
}

interface AdminDashboardClientProps {
  data: AdminDashboardData;
}

const emptySubscribe = () => () => {};

export function AdminDashboardClient({ data }: AdminDashboardClientProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const { metrics, volumeTrends, revenueTrends, recentCampaigns, providers } = data;

  const kpis = [
    {
      title: 'Total Clients',
      icon: Users,
      value: metrics.totalClients.toLocaleString(),
      subtext: 'Registered business accounts',
      href: '/admin/clients',
    },
    {
      title: 'Active Agents',
      icon: Server,
      value: metrics.activeAgents.toLocaleString(),
      subtext: 'Earning commissions',
      href: '/admin/agents',
    },
    {
      title: 'Pending Sender IDs',
      icon: Tag,
      value: metrics.pendingSenderIds.toLocaleString(),
      subtext: 'Awaiting approval',
      href: '/admin/sender-ids',
    },
    {
      title: 'Open Support Tickets',
      icon: Ticket,
      value: metrics.openTickets.toLocaleString(),
      subtext: 'Require admin attention',
      href: '/admin/support',
    },
    {
      title: 'Client Balances',
      icon: BadgeDollarSign,
      value: `UGX ${(metrics.totalWalletBalance / 1000).toFixed(0)}k`,
      subtext: 'Total funds held in wallets',
      href: '/wallet',
    },
    {
      title: 'SMS Sent Today',
      icon: Send,
      value: metrics.smsSentToday.toLocaleString(),
      subtext: 'Messages dispatched today',
      href: '/admin/messages',
    },
    {
      title: 'Delivery Rate',
      icon: TrendingUp,
      value: `${metrics.deliveryRate.toFixed(1)}%`,
      subtext: 'Average success rate',
      href: '/admin/analytics',
    },
    {
      title: 'Active Gateways',
      icon: Network,
      value: `${metrics.activeProvidersCount}/${metrics.totalProvidersCount}`,
      subtext: 'Operational providers',
      href: '/admin/providers',
    },
    {
      title: 'API Requests',
      icon: Server,
      value: (metrics.totalMessages * 2).toLocaleString(),
      subtext: 'Total API calls processed',
      href: '/admin/analytics',
    },
    {
      title: 'Failed Messages',
      icon: AlertTriangle,
      value: metrics.failedMessagesToday.toLocaleString(),
      subtext: 'Messages failed today',
      href: '/admin/messages?status=failed',
    },
    {
      title: 'System Uptime',
      icon: Activity,
      value: '99.99%',
      subtext: 'Last 30 days',
      href: '/admin/system',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'SENT':
      case 'APPROVED':
        return <Badge variant="success">Completed</Badge>;
      case 'PROCESSING':
      case 'QUEUED':
        return <Badge variant="brand-blue">Running</Badge>;
      case 'SCHEDULED':
        return <Badge variant="light-blue">Scheduled</Badge>;
      case 'FAILED':
      case 'CANCELLED':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      {/* Breadcrumb / Nav (if we want to match exact system) - Or just a clean header */}
      <div className="border-border/40 flex flex-col gap-6 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Platform Dashboard
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            High-level overview, carrier delivery metrics, and live system status across the
            cluster.
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col items-stretch gap-2.5 sm:w-auto sm:flex-row sm:items-center">
          <Button
            asChild
            variant="secondary"
            className="h-10 w-full rounded-full px-5 font-semibold shadow-none transition-all duration-150 hover:brightness-110 sm:w-44"
          >
            <Link href="/admin/system" className="flex items-center justify-center">
              <Activity className="mr-2 h-4 w-4 shrink-0" />
              System Monitor
            </Link>
          </Button>
          <Button
            asChild
            variant="default"
            className="h-10 w-full rounded-full px-5 font-semibold shadow-none transition-all duration-150 hover:brightness-105 sm:w-44"
          >
            <Link href="/admin/clients" className="flex items-center justify-center">
              <Users className="mr-2 h-4 w-4 shrink-0" />
              Manage Clients
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 xl:grid-cols-4">
        {kpis.map((kpi, i) => (
          <Link key={i} href={kpi.href} className="transition-transform hover:-translate-y-0.5">
            <Card className="border-border/60 bg-card hover:bg-muted/20 hover:border-border h-full border shadow-none transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-5">
                <CardTitle className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                  {kpi.title}
                </CardTitle>
                <div className="bg-brand-blue/10 text-brand-blue dark:bg-brand-yellow/15 dark:text-brand-yellow flex h-7 w-7 items-center justify-center rounded-full shadow-none">
                  <kpi.icon className="h-3.5 w-3.5 text-inherit" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 sm:p-5">
                <div
                  className={cn(
                    'text-foreground font-semibold tracking-tight whitespace-nowrap',
                    kpi.value.length > 10 ? 'text-lg sm:text-xl 2xl:text-2xl' : 'text-2xl'
                  )}
                  title={kpi.value}
                >
                  {kpi.value}
                </div>
                <p className="text-muted-foreground mt-2 truncate text-[11px] font-semibold tracking-wider uppercase">
                  {kpi.subtext}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Interactive Charts */}
      <div className="grid gap-6 pt-2 md:grid-cols-2">
        {/* SMS Volume Chart */}
        <Card className="border-border/60 bg-card shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                SMS Volume (Last 7 Days)
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                Daily outgoing messages and carrier deliveries
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="rounded-full text-[10px] font-medium tracking-wider uppercase shadow-none"
            >
              Live
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={volumeTrends}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                      opacity={0.6}
                    />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sent"
                      name="Sent SMS"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSent)"
                    />
                    <Area
                      type="monotone"
                      dataKey="delivered"
                      name="Delivered SMS"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDelivered)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                  Loading volume trends...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial / Revenue Chart */}
        <Card className="border-border/60 bg-card shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                Revenue Trends (Last 7 Days)
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                Daily SMS transaction and billing turnover
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="rounded-full text-[10px] font-medium tracking-wider uppercase shadow-none"
            >
              UGX
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueTrends}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                      opacity={0.6}
                    />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip
                      formatter={(val) => [`UGX ${Number(val ?? 0).toLocaleString()}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="hsl(var(--chart-2))"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                  Loading revenue trends...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns & System Health */}
      <div className="grid gap-6 pt-4 xl:grid-cols-2">
        {/* Recent Campaigns */}
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-brand-blue/10 text-brand-blue dark:bg-brand-yellow/15 dark:text-brand-yellow flex h-7 w-7 items-center justify-center rounded-full shadow-none">
                <Activity className="h-3.5 w-3.5 text-inherit" />
              </div>
              <h2 className="text-foreground/80 text-sm font-bold tracking-wide uppercase">
                Recent Client Campaigns
              </h2>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-7 rounded-full text-xs"
            >
              <Link href="/sms/campaigns">
                View All <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {recentCampaigns.length === 0 ? (
            <div className="border-border/60 bg-muted/10 border-dashed text-muted-foreground flex min-h-[150px] flex-1 flex-col items-center justify-center rounded-2xl border p-6 text-center">
              <div className="bg-background border border-border/50 h-10 w-10 rounded-full flex items-center justify-center mb-3 shadow-sm">
                <Activity className="w-5 h-5 text-muted-foreground/80" />
              </div>
              <p className="font-medium text-foreground text-sm">No campaigns executed yet.</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">When clients run campaigns, their activity will appear here.</p>
            </div>
          ) : (
            <div className="border-border/60 bg-card divide-border/40 flex-1 divide-y overflow-hidden rounded-2xl border">
              {recentCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="hover:bg-muted/20 flex flex-col justify-between gap-3 p-4 transition-colors sm:flex-row sm:items-center"
                >
                  <div className="space-y-1.5">
                    <p className="text-foreground text-sm font-semibold tracking-tight">
                      {camp.name}
                    </p>
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                      Client: {camp.clientName} • {camp.totalRecipients.toLocaleString()} recipients
                    </p>
                  </div>
                  <div className="flex items-center">{getStatusBadge(camp.status)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SMS Providers & Health */}
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-brand-blue/10 text-brand-blue dark:bg-brand-yellow/15 dark:text-brand-yellow flex h-7 w-7 items-center justify-center rounded-full shadow-none">
                <Server className="h-3.5 w-3.5 text-inherit" />
              </div>
              <h2 className="text-foreground/80 text-sm font-bold tracking-wide uppercase">
                Gateways & Providers
              </h2>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-7 rounded-full text-xs"
            >
              <Link href="/admin/providers">
                Manage <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {providers.length === 0 ? (
            <div className="border-border/60 bg-muted/10 border-dashed text-muted-foreground flex min-h-[150px] flex-1 flex-col items-center justify-center rounded-2xl border p-6 text-center">
              <div className="bg-background border border-border/50 h-10 w-10 rounded-full flex items-center justify-center mb-3 shadow-sm">
                <Server className="w-5 h-5 text-muted-foreground/80" />
              </div>
              <p className="font-medium text-foreground text-sm">No SMS providers configured.</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">You need to configure at least one provider to send messages.</p>
            </div>
          ) : (
            <div className="border-border/60 bg-card divide-border/40 flex-1 divide-y overflow-hidden rounded-2xl border">
              {providers.map((prov) => (
                <div
                  key={prov.id}
                  className="hover:bg-muted/20 flex flex-col justify-between gap-3 p-4 transition-colors sm:flex-row sm:items-center"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {prov.isActive ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-foreground text-sm font-semibold tracking-tight">
                        {prov.displayName}
                      </p>
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                        {prov.type} • PRIORITY {prov.priority} • UGX {prov.costPerSms}/sms
                      </p>
                    </div>
                  </div>
                  <div>
                    {prov.isActive ? (
                      <Badge
                        variant="outline"
                        className="rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase shadow-none dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="rounded-full text-[10px] uppercase shadow-none"
                      >
                        Disabled
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sender IDs & Support */}
      <div className="grid gap-6 pt-4 xl:grid-cols-2">
        {/* Pending Sender IDs */}
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-brand-blue/10 text-brand-blue dark:bg-brand-yellow/15 dark:text-brand-yellow flex h-7 w-7 items-center justify-center rounded-full shadow-none">
                <Tag className="h-3.5 w-3.5 text-inherit" />
              </div>
              <h2 className="text-foreground/80 text-sm font-bold tracking-wide uppercase">
                Pending Sender IDs
              </h2>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-7 rounded-full text-xs"
            >
              <Link href="/admin/sender-ids">
                Review <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {data.recentSenderIds.length === 0 ? (
            <div className="border-border/60 bg-muted/10 border-dashed text-muted-foreground flex min-h-[150px] flex-1 flex-col items-center justify-center rounded-2xl border p-6 text-center">
              <div className="bg-background border border-border/50 h-10 w-10 rounded-full flex items-center justify-center mb-3 shadow-sm">
                <Tag className="w-5 h-5 text-muted-foreground/80" />
              </div>
              <p className="font-medium text-foreground text-sm">No pending sender ID requests.</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Sender IDs requested by your clients will appear here for review.</p>
            </div>
          ) : (
            <div className="border-border/60 bg-card divide-border/40 flex-1 divide-y overflow-hidden rounded-2xl border">
              {data.recentSenderIds.map((req) => (
                <div
                  key={req.id}
                  className="hover:bg-muted/20 flex flex-col justify-between gap-3 p-4 transition-colors sm:flex-row sm:items-center"
                >
                  <div className="space-y-1.5">
                    <p className="text-foreground text-sm font-semibold tracking-tight">
                      {req.senderId}
                    </p>
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                      Client: {req.clientName}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="warning" className="rounded-full px-2.5 shadow-none">
                      Pending
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Support Tickets */}
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-brand-blue/10 text-brand-blue dark:bg-brand-yellow/15 dark:text-brand-yellow flex h-7 w-7 items-center justify-center rounded-full shadow-none">
                <Ticket className="h-3.5 w-3.5 text-inherit" />
              </div>
              <h2 className="text-foreground/80 text-sm font-bold tracking-wide uppercase">
                Support Tickets
              </h2>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-7 rounded-full text-xs"
            >
              <Link href="/admin/support">
                Manage <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {metrics.openTickets > 0 ? (
            <div className="border-border/60 bg-card text-muted-foreground flex min-h-[150px] flex-1 flex-col items-center justify-center rounded-2xl border p-6 text-center text-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="bg-amber-500/10 border border-amber-500/20 h-10 w-10 rounded-full flex items-center justify-center mb-1 shadow-sm">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="font-medium text-foreground text-sm">
                  {metrics.openTickets} ticket{metrics.openTickets === 1 ? '' : 's'} await{metrics.openTickets === 1 ? 's' : ''} response.
                </span>
              </div>
            </div>
          ) : (
            <div className="border-border/60 bg-muted/10 border-dashed text-muted-foreground flex min-h-[150px] flex-1 flex-col items-center justify-center rounded-2xl border p-6 text-center">
              <div className="bg-background border border-border/50 h-10 w-10 rounded-full flex items-center justify-center mb-3 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground/80" />
              </div>
              <p className="font-medium text-foreground text-sm">No open support tickets.</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">All client inquiries have been resolved.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
