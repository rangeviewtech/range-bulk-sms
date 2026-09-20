"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCw, Trash2, Globe, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableSkeletonRows } from "@/components/blocks/ui/skeleton-layouts";
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

interface PricingRecord {
  id: string;
  countryCode: string;
  countryName: string;
  networkCode: string | null;
  networkName: string | null;
  costPerSms: number | string;
  sellingPrice: number | string;
  currency: string;
  isDefault: boolean;
  createdAt: string;
}

export default function PricingPage() {
  const [pricing, setPricing] = useState<PricingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [countryCode, setCountryCode] = useState("UG");
  const [countryName, setCountryName] = useState("Uganda");
  const [networkCode, setNetworkCode] = useState("MTN");
  const [networkName, setNetworkName] = useState("MTN Uganda");
  const [costPerSms, setCostPerSms] = useState("28.0");
  const [sellingPrice, setSellingPrice] = useState("45.0");
  const [currency, setCurrency] = useState("UGX");

  const fetchPricing = useCallback(async (query = "") => {
    try {
      setLoading(true);
      const url = query ? `/api/admin/pricing?q=${encodeURIComponent(query)}` : "/api/admin/pricing";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load pricing rules");
      const data = await res.json();
      setPricing(data.pricing || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching pricing";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPricing(search);
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: countryCode.trim().toUpperCase(),
          countryName: countryName.trim(),
          networkCode: networkCode.trim().toUpperCase() || undefined,
          networkName: networkName.trim() || undefined,
          costPerSms: Number(costPerSms),
          sellingPrice: Number(sellingPrice),
          currency: currency.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create pricing rule");
      }

      toast.success(`Pricing rule for ${countryName} (${networkCode || "All"}) created!`);
      setIsAddOpen(false);
      fetchPricing(search);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create pricing rule";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRule = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete the pricing rule for ${label}?`)) return;

    try {
      const res = await fetch(`/api/admin/pricing/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      toast.success(`Rule for ${label} deleted`);
      setPricing((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete";
      toast.error(msg);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pricing Config</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure destination country, mobile network operator rates, and retail SMS selling margins.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchPricing(search)} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
              <form onSubmit={handleAddRule}>
                <DialogHeader>
                  <DialogTitle>Add Network Pricing Rule</DialogTitle>
                  <DialogDescription>
                    Define the wholesale gateway cost and standard retail rate per SMS segment.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 sm:gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="countryCode" required>Country Code (ISO-2)</Label>
                      <Input
                        id="countryCode"
                        placeholder="UG"
                        maxLength={2}
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="countryName" required>Country Name</Label>
                      <Input
                        id="countryName"
                        placeholder="Uganda"
                        value={countryName}
                        onChange={(e) => setCountryName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="netCode">Network Code</Label>
                      <Input
                        id="netCode"
                        placeholder="MTN"
                        value={networkCode}
                        onChange={(e) => setNetworkCode(e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="netName">Network Name</Label>
                      <Input
                        id="netName"
                        placeholder="MTN Uganda"
                        value={networkName}
                        onChange={(e) => setNetworkName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cost" required>Cost / SMS</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.001"
                        min="0"
                        value={costPerSms}
                        onChange={(e) => setCostPerSms(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price" required>Selling Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.001"
                        min="0"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="curr" required>Currency</Label>
                      <Input
                        id="curr"
                        placeholder="UGX"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Pricing Rule"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-sm flex gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by country or network..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
          </form>
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{pricing.length}</span> pricing rules
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="w-full">
            <Table className="min-w-[750px]">
            <TableHeader>
              <TableRow>
                <TableHead>Country / Destination</TableHead>
                <TableHead>Mobile Network</TableHead>
                <TableHead>Base Cost</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Profit Margin</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeletonRows columns={7} rows={5} />
              ) : pricing.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No pricing rules configured.
                  </TableCell>
                </TableRow>
              ) : (
                pricing.map((rule) => {
                  const cost = Number(rule.costPerSms);
                  const price = Number(rule.sellingPrice);
                  const margin = price > 0 ? (((price - cost) / price) * 100).toFixed(1) : "0.0";
                  const isMarginHealthy = Number(margin) >= 20;

                  return (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded bg-muted text-muted-foreground">
                            <Globe className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">{rule.countryName}</span>
                            <span className="text-xs text-muted-foreground ml-1.5 font-mono">({rule.countryCode})</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {rule.networkName || rule.networkCode ? (
                          <Badge variant="outline" className="font-medium">
                            {rule.networkName || rule.networkCode}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">All Networks</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-sm text-foreground">
                        {price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingUp className={`w-3.5 h-3.5 ${isMarginHealthy ? "text-emerald-600" : "text-amber-500"}`} />
                          <span className={`font-semibold text-xs ${isMarginHealthy ? "text-emerald-600" : "text-amber-600"}`}>
                            {margin}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {rule.currency}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteRule(rule.id, `${rule.countryName} - ${rule.networkName || "All"}`)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
