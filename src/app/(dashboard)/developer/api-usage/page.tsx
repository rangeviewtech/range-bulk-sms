'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

type TimeRange = '24h' | '7d' | '30d' | '90d';

interface EndpointMetric {
  endpoint: string;
  method: 'POST' | 'GET';
  calls: number;
  avgLatency: number;
  errorRate: number;
  status: 'optimal' | 'warning';
}

const TOP_ENDPOINTS: EndpointMetric[] = [
  {
    endpoint: '/api/v1/sms/send',
    method: 'POST',
    calls: 84210,
    avgLatency: 132,
    errorRate: 0.08,
    status: 'optimal',
  },
  {
    endpoint: '/api/v1/sms/bulk',
    method: 'POST',
    calls: 31200,
    avgLatency: 245,
    errorRate: 0.12,
    status: 'optimal',
  },
  {
    endpoint: '/api/v1/balance',
    method: 'GET',
    calls: 16840,
    avgLatency: 48,
    errorRate: 0.01,
    status: 'optimal',
  },
  {
    endpoint: '/api/v1/sms/schedule',
    method: 'POST',
    calls: 6420,
    avgLatency: 164,
    errorRate: 0.15,
    status: 'optimal',
  },
  {
    endpoint: '/api/v1/contacts',
    method: 'POST',
    calls: 3631,
    avgLatency: 92,
    errorRate: 0.04,
    status: 'optimal',
  },
];

const TIME_SERIES_DATA: Record<TimeRange, Array<{ time: string; requests: number; success: number; errors: number; latency: number }>> = {
  '24h': [
    { time: '00:00', requests: 1200, success: 1198, errors: 2, latency: 142 },
    { time: '03:00', requests: 850, success: 849, errors: 1, latency: 138 },
    { time: '06:00', requests: 2100, success: 2096, errors: 4, latency: 145 },
    { time: '09:00', requests: 6400, success: 6390, errors: 10, latency: 158 },
    { time: '12:00', requests: 7800, success: 7788, errors: 12, latency: 162 },
    { time: '15:00', requests: 7200, success: 7192, errors: 8, latency: 154 },
    { time: '18:00', requests: 5400, success: 5395, errors: 5, latency: 148 },
    { time: '21:00', requests: 3100, success: 3097, errors: 3, latency: 140 },
  ],
  '7d': [
    { time: 'Mon', requests: 18400, success: 18382, errors: 18, latency: 148 },
    { time: 'Tue', requests: 22100, success: 22075, errors: 25, latency: 152 },
    { time: 'Wed', requests: 24500, success: 24470, errors: 30, latency: 156 },
    { time: 'Thu', requests: 21800, success: 21774, errors: 26, latency: 150 },
    { time: 'Fri', requests: 26400, success: 26362, errors: 38, latency: 160 },
    { time: 'Sat', requests: 14200, success: 14188, errors: 12, latency: 135 },
    { time: 'Sun', requests: 12900, success: 12891, errors: 9, latency: 130 },
  ],
  '30d': [
    { time: 'Week 1', requests: 32400, success: 32360, errors: 40, latency: 144 },
    { time: 'Week 2', requests: 36800, success: 36750, errors: 50, latency: 148 },
    { time: 'Week 3', requests: 38200, success: 38148, errors: 52, latency: 150 },
    { time: 'Week 4', requests: 34901, success: 34861, errors: 40, latency: 142 },
  ],
  '90d': [
    { time: 'Month 1', requests: 128400, success: 128220, errors: 180, latency: 146 },
    { time: 'Month 2', requests: 142301, success: 142130, errors: 171, latency: 145 },
    { time: 'Month 3', requests: 158900, success: 158700, errors: 200, latency: 149 },
  ],
};

