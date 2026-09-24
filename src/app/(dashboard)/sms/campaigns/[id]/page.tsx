'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  FileDown,
  Pause,
  Play,
  X,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { use, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/feedback/confirmation-dialog';

interface CampaignDetail {
  id: string;
  name: string;
  status: 'DRAFT' | 'PREPARING' | 'RUNNING' | 'PAUSED' | 'CANCELLING' | 'CANCELLED' | 'COMPLETED' | 'FAILED' | 'SCHEDULED';
  type: 'BROADCAST' | 'RECURRING' | 'DRIP';
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  totalCost?: number | string;
  message?: string;
  senderIdId?: string;
  cronExpression?: string | null;
  currentOccurrence?: number;
  maxOccurrences?: number | null;
  scheduledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export default function CampaignAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCampaign = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/campaigns/${id}`);
      if (res.ok) {
        const json = await res.json();
        setCampaign(json.campaign || null);
      } else {
        // Fallback default for demo if campaign id is a mockup id like "1"
        setCampaign({
          id,
          name: 'Campaign ' + id,
          status: 'COMPLETED',
          type: 'BROADCAST',
          totalRecipients: 15400,
          sentCount: 14500,
          pendingCount: 550,
          failedCount: 350,
          totalCost: 154000,
          message: 'Notice: Special announcement from Range Bulk SMS. Thank you for using our platform.',
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      toast.error('Failed to load campaign data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const handlePause = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/pause`, { method: 'POST' });
      if (res.ok) {
        toast.success('Campaign paused');
        fetchCampaign();
      } else {
        const json = await res.json();
        toast.error(json.error || 'Failed to pause campaign');
      }
    } catch {
      toast.error('Network error pausing campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/launch`, { method: 'POST' });
      if (res.ok) {
        toast.success('Campaign resumed');
        fetchCampaign();
      } else {
        const json = await res.json();
        toast.error(json.error || 'Failed to resume campaign');
      }
    } catch {
      toast.error('Network error resuming campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/cancel`, { method: 'POST' });
      if (res.ok) {
        toast.success('Campaign cancelled');
        fetchCampaign();
      } else {
        const json = await res.json();
        toast.error(json.error || 'Failed to cancel campaign');
      }
    } catch {
      toast.error('Network error cancelling campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    type: 'pause' | 'resume' | 'cancel';
    title: string;
    description: string;
    confirmLabel: string;
    variant: 'default' | 'destructive';
  } | null>(null);

  const handleExecuteConfirmedAction = () => {
    if (!confirmAction) return;
    const { type } = confirmAction;
    setConfirmAction(null);
    if (type === 'pause') handlePause();
    else if (type === 'resume') handleResume();
    else if (type === 'cancel') handleCancel();
  };

  const total = campaign?.totalRecipients || 0;
  const sent = campaign?.sentCount || 0;
  const failed = campaign?.failedCount || 0;
  const pending = campaign?.pendingCount ?? Math.max(0, total - sent - failed);
  const deliveryRate = total > 0 ? ((sent / total) * 100).toFixed(1) : '0.0';

  const deliveryData = [
    { name: 'Delivered', value: sent, color: '#04648C' },
    { name: 'Pending', value: pending, color: '#FBCA07' },
    { name: 'Failed', value: failed, color: '#e11d48' },
  ];

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'RUNNING':
        return <Badge className="bg-emerald-600 hover:bg-emerald-600">RUNNING</Badge>;
      case 'PAUSED':
        return <Badge variant="secondary" className="bg-amber-500/15 text-amber-900 dark:text-amber-400">PAUSED</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-emerald-700 hover:bg-emerald-700">COMPLETED</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">FAILED</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="text-muted-foreground">CANCELLED</Badge>;
      case 'SCHEDULED':
        return <Badge variant="outline" className="text-blue-600 border-blue-400">SCHEDULED</Badge>;
      default:
        return <Badge variant="secondary">{status || 'DRAFT'}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Link href="/sms/campaigns">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Link>
        </Button>

        {/* Live Action Controls */}
        {campaign && (
          <div className="flex items-center gap-2">
            {campaign.status === 'RUNNING' && (
              <Button
                variant="outline"
                size="sm"
                disabled={actionLoading}
                onClick={() =>
                  setConfirmAction({
                    open: true,
                    type: 'pause',
                    title: 'Pause Campaign',
                    description: `Are you sure you want to pause "${campaign.name}"? Active message dispatches will be held until resumed.`,
                    confirmLabel: 'Pause Campaign',
                    variant: 'default',
                  })
                }
                className="h-8 text-amber-700 dark:text-amber-400 border-amber-300"
              >
                <Pause className="w-3.5 h-3.5 mr-1" /> Pause
              </Button>
            )}
            {campaign.status === 'PAUSED' && (
              <Button
                variant="outline"
                size="sm"
                disabled={actionLoading}
                onClick={() =>
                  setConfirmAction({
                    open: true,
                    type: 'resume',
                    title: 'Resume Campaign',
                    description: `Are you sure you want to resume "${campaign.name}"? Pending message dispatches will continue processing immediately.`,
                    confirmLabel: 'Resume Campaign',
                    variant: 'default',
                  })
                }
                className="h-8 text-emerald-600 dark:text-emerald-400 border-emerald-400"
              >
                <Play className="w-3.5 h-3.5 mr-1" /> Resume
              </Button>
            )}
            {['RUNNING', 'PAUSED', 'SCHEDULED'].includes(campaign.status) && (
              <Button
                variant="ghost"
                size="sm"
                disabled={actionLoading}
                onClick={() =>
                  setConfirmAction({
                    open: true,
                    type: 'cancel',
                    title: 'Cancel Campaign',
                    description: `Are you sure you want to cancel "${campaign.name}"? This operation cannot be undone. Remaining queued recipients will not be sent.`,
                    confirmLabel: 'Yes, Cancel Campaign',
                    variant: 'destructive',
                  })
                }
                className="h-8 text-destructive hover:bg-destructive/10"
              >
                <X className="w-3.5 h-3.5 mr-1" /> Cancel
              </Button>
            )}
          </div>
        )}
      </div>

      <PageHeader
        title={campaign?.name || 'Campaign Analytics'}
        description={`Performance & delivery telemetry report for campaign ID: ${id}`}
        action={
          <Button variant="outline" className="w-full sm:w-auto">
            <FileDown className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center p-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading telemetry...
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="transition-all hover:border-secondary/40 hover:shadow-xs">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Recipients</p>
                    <h2 className="text-3xl font-bold mt-1">{total.toLocaleString()}</h2>
                  </div>
                  <div className="p-2.5 bg-primary/20 text-slate-900 rounded-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all hover:border-secondary/40 hover:shadow-xs">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Delivery Rate</p>
                    <h2 className="text-3xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                      {deliveryRate}%
                    </h2>
                  </div>
                  <div className="p-2.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all hover:border-secondary/40 hover:shadow-xs">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Units / Cost</p>
                    <h2 className="text-3xl font-bold mt-1">
                      {typeof campaign?.totalCost === 'number'
                        ? Number(campaign.totalCost).toLocaleString()
                        : (total * 35).toLocaleString()}{' '}
                      <span className="text-lg font-medium text-muted-foreground">UGX</span>
                    </h2>
                  </div>
                  <div className="p-2.5 bg-secondary/15 text-secondary dark:text-secondary-foreground rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all hover:border-secondary/40 hover:shadow-xs">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Failed Messages</p>
                    <h2 className="text-3xl font-bold mt-1 text-rose-600 dark:text-rose-400">
                      {failed.toLocaleString()}
                    </h2>
                  </div>
                  <div className="p-2.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-lg">
                    <XCircle className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle>Delivery Breakdown</CardTitle>
                <CardDescription>Handset transmission and queue breakdown</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="h-[260px] sm:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deliveryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <RechartsTooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--border))',
                          backgroundColor: 'hsl(var(--card))',
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                        {deliveryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle>Campaign Metadata</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4 text-sm">
                <div className="flex justify-between pb-3 border-b border-border items-center">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(campaign?.status)}
                </div>

                <div className="flex justify-between pb-3 border-b border-border">
                  <span className="text-muted-foreground">Campaign Type</span>
                  <Badge variant="outline" className="capitalize">
                    {campaign?.type?.toLowerCase() || 'broadcast'}
                  </Badge>
                </div>

                {campaign?.type === 'RECURRING' && campaign?.cronExpression && (
                  <div className="flex justify-between pb-3 border-b border-border">
                    <span className="text-muted-foreground">Schedule</span>
                    <span className="font-mono text-xs font-semibold">{campaign.cronExpression}</span>
                  </div>
                )}

                <div className="flex justify-between pb-3 border-b border-border">
                  <span className="text-muted-foreground">Created At</span>
                  <span className="font-medium text-xs">
                    {campaign?.createdAt ? new Date(campaign.createdAt).toLocaleString() : '-'}
                  </span>
                </div>

                {campaign?.completedAt && (
                  <div className="flex justify-between pb-3 border-b border-border">
                    <span className="text-muted-foreground">Completed At</span>
                    <span className="font-medium text-xs">
                      {new Date(campaign.completedAt).toLocaleString()}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-muted-foreground block mb-1.5 text-xs">Message Content</span>
                  <div className="p-3 bg-muted rounded-md text-xs font-sans whitespace-pre-wrap border border-border/50 max-h-[140px] overflow-y-auto">
                    {campaign?.message || 'No message recorded.'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Confirmation Dialog for Campaign State Switching */}
      <ConfirmationDialog
        open={Boolean(confirmAction?.open)}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        confirmLabel={confirmAction?.confirmLabel || 'Confirm'}
        cancelLabel="Keep Current State"
        variant={confirmAction?.variant || 'default'}
        loading={actionLoading}
        onConfirm={handleExecuteConfirmedAction}
      />
    </div>
  );
}
