"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TableSkeletonRows } from "@/components/blocks/ui/skeleton-layouts";
import { RefreshCw, Search, Check, X, ShieldAlert, AtSign, ArrowDownUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { InputError } from "@/components/ui/input-error";
import { useTableState } from "@/hooks/use-table-state";
import { SortableHeader } from "@/components/ui/sortable-header";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog";

interface SenderIdRecord {
  id: string;
  senderId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" | "EXPIRED";
  purpose: string | null;
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  client: {
    id: string;
    companyName: string | null;
  } | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function SenderIdsPage() {
  const [senderIds, setSenderIds] = useState<SenderIdRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Reject modal state
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonTouched, setRejectReasonTouched] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const rejectReasonError = useMemo(() => {
    if (!rejectReasonTouched) return "";
    if (!rejectReason.trim()) return "Rejection reason is required";
    if (rejectReason.trim().length < 5) return "Rejection reason must be at least 5 characters";
    return "";
  }, [rejectReason, rejectReasonTouched]);

  const fetchSenderIds = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/sender-ids");
      if (!res.ok) throw new Error("Failed to load Sender IDs");
      const data = await res.json();
      setSenderIds(data.senderIds || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching sender IDs";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSenderIds();
  }, [fetchSenderIds]);

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
    paginatedData: displayedSenderIds,
  } = useTableState<SenderIdRecord>({
    data: senderIds,
    searchFields: [
      "senderId",
      (s) => s.purpose || "",
      "status",
      (s) => s.client?.companyName || "",
      (s) => s.user.name || "",
      (s) => s.user.email,
      "createdAt",
      (s) => s.approvedAt || "",
    ],
    initialSortKey: "createdAt",
    initialSortOrder: "desc",
    initialPageSize: 10,
    initialFilters: { status: "all" },
    filterFn: (item, currentFilters) => {
      const targetStatus = currentFilters.status;
      if (targetStatus && targetStatus !== "all" && targetStatus !== "ALL") {
        if (item.status.toLowerCase() !== targetStatus.toLowerCase()) return false;
      }
      return true;
    },
    customSortFn: (a, b, key, order) => {
      let comp = 0;
      if (key === "senderId") {
        comp = a.senderId.localeCompare(b.senderId);
      } else if (key === "client") {
        const nameA = a.client?.companyName || a.user.name || a.user.email;
        const nameB = b.client?.companyName || b.user.name || b.user.email;
        comp = nameA.localeCompare(nameB);
      } else if (key === "purpose") {
        comp = (a.purpose || "").localeCompare(b.purpose || "");
      } else if (key === "status") {
        comp = a.status.localeCompare(b.status);
      } else if (key === "createdAt") {
        comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return order === "asc" ? comp : -comp;
    },
  });

  const [approveConfirm, setApproveConfirm] = useState<{
    open: boolean;
    id: string;
    senderId: string;
    clientName: string;
  } | null>(null);

  const handleApprove = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/sender-ids/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });

      if (!res.ok) throw new Error("Approval failed");
      toast.success(`Sender ID "${name}" approved successfully`);
      fetchSenderIds();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve";
      toast.error(msg);
    }
  };

  const handleRequestApprove = (id: string, senderId: string, clientName: string) => {
    setApproveConfirm({
      open: true,
      id,
      senderId,
      clientName,
    });
  };

  const handleConfirmApprove = async () => {
    if (!approveConfirm) return;
    const { id, senderId } = approveConfirm;
    setApproveConfirm(null);
    await handleApprove(id, senderId);
  };

  const handleConfirmReject = async () => {
    if (!rejectId) return;
    setRejectReasonTouched(true);
    if (!rejectReason.trim() || rejectReason.trim().length < 5) return;

    try {
      setRejecting(true);
      const res = await fetch(`/api/admin/sender-ids/${rejectId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason: rejectReason.trim() }),
      });

      if (!res.ok) throw new Error("Rejection failed");
      toast.success("Sender ID rejected");
      setRejectId(null);
      setRejectReason("");
      setRejectReasonTouched(false);
      fetchSenderIds();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject";
      toast.error(msg);
    } finally {
      setRejecting(false);
    }
  };

  const getStatusBadge = (status: SenderIdRecord["status"]) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            Pending Review
          </Badge>
        );
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "SUSPENDED":
        return <Badge variant="outline" className="text-destructive border-destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sender ID Approvals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Verify regulatory UCC compliance and approve client alphanumeric sender masks.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchSenderIds()}
          disabled={loading}
          aria-label="Refresh sender IDs"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <Tabs
          value={filters.status || "all"}
          onValueChange={(val) => setFilter("status", val)}
          className="w-full md:w-auto"
        >
          <TabsList className="w-full md:w-auto h-auto flex-wrap">
            <TabsTrigger value="all">All ({senderIds.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search mask, client, email..."
              className="pl-9 pr-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search sender IDs"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
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

      {/* Main Table Card */}
      <Card>
        <CardContent className="p-0 sm:p-6">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHeader
                      column="senderId"
                      label="Sender ID Mask"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="client"
                      label="Client / Entity"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="purpose"
                      label="Purpose / Use Case"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="createdAt"
                      label="Requested Date"
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeletonRows columns={6} rows={5} />
                ) : displayedSenderIds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <p className="font-medium text-foreground">No Sender IDs found matching criteria.</p>
                      <p className="text-xs mt-1">Try selecting a different tab or clearing search filters.</p>
                      {(search || filters.status !== "all") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            clearSearch();
                            setFilter("status", "all");
                          }}
                        >
                          Reset Filters
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedSenderIds.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded bg-primary/10 text-primary">
                            <AtSign className="w-4 h-4" />
                          </div>
                          <span className="font-mono font-bold text-base tracking-wider text-foreground">
                            {item.senderId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">
                          {item.client?.companyName || item.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.user.email}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[240px] truncate">
                        {item.purpose || "Transactional & Marketing Alerts"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(item.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {item.status === "PENDING" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-600/30"
                                onClick={() => handleRequestApprove(item.id, item.senderId, item.client?.companyName || item.user.name || item.user.email)}
                              >
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                onClick={() => {
                                  setRejectId(item.id);
                                  setRejectReason("");
                                  setRejectReasonTouched(false);
                                }}
                              >
                                <X className="w-3.5 h-3.5 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {item.status === "APPROVED" && (
                            <span className="text-xs text-muted-foreground italic">Active on Network</span>
                          )}
                          {item.status === "REJECTED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                toast.info(`Rejection Note: ${item.rejectionReason || "No details provided"}`);
                              }}
                            >
                              Reason
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {senderIds.length > 0 && (
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

      {/* Rejection Reason Modal */}
      <Dialog open={Boolean(rejectId)} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              Reject Sender ID
            </DialogTitle>
            <DialogDescription>
              State the regulatory or policy violation reason to inform the client entity.
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="space-y-1">
              <Label htmlFor="rejectReason" required>
                Rejection Reason (UCC / Network Compliance)
              </Label>
              <Textarea
                id="rejectReason"
                rows={3}
                placeholder="e.g. Requires trademark proof or registration certificate matching brand name..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                onBlur={() => setRejectReasonTouched(true)}
                error={Boolean(rejectReasonError)}
                required
              />
              <InputError message={rejectReasonError} />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectId(null)}
              disabled={rejecting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={rejecting}
            >
              {rejecting ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Approving Sender ID */}
      <ConfirmationDialog
        open={Boolean(approveConfirm?.open)}
        onOpenChange={(open) => !open && setApproveConfirm(null)}
        title="Approve Sender ID"
        description={`Are you sure you want to approve Sender ID "${approveConfirm?.senderId}" for client "${approveConfirm?.clientName}"? This alphanumeric mask will immediately be activated for network message dispatching.`}
        confirmLabel="Approve Sender ID"
        cancelLabel="Cancel"
        variant="default"
        onConfirm={handleConfirmApprove}
      />
    </div>
  );
}
