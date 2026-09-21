'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, RefreshCw, DollarSign, Wallet, CheckCircle, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { TableSkeletonRows } from '@/components/blocks/ui/skeleton-layouts';
import { useFormValidation } from '@/hooks/use-form-validation';
import { agentPayoutSchema } from '@/lib/validations/admin';
import { InputError } from '@/components/ui/input-error';

interface PaidRecord {
  id: string;
  amount: number | string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  transactionRef: string | null;
  client: {
    user: {
      name: string | null;
    };
  };
}

export default function EarningsPage() {
  const [availableForPayout, setAvailableForPayout] = useState(0);
  const [totalLifetimePaid, setTotalLifetimePaid] = useState(0);
  const [payouts, setPayouts] = useState<PaidRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    values: payoutForm,
    errors: payoutErrors,
    touched: payoutTouched,
    setFieldValue: setPayoutField,
    handleBlur: handlePayoutBlur,
    validateAll: validatePayoutAll,
    reset: resetPayoutForm,
    setServerErrors: setPayoutServerErrors,
  } = useFormValidation({
    initialValues: {
      amount: '' as unknown as number,
      method: 'Mobile Money - MTN',
      details: '',
    },
    schema: agentPayoutSchema,
  });

  const fetchEarningsData = useCallback(async () => {
    try {
      const [overviewRes, paidRes] = await Promise.all([
        fetch('/api/agent/overview'),
        fetch('/api/agent/commissions?status=PAID'),
      ]);

      if (overviewRes.ok) {
        const oData = await overviewRes.json();
        setAvailableForPayout(oData.overview?.availableForPayout || 0);
        setTotalLifetimePaid(oData.overview?.totalEarnings || 0);
      }

      if (paidRes.ok) {
        const pData = await paidRes.json();
        setPayouts(pData.commissions || []);
      }
    } catch {
      toast.error('Unable to fetch earnings data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEarningsData();
  }, [fetchEarningsData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEarningsData();
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid } = validatePayoutAll();
    if (!isValid) return;

    const amountNum = Number(payoutForm.amount);
    if (amountNum > availableForPayout && availableForPayout > 0) {
      toast.error(`Amount cannot exceed available balance of UGX ${availableForPayout.toLocaleString()}`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/agent/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNum,
          method: payoutForm.method,
          details: payoutForm.details.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          setPayoutServerErrors(data.details);
        }
        throw new Error(data.error || 'Failed to submit payout request');
      }

      toast.success('Payout request processed successfully');
      setIsPayoutOpen(false);
      resetPayoutForm();
      fetchEarningsData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting payout';
      toast.error(msg);
    } finally {
      setSubmitting(false);
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Earnings & Payouts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your reseller withdrawals via MTN Mobile Money, Airtel Money, or Bank Wire.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh earnings"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Dialog open={isPayoutOpen} onOpenChange={setIsPayoutOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                disabled={availableForPayout <= 0}
              >
                <ArrowUpRight className="mr-1.5 h-4 w-4" /> Request Payout
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-md p-0 overflow-hidden">
              <DialogHeader>
                <DialogTitle>Request Commission Payout</DialogTitle>
                <DialogDescription>
                  Disbursement will be transferred directly to your configured payout destination.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleRequestPayout} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <DialogBody>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="amount" required>Payout Amount (UGX)</Label>
                      <span className="text-xs text-muted-foreground">
                        Max: UGX {availableForPayout.toLocaleString()}
                      </span>
                    </div>
                    <Input
                      id="amount"
                      type="number"
                      min="10000"
                      step="5000"
                      value={payoutForm.amount || ''}
                      onChange={(e) => setPayoutField('amount', e.target.value)}
                      onBlur={() => handlePayoutBlur('amount')}
                      error={payoutTouched.amount && Boolean(payoutErrors.amount)}
                      placeholder={`e.g. ${availableForPayout}`}
                      required
                    />
                    <InputError message={payoutTouched.amount ? payoutErrors.amount : undefined} />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="method" required>Payout Method</Label>
                    <Select
                      value={payoutForm.method}
                      onValueChange={(val) => setPayoutField('method', val)}
                    >
                      <SelectTrigger id="method">
                        <SelectValue placeholder="Select Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mobile Money - MTN">MTN Mobile Money</SelectItem>
                        <SelectItem value="Mobile Money - Airtel">Airtel Money</SelectItem>
                        <SelectItem value="Bank Wire">Standard Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <InputError message={payoutTouched.method ? payoutErrors.method : undefined} />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="details" required>Account / Mobile Number</Label>
                    <Input
                      id="details"
                      value={payoutForm.details}
                      onChange={(e) => setPayoutField('details', e.target.value)}
                      onBlur={() => handlePayoutBlur('details')}
                      error={payoutTouched.details && Boolean(payoutErrors.details)}
                      placeholder="e.g. 256770123456 or Bank Account details"
                      required
                    />
                    <InputError message={payoutTouched.details ? payoutErrors.details : undefined} />
                  </div>
                </DialogBody>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPayoutOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Confirm Withdrawal'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card className="border-secondary/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available for Payout</CardTitle>
            <div className="p-2 rounded-lg bg-primary/20 text-primary-foreground">
              <DollarSign className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-secondary dark:text-primary">
              {loading ? (
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              ) : (
                `UGX ${availableForPayout.toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Minimum withdrawal threshold is UGX 10,000
            </p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Lifetime Paid</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {loading ? (
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              ) : (
                `UGX ${totalLifetimePaid.toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total cumulative payouts disbursed to your account
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payout History Card */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader>
          <CardTitle>Disbursed Payouts History</CardTitle>
          <CardDescription>
            Historical records of completed commission withdrawals.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Payout Ref</TableHead>
                  <TableHead>Client Ref</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Disbursed Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeletonRows columns={5} rows={5} />
                ) : payouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium text-foreground">No completed payouts yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        When you request a commission payout, disbursement details will be tracked here.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  payouts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs font-semibold">
                        {p.transactionRef || `PAY-${p.id.slice(0, 6).toUpperCase()}`}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {p.client?.user?.name || 'Bulk Campaign Commission'}
                      </TableCell>
                      <TableCell className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        UGX {Number(p.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                          COMPLETED
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(p.paidAt || p.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
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
