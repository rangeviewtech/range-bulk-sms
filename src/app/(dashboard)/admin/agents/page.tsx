"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCw, Briefcase } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [commissionRate, setCommissionRate] = useState("5.0");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [mobileMoney, setMobileMoney] = useState("");
  const [password, setPassword] = useState("Password123!");

  const fetchAgents = useCallback(async (query = "") => {
    try {
      setLoading(true);
      const url = query ? `/api/admin/agents?q=${encodeURIComponent(query)}` : "/api/admin/agents";
      const res = await fetch(url);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAgents(search);
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Contact name and email are required");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          companyName: companyName.trim() || name.trim(),
          commissionRate: Number(commissionRate) || 5.0,
          bankName: bankName.trim(),
          bankAccount: bankAccount.trim(),
          mobileMoney: mobileMoney.trim(),
          password: password || "Password123!",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create agent");
      }

      toast.success(`Agent ${companyName || name} registered successfully!`);
      setIsAddOpen(false);
      // Reset form
      setName("");
      setEmail("");
      setCompanyName("");
      setCommissionRate("5.0");
      setBankName("");
      setBankAccount("");
      setMobileMoney("");
      setPassword("Password123!");
      fetchAgents(search);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create agent";
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage authorized sales agents, commission rates, and referral performance.</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => fetchAgents(search)} disabled={loading} className="flex-1 sm:flex-initial">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1 sm:flex-initial">
                <Plus className="mr-2 h-4 w-4" /> Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
              <form onSubmit={handleAddAgent}>
                <DialogHeader>
                  <DialogTitle>Register New Sales Agent</DialogTitle>
                  <DialogDescription>
                    Create an agent account with custom commission rates and payment details.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="agentCompany">Agency / Business Name</Label>
                      <Input
                        id="agentCompany"
                        placeholder="e.g. Apex Telecom Ltd"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rate">Commission Rate (%)</Label>
                      <Input
                        id="rate"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="agentName">Primary Contact Person</Label>
                      <Input
                        id="agentName"
                        placeholder="e.g. Patrick Okello"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agentEmail">Official Email</Label>
                      <Input
                        id="agentEmail"
                        type="email"
                        placeholder="patrick@apextelecom.co.ug"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="agentPassword">Initial Password</Label>
                      <Input
                        id="agentPassword"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobileMoney">Mobile Money Number</Label>
                      <Input
                        id="mobileMoney"
                        placeholder="+256770000000"
                        value={mobileMoney}
                        onChange={(e) => setMobileMoney(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Settlement Bank</Label>
                      <Input
                        id="bankName"
                        placeholder="e.g. Stanbic Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankAccount">Bank Account No.</Label>
                      <Input
                        id="bankAccount"
                        placeholder="9030012345678"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
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
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 space-y-0 p-4 sm:p-6">
          <form onSubmit={handleSearch} className="relative flex-1 w-full max-w-sm flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company, agent name, email..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
          </form>
          <div className="text-sm text-muted-foreground sm:ml-auto">
            Total: <span className="font-semibold text-foreground">{agents.length}</span> agents
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0">
          <div className="w-full">
            <Table className="min-w-[850px]">
            <TableHeader>
              <TableRow>
                <TableHead>Agency & Contact</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Referred Clients</TableHead>
                <TableHead>Payout Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeletonRows columns={6} rows={5} />
              ) : agents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No sales agents found.
                  </TableCell>
                </TableRow>
              ) : (
                agents.map((agent) => {
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
        </CardContent>
      </Card>
    </div>
  );
}
