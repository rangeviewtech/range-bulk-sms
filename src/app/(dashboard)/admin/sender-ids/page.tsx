"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search, Check, X, ShieldAlert, AtSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

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
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  // Reject modal state
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const fetchSenderIds = useCallback(async (tab = activeTab, query = search) => {
    try {
      setLoading(true);
      let url = "/api/admin/sender-ids";
      const params = new URLSearchParams();
      if (tab !== "all") params.set("status", tab);
      if (query) params.set("q", query);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load Sender IDs");
      const data = await res.json();
      setSenderIds(data.senderIds || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching sender IDs";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    fetchSenderIds(activeTab, search);
  }, [activeTab, fetchSenderIds]);

  const handleApprove = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/sender-ids/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });

      if (!res.ok) throw new Error("Approval failed");
      toast.success(`Sender ID "${name}" approved successfully`);
      fetchSenderIds(activeTab, search);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve";
      toast.error(msg);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectId) return;
    try {
      setRejecting(true);
      const res = await fetch(`/api/admin/sender-ids/${rejectId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          reason: rejectReason.trim() || "Rejected by Administrator",
        }),
      });

      if (!res.ok) throw new Error("Rejection failed");
      toast.success("Sender ID rejected");
      setRejectId(null);
      setRejectReason("");
      fetchSenderIds(activeTab, search);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject";
      toast.error(msg);
    } finally {
      setRejecting(false);
    }
  };

  const handleSuspend = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/sender-ids/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suspend" }),
      });

      if (!res.ok) throw new Error("Suspension failed");
      toast.warning(`Sender ID "${name}" suspended`);
      fetchSenderIds(activeTab, search);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to suspend";
      toast.error(msg);
    }
  };

  const getStatusBadge = (status: SenderIdRecord["status"]) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-emerald-600/10 text-emerald-600 border-emerald-600/30">Approved</Badge>;
      case "PENDING":
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/30">Pending Review</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "SUSPENDED":
        return <Badge variant="outline" className="text-destructive border-destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sender ID Approvals</h1>
          <p className="text-muted-foreground">Verify regulatory UCC compliance and approve client alphanumeric sender masks.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchSenderIds(activeTab, search)} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sender ID..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchSenderIds(activeTab, search);
            }}
          />
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender ID Mask</TableHead>
                <TableHead>Client / Entity</TableHead>
                <TableHead>Purpose / Use Case</TableHead>
                <TableHead>Requested Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading Sender IDs...
                  </TableCell>
                </TableRow>
              ) : senderIds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No Sender IDs found for this status.
                  </TableCell>
                </TableRow>
              ) : (
                senderIds.map((item) => (
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
                              onClick={() => handleApprove(item.id, item.senderId)}
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
                              }}
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {item.status === "APPROVED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => handleSuspend(item.id, item.senderId)}
                          >
                            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                            Suspend
                          </Button>
                        )}
                        {(item.status === "SUSPENDED" || item.status === "REJECTED") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-emerald-600"
                            onClick={() => handleApprove(item.id, item.senderId)}
                          >
                            Re-Approve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reject Reason Dialog */}
      <Dialog open={!!rejectId} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Sender ID Request</DialogTitle>
            <DialogDescription>
              Please provide the official rejection reason to notify the requesting client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="e.g. Brand authorization letter required under UCC bulk messaging rules."
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)} disabled={rejecting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject} disabled={rejecting}>
              {rejecting ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
