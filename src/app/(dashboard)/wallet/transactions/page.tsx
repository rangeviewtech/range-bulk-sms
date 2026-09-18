'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, ArrowLeft, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'DEDUCTION' | 'REFUND';
  amount: string | number;
  balanceBefore?: string | number;
  balanceAfter: string | number;
  reference: string;
  description?: string | null;
  status?: string;
  createdAt: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchTransactions = useCallback(async (targetPage = page, type = filterType) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: targetPage.toString(),
        limit: '15',
      });
      if (type !== 'ALL') {
        queryParams.append('type', type);
      }

      const res = await fetch(`/api/wallet/transactions?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const json = await res.json();
      const data = json.data;

      setTransactions(data.transactions || []);
      setTotalRecords(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / (data.limit || 15)) || 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading transactions';
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterType, page]);

  useEffect(() => {
    fetchTransactions(page, filterType);
  }, [fetchTransactions, page, filterType]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTransactions(page, filterType);
  };

  const handleTypeChange = (type: string) => {
    setFilterType(type);
    setPage(1);
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const headers = ['ID', 'Reference', 'Type', 'Amount', 'Balance After', 'Description', 'Date', 'Status'];
    const rows = transactions.map((t) => [
      t.id,
      t.reference,
      t.type,
      Number(t.amount || 0),
      Number(t.balanceAfter || 0),
      `"${(t.description || '').replace(/"/g, '""')}"`,
      new Date(t.createdAt).toISOString(),
      t.status || 'COMPLETED',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `wallet-transactions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported transactions to CSV');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" asChild className="p-0 h-auto text-muted-foreground hover:text-foreground">
              <Link href="/wallet" className="flex items-center gap-1 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Wallet
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit ledger of all financial deposits, disbursements, and refunds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex-1 sm:flex-initial"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="flex-1 sm:flex-initial"
          >
            <Download className="mr-1.5 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle>All Transactions ({totalRecords})</CardTitle>
            <CardDescription>Filtered by transaction category.</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1 rounded-lg border w-full sm:w-auto">
            {['ALL', 'DEPOSIT', 'DEDUCTION', 'REFUND'].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs px-3 py-1 h-7 flex-1 sm:flex-initial ${
                  filterType === type ? 'bg-primary text-primary-foreground font-bold shadow-none' : ''
                }`}
                onClick={() => handleTypeChange(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-full bg-muted/40 animate-pulse rounded" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-sm font-medium text-foreground">No transactions matching your filter</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try selecting a different filter or depositing funds.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto min-w-[700px]">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance After</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => {
                    const isDeposit = tx.type === 'DEPOSIT';
                    const isRefund = tx.type === 'REFUND';
                    const amountVal = Number(tx.amount || 0);
                    const balAfterVal = Number(tx.balanceAfter || 0);

                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-xs font-medium">
                          {tx.reference}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center text-xs font-semibold ${
                              isDeposit
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isRefund
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {isDeposit ? (
                              <ArrowDownRight className="mr-1 h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
                            )}
                            {tx.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {tx.description || 'System transaction'}
                        </TableCell>
                        <TableCell
                          className={`font-semibold text-sm ${
                            isDeposit
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isRefund
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {isDeposit ? '+' : '-'}UGX {amountVal.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          UGX {balAfterVal.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tx.status === 'COMPLETED'
                                ? 'default'
                                : tx.status === 'FAILED'
                                ? 'destructive'
                                : 'outline'
                            }
                          >
                            {tx.status || 'COMPLETED'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t p-4 sm:p-0 sm:pt-4 mt-4">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages} ({totalRecords} total transactions)
              </p>
              <div className="flex items-center justify-between w-full sm:w-auto gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="flex-1 sm:flex-initial"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className="flex-1 sm:flex-initial"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
