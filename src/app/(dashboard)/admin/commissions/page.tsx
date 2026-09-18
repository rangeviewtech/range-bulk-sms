"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle2, DollarSign, CreditCard, Building2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface CommissionRecord {
  id: string;
  amount: number | string;
  status: "PENDING" | "APPROVED" | "PAID" | "REVERSED";
  createdAt: string;
  approvedAt: string | null;
  paidAt: string | null;
  agent: {
    id: string;
    companyName: string | null;
    bankName: string | null;
    bankAccount: string | null;
    mobileMoney: string | null;
    user: {
      name: string | null;
      email: string;
    };
  };
  client: {
    id: string;
    companyName: string | null;
  } | null;
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchCommissions = useCallback(async (tab = activeTab) => {
    try {
      setLoading(true);
      const url = tab === "all" ? "/api/admin/commissions" : `/api/admin/commissions?status=${tab}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load commissions");
      const data = await res.json();
      setCommissions(data.commissions || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching commissions";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchCommissions(activeTab);
  }, [activeTab, fetchCommissions]);

  const handleAction = async (id: string, action: "approve" | "pay") => {
    try {
      setProcessingId(id);
      const res = await fetch(`/api/admin/commissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action}`);

      toast.success(
        action === "approve"
          ? "Commission approved for payout"
          : "Commission paid and credited to agent wallet"
      );
      fetchCommissions(activeTab);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Error during ${action}`;
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: CommissionRecord["status"]) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-emerald-600/10 text-emerald-600 border-emerald-600/30">Paid Out</Badge>;
      case "APPROVED":
        return <Badge className="bg-blue-600/10 text-blue-600 border-blue-600/30">Approved</Badge>;
      case "PENDING":
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/30">Pending</Badge>;
      case "REVERSED":
        return <Badge variant="destructive">Reversed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Commissions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage agent commission statements, authorizations, and automated wallet disbursements.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchCommissions(activeTab)} disabled={loading} className="w-full sm:w-auto">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap sm:flex-nowrap h-auto gap-1 p-1 w-full sm:w-auto">
          <TabsTrigger value="all" className="flex-1 sm:flex-initial text-xs sm:text-sm">All</TabsTrigger>
          <TabsTrigger value="pending" className="flex-1 sm:flex-initial text-xs sm:text-sm">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved" className="flex-1 sm:flex-initial text-xs sm:text-sm">Approved for Payout</TabsTrigger>
          <TabsTrigger value="paid" className="flex-1 sm:flex-initial text-xs sm:text-sm">Settled / Paid</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main Table Card */}
      <Card>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto min-w-[800px]">
            <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>Sales Agent</TableHead>
                <TableHead>Client Account</TableHead>
                <TableHead>Commission Amount</TableHead>
                <TableHead>Disbursement Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading commissions...
                  </TableCell>
                </TableRow>
              ) : commissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No commissions found for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                commissions.map((c) => {
                  const amt = Number(c.amount);
                  const isProcessing = processingId === c.id;

                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-600 mt-0.5">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{c.agent.companyName || c.agent.user.name}</p>
                            <p className="text-xs text-muted-foreground">{c.agent.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{c.client?.companyName || "Direct Billing"}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(c.createdAt), "MMM dd, yyyy")}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-base text-foreground font-mono">
                          UGX {amt.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {c.agent.mobileMoney ? (
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>MoMo: <strong className="text-foreground">{c.agent.mobileMoney}</strong></span>
                          </div>
                        ) : c.agent.bankName ? (
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{c.agent.bankName}: <strong className="text-foreground">{c.agent.bankAccount}</strong></span>
                          </div>
                        ) : (
                          <span className="italic">Wallet Credit</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(c.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {c.status === "PENDING" && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isProcessing}
                              className="text-blue-600 border-blue-600/30 hover:bg-blue-50"
                              onClick={() => handleAction(c.id, "approve")}
                            >
                              Approve
                            </Button>
                          )}
                          {c.status === "APPROVED" && (
                            <Button
                              size="sm"
                              disabled={isProcessing}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleAction(c.id, "pay")}
                            >
                              <DollarSign className="w-3.5 h-3.5 mr-1" />
                              Pay Out
                            </Button>
                          )}
                          {c.status === "PAID" && (
                            <div className="flex items-center gap-1 text-xs text-emerald-600">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Settled</span>
                            </div>
                          )}
                        </div>
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
