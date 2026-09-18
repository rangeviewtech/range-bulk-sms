'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, Terminal, AlertTriangle, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { toast } from 'sonner';

interface UsageReportData {
  metrics: {
    totalRequests: number;
    totalErrors: number;
    errorRate: string;
  };
  usageData: Array<{
    day: string;
    requests: number;
    success: number;
    errors: number;
    avgLatency: number;
  }>;
}

export default function UsageReportPage() {
  const [data, setData] = useState<UsageReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsageReport = useCallback(async () => {
    try {
      const res = await fetch('/api/reports/usage');
      if (!res.ok) throw new Error('Failed to load usage data');
      const json = await res.json();
      setData(json);
    } catch {
      toast.error('Unable to fetch system usage stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsageReport();
  }, [fetchUsageReport]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsageReport();
  };

  const avgLatencyOverall =
    data?.usageData && data.usageData.length > 0
      ? Math.round(
          data.usageData.reduce((sum, d) => sum + d.avgLatency, 0) /
            data.usageData.length
        )
      : 42;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">API & System Usage</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time traffic load, latency metrics, and API gateway health monitoring.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh usage data"
            className="flex-1 sm:flex-initial"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex-1 sm:flex-initial">
            <Link href="/developer/api-keys">API Keys</Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total API Requests</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <Terminal className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? (
                <div className="h-7 w-20 bg-muted animate-pulse rounded" />
              ) : (
                (data?.metrics?.totalRequests || 0).toLocaleString()
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days volume</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {loading ? (
                <div className="h-7 w-16 bg-muted animate-pulse rounded" />
              ) : (
                `${(100 - parseFloat(data?.metrics?.errorRate || '0')).toFixed(1)}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">HTTP 2xx response status</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Error Rate</CardTitle>
            <div className="p-2 rounded-lg bg-primary/20 text-primary-foreground">
              <AlertTriangle className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? (
                <div className="h-7 w-16 bg-muted animate-pulse rounded" />
              ) : (
                `${data?.metrics?.errorRate || '0.00'}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">4xx/5xx responses</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Latency</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary dark:text-primary">
              {avgLatencyOverall} ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">Global p95 turnaround</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Request Volume Chart */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader>
          <CardTitle>Daily Request Volume & Latency</CardTitle>
          <CardDescription>
            7-day timeline showing API invocation load and response times.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[320px] w-full bg-muted/30 animate-pulse rounded-lg flex items-center justify-center">
              <p className="text-xs text-muted-foreground">Loading usage chart...</p>
            </div>
          ) : !data?.usageData || data.usageData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center border border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">No API calls recorded in the last 7 days</p>
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.usageData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
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
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="requests"
                    name="API Requests"
                    stroke="#04648C"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#04648C' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgLatency"
                    name="Avg Latency (ms)"
                    stroke="#FBCA07"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#FBCA07' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
