"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCw, Server, Trash2, CheckCircle2, XCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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

  // Form fields
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [type, setType] = useState("HTTP");
  const [baseUrl, setBaseUrl] = useState("https://api.gateway.com/v1");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [priority, setPriority] = useState("1");
  const [costPerSms, setCostPerSms] = useState("30.0");
  const [maxThroughput, setMaxThroughput] = useState("500");

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
    if (!name.trim() || !displayName.trim()) {
      toast.error("Name and Display Name are required");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          displayName: displayName.trim(),
          type,
          baseUrl: baseUrl.trim(),
          apiKey: apiKey.trim() || undefined,
          apiSecret: apiSecret.trim() || undefined,
          priority: Number(priority),
          costPerSms: Number(costPerSms),
          maxThroughput: Number(maxThroughput),
          supportsDlr: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create provider");

      toast.success(`Gateway ${displayName} added successfully!`);
      setIsAddOpen(false);
      setName("");
      setDisplayName("");
      setApiKey("");
      setApiSecret("");
      fetchProviders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create provider";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to remove SMS provider ${label}?`)) return;

    try {
      const res = await fetch(`/api/admin/providers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success(`Provider ${label} deleted`);
      setProviders((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting provider";
      toast.error(msg);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
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
            <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
              <form onSubmit={handleAddProvider}>
                <DialogHeader>
                  <DialogTitle>Configure New SMS Gateway</DialogTitle>
                  <DialogDescription>
                    Connect a carrier API or SMPP aggregator for outbound message routing.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provName">Provider Slug</Label>
                      <Input
                        id="provName"
                        placeholder="e.g. infobip"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provDisplay">Display Name</Label>
                      <Input
                        id="provDisplay"
                        placeholder="e.g. InfoBip Global"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provType">Protocol / Type</Label>
                      <Input
                        id="provType"
                        value={type}
                        onChange={(e) => setType(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provPriority">Priority Order (1 = Primary)</Label>
                      <Input
                        id="provPriority"
                        type="number"
                        min="1"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provUrl">API Endpoint / Base URL</Label>
                    <Input
                      id="provUrl"
                      placeholder="https://api.infobip.com"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provKey">API Key / Username</Label>
                      <Input
                        id="provKey"
                        placeholder="Key or User"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provSecret">API Secret / Password</Label>
                      <Input
                        id="provSecret"
                        type="password"
                        placeholder="Secret"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provCost">Cost / SMS (UGX)</Label>
                      <Input
                        id="provCost"
                        type="number"
                        step="0.1"
                        value={costPerSms}
                        onChange={(e) => setCostPerSms(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provThroughput">Max Throughput (msg/s)</Label>
                      <Input
                        id="provThroughput"
                        type="number"
                        value={maxThroughput}
                        onChange={(e) => setMaxThroughput(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
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
          <div className="overflow-x-auto min-w-[850px]">
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
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading providers...
                  </TableCell>
                </TableRow>
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
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(prov.id, prov.displayName)}
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
    </div>
  );
}
