"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCw, Server, Trash2, CheckCircle2, XCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableSkeletonRows } from "@/components/blocks/ui/skeleton-layouts";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogBody,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog";
import { useFormValidation } from "@/hooks/use-form-validation";
import { smsProviderSchema } from "@/lib/validations/sender-id";
import { InputError } from "@/components/ui/input-error";

interface ProviderRecord {
  id: string;
  name: string;
  displayName: string;
  type: string;
  baseUrl: string;
  apiKey: string | null;
  apiSecret: string | null;
  priority: number;
  costPerSms: number | string;
  isActive: boolean;
  supportsDlr: boolean;
  maxThroughput: number;
  createdAt: string;
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    values: providerForm,
    errors: providerErrors,
    touched: providerTouched,
    setFieldValue: setProviderField,
    handleBlur: handleProviderBlur,
    validateAll: validateProviderAll,
    reset: resetProviderForm,
    setServerErrors: setProviderServerErrors,
  } = useFormValidation({
    initialValues: {
      name: "",
      displayName: "",
      type: "HTTP" as "HTTP" | "SMPP" | "SDK",
      baseUrl: "https://api.gateway.com/v1",
      apiKey: "",
      apiSecret: "",
      username: "",
      password: "",
      senderId: "",
      priority: 1,
      costPerSms: 30.0,
      isActive: true,
      isFallback: false,
      maxThroughput: 500,
      supportsDlr: true,
    },
    schema: smsProviderSchema,
  });

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/providers");
      if (!res.ok) throw new Error("Failed to load providers");
      const data = await res.json();
      setProviders(data.providers || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching providers";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleToggleActive = async (id: string, current: boolean, name: string) => {
    try {
      const res = await fetch(`/api/admin/providers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });

      if (!res.ok) throw new Error("Failed to toggle status");
      toast.success(`${name} is now ${!current ? "Active" : "Disabled"}`);
      setProviders((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !current } : p))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating status";
      toast.error(msg);
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid } = validateProviderAll();
    if (!isValid) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: providerForm.name.trim(),
          displayName: providerForm.displayName.trim(),
          type: providerForm.type,
          baseUrl: providerForm.baseUrl.trim(),
          apiKey: providerForm.apiKey?.trim() || undefined,
          apiSecret: providerForm.apiSecret?.trim() || undefined,
          priority: Number(providerForm.priority),
          costPerSms: Number(providerForm.costPerSms),
          maxThroughput: Number(providerForm.maxThroughput),
          supportsDlr: providerForm.supportsDlr,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          setProviderServerErrors(data.details);
        }
        throw new Error(data.error || "Failed to create provider");
      }

      toast.success(`Gateway ${providerForm.displayName} added successfully!`);
      setIsAddOpen(false);
      resetProviderForm();
      fetchProviders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create provider";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    label: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: string, label: string) => {
    setDeleteConfirm({ open: true, id, label });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/providers/${deleteConfirm.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success(`Provider "${deleteConfirm.label}" deleted`);
      setProviders((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting provider";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">SMS Providers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage carrier aggregators, failover priorities, throughput rates, and credentials.</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={fetchProviders} disabled={loading} className="flex-1 sm:flex-initial">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1 sm:flex-initial">
                <Plus className="mr-2 h-4 w-4" /> Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-lg p-0 overflow-hidden">
              <DialogHeader>
                <DialogTitle>Configure New SMS Gateway</DialogTitle>
                <DialogDescription>
                  Connect a carrier API or SMPP aggregator for outbound message routing.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddProvider} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <DialogBody>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="provName" required>Provider Slug</Label>
                      <Input
                        id="provName"
                        placeholder="e.g. infobip"
                        value={providerForm.name}
                        onChange={(e) => setProviderField("name", e.target.value)}
                        onBlur={() => handleProviderBlur("name")}
                        error={providerTouched.name && Boolean(providerErrors.name)}
                        required
                      />
                      <InputError message={providerTouched.name ? providerErrors.name : undefined} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="provDisplay" required>Display Name</Label>
                      <Input
                        id="provDisplay"
                        placeholder="e.g. InfoBip Global"
                        value={providerForm.displayName}
                        onChange={(e) => setProviderField("displayName", e.target.value)}
                        onBlur={() => handleProviderBlur("displayName")}
                        error={providerTouched.displayName && Boolean(providerErrors.displayName)}
                        required
                      />
                      <InputError message={providerTouched.displayName ? providerErrors.displayName : undefined} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="provType" required>Protocol / Type</Label>
                      <Input
                        id="provType"
                        value={providerForm.type}
                        onChange={(e) => setProviderField("type", e.target.value.toUpperCase() as "HTTP" | "SMPP" | "SDK")}
                        onBlur={() => handleProviderBlur("type")}
                        error={providerTouched.type && Boolean(providerErrors.type)}
                        required
                      />
                      <InputError message={providerTouched.type ? providerErrors.type : undefined} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="provPriority" required>Priority Order (1 = Primary)</Label>
                      <Input
                        id="provPriority"
                        type="number"
                        min="1"
                        value={providerForm.priority}
                        onChange={(e) => setProviderField("priority", Number(e.target.value))}
                        onBlur={() => handleProviderBlur("priority")}
                        error={providerTouched.priority && Boolean(providerErrors.priority)}
                        required
                      />
                      <InputError message={providerTouched.priority ? providerErrors.priority : undefined} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="provUrl" required>API Endpoint / Base URL</Label>
                    <Input
                      id="provUrl"
                      placeholder="https://api.infobip.com"
                      value={providerForm.baseUrl || ""}
                      onChange={(e) => setProviderField("baseUrl", e.target.value)}
                      onBlur={() => handleProviderBlur("baseUrl")}
                      error={providerTouched.baseUrl && Boolean(providerErrors.baseUrl)}
                      required
                    />
                    <InputError message={providerTouched.baseUrl ? providerErrors.baseUrl : undefined} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="provKey">API Key / Username</Label>
                      <Input
                        id="provKey"
                        placeholder="Key or User"
                        value={providerForm.apiKey || ""}
                        onChange={(e) => setProviderField("apiKey", e.target.value)}
                        onBlur={() => handleProviderBlur("apiKey")}
                        error={providerTouched.apiKey && Boolean(providerErrors.apiKey)}
                      />
                      <InputError message={providerTouched.apiKey ? providerErrors.apiKey : undefined} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="provSecret">API Secret / Password</Label>
                      <Input
                        id="provSecret"
                        type="password"
                        placeholder="Secret"
                        value={providerForm.apiSecret || ""}
                        onChange={(e) => setProviderField("apiSecret", e.target.value)}
                        onBlur={() => handleProviderBlur("apiSecret")}
                        error={providerTouched.apiSecret && Boolean(providerErrors.apiSecret)}
                      />
                      <InputError message={providerTouched.apiSecret ? providerErrors.apiSecret : undefined} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="provCost">Cost / SMS (UGX)</Label>
                      <Input
                        id="provCost"
                        type="number"
                        step="0.1"
                        value={providerForm.costPerSms}
                        onChange={(e) => setProviderField("costPerSms", Number(e.target.value))}
                        onBlur={() => handleProviderBlur("costPerSms")}
                        error={providerTouched.costPerSms && Boolean(providerErrors.costPerSms)}
                      />
                      <InputError message={providerTouched.costPerSms ? providerErrors.costPerSms : undefined} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="provThroughput">Max Throughput (msg/s)</Label>
                      <Input
                        id="provThroughput"
                        type="number"
                        value={providerForm.maxThroughput}
                        onChange={(e) => setProviderField("maxThroughput", Number(e.target.value))}
                        onBlur={() => handleProviderBlur("maxThroughput")}
                        error={providerTouched.maxThroughput && Boolean(providerErrors.maxThroughput)}
                      />
                      <InputError message={providerTouched.maxThroughput ? providerErrors.maxThroughput : undefined} />
                    </div>
                  </div>
                </DialogBody>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Gateway"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0 sm:p-6">
          <div className="w-full">
            <Table className="min-w-[850px]">
            <TableHeader>
              <TableRow>
                <TableHead>Gateway</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Cost / SMS</TableHead>
                <TableHead>Max Speed</TableHead>
                <TableHead>DLR Supported</TableHead>
                <TableHead>Active State</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeletonRows columns={8} rows={5} />
              ) : providers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No SMS providers configured.
                  </TableCell>
                </TableRow>
              ) : (
                providers.map((prov) => (
                  <TableRow key={prov.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 mt-0.5">
                          <Server className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{prov.displayName}</p>
                          <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                            {prov.baseUrl || "Local Mock"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {prov.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={prov.priority === 1 ? "default" : "secondary"}>
                        Rank {prov.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      UGX {Number(prov.costPerSms).toFixed(1)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>{prov.maxThroughput} msg/s</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {prov.supportsDlr ? (
                        <div className="flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Yes</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>No</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={prov.isActive}
                          onCheckedChange={() => handleToggleActive(prov.id, prov.isActive, prov.displayName)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {prov.isActive ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive/40 dark:text-destructive/50 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClick(prov.id, prov.displayName)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Provider Removal */}
      <ConfirmationDialog
        open={Boolean(deleteConfirm?.open)}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Remove SMS Provider"
        description={`Are you sure you want to remove SMS provider "${deleteConfirm?.label}"? Routing rules or gateways linked to this provider may be disrupted.`}
        confirmLabel="Remove Provider"
        cancelLabel="Cancel"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
