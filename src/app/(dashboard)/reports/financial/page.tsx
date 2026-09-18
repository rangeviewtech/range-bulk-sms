'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowUpRight, ArrowDownRight, RotateCcw } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { toast } from 'sonner';

interface FinancialReportData {
  summary: {
    totalDeposits: number;
    totalSpend: number;
    totalRefunds: number;
  };
  monthlyData: Array<{
    month: string;
    spend: number;
    deposits: number;
  }>;
}

export default function FinancialReportPage() {
  const [data, setData] = useState<FinancialReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFinancialReport = useCallback(async () => {
    try {
      const res = await fetch('/api/reports/financial');
      if (!res.ok) throw new Error('Failed to load financial report');
      const json = await res.json();
      setData(json);
    } catch {
      toast.error('Unable to fetch financial summary');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancialReport();
  }, [fetchFinancialReport]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFinancialReport();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Financial Summary</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Audited breakdown of your annual deposits, campaign spend, and automated delivery refunds.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh financial report"
            className="flex-1 sm:flex-initial"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex-1 sm:flex-initial">
            <Link href="/wallet">Manage Wallet</Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Deposits (YTD)</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? (
                <div className="h-7 w-28 bg-muted animate-pulse rounded" />
              ) : (
                `UGX ${(data?.summary?.totalDeposits || 0).toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cumulative wallet top-ups this year</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spend (YTD)</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? (
                <div className="h-7 w-28 bg-muted animate-pulse rounded" />
              ) : (
                `UGX ${(data?.summary?.totalSpend || 0).toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Dispatched SMS message usage</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Refunds Credited (YTD)</CardTitle>
            <div className="p-2 rounded-lg bg-primary/20 text-primary-foreground">
              <RotateCcw className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary dark:text-primary">
              {loading ? (
                <div className="h-7 w-24 bg-muted animate-pulse rounded" />
              ) : (
                `UGX ${(data?.summary?.totalRefunds || 0).toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Undelivered carrier failure rebates</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Spend & Deposit Chart */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader>
          <CardTitle>Monthly Spend & Deposits</CardTitle>
          <CardDescription>
            Comparison of capital added vs messaging spend month-over-month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[320px] w-full bg-muted/30 animate-pulse rounded-lg flex items-center justify-center">
              <p className="text-xs text-muted-foreground">Loading financial chart...</p>
            </div>
          ) : !data?.monthlyData || data.monthlyData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center border border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">No financial activity recorded this year</p>
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip
                    formatter={(value: unknown) => [`UGX ${Number(value || 0).toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar
                    dataKey="deposits"
                    name="Deposits (UGX)"
                    fill="#FBCA07"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="spend"
                    name="SMS Spend (UGX)"
                    fill="#04648C"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
