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

  // Deposit Modal State
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>('50000');
  const [depositDescription, setDepositDescription] = useState<string>('Wallet Top-up');
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

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
  }, [fetchWalletData]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }

    try {
      setSubmittingDeposit(true);
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNum,
          description: depositDescription || 'Manual deposit',
          idempotencyKey: `dep-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Deposit failed');
      }

      toast.success(`Successfully deposited ${currency} ${amountNum.toLocaleString()}`);
      setIsDepositOpen(false);
      setDepositAmount('50000');
      fetchWalletData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process deposit';
      toast.error(msg);
    } finally {
      setSubmittingDeposit(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Wallet & Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your prepaid balance, SMS credits, and review transaction history.
          </p>
        </div>

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
            <DialogContent className="sm:max-w-[460px]">
              <DialogHeader>
                <DialogTitle>Top-up Wallet</DialogTitle>
                <DialogDescription>
                  Add funds instantly to your SMS sending balance.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleDepositSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="quick-amount">Quick Select ({currency})</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_AMOUNTS.map((amt) => (
                      <Button
                        key={amt}
                        type="button"
                        variant={depositAmount === amt.toString() ? 'default' : 'outline'}
                        size="sm"
                        className={
                          depositAmount === amt.toString()
                            ? 'bg-primary text-primary-foreground font-bold'
                            : ''
                        }
                        onClick={() => setDepositAmount(amt.toString())}
                      >
                        {amt.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Custom Amount ({currency})</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1000"
                    step="1000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Payment Reference / Note</Label>
                  <Input
                    id="description"
                    value={depositDescription}
                    onChange={(e) => setDepositDescription(e.target.value)}
                    placeholder="e.g. MTN Mobile Money deposit"
                  />
                </div>

                <div className="rounded-md bg-secondary/10 p-3 text-xs text-secondary-foreground space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-secondary" /> Instant Credit
                  </div>
                  <p className="text-muted-foreground">
                    Funds are immediately credited to your wallet balance for SMS campaigns.
                  </p>
                </div>

                <DialogFooter className="pt-2">
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
      </div>

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
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
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
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <CardDescription>Your latest wallet deposits, campaign deductions, and refunds.</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/wallet/transactions">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-full bg-muted/40 animate-pulse rounded" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-lg">
              <WalletIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-foreground">No transactions recorded yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Top up your wallet to send your first bulk SMS campaign.
              </p>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                onClick={() => setIsDepositOpen(true)}
              >
                Deposit Funds Now
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
