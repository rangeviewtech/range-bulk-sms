'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Download,
  RefreshCw,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  X,
  ArrowDownUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { buildSanitizedCsv } from '@/lib/security/csv-sanitizer';
import { useTableState } from '@/hooks/use-table-state';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Pagination } from '@/components/ui/pagination';

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

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wallet/transactions?limit=250');
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const json = await res.json();
      const data = json.data;
      setTransactions(data.transactions || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading transactions';
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const {
    search,
    setSearch,
    clearSearch,
    sortKey,
    sortOrder,
    toggleSort,
    filters,
    setFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedData: displayedTransactions,
    filteredData,
  } = useTableState<Transaction>({
    data: transactions,
    searchFields: [
      'reference',
      (t) => t.description || '',
      'type',
      (t) => String(t.amount || ''),
      (t) => String(t.balanceAfter || ''),
      (t) => t.status || 'COMPLETED',
      (t) => t.createdAt,
    ],
    initialSortKey: 'createdAt',
    initialSortOrder: 'desc',
    initialPageSize: 10,
    initialFilters: { type: 'ALL' },
    filterFn: (item, currentFilters) => {
      if (currentFilters.type && currentFilters.type !== 'ALL' && item.type !== currentFilters.type) {
        return false;
      }
      return true;
    },
    customSortFn: (a, b, key, order) => {
      let comp = 0;
      if (key === 'amount') {
        comp = Number(a.amount || 0) - Number(b.amount || 0);
      } else if (key === 'balanceAfter') {
        comp = Number(a.balanceAfter || 0) - Number(b.balanceAfter || 0);
      } else if (key === 'createdAt') {
        comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (key === 'type') {
        comp = a.type.localeCompare(b.type);
      } else if (key === 'status') {
        comp = (a.status || 'COMPLETED').localeCompare(b.status || 'COMPLETED');
      } else if (key === 'description') {
        comp = (a.description || '').localeCompare(b.description || '');
      } else if (key === 'reference') {
        comp = a.reference.localeCompare(b.reference);
      }
      return order === 'asc' ? comp : -comp;
    },
  });

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const headers = ['ID', 'Reference', 'Type', 'Amount', 'Balance After', 'Description', 'Date', 'Status'];
    const rows = filteredData.map((t) => [
      t.id,
      t.reference,
      t.type,
      Number(t.amount || 0),
      Number(t.balanceAfter || 0),
      t.description || '',
      new Date(t.createdAt).toISOString(),
      t.status || 'COMPLETED',
    ]);

    const csvContent = buildSanitizedCsv(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `wallet-transactions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredData.length} transactions to CSV`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
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
            aria-label="Refresh transactions"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={filteredData.length === 0}
            className="flex-1 sm:flex-initial"
            aria-label="Export transactions to CSV"
          >
            <Download className="mr-1.5 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader className="flex flex-col space-y-4 p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">All Transactions ({transactions.length})</CardTitle>
              <CardDescription>Search, filter, and inspect detailed ledger transactions.</CardDescription>
            </div>
            <div className="text-xs text-muted-foreground">
              Filtered: <span className="font-semibold text-foreground">{totalItems}</span> results
            </div>
          </div>

          {/* Controls: Search, Type Filters & Sort Direction */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
            {/* Multi-field search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search reference, description, amount, status..."
                className="pl-9 pr-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search transactions"
              />
              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Type Category Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1 bg-muted/40 p-1 rounded-lg border">
                {(['ALL', 'DEPOSIT', 'DEDUCTION', 'REFUND'] as const).map((t) => (
                  <Button
                    key={t}
                    variant={filters.type === t ? 'default' : 'ghost'}
                    size="sm"
                    className={`text-xs px-2.5 py-1 h-7 ${
                      filters.type === t ? 'bg-primary text-primary-foreground font-bold shadow-none' : ''
                    }`}
                    onClick={() => setFilter('type', t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>

              {/* Sort Order Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => toggleSort(sortKey || 'createdAt')}
                title={`Sorting ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                aria-label="Toggle sort order"
              >
                <ArrowDownUp className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Order:</span> {sortOrder.toUpperCase()}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-full bg-muted/40 animate-pulse rounded" />
              ))}
            </div>
          ) : displayedTransactions.length === 0 ? (
            <div className="text-center py-12 px-4 border-t border-dashed">
              <p className="text-sm font-medium text-foreground">No transactions matching your criteria</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try refining your search query or selecting a different transaction filter.
              </p>
              {(search || filters.type !== 'ALL') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    clearSearch();
                    setFilter('type', 'ALL');
                  }}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <SortableHeader
                        column="reference"
                        label="Reference"
                        currentSort={sortKey}
                        currentOrder={sortOrder}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        column="type"
                        label="Type"
                        currentSort={sortKey}
                        currentOrder={sortOrder}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        column="description"
                        label="Description"
                        currentSort={sortKey}
                        currentOrder={sortOrder}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        column="amount"
                        label="Amount"
                        currentSort={sortKey}
                        currentOrder={sortOrder}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        column="balanceAfter"
                        label="Balance After"
                        currentSort={sortKey}
                        currentOrder={sortOrder}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        column="createdAt"
                        label="Date"
                        currentSort={sortKey}
                        currentOrder={sortOrder}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        column="status"
                        label="Status"
                        currentSort={sortKey}
                        currentOrder={sortOrder}
                        onSort={toggleSort}
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedTransactions.map((tx) => {
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
          {transactions.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 20, 50, 100]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
