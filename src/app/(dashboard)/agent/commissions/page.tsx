'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { TableSkeletonRows } from '@/components/blocks/ui/skeleton-layouts';

interface CommissionRecord {
  id: string;
  transactionRef: string | null;
  messageCount: number;
  totalSmsValue: number | string;
  commissionRate: number | string;
  amount: number | string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REVERSED';
  createdAt: string;
  paidAt: string | null;
  client: {
    user: {
      name: string | null;
      email: string;
    };
  };
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchCommissions = useCallback(async (status = statusFilter) => {
    try {
      const url = status !== 'ALL' ? `/api/agent/commissions?status=${status}` : '/api/agent/commissions';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load commissions');
      const data = await res.json();
      setCommissions(data.commissions || []);
    } catch {
      toast.error('Unable to fetch commission logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCommissions(statusFilter);
  }, [fetchCommissions, statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCommissions(statusFilter);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  // Calculations
  const totalPending = commissions
    .filter((c) => c.status === 'PENDING' || c.status === 'APPROVED')
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);

  const totalPaid = commissions
    .filter((c) => c.status === 'PAID')
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);

  const getStatusBadge = (status: CommissionRecord['status']) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="default" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">PAID</Badge>;
      case 'APPROVED':
        return <Badge variant="secondary" className="bg-secondary text-white">APPROVED</Badge>;
      case 'PENDING':
        return <Badge variant="default" className="bg-primary text-primary-foreground font-semibold">PENDING</Badge>;
      case 'REVERSED':
        return <Badge variant="destructive">REVERSED</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" asChild className="p-0 h-auto text-muted-foreground hover:text-foreground">
              <Link href="/agent/dashboard" className="flex items-center gap-1 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Agent Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Commissions Ledger</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Detailed commission statements generated on client SMS usage and campaigns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh commissions"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild className="bg-primary text-primary-foreground font-bold hover:bg-primary/90">
            <Link href="/agent/earnings">Payout Center</Link>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending / Approved</CardTitle>
            <div className="p-2 rounded-lg bg-primary/20 text-primary-foreground">
              <Clock className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              UGX {totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Available for withdrawal request</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Lifetime Paid</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              UGX {totalPaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Successfully disbursed earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Ledger Card */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Commission Records ({commissions.length})</CardTitle>
            <CardDescription>Filtered by payout lifecycle status.</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1 rounded-lg border">
            {['ALL', 'PENDING', 'APPROVED', 'PAID'].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs px-2.5 py-1 h-7 ${
                  statusFilter === s ? 'bg-primary text-primary-foreground font-bold shadow-none' : ''
                }`}
                onClick={() => handleStatusFilterChange(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[750px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Ref ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>SMS Value</TableHead>
                  <TableHead>Commission Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeletonRows columns={7} rows={5} />
                ) : commissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium text-foreground">No commission entries found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Commissions will automatically generate when your clients dispatch SMS campaigns.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  commissions.map((comm) => (
                    <TableRow key={comm.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {comm.transactionRef || comm.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm text-foreground">
                          {comm.client?.user?.name || 'Client'}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {comm.client?.user?.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{comm.messageCount.toLocaleString()}</TableCell>
                      <TableCell className="text-xs">
                        UGX {Number(comm.totalSmsValue || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-bold text-sm text-secondary dark:text-primary">
                        UGX {Number(comm.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(comm.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>{getStatusBadge(comm.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
