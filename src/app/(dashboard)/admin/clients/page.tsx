"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCw, Building2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [password, setPassword] = useState("Password123!");
  const [initialBalance, setInitialBalance] = useState("500000");

  const fetchClients = useCallback(async (query = "") => {
    try {
      setLoading(true);
      const url = query ? `/api/admin/clients?q=${encodeURIComponent(query)}` : "/api/admin/clients";
      const res = await fetch(url);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients(search);
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Contact name and email are required");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          companyName: companyName.trim() || name.trim(),
          industry: industry.trim() || "Telecommunications",
          password: password || "Password123!",
          initialBalance: Number(initialBalance) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create client");
      }

      toast.success(`Client ${companyName || name} created successfully!`);
      setIsAddOpen(false);
      // Reset form
      setName("");
      setEmail("");
      setCompanyName("");
      setIndustry("");
      setPassword("Password123!");
      setInitialBalance("500000");
      fetchClients(search);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create client";
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage registered business clients, wallet credits, and assigned agents.</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => fetchClients(search)} disabled={loading} className="flex-1 sm:flex-initial">
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
                <DialogTitle>Register New Client Account</DialogTitle>
                <DialogDescription>
                  Create a corporate client profile with an authenticated user and dedicated SMS wallet.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddClient} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <DialogBody>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" required>Company Name</Label>
                      <Input
                        id="companyName"
                        placeholder="e.g. Acme Africa Ltd"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        placeholder="e.g. Fintech, Retail"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" required>Primary Contact Person</Label>
                      <Input
                        id="name"
                        placeholder="e.g. Sarah Kintu"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" required>Official Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="sarah@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" required>Initial Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="balance">Initial Deposit (UGX)</Label>
                      <Input
                        id="balance"
                        type="number"
                        min="0"
                        step="10000"
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
                      />
                    </div>
                  </div>
                </DialogBody>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Client Account"}
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
                placeholder="Search by company, contact, or email..."
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
            Total: <span className="font-semibold text-foreground">{clients.length}</span> clients
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0">
          <div className="w-full">
            <Table className="min-w-[850px]">
            <TableHeader>
              <TableRow>
                <TableHead>Company & Contact</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Wallet Balance</TableHead>
                <TableHead>Agent Assigned</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeletonRows columns={7} rows={5} />
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No clients found matching your query.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => {
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
                          <span className="font-medium text-foreground">{client.agent.companyName || client.agent.user.name}</span>
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
        </CardContent>
      </Card>
    </div>
  );
}
