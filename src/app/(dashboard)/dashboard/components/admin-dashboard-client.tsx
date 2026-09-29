"use client";

import React, { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Server, BadgeDollarSign, Activity, Settings2, BarChart2, CheckCircle2, AlertCircle, ArrowUpRight, Ticket, Tag, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
} from "recharts";

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
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const { metrics, volumeTrends, revenueTrends, recentCampaigns, providers } = data;

  const kpis = [
    {
      title: "Total Clients",
      icon: Users,
      value: metrics.totalClients.toLocaleString(),
      subtext: "Registered business accounts",
      href: "/admin/clients",
    },
    {
      title: "Active Agents",
      icon: Server,
      value: metrics.activeAgents.toLocaleString(),
      subtext: "Earning commissions",
      href: "/admin/agents",
    },
    {
      title: "SMS Sent Today",
      icon: Activity,
      value: metrics.smsSentToday.toLocaleString(),
      subtext: `${metrics.totalMessages.toLocaleString()} all-time messages`,
      href: "/admin/communications/logs",
    },
    {
      title: "Delivery Rate",
      icon: BarChart2,
      value: `${metrics.deliveryRate.toFixed(1)}%`,
      subtext: "Carrier delivery success",
      href: "/sms/delivery-reports",
    },
    {
      title: "Failed Messages (Today)",
      icon: AlertTriangle,
      value: metrics.failedMessagesToday.toLocaleString(),
      subtext: "Undelivered or bounced",
      href: "/sms/delivery-reports",
    },
    {
      title: "Pending Sender IDs",
      icon: Tag,
      value: metrics.pendingSenderIds.toLocaleString(),
      subtext: "Awaiting approval",
      href: "/admin/sender-ids",
    },
    {
      title: "Open Support Tickets",
      icon: Ticket,
      value: metrics.openTickets.toLocaleString(),
      subtext: "Require admin attention",
      href: "/admin/support",
    },
    {
      title: "Client Balances",
      icon: BadgeDollarSign,
      value: `UGX ${(metrics.totalWalletBalance / 1000).toFixed(0)}k`,
      subtext: "Total funds held in wallets",
      href: "/wallet",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "SENT":
      case "APPROVED":
        return <Badge variant="success">Completed</Badge>;
      case "PROCESSING":
      case "QUEUED":
        return <Badge variant="brand-blue">Running</Badge>;
      case "SCHEDULED":
        return <Badge variant="light-blue">Scheduled</Badge>;
      case "FAILED":
      case "CANCELLED":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Breadcrumb / Nav (if we want to match exact system) - Or just a clean header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between pb-6 border-b border-border/40">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Platform Dashboard
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            High-level overview, carrier delivery metrics, and live system status across the cluster.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
          <Button
            asChild
            variant="secondary"
            className="w-full sm:w-44 h-10 font-semibold rounded-full px-5 shadow-none transition-all duration-150 hover:brightness-110"
          >
            <Link href="/admin/system" className="flex items-center justify-center">
              <Activity className="w-4 h-4 mr-2 shrink-0" />
              System Monitor
            </Link>
          </Button>
          <Button
            asChild
            variant="default"
            className="w-full sm:w-44 h-10 font-semibold rounded-full px-5 shadow-none transition-all duration-150 hover:brightness-105"
          >
            <Link href="/admin/clients" className="flex items-center justify-center">
              <Users className="w-4 h-4 mr-2 shrink-0" />
              Manage Clients
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 pt-2">
        {kpis.map((kpi, i) => (
          <Link key={i} href={kpi.href} className="transition-transform hover:-translate-y-0.5">
            <Card className="h-full shadow-none border border-border/60 bg-card hover:bg-muted/20 hover:border-border transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-5 pb-2">
                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.title}</CardTitle>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue dark:bg-brand-yellow/15 dark:text-brand-yellow shadow-none">
                  <kpi.icon className="h-3.5 w-3.5 text-inherit" />
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-0">
                <div
                  className={cn(
                    "font-semibold tracking-tight whitespace-nowrap text-foreground",
                    kpi.value.length > 10 ? "text-lg sm:text-xl 2xl:text-2xl" : "text-2xl"
                  )}
                  title={kpi.value}
                >
                  {kpi.value}
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-2 truncate">{kpi.subtext}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Interactive Charts */}
      <div className="grid gap-6 md:grid-cols-2 pt-2">
        {/* SMS Volume Chart */}
        <Card className="shadow-none border-border/60 bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">SMS Volume (Last 7 Days)</CardTitle>
              <CardDescription className="text-xs mt-1">Daily outgoing messages and carrier deliveries</CardDescription>
            </div>
            <Badge variant="secondary" className="text-[10px] font-medium uppercase tracking-wider shadow-none rounded-full">Live</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                      }}
                    />
                    <Area type="monotone" dataKey="sent" name="Sent SMS" stroke="hsl(var(--chart-2))" strokeWidth={2} fillOpacity={1} fill="url(#colorSent)" />
                    <Area type="monotone" dataKey="delivered" name="Delivered SMS" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorDelivered)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Loading volume trends...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial / Revenue Chart */}
        <Card className="shadow-none border-border/60 bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Revenue Trends (Last 7 Days)</CardTitle>
              <CardDescription className="text-xs mt-1">Daily SMS transaction and billing turnover</CardDescription>
            </div>
            <Badge variant="secondary" className="text-[10px] font-medium uppercase tracking-wider shadow-none rounded-full">UGX</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <RechartsTooltip
                      formatter={(val) => [`UGX ${Number(val ?? 0).toLocaleString()}`, "Revenue"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                      }}
                    />
                    <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Loading revenue trends...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns & System Health */}
      <div className="grid gap-6 xl:grid-cols-2 pt-4">
        {/* Recent Campaigns */}
        <div className="flex flex-col h-full gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue dark:bg-brand-yellow/15 dark:text-brand-yellow shadow-none">
                <Activity className="w-3.5 h-3.5 text-inherit" />
              </div>
              <h2 className="text-sm font-bold tracking-wide uppercase text-foreground/80">Recent Client Campaigns</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs h-7 rounded-full text-muted-foreground">
              <Link href="/sms/campaigns">
                View All <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
          
          {recentCampaigns.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[150px] p-6 rounded-2xl border border-border/60 bg-card text-sm text-muted-foreground text-center">
              No campaigns executed yet.
            </div>
          ) : (
            <div className="flex-1 rounded-2xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
              {recentCampaigns.map((camp) => (
                <div key={camp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-foreground tracking-tight">{camp.name}</p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      Client: {camp.clientName} • {camp.totalRecipients.toLocaleString()} recipients
                    </p>
                  </div>
                  <div className="flex items-center">
                    {getStatusBadge(camp.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SMS Providers & Health */}
        <div className="flex flex-col h-full gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue dark:bg-brand-yellow/15 dark:text-brand-yellow shadow-none">
                <Server className="w-3.5 h-3.5 text-inherit" />
              </div>
              <h2 className="text-sm font-bold tracking-wide uppercase text-foreground/80">Gateways & Providers</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs h-7 rounded-full text-muted-foreground">
              <Link href="/admin/providers">
                Manage <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
          
          {providers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[150px] p-6 rounded-2xl border border-border/60 bg-card text-sm text-muted-foreground text-center">
              No SMS providers configured.
            </div>
          ) : (
            <div className="flex-1 rounded-2xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
              {providers.map((prov) => (
                <div key={prov.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {prov.isActive ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-foreground tracking-tight">{prov.displayName}</p>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                        {prov.type} • PRIORITY {prov.priority} • UGX {prov.costPerSms}/sms
                      </p>
                    </div>
                  </div>
                  <div>
                    {prov.isActive ? (
                      <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px] uppercase font-bold text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400 shadow-none">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-full text-[10px] uppercase shadow-none">Disabled</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sender IDs & Support */}
      <div className="grid gap-6 xl:grid-cols-2 pt-4">
        {/* Pending Sender IDs */}
        <div className="flex flex-col h-full gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue dark:bg-brand-yellow/15 dark:text-brand-yellow shadow-none">
                <Tag className="w-3.5 h-3.5 text-inherit" />
              </div>
              <h2 className="text-sm font-bold tracking-wide uppercase text-foreground/80">Pending Sender IDs</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs h-7 rounded-full text-muted-foreground">
              <Link href="/admin/sender-ids">
                Review <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
          
          {data.recentSenderIds.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[150px] p-6 rounded-2xl border border-border/60 bg-card text-sm text-muted-foreground text-center">
              No pending sender ID requests.
            </div>
          ) : (
            <div className="flex-1 rounded-2xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
              {data.recentSenderIds.map((req) => (
                <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-foreground tracking-tight">{req.senderId}</p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      Client: {req.clientName}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="warning" className="rounded-full shadow-none px-2.5">Pending</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Support Tickets */}
        <div className="flex flex-col h-full gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue dark:bg-brand-yellow/15 dark:text-brand-yellow shadow-none">
                <Ticket className="w-3.5 h-3.5 text-inherit" />
              </div>
              <h2 className="text-sm font-bold tracking-wide uppercase text-foreground/80">Support Tickets</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs h-7 rounded-full text-muted-foreground">
              <Link href="/admin/support">
                Manage <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center min-h-[150px] p-6 rounded-2xl border border-border/60 bg-card text-sm text-muted-foreground text-center">
            {metrics.openTickets > 0 ? (
              <div className="flex flex-col items-center gap-2">
                <AlertTriangle className="w-8 h-8 text-amber-500 opacity-80" />
                <span>{metrics.openTickets} ticket{metrics.openTickets === 1 ? '' : 's'} await{metrics.openTickets === 1 ? 's' : ''} your response.</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
                <span>No open support tickets.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
