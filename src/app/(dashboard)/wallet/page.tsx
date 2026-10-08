'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Eye, EyeOff } from 'lucide-react';
import { formatDateTimeTz } from '@/lib/timezone';

const depositFormSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 1000, {
      message: 'Minimum deposit amount is 1,000 UGX',
    })
    .refine((val) => Number.isInteger(Number(val)), {
      message: 'Enter a whole amount in UGX',
    })
    .refine((val) => parseFloat(val) <= 100000000, {
      message: 'Deposit amount cannot exceed 100,000,000 UGX',
    }),
  phone: z.string().trim().min(9, 'Enter your MTN Uganda number').max(20),
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMasked, setIsMasked] = useState(true);

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
    initialValues: { amount: '50000', phone: '' },
    schema: depositFormSchema,
  });

  const fetchWalletData = useCallback(async () => {
    try {
      const [walletRes, txnRes] = await Promise.all([
        fetch('/api/v1/wallet'),
        fetch('/api/v1/wallet/transactions?limit=5'),
      ]);

      if (walletRes.ok) {
        const walletData = await walletRes.json();
        const numBal = Number(walletData.data?.balance || 0);
        setBalance(numBal);
        setCurrency(walletData.data?.currency || 'UGX');
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
      const idempotencyKey = `web-wallet-${crypto.randomUUID()}`;
      const res = await fetch('/api/v1/wallet/momo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify({
          amount: amountNum,
          phone: data.phone,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        if (resData?.details) {
          setDepositServerErrors(resData.details);
        }
        throw new Error(resData.error || 'Deposit failed');
      }

      const paymentId = resData.data?.paymentId as string | undefined;
      if (!paymentId) throw new Error('MTN did not return a payment reference. Please check your wallet before retrying.');
      toast.success('Payment request sent. Approve it on your MTN phone to complete the top-up.');
      setIsDepositOpen(false);
      resetDepositForm();
      void (async () => {
        for (let attempt = 0; attempt < 12; attempt += 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 5_000));
          try {
            const statusResponse = await fetch(`/api/v1/wallet/momo/${encodeURIComponent(paymentId)}`, { cache: 'no-store' });
            if (!statusResponse.ok) continue;
            const statusData = await statusResponse.json();
            if (statusData.data?.status === 'SUCCESSFUL') {
              toast.success('Payment confirmed. Your wallet has been credited.');
              fetchWalletData();
              notifyWalletUpdated();
              return;
            }
            if (statusData.data?.status === 'FAILED') {
              toast.error('MTN did not complete the payment. No funds were added.');
              return;
            }
          } catch {
            // Retry status checks while the provider is processing the payment.
          }
        }
        toast.info('Payment is still processing. Refresh your wallet shortly to check for confirmation.');
      })();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process deposit';
      toast.error(msg);
    } finally {
      setSubmittingDeposit(false);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      {/* Page Header */}
      <PageHeader
        title="Wallet & Billing"
        description="Manage your prepaid balance, SMS credits, and review transaction history."
        action={
          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              variant="outline"
              size="md"
              onClick={handleManualRefresh}
              disabled={refreshing || loading}
              aria-label="Refresh wallet data"
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
              <DialogTrigger asChild>
                <Button
                  size="md"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full font-bold sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" /> Deposit Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[calc(100%-2rem)] max-w-md overflow-hidden p-0">
                <DialogHeader>
                  <DialogTitle>Top-up Wallet</DialogTitle>
                  <DialogDescription>
                    Add funds instantly to your SMS sending balance.
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={handleDepositSubmit}
                  noValidate
                  className="flex flex-1 flex-col overflow-hidden"
                >
                  <DialogBody>
                    <div className="space-y-1">
                      <Label htmlFor="quick-amount">Quick Select ({currency})</Label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {PRESET_AMOUNTS.map((amt) => (
                          <Button
                            key={amt}
                            type="button"
                            variant={
                              depositValues.amount === amt.toString() ? 'default' : 'outline'
                            }
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
                      <Label htmlFor="amount" required>
                        Custom Amount ({currency})
                      </Label>
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
                      <Label htmlFor="phone" required>MTN Mobile Money Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        value={depositValues.phone}
                        onChange={(e) => setDepositFieldValue('phone', e.target.value)}
                        onBlur={() => handleDepositBlur('phone')}
                        error={depositTouched.phone && !!depositErrors.phone}
                        aria-describedby={depositErrors.phone ? 'phone-error' : undefined}
                        placeholder="e.g. 0772 123 456"
                        required
                      />
                      {depositTouched.phone && depositErrors.phone && (
                        <InputError id="phone-error" message={depositErrors.phone} />
                      )}
                    </div>

                    <div className="bg-secondary/10 text-secondary-foreground space-y-1 rounded-md p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 className="text-secondary h-3.5 w-3.5" /> Secure MTN payment
                      </div>
                      <p className="text-muted-foreground">
                        Approve the prompt on your phone. Your wallet is credited after MTN confirms payment.
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
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
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
        <Card className="border-secondary/20 relative overflow-hidden shadow-none">
          <div className="bg-primary absolute top-0 right-0 left-0 h-1" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Available Balance
            </CardTitle>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isMasked) {
                    setIsMasked(false);
                  } else {
                    setIsMasked(true);
                  }
                }}
                className="hover:bg-muted text-muted-foreground rounded-full p-1 transition-colors"
                title={isMasked ? 'Unmask balance' : 'Mask balance'}
              >
                {isMasked ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <div className="bg-secondary text-secondary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-none">
                <WalletIcon className="h-3.5 w-3.5 text-inherit" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-foreground text-3xl font-bold tracking-tight">
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : isMasked ? (
                'â€¢â€¢â€¢â€¢â€¢â€¢'
              ) : (
                `${currency} ${balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Ready for SMS dispatch</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Pricing Tier
            </CardTitle>
            <div className="bg-secondary text-secondary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-none">
              <History className="h-3.5 w-3.5 text-inherit" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-foreground text-3xl font-bold tracking-tight">Standard</div>
            <div className="mt-1">
              <Link
                href="/wallet/pricing"
                className="text-brand-blue dark:text-brand-yellow text-xs font-semibold hover:underline"
              >
                View coverage pricing &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Card */}
      <Card className="border-secondary/20 shadow-none">
        <CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <CardDescription>
              Your latest wallet deposits, campaign deductions, and refunds.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/wallet/transactions">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div
              className="space-y-3 p-4 py-4 sm:p-0"
              role="status"
              aria-label="Loading transactions"
            >
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
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                  onClick={() => setIsDepositOpen(true)}
                >
                  <Plus className="mr-1.5 h-4 w-4" /> Deposit Funds Now
                </Button>
              }
            />
          ) : (
            <>
              {/* Mobile View: High-density transaction cards */}
              <div className="divide-border block divide-y md:hidden">
                {transactions.map((tx) => {
                  const isDeposit = tx.type === 'DEPOSIT';
                  const isRefund = tx.type === 'REFUND';
                  const amountVal = Number(tx.amount || 0);
                  const balAfterVal = Number(tx.balanceAfter || 0);

                  return (
                    <div key={tx.id} className="hover:bg-muted/20 space-y-2 p-4 transition-colors">
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
                        <span className="text-muted-foreground text-xs">
                          Bal: {currency} {balAfterVal.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-muted-foreground border-border/40 flex items-center justify-between border-t pt-1 text-[11px]">
                        <span className="max-w-[180px] truncate font-mono">{tx.reference}</span>
                        <span>
                          {formatDateTimeTz(tx.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View: Full data table */}
              <div className="hidden w-full overflow-x-auto md:block">
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
                          <TableCell className="text-muted-foreground font-mono text-xs">
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
                          <TableCell className="text-muted-foreground text-xs">
                            {formatDateTimeTz(tx.createdAt)}
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


