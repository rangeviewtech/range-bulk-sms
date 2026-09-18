'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Send, CheckCircle, BarChart3, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CampaignReportItem {
  id: string;
  name: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  totalCost: number | string;
  createdAt: string;
}

export default function CampaignsReportPage() {
  const [campaigns, setCampaigns] = useState<CampaignReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCampaignReports = useCallback(async () => {
    try {
      const res = await fetch('/api/campaigns?limit=50');
      if (!res.ok) throw new Error('Failed to load campaigns report');
      const data = await res.json();
      setCampaigns(data.data || []);
    } catch {
      toast.error('Unable to fetch campaign reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaignReports();
  }, [fetchCampaignReports]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCampaignReports();
  };

  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalDelivered = campaigns.reduce((sum, c) => sum + c.deliveredCount, 0);
  const totalSpend = campaigns.reduce((sum, c) => sum + Number(c.totalCost || 0), 0);
  const avgDeliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '99.0';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Campaign Performance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Historical delivery metrics, success rates, and spend per campaign dispatch.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh campaigns report"
            className="flex-1 sm:flex-initial"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex-1 sm:flex-initial">
            <Link href="/sms/campaigns/new">New Campaign</Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Campaigns</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <BarChart3 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Executed to date</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages Sent</CardTitle>
            <div className="p-2 rounded-lg bg-primary/20 text-primary-foreground">
              <Send className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Recipients reached</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Delivery Rate</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {avgDeliveryRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Successful carrier handoff</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Campaign Spend</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <span className="font-bold text-xs">UGX</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary dark:text-primary">
              UGX {totalSpend.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Prepaid wallet deductions</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance Table */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader>
          <CardTitle>Campaigns Breakdown</CardTitle>
          <CardDescription>
            Detailed performance log of your recent messaging campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-full bg-muted/40 animate-pulse rounded" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-foreground">No campaign data available</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Launch a bulk SMS campaign to see real-time analytics.
              </p>
              <Button asChild className="bg-primary text-primary-foreground font-bold hover:bg-primary/90">
                <Link href="/sms/campaigns/new">Create First Campaign</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Sent / Recipients</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Failed</TableHead>
                    <TableHead>Delivery Rate</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => {
                    const rate =
                      c.sentCount > 0
                        ? ((c.deliveredCount / c.sentCount) * 100).toFixed(1)
                        : '0.0';
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-semibold text-foreground">
                          {c.name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {c.sentCount.toLocaleString()} / {c.recipientCount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          {c.deliveredCount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-red-600 dark:text-red-400 font-medium">
                          {c.failedCount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={parseFloat(rate) >= 95 ? 'default' : 'outline'}
                            className={
                              parseFloat(rate) >= 95
                                ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                                : ''
                            }
                          >
                            {rate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-sm">
                          UGX {Number(c.totalCost || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/sms/campaigns/${c.id}`} className="hover:text-secondary">
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
