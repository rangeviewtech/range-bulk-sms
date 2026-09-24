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
import { Plus, Copy, Check, KeyRound, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  scopes: string[];
  rateLimit: number;
  rateLimitWindow: number;
  ipWhitelist: string[];
  createdAt: string;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
}

const AVAILABLE_SCOPES = [
  { id: 'sms.send', label: 'sms.send', desc: 'Send SMS messages and campaigns' },
  { id: 'sms.status', label: 'sms.status', desc: 'Read delivery statuses and message details' },
  { id: 'balance.read', label: 'balance.read', desc: 'Check wallet balances and credit limits' },
  { id: 'contacts.read', label: 'contacts.read', desc: 'Read contacts and groups' },
  { id: 'contacts.write', label: 'contacts.write', desc: 'Create or update contacts' },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate Key Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['sms.send', 'sms.status', 'balance.read']);
  const [rateLimit, setRateLimit] = useState(100);
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);
  const [creating, setCreating] = useState(false);

  // Unsaved changes protection
  const isKeyDirty = createDialogOpen && keyName.trim().length > 0;
  const { confirmDiscard } = useUnsavedChanges({
    id: 'create-api-key',
    isDirty: isKeyDirty,
    title: 'Unsaved changes',
    message: 'You have entered an unsaved API key name. If you leave now, your input will be discarded.',
    onDiscard: () => {
      setCreateDialogOpen(false);
      setKeyName('');
    },
  });

  // Post-Creation Key Display Dialog
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Revoke Dialog
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyItem | null>(null);
  const [revoking, setRevoking] = useState(false);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/developer/api-keys');
      if (res.ok) {
        const json = await res.json();
        setKeys(json.data || []);
      } else {
        toast.error('Failed to load API keys');
      }
    } catch {
      toast.error('Network error loading API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }
    if (selectedScopes.length === 0) {
      toast.error('Please select at least one scope');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/developer/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: keyName.trim(),
          scopes: selectedScopes,
          rateLimit: Number(rateLimit) || 100,
          expiresInDays: expiresInDays ? Number(expiresInDays) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to create API key');
        return;
      }

      setCreateDialogOpen(false);
      setCreatedKey(data.key);
      setKeyName('');
      toast.success('API key generated successfully!');
      fetchKeys();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error generating key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      const res = await fetch(`/api/developer/api-keys/${revokeTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(`Key "${revokeTarget.name}" has been revoked`);
        setRevokeTarget(null);
        fetchKeys();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to revoke key');
      }
    } catch {
      toast.error('Network error revoking key');
    } finally {
      setRevoking(false);
    }
  };

  const handleCopyKey = () => {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey);
    setCopied(true);
    toast.success('API key copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleScope = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Developer API Keys"
        description="Manage secure authentication tokens to programmatically send SMS and query delivery status."
        action={
          <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Generate New Key
          </Button>
        }
      />

      {/* Info Card */}
      <Card className="border-secondary/20 bg-secondary/5">
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-secondary/15 text-secondary dark:text-secondary-foreground mt-0.5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">Authentication Headers</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Pass your API key as an HTTP Authorization header:{' '}
                <code className="bg-background px-1.5 py-0.5 rounded text-xs font-mono border">
                  Authorization: Bearer rsms_...
                </code>
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <a href="/api/docs" target="_blank" rel="noreferrer">
              View API Documentation &rarr;
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active & Revoked Keys</CardTitle>
          <CardDescription>
            Keys allow direct machine-to-machine integration. Revoke keys immediately if compromised.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading API keys...
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center p-12 space-y-3">
              <KeyRound className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <h3 className="font-semibold text-base">No API keys yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Generate your first API key to start integrating your backend, e-commerce store, or CRM with Range Bulk SMS.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1.5" /> Generate Key
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Prefix</TableHead>
                    <TableHead>Scopes</TableHead>
                    <TableHead>Rate Limit</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium">{k.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        rsms_{k.keyPrefix}_...
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {k.scopes.map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {k.rateLimit} req/min
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(k.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {k.status === 'ACTIVE' ? (
                          <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground">
                            {k.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {k.status === 'ACTIVE' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRevokeTarget(k)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            Revoke
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Revoked</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Key Modal */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            confirmDiscard(() => {
              setCreateDialogOpen(false);
              setKeyName('');
            });
          } else {
            setCreateDialogOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleCreateKey}>
            <DialogHeader>
              <DialogTitle>Generate New API Key</DialogTitle>
              <DialogDescription>
                Create a new programmatic secret to access the Range Bulk SMS API.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g. Production Backend, Shopify Integration"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Permissions & Scopes</Label>
                <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
                  {AVAILABLE_SCOPES.map((scope) => (
                    <div key={scope.id} className="flex items-start space-x-2.5">
                      <Checkbox
                        id={`scope-${scope.id}`}
                        checked={selectedScopes.includes(scope.id)}
                        onCheckedChange={() => toggleScope(scope.id)}
                      />
                      <div className="grid gap-0.5 leading-none">
                        <label
                          htmlFor={`scope-${scope.id}`}
                          className="text-xs font-semibold cursor-pointer"
                        >
                          {scope.label}
                        </label>
                        <p className="text-[11px] text-muted-foreground">{scope.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rateLimit">Rate Limit (req/min)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    min={10}
                    max={1000}
                    value={rateLimit}
                    onChange={(e) => setRateLimit(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="expiresInDays">Expiry (Days)</Label>
                  <Input
                    id="expiresInDays"
                    type="number"
                    min={1}
                    max={365}
                    placeholder="Never (optional)"
                    value={expiresInDays || ''}
                    onChange={(e) =>
                      setExpiresInDays(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  confirmDiscard(() => {
                    setCreateDialogOpen(false);
                    setKeyName('');
                  });
                }}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Generate Key
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Secret Key Revealed Dialog (Shown Once) */}
      <Dialog open={Boolean(createdKey)} onOpenChange={(open) => !open && setCreatedKey(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Save Your API Key</DialogTitle>
            </div>
            <DialogDescription>
              Make sure to copy your API key now. For security purposes,{' '}
              <span className="font-semibold text-foreground">
                we will never show this secret to you again.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-2">
            <Label className="text-xs text-muted-foreground">Your New API Key</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2.5 bg-muted rounded-md font-mono text-xs break-all select-all border">
                {createdKey}
              </div>
              <Button size="icon" variant="outline" onClick={handleCopyKey} className="shrink-0">
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setCreatedKey(null)} className="w-full">
              I have copied and saved my API key securely
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <ConfirmationDialog
        open={Boolean(revokeTarget)}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Revoke API Key"
        description={`Are you sure you want to revoke "${revokeTarget?.name}"? Any applications using this key will immediately be rejected with 401 Unauthorized.`}
        confirmLabel="Yes, Revoke Key"
        variant="destructive"
        loading={revoking}
        onConfirm={handleRevokeKey}
      />
    </div>
  );
}
