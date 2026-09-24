'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmationDialog } from '@/components/feedback/confirmation-dialog';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { cn } from '@/lib/utils';
import { Plus, Copy, Webhook, Send, Trash2, Eye, EyeOff, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

interface WebhookItem {
  id: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  description?: string | null;
  createdAt: string;
  _count?: {
    deliveries: number;
  };
}

const WEBHOOK_EVENTS = [
  { id: 'SMS_SENT', label: 'SMS Sent', desc: 'Fires when a message has been sent to the network provider' },
  { id: 'SMS_DELIVERED', label: 'SMS Delivered', desc: 'Fires when handset delivery receipt is confirmed' },
  { id: 'SMS_FAILED', label: 'SMS Failed', desc: 'Fires when a message fails or is rejected' },
  { id: 'CAMPAIGN_COMPLETED', label: 'Campaign Completed', desc: 'Fires when all recipients in a campaign finish' },
  { id: 'BALANCE_CHANGED', label: 'Balance Changed', desc: 'Fires when credits are deposited or refunded' },
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'SMS_SENT',
    'SMS_DELIVERED',
    'SMS_FAILED',
  ]);
  const [creating, setCreating] = useState(false);

  // Unsaved changes protection
  const isWebhookDirty = addDialogOpen && (url.trim().length > 0 || description.trim().length > 0);
  const { confirmDiscard } = useUnsavedChanges({
    id: 'create-webhook',
    isDirty: isWebhookDirty,
    title: 'Unsaved changes',
    message: 'You have unsaved changes in this webhook endpoint configuration. If you leave now, your entries will be lost.',
    onDiscard: () => {
      setAddDialogOpen(false);
      setUrl('');
      setDescription('');
    },
  });

  // Secrets visibility map (webhookId -> boolean)
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  // Testing Webhook
  const [testingId, setTestingId] = useState<string | null>(null);

  // Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<WebhookItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/developer/webhooks');
      if (res.ok) {
        const json = await res.json();
        setWebhooks(json.data || []);
      } else {
        toast.error('Failed to load webhooks');
      }
    } catch {
      toast.error('Network error loading webhooks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter a target URL');
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error('Please select at least one subscribed event');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/developer/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          description: description.trim() || undefined,
          events: selectedEvents,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to create webhook');
        return;
      }

      toast.success('Webhook endpoint registered successfully!');
      setAddDialogOpen(false);
      setUrl('');
      setDescription('');
      fetchWebhooks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error registering webhook');
    } finally {
      setCreating(false);
    }
  };

  const handleTestPing = async (webhook: WebhookItem) => {
    setTestingId(webhook.id);
    try {
      const res = await fetch(`/api/developer/webhooks/${webhook.id}/test`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        const statusCode = data.delivery?.statusCode || 200;
        if (statusCode >= 200 && statusCode < 300) {
          toast.success(`Ping dispatched successfully! Endpoint replied with HTTP ${statusCode}`);
        } else {
          toast.warning(`Ping dispatched! Endpoint replied with HTTP ${statusCode}`);
        }
        fetchWebhooks();
      } else {
        toast.error(data.error || 'Failed to send test ping');
      }
    } catch {
      toast.error('Network error triggering test ping');
    } finally {
      setTestingId(null);
    }
  };

  const [webhookStatusConfirm, setWebhookStatusConfirm] = useState<{
    open: boolean;
    id: string;
    url: string;
    currentActive: boolean;
  } | null>(null);

  const handleRequestToggleWebhook = (webhook: WebhookItem) => {
    setWebhookStatusConfirm({
      open: true,
      id: webhook.id,
      url: webhook.url,
      currentActive: webhook.isActive,
    });
  };

  const handleConfirmToggleWebhook = async () => {
    if (!webhookStatusConfirm) return;
    const { id, url: _url, currentActive } = webhookStatusConfirm;
    setWebhookStatusConfirm(null);

    try {
      const res = await fetch(`/api/developer/webhooks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        toast.success(`Webhook ${!currentActive ? 'activated' : 'paused'} successfully`);
        fetchWebhooks();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update webhook status');
      }
    } catch {
      toast.error('Network error updating webhook status');
    }
  };

  const handleDeleteWebhook = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/developer/webhooks/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Webhook endpoint removed');
        setDeleteTarget(null);
        fetchWebhooks();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete webhook');
      }
    } catch {
      toast.error('Network error deleting webhook');
    } finally {
      setDeleting(false);
    }
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
    );
  };

  const toggleSecretReveal = (id: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Webhooks"
        description="Receive real-time programmatic HTTP callbacks for message deliveries, failures, and account events."
        action={
          <Button onClick={() => setAddDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Webhook Endpoint
          </Button>
        }
      />

      {/* Security Tip Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20 text-foreground mt-0.5">
              <Webhook className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">Cryptographic Signature Verification</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Each incoming POST request is signed using HMAC-SHA256 in header{' '}
                <code className="bg-background px-1.5 py-0.5 rounded text-xs font-mono border">
                  x-webhook-signature
                </code>
                . Verify the signature against your endpoint secret to ensure payload authenticity.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Webhooks</CardTitle>
          <CardDescription>
            Active endpoints will receive JSON payloads with exponential backoff retries on failure.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading webhooks...
            </div>
          ) : webhooks.length === 0 ? (
            <div className="text-center p-12 space-y-3">
              <Webhook className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <h3 className="font-semibold text-base">No Webhook Endpoints</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Add an HTTPS endpoint to automatically receive delivery notifications when your SMS messages reach recipient handsets.
              </p>
              <Button onClick={() => setAddDialogOpen(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1.5" /> Add Webhook
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[750px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Target URL</TableHead>
                    <TableHead>Subscribed Events</TableHead>
                    <TableHead>Secret Key</TableHead>
                    <TableHead>Deliveries</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((w) => {
                    const isRevealed = Boolean(revealedSecrets[w.id]);
                    return (
                      <TableRow key={w.id}>
                        <TableCell>
                          <div>
                            <div className="font-mono text-xs font-semibold break-all text-primary">
                              {w.url}
                            </div>
                            {w.description && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {w.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {w.events.map((e) => (
                              <Badge key={e} variant="outline" className="text-[10px] px-1.5 py-0">
                                {e}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                            <span>
                              {isRevealed
                                ? w.secret
                                : `${w.secret.substring(0, 10)}••••••••••••`}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleSecretReveal(w.id)}
                            >
                              {isRevealed ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(w.secret, 'Webhook Secret')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="font-medium">{w._count?.deliveries ?? 0}</span> events
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => handleRequestToggleWebhook(w)}
                            title={w.isActive ? 'Click to pause webhook deliveries' : 'Click to activate webhook deliveries'}
                            aria-label={`Toggle status for webhook ${w.url}. Currently ${w.isActive ? 'Active' : 'Paused'}.`}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer border select-none',
                              w.isActive
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                            )}
                          >
                            <span
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                w.isActive
                                  ? 'bg-emerald-500 animate-pulse'
                                  : 'bg-amber-500'
                              )}
                            />
                            {w.isActive ? 'Active' : 'Paused'}
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRequestToggleWebhook(w)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title={w.isActive ? 'Pause Webhook' : 'Activate Webhook'}
                              aria-label={w.isActive ? `Pause Webhook ${w.url}` : `Activate Webhook ${w.url}`}
                            >
                              {w.isActive ? (
                                <ToggleRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={testingId === w.id}
                              onClick={() => handleTestPing(w)}
                              className="h-8 text-xs"
                            >
                              {testingId === w.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                              ) : (
                                <Send className="h-3.5 w-3.5 mr-1 text-secondary" />
                              )}
                              Test Ping
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(w)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* Add Webhook Modal */}
      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            confirmDiscard(() => {
              setAddDialogOpen(false);
              setUrl('');
              setDescription('');
            });
          } else {
            setAddDialogOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleCreateWebhook}>
            <DialogHeader>
              <DialogTitle>Add Webhook Endpoint</DialogTitle>
              <DialogDescription>
                Configure a destination URL to receive event payloads via HTTP POST.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="webhookUrl">Payload URL</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  placeholder="https://api.yourdomain.com/webhooks/sms"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="webhookDesc">Description (Optional)</Label>
                <Input
                  id="webhookDesc"
                  placeholder="e.g. Production Delivery Receipts"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Subscribed Events</Label>
                <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
                  {WEBHOOK_EVENTS.map((event) => (
                    <div key={event.id} className="flex items-start space-x-2.5">
                      <Checkbox
                        id={`event-${event.id}`}
                        checked={selectedEvents.includes(event.id)}
                        onCheckedChange={() => toggleEvent(event.id)}
                      />
                      <div className="grid gap-0.5 leading-none">
                        <label
                          htmlFor={`event-${event.id}`}
                          className="text-xs font-semibold cursor-pointer"
                        >
                          {event.label}
                        </label>
                        <p className="text-[11px] text-muted-foreground">{event.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  confirmDiscard(() => {
                    setAddDialogOpen(false);
                    setUrl('');
                    setDescription('');
                  });
                }}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Register Webhook
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Webhook Confirmation */}
      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Webhook"
        description={`Are you sure you want to delete the webhook for "${deleteTarget?.url}"? Delivery callbacks will no longer be dispatched to this address.`}
        confirmLabel="Yes, Delete Endpoint"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDeleteWebhook}
      />

      {/* Toggle Webhook Status Confirmation */}
      <ConfirmationDialog
        open={Boolean(webhookStatusConfirm?.open)}
        onOpenChange={(open) => !open && setWebhookStatusConfirm(null)}
        title={webhookStatusConfirm?.currentActive ? 'Pause Webhook Endpoint?' : 'Activate Webhook Endpoint?'}
        description={
          webhookStatusConfirm?.currentActive
            ? `Are you sure you want to pause webhook deliveries to "${webhookStatusConfirm?.url}"? Events will not be dispatched to this URL until re-activated.`
            : `Are you sure you want to activate webhook deliveries to "${webhookStatusConfirm?.url}"? Real-time event notifications will immediately resume.`
        }
        confirmLabel={webhookStatusConfirm?.currentActive ? 'Yes, Pause Webhook' : 'Yes, Activate Webhook'}
        variant={webhookStatusConfirm?.currentActive ? 'destructive' : 'default'}
        onConfirm={handleConfirmToggleWebhook}
      />
    </div>
  );
}
