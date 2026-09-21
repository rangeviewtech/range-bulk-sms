"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCw, Trash2, Globe, TrendingUp, X, ArrowDownUp } from "lucide-react";
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
  DialogBody,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog";
import { useFormValidation } from "@/hooks/use-form-validation";
import { smsPricingSchema } from "@/lib/validations/wallet";
import { InputError } from "@/components/ui/input-error";
import { useTableState } from "@/hooks/use-table-state";
import { SortableHeader } from "@/components/ui/sortable-header";
import { Pagination } from "@/components/ui/pagination";

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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    values: pricingForm,
    errors: pricingErrors,
    touched: pricingTouched,
    setFieldValue: setPricingField,
    handleBlur: handlePricingBlur,
    validateAll: validatePricingAll,
    reset: resetPricingForm,
    setServerErrors: setPricingServerErrors,
  } = useFormValidation({
    initialValues: {
      countryCode: "UG",
      countryName: "Uganda",
      networkCode: "MTN",
      networkName: "MTN Uganda",
      costPerSms: 28.0,
      sellingPrice: 45.0,
      currency: "UGX",
    },
    schema: smsPricingSchema,
  });

  const fetchPricing = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/pricing");
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

  const {
    search,
    setSearch,
    clearSearch,
    sortKey,
    sortOrder,
    toggleSort,
    filters,
    setFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedData: displayedPricing,
  } = useTableState<PricingRecord>({
    data: pricing,
    searchFields: [
      "countryName",
      "countryCode",
      (r) => r.networkName || "",
      (r) => r.networkCode || "",
      "currency",
      (r) => String(r.costPerSms),
      (r) => String(r.sellingPrice),
    ],
    initialSortKey: "country",
    initialSortOrder: "asc",
    initialPageSize: 10,
    initialFilters: { network: "ALL" },
    filterFn: (rule, currentFilters) => {
      if (currentFilters.network && currentFilters.network !== "ALL") {
        const net = rule.networkCode || rule.networkName || "ALL";
        if (net.toUpperCase() !== currentFilters.network.toUpperCase()) return false;
      }
      return true;
    },
    customSortFn: (a, b, key, order) => {
      let comp = 0;
      if (key === "country") {
        comp = a.countryName.localeCompare(b.countryName);
      } else if (key === "network") {
        const netA = a.networkName || a.networkCode || "";
        const netB = b.networkName || b.networkCode || "";
        comp = netA.localeCompare(netB);
      } else if (key === "cost") {
        comp = Number(a.costPerSms) - Number(b.costPerSms);
      } else if (key === "price") {
        comp = Number(a.sellingPrice) - Number(b.sellingPrice);
      } else if (key === "margin") {
        const marginA =
          Number(a.sellingPrice) > 0
            ? (Number(a.sellingPrice) - Number(a.costPerSms)) / Number(a.sellingPrice)
            : 0;
        const marginB =
          Number(b.sellingPrice) > 0
            ? (Number(b.sellingPrice) - Number(b.costPerSms)) / Number(b.sellingPrice)
            : 0;
        comp = marginA - marginB;
      } else if (key === "currency") {
        comp = a.currency.localeCompare(b.currency);
      }
      return order === "asc" ? comp : -comp;
    },
  });

  // Extract distinct networks dynamically
  const distinctNetworks = useMemo(() => {
    const list = new Set<string>();
    pricing.forEach((p) => {
      const net = p.networkCode || p.networkName;
      if (net) list.add(net.toUpperCase());
    });
    return Array.from(list).sort();
  }, [pricing]);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid } = validatePricingAll();
    if (!isValid) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: pricingForm.countryCode.trim().toUpperCase(),
          countryName: pricingForm.countryName.trim(),
          networkCode: pricingForm.networkCode?.trim().toUpperCase() || undefined,
          networkName: pricingForm.networkName?.trim() || undefined,
          costPerSms: Number(pricingForm.costPerSms),
          sellingPrice: Number(pricingForm.sellingPrice),
          currency: pricingForm.currency.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          setPricingServerErrors(data.details);
        }
        throw new Error(data.error || "Failed to create pricing rule");
      }

      toast.success(
        `Pricing rule saved for ${pricingForm.countryName} (${pricingForm.networkCode || "All"})!`
      );
      setIsAddOpen(false);
      resetPricingForm();
      fetchPricing();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving rule";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/pricing?id=${deleteConfirm.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete pricing rule");
      toast.success("Pricing rule removed");
      setDeleteConfirm(null);
      fetchPricing();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error removing rule";
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">SMS Pricing & Margins</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure destination route wholesale termination rates, client retail prices, and profit margins.
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchPricing()}
            disabled={loading}
            className="flex-1 sm:flex-initial"
            aria-label="Refresh pricing rules"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1 sm:flex-initial">
                <Plus className="mr-2 h-4 w-4" /> Add Rate Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-md p-0 overflow-hidden">
              <DialogHeader>
                <DialogTitle>Configure Rate Rule</DialogTitle>
                <DialogDescription>
                  Define destination carrier termination fee and billable retail price per SMS segment.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddRule} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <DialogBody>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="countryCode" required>Country ISO</Label>
                      <Input
                        id="countryCode"
                        placeholder="UG"
                        maxLength={2}
                        value={pricingForm.countryCode}
                        onChange={(e) => setPricingField("countryCode", e.target.value)}
                        onBlur={() => handlePricingBlur("countryCode")}
                        error={pricingTouched.countryCode && Boolean(pricingErrors.countryCode)}
                        required
                      />
                      <InputError message={pricingTouched.countryCode ? pricingErrors.countryCode : undefined} />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="countryName" required>Country Name</Label>
                      <Input
                        id="countryName"
                        placeholder="Uganda"
                        value={pricingForm.countryName}
                        onChange={(e) => setPricingField("countryName", e.target.value)}
                        onBlur={() => handlePricingBlur("countryName")}
                        error={pricingTouched.countryName && Boolean(pricingErrors.countryName)}
                        required
                      />
                      <InputError message={pricingTouched.countryName ? pricingErrors.countryName : undefined} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="networkCode">Network Code</Label>
                      <Input
                        id="networkCode"
                        placeholder="e.g. MTN"
                        value={pricingForm.networkCode}
                        onChange={(e) => setPricingField("networkCode", e.target.value)}
                        onBlur={() => handlePricingBlur("networkCode")}
                        error={pricingTouched.networkCode && Boolean(pricingErrors.networkCode)}
                      />
                      <InputError message={pricingTouched.networkCode ? pricingErrors.networkCode : undefined} />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="networkName">Network Label</Label>
                      <Input
                        id="networkName"
                        placeholder="e.g. MTN Uganda"
                        value={pricingForm.networkName}
                        onChange={(e) => setPricingField("networkName", e.target.value)}
                        onBlur={() => handlePricingBlur("networkName")}
                        error={pricingTouched.networkName && Boolean(pricingErrors.networkName)}
                      />
                      <InputError message={pricingTouched.networkName ? pricingErrors.networkName : undefined} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="costPerSms" required>Gateway Cost (Wholesale)</Label>
                      <Input
                        id="costPerSms"
                        type="number"
                        step="0.1"
                        value={pricingForm.costPerSms}
                        onChange={(e) => setPricingField("costPerSms", Number(e.target.value))}
                        onBlur={() => handlePricingBlur("costPerSms")}
                        error={pricingTouched.costPerSms && Boolean(pricingErrors.costPerSms)}
                        required
                      />
                      <InputError message={pricingTouched.costPerSms ? pricingErrors.costPerSms : undefined} />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="sellingPrice" required>Selling Price (Retail)</Label>
                      <Input
                        id="sellingPrice"
                        type="number"
                        step="0.1"
                        value={pricingForm.sellingPrice}
                        onChange={(e) => setPricingField("sellingPrice", Number(e.target.value))}
                        onBlur={() => handlePricingBlur("sellingPrice")}
                        error={pricingTouched.sellingPrice && Boolean(pricingErrors.sellingPrice)}
                        required
                      />
                      <InputError message={pricingTouched.sellingPrice ? pricingErrors.sellingPrice : undefined} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="currency" required>Pricing Currency</Label>
                    <Input
                      id="currency"
                      placeholder="UGX"
                      value={pricingForm.currency}
                      onChange={(e) => setPricingField("currency", e.target.value)}
                      onBlur={() => handlePricingBlur("currency")}
                      error={pricingTouched.currency && Boolean(pricingErrors.currency)}
                      required
                    />
                    <InputError message={pricingTouched.currency ? pricingErrors.currency : undefined} />
                  </div>
                </DialogBody>

                <DialogFooter>
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
        <CardHeader className="flex flex-col space-y-4 p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Active Rate Rules ({pricing.length})</h2>
              <p className="text-xs text-muted-foreground">Carrier termination rates and client SMS tariffs.</p>
            </div>
            <div className="text-xs text-muted-foreground">
              Filtered: <span className="font-semibold text-foreground">{totalItems}</span> matching
            </div>
          </div>

          {/* Toolbar: Search, Network Filter, Order Toggle */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by country, code, network, currency..."
                className="pl-8 pr-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search pricing rules"
              />
              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {distinctNetworks.length > 0 && (
                <div className="w-36">
                  <Select
                    value={filters.network || "ALL"}
                    onValueChange={(val) => setFilter("network", val)}
                  >
                    <SelectTrigger className="h-9 text-xs" aria-label="Filter by network">
                      <SelectValue placeholder="All Networks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Networks</SelectItem>
                      {distinctNetworks.map((net) => (
                        <SelectItem key={net} value={net}>
                          {net}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1 text-xs"
                onClick={() => toggleSort(sortKey || "country")}
                title={`Order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
                aria-label="Toggle sort order"
              >
                <ArrowDownUp className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Order:</span> {sortOrder.toUpperCase()}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6 pt-0">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[750px]">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHeader
                      column="country"
                      label="Country / Destination"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="network"
                      label="Mobile Network"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="cost"
                      label="Base Cost"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="price"
                      label="Selling Price"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="margin"
                      label="Profit Margin"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="currency"
                      label="Currency"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeletonRows columns={7} rows={5} />
                ) : displayedPricing.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="font-medium text-foreground">No pricing rules matching query.</p>
                        <p className="text-xs">Try adjusting your search query or network filter.</p>
                        {(search || filters.network !== "ALL") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              clearSearch();
                              setFilter("network", "ALL");
                            }}
                          >
                            Reset Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedPricing.map((rule) => {
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
                              <span className="text-xs text-muted-foreground ml-1.5 font-mono">
                                ({rule.countryCode})
                              </span>
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
                            <TrendingUp
                              className={`w-3.5 h-3.5 ${
                                isMarginHealthy ? "text-emerald-600" : "text-amber-500"
                              }`}
                            />
                            <span
                              className={`font-semibold text-xs ${
                                isMarginHealthy ? "text-emerald-600" : "text-amber-600"
                              }`}
                            >
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
                            className="h-8 w-8 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300 transition-colors rounded-lg"
                            onClick={() =>
                              handleDeleteClick(
                                rule.id,
                                `${rule.countryName} - ${rule.networkName || "All"}`
                              )
                            }
                            aria-label={`Delete pricing rule for ${rule.countryName} - ${rule.networkName || "All"}`}
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

          {pricing.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Pricing Rule Removal */}
      <ConfirmationDialog
        open={Boolean(deleteConfirm?.open)}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Pricing Rule"
        description={`Are you sure you want to delete the pricing rule for "${deleteConfirm?.name}"? Billing calculations for this country/network route will revert to default.`}
        confirmLabel="Delete Rule"
        cancelLabel="Cancel"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
