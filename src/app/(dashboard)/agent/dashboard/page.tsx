'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CreditCard, MessageSquare, DollarSign, RefreshCw, ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { toast } from 'sonner';

interface OverviewData {
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

export default function AgentDashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/agent/overview');
      if (!res.ok) throw new Error('Failed to load agent overview');
      const json = await res.json();
      setData(json.overview);
    } catch {
      toast.error('Could not load agent metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOverview();
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Agent Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your onboarded client volume, aggregate SMS spend, and accumulated commissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh metrics"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild className="bg-primary text-primary-foreground font-bold hover:bg-primary/90">
            <Link href="/agent/earnings">
              Request Payout <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? <div className="h-7 w-16 bg-muted animate-pulse rounded" /> : data?.totalClients || 0}
            </div>
            <Link href="/agent/clients" className="text-xs text-secondary hover:underline mt-1 inline-block dark:text-primary">
              Manage clients &rarr;
            </Link>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Client SMS Volume</CardTitle>
            <div className="p-2 rounded-lg bg-primary/20 text-primary-foreground">
              <MessageSquare className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? (
                <div className="h-7 w-20 bg-muted animate-pulse rounded" />
              ) : (
                (data?.clientSmsVolume || 0).toLocaleString()
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Dispatched by your portfolio</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Revenue</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? (
                <div className="h-7 w-28 bg-muted animate-pulse rounded" />
              ) : (
                `UGX ${(data?.totalRevenue || 0).toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total client spend</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Commission</CardTitle>
            <div className="p-2 rounded-lg bg-primary/20 text-primary-foreground">
              <CreditCard className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary dark:text-primary">
              {loading ? (
                <div className="h-7 w-24 bg-muted animate-pulse rounded" />
              ) : (
                `UGX ${(data?.pendingCommissions || 0).toLocaleString()}`
              )}
            </div>
            <Link href="/agent/commissions" className="text-xs text-secondary hover:underline mt-1 inline-block dark:text-primary">
              View ledger &rarr;
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends Chart */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader>
          <CardTitle>Client Performance & Commission Trends</CardTitle>
          <CardDescription>
            Historical monthly SMS dispatch volume and your earned reseller commissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[320px] w-full bg-muted/30 animate-pulse rounded-lg flex items-center justify-center">
              <p className="text-xs text-muted-foreground">Loading performance trends...</p>
            </div>
          ) : !data?.monthlyTrends || data.monthlyTrends.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center border border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">No monthly trends data available yet</p>
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyTrends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="agentVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#04648C" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#04648C" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="agentCommGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FBCA07" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#FBCA07" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="volume"
                    name="SMS Volume"
                    stroke="#04648C"
                    fillOpacity={1}
                    fill="url(#agentVolumeGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="commissions"
                    name="Commission (UGX)"
                    stroke="#FBCA07"
                    fillOpacity={1}
                    fill="url(#agentCommGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
