"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCw, Building2, X, ArrowDownUp } from "lucide-react";
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
import { useFormValidation } from "@/hooks/use-form-validation";
import { createClientSchema } from "@/lib/validations/admin";
import { InputError } from "@/components/ui/input-error";
import { useTableState } from "@/hooks/use-table-state";
import { SortableHeader } from "@/components/ui/sortable-header";
import { Pagination } from "@/components/ui/pagination";

interface ClientRecord {
  id: string;
  companyName: string | null;
  industry: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    status: string;
    createdAt: string;
  };
  wallet: {
    id: string;
    balance: number | string;
    currency: string;
    smsCredits: number;
  } | null;
  agent: {
    id: string;
    companyName: string | null;
    user: {
      name: string | null;
    };
  } | null;
  _count: {
    campaigns: number;
    senderIds: number;
  };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    values: clientForm,
    errors: clientErrors,
    touched: clientTouched,
    setFieldValue: setClientField,
    handleBlur: handleClientBlur,
    validateAll: validateClientAll,
    reset: resetClientForm,
    setServerErrors: setClientServerErrors,
  } = useFormValidation({
    initialValues: {
      name: "",
      email: "",
      companyName: "",
      industry: "",
      password: "Password123!",
      agentId: "",
      initialBalance: 500000,
    },
    schema: createClientSchema,
  });

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/clients");
      if (!res.ok) throw new Error("Failed to load clients");
      const data = await res.json();
      setClients(data.clients || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching clients";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

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
    paginatedData: displayedClients,
  } = useTableState<ClientRecord>({
    data: clients,
    searchFields: [
      (c) => c.companyName || "",
      (c) => c.user.name || "",
      (c) => c.user.email,
      (c) => c.industry || "",
      (c) => c.user.status,
      (c) => c.agent?.companyName || c.agent?.user?.name || "",
      (c) => String(c.wallet?.balance || ""),
    ],
    initialSortKey: "createdAt",
    initialSortOrder: "desc",
    initialPageSize: 10,
    initialFilters: { status: "ALL", industry: "ALL" },
    filterFn: (client, currentFilters) => {
      if (currentFilters.status && currentFilters.status !== "ALL") {
        if (client.user.status.toUpperCase() !== currentFilters.status.toUpperCase()) return false;
      }
      if (currentFilters.industry && currentFilters.industry !== "ALL") {
        if ((client.industry || "General").toLowerCase() !== currentFilters.industry.toLowerCase()) {
          return false;
        }
      }
      return true;
    },
    customSortFn: (a, b, key, order) => {
      let comp = 0;
      if (key === "company") {
        const nameA = a.companyName || a.user.name || "";
        const nameB = b.companyName || b.user.name || "";
        comp = nameA.localeCompare(nameB);
      } else if (key === "industry") {
        comp = (a.industry || "General").localeCompare(b.industry || "General");
      } else if (key === "status") {
        comp = a.user.status.localeCompare(b.user.status);
      } else if (key === "balance") {
        const balA = Number(a.wallet?.balance || 0);
        const balB = Number(b.wallet?.balance || 0);
        comp = balA - balB;
      } else if (key === "agent") {
        const agentA = a.agent?.companyName || a.agent?.user?.name || "";
        const agentB = b.agent?.companyName || b.agent?.user?.name || "";
        comp = agentA.localeCompare(agentB);
      } else if (key === "campaigns") {
        comp = (a._count?.campaigns || 0) - (b._count?.campaigns || 0);
      } else if (key === "createdAt") {
        comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return order === "asc" ? comp : -comp;
    },
  });

  // Extract unique industries dynamically
  const uniqueIndustries = useMemo(() => {
    const list = new Set<string>();
    clients.forEach((c) => {
      if (c.industry) list.add(c.industry.trim());
    });
    return Array.from(list).sort();
  }, [clients]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid } = validateClientAll();
    if (!isValid) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientForm.name.trim(),
          email: clientForm.email.trim(),
          password: clientForm.password,
          companyName: clientForm.companyName.trim() || undefined,
          industry: clientForm.industry.trim() || undefined,
          agentId: clientForm.agentId || undefined,
          initialBalance: Number(clientForm.initialBalance),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          setClientServerErrors(data.details);
        }
        throw new Error(data.error || "Failed to create client account");
      }

      toast.success(`Client account created for ${clientForm.name}!`);
      setIsAddOpen(false);
      resetClientForm();
      fetchClients();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating client";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Client Organizations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage enterprise accounts, prepaid balances, and designated sales agent associations.
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchClients()}
            disabled={loading}
            className="flex-1 sm:flex-initial"
            aria-label="Refresh clients list"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1 sm:flex-initial">
                <Plus className="mr-2 h-4 w-4" /> Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-lg p-0 overflow-hidden">
              <DialogHeader>
                <DialogTitle>Enroll New Client Organization</DialogTitle>
                <DialogDescription>
                  Creates an enterprise profile, default wallet ledger, and root user account.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddClient} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <DialogBody>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="clientName" required>Primary Contact Name</Label>
                      <Input
                        id="clientName"
                        placeholder="e.g. Sarah Kintu"
                        value={clientForm.name}
                        onChange={(e) => setClientField("name", e.target.value)}
                        onBlur={() => handleClientBlur("name")}
                        error={clientTouched.name && Boolean(clientErrors.name)}
                        required
                      />
                      <InputError message={clientTouched.name ? clientErrors.name : undefined} />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="clientEmail" required>Work Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        placeholder="sarah@corp.ug"
                        value={clientForm.email}
                        onChange={(e) => setClientField("email", e.target.value)}
                        onBlur={() => handleClientBlur("email")}
                        error={clientTouched.email && Boolean(clientErrors.email)}
                        required
                      />
                      <InputError message={clientTouched.email ? clientErrors.email : undefined} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="companyName">Company / Organization</Label>
                      <Input
                        id="companyName"
                        placeholder="e.g. Kintu Holdings Ltd"
                        value={clientForm.companyName}
                        onChange={(e) => setClientField("companyName", e.target.value)}
                        onBlur={() => handleClientBlur("companyName")}
                        error={clientTouched.companyName && Boolean(clientErrors.companyName)}
                      />
                      <InputError message={clientTouched.companyName ? clientErrors.companyName : undefined} />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="industry">Industry Sector</Label>
                      <Input
                        id="industry"
                        placeholder="e.g. Financial Services"
                        value={clientForm.industry}
                        onChange={(e) => setClientField("industry", e.target.value)}
                        onBlur={() => handleClientBlur("industry")}
                        error={clientTouched.industry && Boolean(clientErrors.industry)}
                      />
                      <InputError message={clientTouched.industry ? clientErrors.industry : undefined} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="clientPass" required>Initial Account Password</Label>
                    <Input
                      id="clientPass"
                      type="password"
                      value={clientForm.password}
                      onChange={(e) => setClientField("password", e.target.value)}
                      onBlur={() => handleClientBlur("password")}
                      error={clientTouched.password && Boolean(clientErrors.password)}
                      required
                    />
                    <InputError message={clientTouched.password ? clientErrors.password : undefined} />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="initialBalance">Initial Funded Balance (UGX)</Label>
                    <Input
                      id="initialBalance"
                      type="number"
                      value={clientForm.initialBalance}
                      onChange={(e) => setClientField("initialBalance", Number(e.target.value))}
                      onBlur={() => handleClientBlur("initialBalance")}
                      error={clientTouched.initialBalance && Boolean(clientErrors.initialBalance)}
                    />
                    <InputError message={clientTouched.initialBalance ? clientErrors.initialBalance : undefined} />
                  </div>
                </DialogBody>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Client"}
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
              <h2 className="text-lg font-semibold tracking-tight">Active Client Accounts ({clients.length})</h2>
              <p className="text-xs text-muted-foreground">Search and manage client wallets, assigned agents, and metrics.</p>
            </div>
            <div className="text-xs text-muted-foreground">
              Filtered: <span className="font-semibold text-foreground">{totalItems}</span> matching
            </div>
          </div>

          {/* Search, Filter & Order Toolbar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search company, contact, email, or agent..."
                className="pl-8 pr-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search clients"
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
              {/* Status filter */}
              <div className="w-36">
                <Select
                  value={filters.status || "ALL"}
                  onValueChange={(val) => setFilter("status", val)}
                >
                  <SelectTrigger className="h-9 text-xs" aria-label="Filter by status">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Industry filter */}
              {uniqueIndustries.length > 0 && (
                <div className="w-40">
                  <Select
                    value={filters.industry || "ALL"}
                    onValueChange={(val) => setFilter("industry", val)}
                  >
                    <SelectTrigger className="h-9 text-xs" aria-label="Filter by industry">
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Industries</SelectItem>
                      {uniqueIndustries.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sort Order Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1 text-xs"
                onClick={() => toggleSort(sortKey || "createdAt")}
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
            <Table className="min-w-[850px]">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHeader
                      column="company"
                      label="Company & Contact"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="industry"
                      label="Industry"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="status"
                      label="Status"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="balance"
                      label="Wallet Balance"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="agent"
                      label="Agent Assigned"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="campaigns"
                      label="Activity"
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
                ) : displayedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="font-medium text-foreground">No clients found matching your query.</p>
                        <p className="text-xs">Try clearing search terms or selecting a different filter.</p>
                        {(search || filters.status !== "ALL" || filters.industry !== "ALL") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              clearSearch();
                              setFilter("status", "ALL");
                              setFilter("industry", "ALL");
                            }}
                          >
                            Reset All Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedClients.map((client) => {
                    const balanceNum = Number(client.wallet?.balance || 0);
                    return (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{client.companyName || client.user.name}</p>
                              <p className="text-xs text-muted-foreground">{client.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {client.industry || "General"}
                        </TableCell>
                        <TableCell>
                          {client.user.status === "ACTIVE" ? (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-600/20 bg-emerald-500/10">
                              Active
                            </Badge>
                          ) : client.user.status === "SUSPENDED" ? (
                            <Badge variant="destructive">Suspended</Badge>
                          ) : (
                            <Badge variant="secondary">{client.user.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-sm">
                            UGX {balanceNum.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {client.wallet?.smsCredits?.toLocaleString() || 0} SMS credits
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {client.agent ? (
                            <span className="font-medium text-foreground">
                              {client.agent.companyName || client.agent.user.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">Direct Client</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className="text-xs font-normal">
                              {client._count.campaigns} campaigns
                            </Badge>
                            <Badge variant="outline" className="text-xs font-normal">
                              {client._count.senderIds} senders
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast.info(`Client ID: ${client.id} - ${client.companyName}`);
                            }}
                          >
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {clients.length > 0 && (
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
    </div>
  );
}
