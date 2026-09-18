'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Send, CheckCircle2, XCircle, DollarSign } from 'lucide-react';
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

interface SmsReportData {
  metrics: {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
    avgCostPerSms: number;
  };
  trends: Array<{
    date: string;
    sent: number;
    delivered: number;
    failed: number;
  }>;
}

export default function SmsReportsPage() {
  const [data, setData] = useState<SmsReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSmsReport = useCallback(async () => {
    try {
      const res = await fetch('/api/reports/sms');
      if (!res.ok) throw new Error('Failed to load SMS analytics');
      const json = await res.json();
      setData(json);
    } catch {
      toast.error('Unable to fetch SMS analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSmsReport();
  }, [fetchSmsReport]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSmsReport();
  };

  const handleExport = () => {
    if (!data?.trends || data.trends.length === 0) {
      toast.error('No trends data to export');
      return;
    }

    const headers = ['Date', 'Total Sent', 'Delivered', 'Failed'];
    const rows = data.trends.map((t) => [t.date, t.sent, t.delivered, t.failed]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sms-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('SMS analytics report exported');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">SMS Delivery Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time delivery receipts, carrier handoffs, and throughput performance.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh SMS analytics"
            className="flex-1 sm:flex-initial"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!data?.trends || data.trends.length === 0}
            className="flex-1 sm:flex-initial"
          >
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle>
            <div className="p-2 rounded-lg bg-primary/20 text-primary-foreground">
              <Send className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? (
                <div className="h-7 w-20 bg-muted animate-pulse rounded" />
              ) : (
                (data?.metrics?.totalSent || 0).toLocaleString()
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All-time dispatched</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {loading ? (
                <div className="h-7 w-24 bg-muted animate-pulse rounded" />
              ) : (
                `${(data?.metrics?.totalDelivered || 0).toLocaleString()} (${data?.metrics?.deliveryRate || 0}%)`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed handset delivery</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <XCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {loading ? (
                <div className="h-7 w-16 bg-muted animate-pulse rounded" />
              ) : (
                (data?.metrics?.totalFailed || 0).toLocaleString()
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Network or subscriber errors</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Cost per SMS</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary dark:text-primary">
              UGX {data?.metrics?.avgCostPerSms || 45}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Weighted carrier average</p>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Trends Chart */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader>
          <CardTitle>Delivery Throughput Trends</CardTitle>
          <CardDescription>
            Recent daily volume comparing total sent vs delivered handsets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[320px] w-full bg-muted/30 animate-pulse rounded-lg flex items-center justify-center">
              <p className="text-xs text-muted-foreground">Loading delivery trends...</p>
            </div>
          ) : !data?.trends || data.trends.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center border border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">No recent dispatch trends to display</p>
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="smsSentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#04648C" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#04648C" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="smsDelivGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
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
                    type="monotone"
                    dataKey="sent"
                    name="Messages Sent"
                    stroke="#04648C"
                    fillOpacity={1}
                    fill="url(#smsSentGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="delivered"
                    name="Delivered"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#smsDelivGrad)"
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
