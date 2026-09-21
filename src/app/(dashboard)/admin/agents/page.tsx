"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCw, Briefcase, X, ArrowDownUp } from "lucide-react";
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
import { createAgentSchema } from "@/lib/validations/admin";
import { InputError } from "@/components/ui/input-error";
import { useTableState } from "@/hooks/use-table-state";
import { SortableHeader } from "@/components/ui/sortable-header";
import { Pagination } from "@/components/ui/pagination";

interface AgentRecord {
  id: string;
  companyName: string | null;
  commissionRate: number | string;
  bankName: string | null;
  bankAccount: string | null;
  mobileMoney: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    status: string;
    createdAt: string;
  };
  clients: {
    id: string;
    companyName: string | null;
  }[];
  _count: {
    clients: number;
    commissions: number;
  };
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    values: agentForm,
    errors: agentErrors,
    touched: agentTouched,
    setFieldValue: setAgentField,
    handleBlur: handleAgentBlur,
    validateAll: validateAgentAll,
    reset: resetAgentForm,
    setServerErrors: setAgentServerErrors,
  } = useFormValidation({
    initialValues: {
      name: "",
      email: "",
      companyName: "",
      commissionRate: 5.0,
      bankName: "",
      bankAccount: "",
      mobileMoney: "",
      password: "Password123!",
    },
    schema: createAgentSchema,
  });

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/agents");
      if (!res.ok) throw new Error("Failed to load agents");
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching agents";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

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
    paginatedData: displayedAgents,
  } = useTableState<AgentRecord>({
    data: agents,
    searchFields: [
      (a) => a.companyName || "",
      (a) => a.user.name || "",
      (a) => a.user.email,
      (a) => a.user.status,
      (a) => a.mobileMoney || "",
      (a) => a.bankName || "",
      (a) => a.bankAccount || "",
      (a) => a.clients.map((c) => c.companyName || ""),
    ],
    initialSortKey: "createdAt",
    initialSortOrder: "desc",
    initialPageSize: 10,
    initialFilters: { status: "ALL" },
    filterFn: (agent, currentFilters) => {
      if (currentFilters.status && currentFilters.status !== "ALL") {
        if (agent.user.status.toUpperCase() !== currentFilters.status.toUpperCase()) return false;
      }
      return true;
    },
    customSortFn: (a, b, key, order) => {
      let comp = 0;
      if (key === "name") {
        const nameA = a.companyName || a.user.name || "";
        const nameB = b.companyName || b.user.name || "";
        comp = nameA.localeCompare(nameB);
      } else if (key === "commissionRate") {
        comp = Number(a.commissionRate) - Number(b.commissionRate);
      } else if (key === "clients") {
        comp = (a._count?.clients || 0) - (b._count?.clients || 0);
      } else if (key === "status") {
        comp = a.user.status.localeCompare(b.user.status);
      } else if (key === "createdAt") {
        comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return order === "asc" ? comp : -comp;
    },
  });

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid } = validateAgentAll();
    if (!isValid) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agentForm.name.trim(),
          email: agentForm.email.trim(),
          password: agentForm.password,
          companyName: agentForm.companyName.trim() || undefined,
          commissionRate: Number(agentForm.commissionRate),
          bankName: agentForm.bankName.trim() || undefined,
          bankAccount: agentForm.bankAccount.trim() || undefined,
          mobileMoney: agentForm.mobileMoney.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          setAgentServerErrors(data.details);
        }
        throw new Error(data.error || "Failed to create agent");
      }

      toast.success(`Agent registered for ${agentForm.name}!`);
      setIsAddOpen(false);
      resetAgentForm();
      fetchAgents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating agent";
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sales Agents & Partners</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage channel resellers, commission payout parameters, and downstream clients.
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAgents()}
            disabled={loading}
            className="flex-1 sm:flex-initial"
            aria-label="Refresh agents list"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1 sm:flex-initial">
                <Plus className="mr-2 h-4 w-4" /> Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-lg p-0 overflow-hidden">
              <DialogHeader>
                <DialogTitle>Register New Sales Agent</DialogTitle>
                <DialogDescription>
                  Setup an affiliate account with customized commission rates and settlement coordinates.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddAgent} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <DialogBody>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="agentName" required>Agent / Contact Name</Label>
                      <Input
                        id="agentName"
                        placeholder="e.g. John Baptist"
                        value={agentForm.name}
                        onChange={(e) => setAgentField("name", e.target.value)}
                        onBlur={() => handleAgentBlur("name")}
                        error={agentTouched.name && Boolean(agentErrors.name)}
                        required
                      />
                      <InputError message={agentTouched.name ? agentErrors.name : undefined} />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="agentEmail" required>Agent Email</Label>
                      <Input
                        id="agentEmail"
                        type="email"
                        placeholder="john@reseller.ug"
                        value={agentForm.email}
                        onChange={(e) => setAgentField("email", e.target.value)}
                        onBlur={() => handleAgentBlur("email")}
                        error={agentTouched.email && Boolean(agentErrors.email)}
                        required
                      />
                      <InputError message={agentTouched.email ? agentErrors.email : undefined} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="agencyCompany">Agency / Business Name</Label>
                      <Input
                        id="agencyCompany"
                        placeholder="e.g. JB Solutions"
                        value={agentForm.companyName}
                        onChange={(e) => setAgentField("companyName", e.target.value)}
                        onBlur={() => handleAgentBlur("companyName")}
                        error={agentTouched.companyName && Boolean(agentErrors.companyName)}
                      />
                      <InputError message={agentTouched.companyName ? agentErrors.companyName : undefined} />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="commissionRate" required>Commission Rate (%)</Label>
                      <Input
                        id="commissionRate"
                        type="number"
                        step="0.5"
                        placeholder="5.0"
                        value={agentForm.commissionRate}
                        onChange={(e) => setAgentField("commissionRate", Number(e.target.value))}
                        onBlur={() => handleAgentBlur("commissionRate")}
                        error={agentTouched.commissionRate && Boolean(agentErrors.commissionRate)}
                        required
                      />
                      <InputError message={agentTouched.commissionRate ? agentErrors.commissionRate : undefined} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="mobileMoney">Mobile Money Settlement Number</Label>
                    <Input
                      id="mobileMoney"
                      placeholder="e.g. +256772123456"
                      value={agentForm.mobileMoney}
                      onChange={(e) => setAgentField("mobileMoney", e.target.value)}
                      onBlur={() => handleAgentBlur("mobileMoney")}
                      error={agentTouched.mobileMoney && Boolean(agentErrors.mobileMoney)}
                    />
                    <InputError message={agentTouched.mobileMoney ? agentErrors.mobileMoney : undefined} />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="agentPass" required>Initial Access Password</Label>
                    <Input
                      id="agentPass"
                      type="password"
                      value={agentForm.password}
                      onChange={(e) => setAgentField("password", e.target.value)}
                      onBlur={() => handleAgentBlur("password")}
                      error={agentTouched.password && Boolean(agentErrors.password)}
                      required
                    />
                    <InputError message={agentTouched.password ? agentErrors.password : undefined} />
                  </div>
                </DialogBody>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Registering..." : "Register Agent"}
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
              <h2 className="text-lg font-semibold tracking-tight">Active Sales Agents ({agents.length})</h2>
              <p className="text-xs text-muted-foreground">Directory of registered affiliate partners and agencies.</p>
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
                placeholder="Search company, agent name, email, phone..."
                className="pl-8 pr-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search agents"
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
                      column="name"
                      label="Agency & Contact"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="commissionRate"
                      label="Commission Rate"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="clients"
                      label="Referred Clients"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>Payout Method</TableHead>
                  <TableHead>
                    <SortableHeader
                      column="status"
                      label="Status"
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
                  <TableSkeletonRows columns={6} rows={5} />
                ) : displayedAgents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="font-medium text-foreground">No sales agents found.</p>
                        <p className="text-xs">Try clearing search terms or selecting a different filter.</p>
                        {(search || filters.status !== "ALL") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              clearSearch();
                              setFilter("status", "ALL");
                            }}
                          >
                            Reset Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedAgents.map((agent) => {
                    const rateNum = Number(agent.commissionRate);
                    return (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 mt-0.5">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{agent.companyName || agent.user.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {agent.user.name} • {agent.user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-semibold text-indigo-600 border-indigo-600/30">
                            {rateNum.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">
                            {agent._count.clients} client{agent._count.clients === 1 ? "" : "s"}
                          </div>
                          {agent.clients.length > 0 && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {agent.clients.map((c) => c.companyName).filter(Boolean).join(", ")}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {agent.mobileMoney ? (
                            <div>MoMo: <span className="text-foreground font-mono">{agent.mobileMoney}</span></div>
                          ) : agent.bankName ? (
                            <div>{agent.bankName} - <span className="font-mono">{agent.bankAccount}</span></div>
                          ) : (
                            <span className="italic">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {agent.user.status === "ACTIVE" ? (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-600/20 bg-emerald-500/10">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">{agent.user.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast.info(`Agent ID: ${agent.id} • ${agent.companyName}`);
                            }}
                          >
                            View Details
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
          {agents.length > 0 && (
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
