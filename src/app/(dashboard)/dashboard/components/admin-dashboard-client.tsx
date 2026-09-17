"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Server, BadgeDollarSign, Activity, Settings2, BarChart2, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
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
    totalWalletBalance: number;
    activeProvidersCount: number;
    totalProvidersCount: number;
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

export function AdminDashboardClient({ data }: AdminDashboardClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      title: "Client Balances",
      icon: BadgeDollarSign,
      value: `UGX ${metrics.totalWalletBalance.toLocaleString()}`,
      subtext: "Total funds held in wallets",
      href: "/billing/wallets",
    },
    {
      title: "SMS Gateways",
      icon: Settings2,
      value: `${metrics.activeProvidersCount}/${metrics.totalProvidersCount} Active`,
      subtext: "Operational gateways",
      href: "/admin/providers",
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
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview, carrier delivery metrics, and live system status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/system">
              <Activity className="w-4 h-4 mr-1.5" />
              System Monitor
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/clients">
              <Users className="w-4 h-4 mr-1.5" />
              Manage Clients
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi, i) => (
          <Link key={i} href={kpi.href} className="transition-transform hover:-translate-y-0.5">
            <Card className="h-full border hover:border-secondary/40 hover:shadow-xs transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.title}</CardTitle>
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary/10 text-secondary dark:bg-secondary/25 dark:text-secondary-foreground">
                  <kpi.icon className="h-3.5 w-3.5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{kpi.subtext}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Interactive Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* SMS Volume Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">SMS Volume (Last 7 Days)</CardTitle>
              <CardDescription>Daily outgoing messages and carrier deliveries</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-normal">Live Aggregate</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#04648C" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#04648C" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FBCA07" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#FBCA07" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="sent" name="Sent SMS" stroke="#04648C" strokeWidth={2} fillOpacity={1} fill="url(#colorSent)" />
                    <Area type="monotone" dataKey="delivered" name="Delivered SMS" stroke="#FBCA07" strokeWidth={2} fillOpacity={1} fill="url(#colorDelivered)" />
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Revenue Trends (Last 7 Days)</CardTitle>
              <CardDescription>Daily SMS transaction and billing turnover</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-normal">UGX Value</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <RechartsTooltip
                      formatter={(val) => [`UGX ${Number(val ?? 0).toLocaleString()}`, "Revenue"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="revenue" name="Revenue" fill="#04648C" radius={[4, 4, 0, 0]} maxBarSize={45} />
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
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Client Campaigns</CardTitle>
              <CardDescription>Latest broadcasts triggered across accounts</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/sms/campaigns">
                View All <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentCampaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No campaigns executed yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentCampaigns.map((camp) => (
                  <li key={camp.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm text-foreground">{camp.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Client: {camp.clientName} • {camp.totalRecipients.toLocaleString()} recipients
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(camp.status)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* SMS Providers & Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">SMS Gateways & Providers</CardTitle>
              <CardDescription>Live connection status and routing priorities</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/admin/providers">
                Manage Gateways <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {providers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No SMS providers configured.</p>
            ) : (
              <ul className="divide-y divide-border">
                {providers.map((prov) => (
                  <li key={prov.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      {prov.isActive ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{prov.displayName}</p>
                        <p className="text-xs text-muted-foreground">
                          Type: {prov.type} • Priority: {prov.priority} • Cost: UGX {prov.costPerSms}/sms
                        </p>
                      </div>
                    </div>
                    <div>
                      {prov.isActive ? (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-600/30">Operational</Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