export default function ApiUsagePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentData = useMemo(() => TIME_SERIES_DATA[timeRange], [timeRange]);

  const totalRequests = useMemo(() => {
    return currentData.reduce((acc, curr) => acc + curr.requests, 0);
  }, [currentData]);

  const totalErrors = useMemo(() => {
    return currentData.reduce((acc, curr) => acc + curr.errors, 0);
  }, [currentData]);

  const avgLatency = useMemo(() => {
    return Math.round(
      currentData.reduce((acc, curr) => acc + curr.latency, 0) / currentData.length
    );
  }, [currentData]);

  const errorRate = useMemo(() => {
    if (totalRequests === 0) return '0.00%';
    return `${((totalErrors / totalRequests) * 100).toFixed(2)}%`;
  }, [totalRequests, totalErrors]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('API usage telemetry refreshed');
    }, 400);
  };

  const handleExport = () => {
    const headers = ['Time', 'Total Requests', 'Successful', 'Errors', 'Avg Latency (ms)'];
    const rows = currentData.map((d) => [
      d.time,
      d.requests.toString(),
      d.success.toString(),
      d.errors.toString(),
      d.latency.toString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `range_api_usage_${timeRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Telemetry exported to CSV');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              API Telemetry &amp; Usage
            </h1>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              Live Gateway Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time throughput metrics, latency percentiles, error monitoring, and endpoint capacity.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Range Selector */}
          <div className="inline-flex rounded-lg border border-border bg-card p-1 shadow-2xs">
            {(['24h', '7d', '30d', '90d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Invocations
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {totalRequests.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14.2% vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Success Delivery Rate
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {(100 - parseFloat(errorRate)).toFixed(2)}%
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {(totalRequests - totalErrors).toLocaleString()} successful dispatches
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Average Latency
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {avgLatency} <span className="text-sm font-sans font-normal text-muted-foreground">ms</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              p95: 245ms &bull; p99: 390ms
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Error / Reject Rate
            </CardTitle>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {errorRate}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {totalErrors} total error responses
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Throughput Volume Chart (2 Cols) */}
        <Card className="lg:col-span-2 bg-card border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">API Throughput Over Time</CardTitle>
                <CardDescription className="text-xs">
                  Request volume and successful dispatches across {timeRange} window
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-[11px] font-mono">
                {currentData.length} data intervals
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] sm:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="requestsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#04648C" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#04648C" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
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
                    dataKey="requests"
                    name="Total Requests"
                    stroke="#04648C"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#requestsGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="success"
                    name="Delivered / Accepted"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#successGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Latency Distribution (1 Col) */}
        <Card className="bg-card border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Gateway Latency (ms)</CardTitle>
            <CardDescription className="text-xs">
              Average response time profile across intervals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] sm:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="latency"
                    name="Latency (ms)"
                    fill="#FBCA07"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HTTP Status Code & Security Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>HTTP 2xx (Success)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono">99.88%</span>
              <span className="text-xs text-muted-foreground">142,130 calls</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '99.88%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>HTTP 4xx (Client Errors)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono">0.11%</span>
              <span className="text-xs text-muted-foreground">156 calls</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '0.11%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>HTTP 5xx (Server / Gateway)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono">0.01%</span>
              <span className="text-xs text-muted-foreground">15 calls</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: '0.01%' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Endpoints Performance Table */}
      <Card className="bg-card border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold">Top Endpoints Activity</CardTitle>
          <CardDescription className="text-xs">
            Performance breakdown by REST route, latency profile, and error rate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Endpoint</th>
                  <th className="px-4 py-3 text-right">Invocations</th>
                  <th className="px-4 py-3 text-right">Avg Latency</th>
                  <th className="px-4 py-3 text-right">Error Rate</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {TOP_ENDPOINTS.map((ep) => (
                  <tr key={`${ep.method}-${ep.endpoint}`} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ep.method === 'POST'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {ep.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground font-mono">
                      {ep.endpoint}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {ep.calls.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {ep.avgLatency}ms
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {ep.errorRate}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                        Healthy
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
