'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Wallet as WalletIcon,
  MessageSquare,
  History,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useFormValidation } from '@/hooks/use-form-validation';
import { InputError } from '@/components/ui/input-error';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { notifyWalletUpdated } from '@/hooks/use-wallet';

const depositFormSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 1000, {
      message: 'Minimum deposit amount is 1,000 UGX',
    })
    .refine((val) => parseFloat(val) <= 100000000, {
      message: 'Deposit amount cannot exceed 100,000,000 UGX',
    }),
  description: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
});

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

const PRESET_AMOUNTS = [25000, 50000, 100000, 250000, 500000];

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('UGX');
  const [smsCredits, setSmsCredits] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Deposit Modal State with Real-Time Validation
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  const {
    values: depositValues,
    errors: depositErrors,
    touched: depositTouched,
    setFieldValue: setDepositFieldValue,
    handleBlur: handleDepositBlur,
    validateAll: validateDepositAll,
    setServerErrors: setDepositServerErrors,
    reset: resetDepositForm,
  } = useFormValidation({
    initialValues: { amount: '50000', description: 'Wallet Top-up' },
    schema: depositFormSchema,
  });

  const fetchWalletData = useCallback(async () => {
    try {
      const [walletRes, txnRes] = await Promise.all([
        fetch('/api/wallet'),
        fetch('/api/wallet/transactions?limit=5'),
      ]);

      if (walletRes.ok) {
        const walletData = await walletRes.json();
        const numBal = Number(walletData.data?.balance || 0);
        setBalance(numBal);
        setCurrency(walletData.data?.currency || 'UGX');
        setSmsCredits(Math.floor(numBal / 45));
      }

      if (txnRes.ok) {
        const txnData = await txnRes.json();
        setTransactions(txnData.data?.transactions || []);
      }
    } catch {
      toast.error('Failed to load wallet information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();

    const handleCustomEvent = () => {
      fetchWalletData();
    };
    window.addEventListener('range:wallet-updated', handleCustomEvent);
    return () => {
      window.removeEventListener('range:wallet-updated', handleCustomEvent);
    };
  }, [fetchWalletData]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, data } = validateDepositAll();
    if (!isValid || !data) return;
    const amountNum = parseFloat(data.amount);

    try {
      setSubmittingDeposit(true);
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNum,
          description: data.description || 'Manual deposit',
          idempotencyKey: `dep-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        if (resData?.details) {
          setDepositServerErrors(resData.details);
        }
        throw new Error(resData.error || 'Deposit failed');
      }

      toast.success(`Successfully deposited ${currency} ${amountNum.toLocaleString()}`);
      setIsDepositOpen(false);
      resetDepositForm();
      fetchWalletData();
      notifyWalletUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process deposit';
      toast.error(msg);
    } finally {
      setSubmittingDeposit(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Wallet & Billing"
        description="Manage your prepaid balance, SMS credits, and review transaction history."
        action={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={refreshing || loading}
              aria-label="Refresh wallet data"
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground font-bold hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> Deposit Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[calc(100%-2rem)] max-w-md p-0 overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Top-up Wallet</DialogTitle>
                  <DialogDescription>
                    Add funds instantly to your SMS sending balance.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleDepositSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
                  <DialogBody>
                    <div className="space-y-1">
                      <Label htmlFor="quick-amount">Quick Select ({currency})</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PRESET_AMOUNTS.map((amt) => (
                          <Button
                            key={amt}
                            type="button"
                            variant={depositValues.amount === amt.toString() ? 'default' : 'outline'}
                            size="sm"
                            className={
                              depositValues.amount === amt.toString()
                                ? 'bg-primary text-primary-foreground font-bold'
                                : ''
                            }
                            onClick={() => setDepositFieldValue('amount', amt.toString())}
                          >
                            {amt.toLocaleString()}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="amount" required>Custom Amount ({currency})</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="1000"
                        step="1000"
                        value={depositValues.amount}
                        onChange={(e) => setDepositFieldValue('amount', e.target.value)}
                        onBlur={() => handleDepositBlur('amount')}
                        error={depositTouched.amount && !!depositErrors.amount}
                        aria-describedby={depositErrors.amount ? 'amount-error' : undefined}
                        placeholder="Enter amount"
                        required
                      />
                      {depositTouched.amount && depositErrors.amount && (
                        <InputError id="amount-error" message={depositErrors.amount} />
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="description">Payment Reference / Note</Label>
                      <Input
                        id="description"
                        value={depositValues.description}
                        onChange={(e) => setDepositFieldValue('description', e.target.value)}
                        onBlur={() => handleDepositBlur('description')}
                        error={depositTouched.description && !!depositErrors.description}
                        aria-describedby={depositErrors.description ? 'description-error' : undefined}
                        placeholder="e.g. MTN Mobile Money deposit"
                      />
                      {depositTouched.description && depositErrors.description && (
                        <InputError id="description-error" message={depositErrors.description} />
                      )}
                    </div>

                    <div className="rounded-md bg-secondary/10 p-3 text-xs text-secondary-foreground space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-secondary" /> Instant Credit
                      </div>
                      <p className="text-muted-foreground">
                        Funds are immediately credited to your wallet balance for SMS campaigns.
                      </p>
                    </div>
                  </DialogBody>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDepositOpen(false)}
                      disabled={submittingDeposit}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                      disabled={submittingDeposit}
                    >
                      {submittingDeposit ? 'Processing...' : 'Confirm Deposit'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-secondary/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Balance</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <WalletIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                `${currency} ${balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ready for SMS dispatch</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Estimated SMS Credits</CardTitle>
            <div className="p-2 rounded-lg bg-primary/20 text-primary-foreground">
              <MessageSquare className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                `~ ${smsCredits.toLocaleString()} SMS`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on UGX 45 / SMS average rate</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pricing Tier</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <History className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-secondary dark:text-primary">
              Standard
            </div>
            <div className="mt-1">
              <Link href="/wallet/pricing" className="text-xs text-secondary hover:underline font-medium dark:text-primary">
                View coverage pricing &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Card */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <CardDescription>Your latest wallet deposits, campaign deductions, and refunds.</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/wallet/transactions">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="space-y-3 p-4 sm:p-0 py-4" role="status" aria-label="Loading transactions">
              <span className="sr-only">Loading transactions...</span>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={<WalletIcon className="h-6 w-6" />}
              title="No transactions recorded yet"
              description="Top up your wallet to start sending bulk SMS campaigns."
              action={
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                  onClick={() => setIsDepositOpen(true)}
                >
                  <Plus className="mr-1.5 h-4 w-4" /> Deposit Funds Now
                </Button>
              }
            />
          ) : (
            <>
              {/* Mobile View: High-density transaction cards */}
              <div className="block md:hidden divide-y divide-border">
                {transactions.map((tx) => {
                  const isDeposit = tx.type === 'DEPOSIT';
                  const isRefund = tx.type === 'REFUND';
                  const amountVal = Number(tx.amount || 0);
                  const balAfterVal = Number(tx.balanceAfter || 0);

                  return (
                    <div key={tx.id} className="p-4 space-y-2 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex items-center text-xs font-semibold ${
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
                        <Badge
                          variant={
                            tx.status === 'COMPLETED'
                              ? 'default'
                              : tx.status === 'FAILED'
                              ? 'destructive'
                              : 'outline'
                          }
                          className="text-[11px]"
                        >
                          {tx.status || 'COMPLETED'}
                        </Badge>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span
                          className={`text-base font-bold ${
                            isDeposit
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isRefund
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {isDeposit ? '+' : '-'}
                          {currency} {amountVal.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Bal: {currency} {balAfterVal.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                        <span className="font-mono truncate max-w-[180px]">{tx.reference}</span>
                        <span>
                          {new Date(tx.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View: Full data table */}
              <div className="hidden md:block w-full overflow-x-auto">
                <Table className="min-w-[650px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Reference</TableHead>
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
                          <TableCell>
                            <span
                              className={`flex items-center text-xs font-semibold ${
                                isDeposit
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : isRefund
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {isDeposit ? (
                                <ArrowDownRight className="mr-1 h-4 w-4" />
                              ) : (
                                <ArrowUpRight className="mr-1 h-4 w-4" />
                              )}
                              {tx.type}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {tx.reference}
                          </TableCell>
                          <TableCell
                            className={`font-semibold ${
                              isDeposit
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isRefund
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {isDeposit ? '+' : '-'}
                            {currency} {amountVal.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {currency} {balAfterVal.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
