'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmationDialog } from '@/components/feedback/confirmation-dialog';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import {
  Plus,
  Copy,
  Check,
  KeyRound,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Search,
  RotateCcw,
  SlidersHorizontal,
  MoreVertical,
  Layers,
  Infinity as InfinityIcon,
  Globe,
  Smartphone,
  ShoppingBag,
  Database,
  CreditCard,
  Cpu,
  Server,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { APP_PRESETS, QuotaPeriod, ApiEnvironment } from '@/lib/validations/api-keys';

interface ApiKeyItem {
  id: string;
  name: string;
  appName: string;
  environment: ApiEnvironment;
  keyPrefix: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  scopes: string[];
  rateLimit: number;
  rateLimitWindow: number;
  quotaLimit: number | null;
  quotaPeriod: QuotaPeriod;
  quotaUsed: number;
  quotaResetAt: string | null;
  alertThreshold: number | null;
  ipWhitelist: string[];
  createdAt: string;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
}

interface ApiResponseMeta {
  apps: string[];
  totalKeys: number;
  activeKeys: number;
  totalQuotaUsed: number;
  uncappedKeys?: number;
  cappedKeys?: number;
}

const AVAILABLE_SCOPES = [
  { id: 'sms.send', label: 'sms.send', desc: 'Send SMS messages and bulk campaigns' },
  { id: 'sms.status', label: 'sms.status', desc: 'Read delivery statuses and message receipts' },
  { id: 'sms.schedule', label: 'sms.schedule', desc: 'Schedule future SMS dispatches' },
  { id: 'balance.read', label: 'balance.read', desc: 'Check wallet balances and credit limits' },
  { id: 'contacts.read', label: 'contacts.read', desc: 'Read contacts and audience groups' },
  { id: 'contacts.write', label: 'contacts.write', desc: 'Create and update contacts' },
  { id: 'campaigns.read', label: 'campaigns.read', desc: 'Read broadcast campaign analytics' },
  { id: 'sender_ids.read', label: 'sender_ids.read', desc: 'Check approved alphanumeric Sender IDs' },
  { id: 'webhooks.manage', label: 'webhooks.manage', desc: 'Configure webhook endpoints and events' },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [meta, setMeta] = useState<ApiResponseMeta>({
    apps: [],
    totalKeys: 0,
    activeKeys: 0,
    totalQuotaUsed: 0,
    uncappedKeys: 0,
    cappedKeys: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppFilter, setSelectedAppFilter] = useState<string>('all');
  const [selectedEnvFilter, setSelectedEnvFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedQuotaFilter, setSelectedQuotaFilter] = useState<string>('all');

  // Generate Key Dialog State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [selectedPresetApp, setSelectedPresetApp] = useState<string>('web_portal');
  const [customAppName, setCustomAppName] = useState('');
  const [environment, setEnvironment] = useState<ApiEnvironment>('production');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'sms.send',
    'sms.status',
    'balance.read',
  ]);
  // Quota configuration: user can choose 'unlimited' (no quota) or 'capped'
  const [quotaType, setQuotaType] = useState<'unlimited' | 'capped'>('unlimited');
  const [quotaLimit, setQuotaLimit] = useState<number>(5000);
  const [quotaPeriod, setQuotaPeriod] = useState<QuotaPeriod>('MONTHLY');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);
  const [rateLimit, setRateLimit] = useState<number>(100);
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);
  const [creating, setCreating] = useState(false);

  // Edit Quota Dialog State
  const [editQuotaTarget, setEditQuotaTarget] = useState<ApiKeyItem | null>(null);
  const [editQuotaType, setEditQuotaType] = useState<'unlimited' | 'capped'>('unlimited');
  const [editQuotaLimit, setEditQuotaLimit] = useState<number>(5000);
  const [editQuotaPeriod, setEditQuotaPeriod] = useState<QuotaPeriod>('MONTHLY');
  const [editAlertThreshold, setEditAlertThreshold] = useState<number>(80);
  const [updatingQuota, setUpdatingQuota] = useState(false);

  // Reset Quota Dialog State
  const [resetQuotaTarget, setResetQuotaTarget] = useState<ApiKeyItem | null>(null);
  const [resettingQuota, setResettingQuota] = useState(false);

  // Post-Creation Key Display Dialog
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Revoke Dialog
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyItem | null>(null);
  const [revoking, setRevoking] = useState(false);

  // Unsaved changes protection
  const isKeyDirty = createDialogOpen && (keyName.trim().length > 0 || customAppName.trim().length > 0);
  const { confirmDiscard } = useUnsavedChanges({
    id: 'create-api-key',
    isDirty: isKeyDirty,
    title: 'Unsaved Key Settings',
    message: 'You have entered unsaved API key configuration. If you leave now, your input will be discarded.',
    onDiscard: () => {
      setCreateDialogOpen(false);
      resetCreateForm();
    },
  });

  const resetCreateForm = () => {
    setKeyName('');
    setSelectedPresetApp('web_portal');
    setCustomAppName('');
    setEnvironment('production');
    setSelectedScopes(['sms.send', 'sms.status', 'balance.read']);
    setQuotaType('unlimited');
    setQuotaLimit(5000);
    setQuotaPeriod('MONTHLY');
    setAlertThreshold(80);
    setRateLimit(100);
    setExpiresInDays(undefined);
  };

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/developer/api-keys');
      if (res.ok) {
        const json = await res.json();
        setKeys(json.data || []);
        if (json.meta) {
          setMeta(json.meta);
        }
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

  // Filter keys client-side for ultra-fast instant UI responsiveness
  const filteredKeys = useMemo(() => {
    return keys.filter((k) => {
      // App Filter
      if (selectedAppFilter !== 'all' && k.appName.toLowerCase() !== selectedAppFilter.toLowerCase()) {
        return false;
      }
      // Environment Filter
      if (selectedEnvFilter !== 'all' && k.environment !== selectedEnvFilter) {
        return false;
      }
      // Status Filter
      if (selectedStatusFilter !== 'all' && k.status !== selectedStatusFilter) {
        return false;
      }
      // Quota Filter
      if (selectedQuotaFilter === 'unlimited' && k.quotaLimit !== null) {
        return false;
      }
      if (selectedQuotaFilter === 'capped' && k.quotaLimit === null) {
        return false;
      }
      if (selectedQuotaFilter === 'warning') {
        if (k.quotaLimit === null) return false;
        const percent = Math.round(((k.quotaUsed || 0) / k.quotaLimit) * 100);
        if (percent < (k.alertThreshold || 80) || percent >= 100) return false;
      }
      if (selectedQuotaFilter === 'exceeded') {
        if (k.quotaLimit === null) return false;
        if ((k.quotaUsed || 0) < k.quotaLimit) return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = k.name.toLowerCase().includes(q);
        const matchApp = k.appName.toLowerCase().includes(q);
        const matchPrefix = k.keyPrefix.toLowerCase().includes(q);
        if (!matchName && !matchApp && !matchPrefix) {
          return false;
        }
      }
      return true;
    });
  }, [keys, selectedAppFilter, selectedEnvFilter, selectedStatusFilter, selectedQuotaFilter, searchQuery]);

  // Derived App Icons
  const getAppIcon = (appName: string) => {
    const lower = appName.toLowerCase();
    if (lower.includes('mobile') || lower.includes('ios') || lower.includes('android')) {
      return <Smartphone className="h-4 w-4" />;
    }
    if (lower.includes('shop') || lower.includes('store') || lower.includes('e-com') || lower.includes('woo')) {
      return <ShoppingBag className="h-4 w-4" />;
    }
    if (lower.includes('erp') || lower.includes('crm') || lower.includes('db') || lower.includes('data')) {
      return <Database className="h-4 w-4" />;
    }
    if (lower.includes('pos') || lower.includes('terminal') || lower.includes('billing')) {
      return <CreditCard className="h-4 w-4" />;
    }
    if (lower.includes('service') || lower.includes('backend') || lower.includes('server')) {
      return <Server className="h-4 w-4" />;
    }
    if (lower.includes('portal') || lower.includes('web') || lower.includes('dashboard')) {
      return <Globe className="h-4 w-4" />;
    }
    return <Cpu className="h-4 w-4" />;
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) {
      toast.error('Please enter a descriptive name for the API key');
      return;
    }
    if (selectedScopes.length === 0) {
      toast.error('Please select at least one permission scope');
      return;
    }

    const resolvedAppName =
      selectedPresetApp === 'custom'
        ? customAppName.trim() || 'Custom App'
        : APP_PRESETS.find((p) => p.id === selectedPresetApp)?.name || 'Default App';

    setCreating(true);
    try {
      const res = await fetch('/api/developer/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: keyName.trim(),
          appName: resolvedAppName,
          environment,
          scopes: selectedScopes,
          rateLimit: Number(rateLimit) || 100,
          quotaLimit: quotaType === 'capped' ? Number(quotaLimit) || 5000 : null,
          quotaPeriod: quotaType === 'capped' ? quotaPeriod : 'UNLIMITED',
          alertThreshold: quotaType === 'capped' ? Number(alertThreshold) || 80 : null,
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
      resetCreateForm();
      toast.success(
        quotaType === 'unlimited'
          ? 'API key generated with Unlimited Quota!'
          : 'API key generated with Quota limit!'
      );
      fetchKeys();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error generating key');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEditQuota = (key: ApiKeyItem) => {
    setEditQuotaTarget(key);
    if (key.quotaLimit === null) {
      setEditQuotaType('unlimited');
      setEditQuotaLimit(5000);
    } else {
      setEditQuotaType('capped');
      setEditQuotaLimit(key.quotaLimit);
    }
    setEditQuotaPeriod(key.quotaPeriod || 'MONTHLY');
    setEditAlertThreshold(key.alertThreshold || 80);
  };

  const handleSaveQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editQuotaTarget) return;

    setUpdatingQuota(true);
    try {
      const res = await fetch(`/api/developer/api-keys/${editQuotaTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotaLimit: editQuotaType === 'capped' ? Number(editQuotaLimit) : null,
          quotaPeriod: editQuotaType === 'capped' ? editQuotaPeriod : 'UNLIMITED',
          alertThreshold: editQuotaType === 'capped' ? Number(editAlertThreshold) || 80 : null,
        }),
      });

      if (res.ok) {
        toast.success(
          editQuotaType === 'unlimited'
            ? `Quota removed for "${editQuotaTarget.name}". Key is now unlimited.`
            : `Quota limit updated for "${editQuotaTarget.name}".`
        );
        setEditQuotaTarget(null);
        fetchKeys();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update quota');
      }
    } catch {
      toast.error('Network error updating quota');
    } finally {
      setUpdatingQuota(false);
    }
  };

  const handleRemoveQuotaDirect = async (key: ApiKeyItem) => {
    try {
      const res = await fetch(`/api/developer/api-keys/${key.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotaLimit: null }),
      });
      if (res.ok) {
        toast.success(`Quota limit removed for "${key.name}". Key is now Unlimited.`);
        fetchKeys();
      } else {
        toast.error('Failed to remove quota limit');
      }
    } catch {
      toast.error('Network error removing quota limit');
    }
  };

  const handleConfirmResetQuota = async () => {
    if (!resetQuotaTarget) return;
    setResettingQuota(true);
    try {
      const res = await fetch(`/api/developer/api-keys/${resetQuotaTarget.id}/reset-quota`, {
        method: 'POST',
      });
      if (res.ok) {
        toast.success(`Quota counter reset to 0 for "${resetQuotaTarget.name}"`);
        setResetQuotaTarget(null);
        fetchKeys();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to reset quota');
      }
    } catch {
      toast.error('Network error resetting quota');
    } finally {
      setResettingQuota(false);
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

  // Quota calculation helpers
  const getQuotaStatus = (k: ApiKeyItem) => {
    if (k.quotaLimit === null) return 'unlimited';
    const percent = Math.round(((k.quotaUsed || 0) / k.quotaLimit) * 100);
    const threshold = k.alertThreshold || 80;
    if (percent >= 100) return 'exceeded';
    if (percent >= threshold) return 'warning';
    return 'healthy';
  };

  const formatResetDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60));
    if (diffHours <= 0) return 'Resets soon';
    if (diffHours < 24) return `Resets in ${diffHours}h`;
    const diffDays = Math.ceil(diffHours / 24);
    return `Resets in ${diffDays}d (${d.toLocaleDateString()})`;
  };

  const uncappedCount = keys.filter((k) => k.quotaLimit === null).length;
  const cappedCount = keys.filter((k) => k.quotaLimit !== null).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader
        title="Developer API Keys & Quotas"
        description="Generate multiple API keys segmented by application and environment. Configure optional daily, weekly, or monthly dispatch quotas, or leave keys uncapped for unlimited pay-as-you-go throughput."
        action={
          <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Generate New Key
          </Button>
        }
      />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Configured Apps
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {meta.apps.length > 0 ? meta.apps.length : 1}
              </p>
              <p className="text-xs text-muted-foreground">Distinct systems & projects</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active API Keys
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {keys.filter((k) => k.status === 'ACTIVE').length}
              </p>
              <p className="text-xs text-muted-foreground">
                {uncappedCount} uncapped • {cappedCount} capped
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <KeyRound className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Cycle Quota Used
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {meta.totalQuotaUsed.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Requests & SMS dispatched</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/15 text-secondary dark:text-secondary-foreground">
              <Zap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                System Quota Health
              </p>
              <div className="flex items-center gap-1.5 pt-0.5">
                {keys.some((k) => getQuotaStatus(k) === 'exceeded') ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-semibold text-destructive">Quota Exceeded</span>
                  </>
                ) : keys.some((k) => getQuotaStatus(k) === 'warning') ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      Near Limit
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      All Systems Optimal
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {uncappedCount > 0 ? `${uncappedCount} key(s) with no quota` : 'Auto-throttled at limits'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-muted text-muted-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Developer Header Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-semibold text-sm sm:text-base text-foreground">
                Flexible Quota Policies & Multi-App Keys
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Quotas are completely optional. You can choose <strong>No Quota (Unlimited)</strong> for high-throughput backends, or enforce strict daily/weekly/monthly caps for partner portals and sandbox testing.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <a href="/api/docs" target="_blank" rel="noreferrer" className="flex items-center gap-1.5">
              <span>View API Documentation</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by key name, app, or prefix..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* App Filter */}
          <Select value={selectedAppFilter} onValueChange={setSelectedAppFilter}>
            <SelectTrigger className="w-[150px] text-xs h-9">
              <SelectValue placeholder="All Applications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              {meta.apps.map((app) => (
                <SelectItem key={app} value={app}>
                  {app}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Quota Policy Filter */}
          <Select value={selectedQuotaFilter} onValueChange={setSelectedQuotaFilter}>
            <SelectTrigger className="w-[145px] text-xs h-9">
              <SelectValue placeholder="Quota Policy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Policies</SelectItem>
              <SelectItem value="unlimited">No Quota (Unlimited)</SelectItem>
              <SelectItem value="capped">Capped Quotas</SelectItem>
              <SelectItem value="warning">Near Limit (≥80%)</SelectItem>
              <SelectItem value="exceeded">Exceeded (100%)</SelectItem>
            </SelectContent>
          </Select>

          {/* Environment Filter */}
          <Select value={selectedEnvFilter} onValueChange={setSelectedEnvFilter}>
            <SelectTrigger className="w-[130px] text-xs h-9">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="sandbox">Sandbox / Test</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
            <SelectTrigger className="w-[120px] text-xs h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="REVOKED">Revoked</SelectItem>
            </SelectContent>
          </Select>

          {(selectedAppFilter !== 'all' ||
            selectedEnvFilter !== 'all' ||
            selectedStatusFilter !== 'all' ||
            selectedQuotaFilter !== 'all' ||
            searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedAppFilter('all');
                setSelectedEnvFilter('all');
                setSelectedStatusFilter('all');
                setSelectedQuotaFilter('all');
                setSearchQuery('');
              }}
              className="text-xs h-9 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Main Keys List */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 sm:p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg">Applications & API Keys</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Showing {filteredKeys.length} of {keys.length} total generated API credentials.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading developer credentials and quotas...</span>
            </div>
          ) : filteredKeys.length === 0 ? (
            <div className="text-center p-12 space-y-3">
              <KeyRound className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <h3 className="font-semibold text-base">No matching API keys found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {searchQuery ||
                selectedAppFilter !== 'all' ||
                selectedEnvFilter !== 'all' ||
                selectedQuotaFilter !== 'all'
                  ? 'Try modifying your search query or clear filters.'
                  : 'Generate your first API key to connect your mobile app, backend, or Shopify store.'}
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1.5" /> Generate Key
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="min-w-[950px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-[220px]">Application & Key</TableHead>
                      <TableHead className="w-[120px]">Environment</TableHead>
                      <TableHead className="w-[140px]">Token Prefix</TableHead>
                      <TableHead className="w-[260px]">Quota Policy & Usage</TableHead>
                      <TableHead className="w-[160px]">Permissions</TableHead>
                      <TableHead className="w-[90px]">Status</TableHead>
                      <TableHead className="w-[70px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKeys.map((k) => {
                      const quotaStatus = getQuotaStatus(k);
                      const percent =
                        k.quotaLimit !== null
                          ? Math.min(100, Math.round(((k.quotaUsed || 0) / k.quotaLimit) * 100))
                          : null;
                      const resetLabel = formatResetDate(k.quotaResetAt);

                      return (
                        <TableRow key={k.id} className="hover:bg-muted/20">
                          {/* App & Key Name */}
                          <TableCell>
                            <div className="flex items-start gap-2.5">
                              <div className="p-2 rounded-md bg-muted text-foreground mt-0.5">
                                {getAppIcon(k.appName)}
                              </div>
                              <div className="space-y-0.5">
                                <p className="font-semibold text-sm text-foreground leading-tight">
                                  {k.name}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <span>{k.appName}</span>
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Environment */}
                          <TableCell>
                            {k.environment === 'production' ? (
                              <Badge
                                variant="outline"
                                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-medium"
                              >
                                Production
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-medium"
                              >
                                Sandbox
                              </Badge>
                            )}
                          </TableCell>

                          {/* Key Prefix */}
                          <TableCell>
                            <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground border">
                              rsms_{k.keyPrefix}_...
                            </code>
                          </TableCell>

                          {/* Quota & Usage Progress */}
                          <TableCell>
                            {k.quotaLimit !== null ? (
                              <div className="space-y-1.5 max-w-[240px]">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium text-foreground">
                                    {(k.quotaUsed || 0).toLocaleString()} /{' '}
                                    {k.quotaLimit.toLocaleString()}
                                  </span>
                                  <span
                                    className={`font-mono text-[11px] font-semibold ${
                                      quotaStatus === 'exceeded'
                                        ? 'text-destructive'
                                        : quotaStatus === 'warning'
                                          ? 'text-amber-600 dark:text-amber-400'
                                          : 'text-muted-foreground'
                                    }`}
                                  >
                                    {percent}% ({k.quotaPeriod?.toLowerCase()})
                                  </span>
                                </div>
                                <Progress
                                  value={percent || 0}
                                  className="h-1.5"
                                  indicatorClassName={
                                    quotaStatus === 'exceeded'
                                      ? 'bg-destructive'
                                      : quotaStatus === 'warning'
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                  }
                                />
                                {resetLabel && (
                                  <p className="text-[11px] text-muted-foreground">{resetLabel}</p>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                                  <InfinityIcon className="h-4 w-4" />
                                  <span>No Quota Limit</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                  {(k.quotaUsed || 0).toLocaleString()} requests processed (Pay as you go)
                                </p>
                              </div>
                            )}
                          </TableCell>

                          {/* Permissions / Scopes */}
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {k.scopes.slice(0, 2).map((s) => (
                                <Badge
                                  key={s}
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 font-mono"
                                >
                                  {s}
                                </Badge>
                              ))}
                              {k.scopes.length > 2 && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  +{k.scopes.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            {k.status === 'ACTIVE' ? (
                              <Badge
                                variant="default"
                                className="bg-emerald-600 hover:bg-emerald-600 text-[11px]"
                              >
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-muted-foreground text-[11px]">
                                Revoked
                              </Badge>
                            )}
                          </TableCell>

                          {/* Actions Dropdown */}
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  aria-label="Actions for key"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={() => handleOpenEditQuota(k)}>
                                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                                  <span>
                                    {k.quotaLimit === null ? 'Set Quota Limit' : 'Edit Quota'}
                                  </span>
                                </DropdownMenuItem>

                                {k.quotaLimit !== null && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleRemoveQuotaDirect(k)}>
                                      <InfinityIcon className="mr-2 h-4 w-4 text-primary" />
                                      <span>Remove Quota (Unlimited)</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setResetQuotaTarget(k)}>
                                      <RotateCcw className="mr-2 h-4 w-4" />
                                      <span>Reset Usage Counter to 0</span>
                                    </DropdownMenuItem>
                                  </>
                                )}

                                <DropdownMenuSeparator />
                                {k.status === 'ACTIVE' && (
                                  <DropdownMenuItem
                                    onClick={() => setRevokeTarget(k)}
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                  >
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    <span>Revoke Key</span>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards View (< 768px) */}
              <div className="block md:hidden divide-y">
                {filteredKeys.map((k) => {
                  const quotaStatus = getQuotaStatus(k);
                  const percent =
                    k.quotaLimit !== null
                      ? Math.min(100, Math.round(((k.quotaUsed || 0) / k.quotaLimit) * 100))
                      : null;
                  const resetLabel = formatResetDate(k.quotaResetAt);

                  return (
                    <div key={k.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-md bg-muted text-foreground mt-0.5">
                            {getAppIcon(k.appName)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">{k.name}</h4>
                            <p className="text-xs text-muted-foreground">{k.appName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {k.environment === 'production' ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 text-[10px] font-medium"
                            >
                              Prod
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-600 text-[10px] font-medium"
                            >
                              Sandbox
                            </Badge>
                          )}
                          {k.status === 'ACTIVE' ? (
                            <Badge
                              variant="default"
                              className="bg-emerald-600 text-[10px] px-1.5 py-0"
                            >
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Revoked
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Token Prefix */}
                      <div className="flex items-center justify-between text-xs bg-muted/40 p-2 rounded border">
                        <span className="text-muted-foreground">Token:</span>
                        <code className="font-mono text-xs">rsms_{k.keyPrefix}_...</code>
                      </div>

                      {/* Quota Progress */}
                      {k.quotaLimit !== null ? (
                        <div className="space-y-1.5 bg-muted/20 p-2.5 rounded-lg border">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-foreground">
                              Quota: {(k.quotaUsed || 0).toLocaleString()} /{' '}
                              {k.quotaLimit.toLocaleString()}
                            </span>
                            <span
                              className={`font-mono text-[11px] font-semibold ${
                                quotaStatus === 'exceeded'
                                  ? 'text-destructive'
                                  : quotaStatus === 'warning'
                                    ? 'text-amber-600'
                                    : 'text-muted-foreground'
                              }`}
                            >
                              {percent}% ({k.quotaPeriod?.toLowerCase()})
                            </span>
                          </div>
                          <Progress
                            value={percent || 0}
                            className="h-1.5"
                            indicatorClassName={
                              quotaStatus === 'exceeded'
                                ? 'bg-destructive'
                                : quotaStatus === 'warning'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                            }
                          />
                          {resetLabel && (
                            <p className="text-[11px] text-muted-foreground">{resetLabel}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs bg-muted/20 p-2.5 rounded-lg border">
                          <div className="flex items-center gap-1.5 text-primary font-medium">
                            <InfinityIcon className="h-4 w-4" />
                            <span>No Quota Limit (Unlimited)</span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">Pay as you go</span>
                        </div>
                      )}

                      {/* Scopes & Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-wrap gap-1">
                          {k.scopes.slice(0, 2).map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px] font-mono">
                              {s}
                            </Badge>
                          ))}
                          {k.scopes.length > 2 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{k.scopes.length - 2}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditQuota(k)}
                            className="h-8 text-xs px-2.5"
                          >
                            <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
                            {k.quotaLimit === null ? 'Set Quota' : 'Quota'}
                          </Button>
                          {k.status === 'ACTIVE' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRevokeTarget(k)}
                              className="h-8 text-xs px-2 text-destructive hover:bg-destructive/10"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
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
              resetCreateForm();
            });
          } else {
            setCreateDialogOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateKey}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Generate New API Key</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Provision a dedicated API token for your application with custom quotas or unlimited pay-as-you-go throughput.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Application Preset & Name */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  1. Application & Project
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {APP_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => setSelectedPresetApp(preset.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-all ${
                        selectedPresetApp === preset.id
                          ? 'border-primary bg-primary/10 text-primary font-medium shadow-xs'
                          : 'border-border bg-card hover:bg-muted/50 text-foreground'
                      }`}
                    >
                      {getAppIcon(preset.name)}
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>

                {selectedPresetApp === 'custom' && (
                  <div className="pt-1.5 space-y-1">
                    <Label htmlFor="customAppName" className="text-xs">
                      Custom Application Name
                    </Label>
                    <Input
                      id="customAppName"
                      placeholder="e.g. Warehouse Inventory Service"
                      value={customAppName}
                      onChange={(e) => setCustomAppName(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Key Name & Environment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="keyName" className="text-xs font-medium">
                    Key Identifier / Name
                  </Label>
                  <Input
                    id="keyName"
                    placeholder="e.g. Production iOS Client, Backend Worker"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="environment" className="text-xs font-medium">
                    Environment
                  </Label>
                  <Select
                    value={environment}
                    onValueChange={(val) => setEnvironment(val as ApiEnvironment)}
                  >
                    <SelectTrigger id="environment" className="text-xs">
                      <SelectValue placeholder="Environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="sandbox">Sandbox / Test</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quota Choice: Prominent Cards */}
              <div className="space-y-3 pt-2 border-t">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  2. Quota & Dispatch Policy
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Card: No Quota */}
                  <button
                    type="button"
                    onClick={() => setQuotaType('unlimited')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      quotaType === 'unlimited'
                        ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                        : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                        <InfinityIcon className="h-4 w-4 text-primary" />
                        <span>No Quota (Unlimited)</span>
                      </div>
                      {quotaType === 'unlimited' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      No request limit. Requests are bounded only by wallet balance & rate limits. Recommended for production backends.
                    </p>
                  </button>

                  {/* Card: Enforce Quota */}
                  <button
                    type="button"
                    onClick={() => setQuotaType('capped')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      quotaType === 'capped'
                        ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                        : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                        <SlidersHorizontal className="h-4 w-4 text-amber-500" />
                        <span>Enforce Quota Limit</span>
                      </div>
                      {quotaType === 'capped' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Cap maximum requests/SMS per day, week, month, or lifetime budget with automatic throttling.
                    </p>
                  </button>
                </div>

                {/* If Unlimited: friendly confirmation banner */}
                {quotaType === 'unlimited' ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        No Quota Ceilings Configured
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        This key will run uncapped. You can always apply a quota ceiling later from the key actions menu.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* If Capped: full configuration controls */
                  <div className="p-3.5 bg-muted/20 border rounded-lg space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="quotaPeriod" className="text-xs">
                          Quota Rollover Frequency
                        </Label>
                        <Select
                          value={quotaPeriod}
                          onValueChange={(val) => setQuotaPeriod(val as QuotaPeriod)}
                        >
                          <SelectTrigger id="quotaPeriod" className="text-xs bg-background">
                            <SelectValue placeholder="Select Frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DAILY">Daily (Resets every 24h)</SelectItem>
                            <SelectItem value="WEEKLY">Weekly (Resets every 7 days)</SelectItem>
                            <SelectItem value="MONTHLY">Monthly (Resets 1st of month)</SelectItem>
                            <SelectItem value="TOTAL">Fixed Lifetime Budget (No Reset)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="quotaLimit" className="text-xs">
                          Max Requests / SMS Limit
                        </Label>
                        <Input
                          id="quotaLimit"
                          type="number"
                          min={10}
                          max={10000000}
                          value={quotaLimit}
                          onChange={(e) => setQuotaLimit(Number(e.target.value))}
                          className="bg-background text-xs"
                          required
                        />
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground mr-1">Quick Presets:</span>
                      {[1000, 5000, 25000, 100000].map((num) => (
                        <button
                          type="button"
                          key={num}
                          onClick={() => setQuotaLimit(num)}
                          className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                            quotaLimit === num
                              ? 'bg-primary text-primary-foreground border-primary font-semibold'
                              : 'bg-background hover:bg-muted text-muted-foreground'
                          }`}
                        >
                          {num.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <Label htmlFor="alertThreshold" className="text-xs text-muted-foreground">
                          Near-Capacity Warning Threshold
                        </Label>
                        <span className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
                          {alertThreshold}%
                        </span>
                      </div>
                      <Input
                        id="alertThreshold"
                        type="range"
                        min={50}
                        max={95}
                        step={5}
                        value={alertThreshold}
                        onChange={(e) => setAlertThreshold(Number(e.target.value))}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Rate Limit & Expiration */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div className="space-y-1.5">
                  <Label htmlFor="rateLimit" className="text-xs">
                    Rate Limit (req/min)
                  </Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    min={10}
                    max={10000}
                    value={rateLimit}
                    onChange={(e) => setRateLimit(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="expiresInDays" className="text-xs">
                    Expiration (Days)
                  </Label>
                  <Input
                    id="expiresInDays"
                    type="number"
                    min={1}
                    max={365}
                    placeholder="Never (Optional)"
                    value={expiresInDays || ''}
                    onChange={(e) =>
                      setExpiresInDays(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Scopes & Permissions */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  3. Scopes & API Permissions
                </Label>
                <div className="space-y-2 border rounded-lg p-3 bg-muted/20 max-h-40 overflow-y-auto">
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
                          className="text-xs font-semibold cursor-pointer text-foreground"
                        >
                          {scope.label}
                        </label>
                        <p className="text-[11px] text-muted-foreground">{scope.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  confirmDiscard(() => {
                    setCreateDialogOpen(false);
                    resetCreateForm();
                  });
                }}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Generate API Key
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Quota Dialog */}
      <Dialog open={Boolean(editQuotaTarget)} onOpenChange={(open) => !open && setEditQuotaTarget(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSaveQuota}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                <span>Adjust Quota Policy: {editQuotaTarget?.name}</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Choose whether this key has an enforced quota limit or operates uncapped with unlimited requests.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditQuotaType('unlimited')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    editQuotaType === 'unlimited'
                      ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                      : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                      <InfinityIcon className="h-4 w-4 text-primary" />
                      <span>No Quota (Unlimited)</span>
                    </div>
                    {editQuotaType === 'unlimited' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Remove limits</p>
                </button>

                <button
                  type="button"
                  onClick={() => setEditQuotaType('capped')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    editQuotaType === 'capped'
                      ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                      : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                      <SlidersHorizontal className="h-4 w-4 text-amber-500" />
                      <span>Enforce Limit</span>
                    </div>
                    {editQuotaType === 'capped' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Apply custom cap</p>
                </button>
              </div>

              {editQuotaType === 'unlimited' ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Saving will remove all quota limits from this key. Requests will be accepted without any ceiling.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 bg-muted/20 p-3.5 rounded-lg border">
                  <div className="space-y-1.5">
                    <Label htmlFor="editQuotaPeriod" className="text-xs">
                      Rollover Frequency
                    </Label>
                    <Select
                      value={editQuotaPeriod}
                      onValueChange={(val) => setEditQuotaPeriod(val as QuotaPeriod)}
                    >
                      <SelectTrigger id="editQuotaPeriod" className="text-xs bg-background">
                        <SelectValue placeholder="Select Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily (Resets every 24h)</SelectItem>
                        <SelectItem value="WEEKLY">Weekly (Resets every 7 days)</SelectItem>
                        <SelectItem value="MONTHLY">Monthly (Resets 1st of month)</SelectItem>
                        <SelectItem value="TOTAL">Fixed Lifetime Budget</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="editQuotaLimit" className="text-xs">
                      Quota Limit (Requests / SMS)
                    </Label>
                    <Input
                      id="editQuotaLimit"
                      type="number"
                      min={10}
                      max={10000000}
                      value={editQuotaLimit}
                      onChange={(e) => setEditQuotaLimit(Number(e.target.value))}
                      className="bg-background text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <Label htmlFor="editAlertThreshold" className="text-muted-foreground">
                        Warning Alert Threshold
                      </Label>
                      <span className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {editAlertThreshold}%
                      </span>
                    </div>
                    <Input
                      id="editAlertThreshold"
                      type="range"
                      min={50}
                      max={95}
                      step={5}
                      value={editAlertThreshold}
                      onChange={(e) => setEditAlertThreshold(Number(e.target.value))}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditQuotaTarget(null)}
                disabled={updatingQuota}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatingQuota}>
                {updatingQuota ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Quota Changes
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
              <DialogTitle className="text-base sm:text-lg">Save Your New API Key</DialogTitle>
            </div>
            <DialogDescription className="text-xs sm:text-sm">
              Make sure to copy your API key right now. For security reasons,{' '}
              <span className="font-semibold text-foreground">
                we will never reveal this secret key again.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-2">
            <Label className="text-xs text-muted-foreground">API Secret Key Token</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2.5 bg-muted rounded-md font-mono text-xs break-all select-all border text-foreground">
                {createdKey}
              </div>
              <Button size="icon" variant="outline" onClick={handleCopyKey} className="shrink-0">
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setCreatedKey(null)} className="w-full">
              I have safely stored my API secret key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Quota Confirmation Dialog */}
      <ConfirmationDialog
        open={Boolean(resetQuotaTarget)}
        onOpenChange={(open) => !open && setResetQuotaTarget(null)}
        title="Reset Quota Consumption"
        description={`Are you sure you want to reset the current period's usage for "${resetQuotaTarget?.name}" back to 0? The key will immediately regain full capacity.`}
        confirmLabel="Reset to 0"
        loading={resettingQuota}
        onConfirm={handleConfirmResetQuota}
      />

      {/* Revoke Confirmation Dialog */}
      <ConfirmationDialog
        open={Boolean(revokeTarget)}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Revoke API Key"
        description={`Are you sure you want to revoke "${revokeTarget?.name}"? Any applications or integrations using this secret key will immediately fail authentication with HTTP 401 Unauthorized.`}
        confirmLabel="Yes, Revoke Key"
        variant="destructive"
        loading={revoking}
        onConfirm={handleRevokeKey}
      />
    </div>
  );
}
