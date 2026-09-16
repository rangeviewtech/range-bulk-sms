"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCw, UserCheck, Shield, KeyRound, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { format } from "date-fns";

interface UserRecord {
  id: string;
  name: string | null;
  email: string;
  status: string;
  mfaEnabled: boolean;
  createdAt: string;
  roles: {
    role: {
      id: string;
      name: string;
    };
  }[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Password123!");
  const [roleName, setRoleName] = useState("CLIENT");

  const fetchUsers = useCallback(async (query = "") => {
    try {
      setLoading(true);
      const url = query ? `/api/admin/users?q=${encodeURIComponent(query)}` : "/api/admin/users";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching users";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password || "Password123!",
          roleName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      toast.success(`User ${email} created with role ${roleName}!`);
      setIsAddOpen(false);
      setName("");
      setEmail("");
      setPassword("Password123!");
      setRoleName("CLIENT");
      fetchUsers(search);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating user";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (roles: UserRecord["roles"]) => {
    if (!roles || roles.length === 0) {
      return <Badge variant="secondary">User</Badge>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {roles.map((r) => {
          const roleNameUpper = r.role.name.toUpperCase();
          if (roleNameUpper === "ADMIN") {
            return (
              <Badge key={r.role.id} className="bg-rose-500/10 text-rose-600 border-rose-500/30">
                Admin
              </Badge>
            );
          }
          if (roleNameUpper === "AGENT") {
            return (
              <Badge key={r.role.id} className="bg-indigo-500/10 text-indigo-600 border-indigo-500/30">
                Agent
              </Badge>
            );
          }
          return (
            <Badge key={r.role.id} variant="secondary">
              Client
            </Badge>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Users</h1>
          <p className="text-muted-foreground">Manage user directory, RBAC role permissions, and multi-factor authentication security.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchUsers(search)} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <form onSubmit={handleAddUser}>
                <DialogHeader>
                  <DialogTitle>Create System User</DialogTitle>
                  <DialogDescription>
                    Provision a login identity with designated platform access levels.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="userName">Full Name</Label>
                    <Input
                      id="userName"
                      placeholder="e.g. David Mukasa"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Email Address</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder="david@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userPass">Initial Password</Label>
                    <Input
                      id="userPass"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userRole">Platform Role</Label>
                    <Select value={roleName} onValueChange={setRoleName}>
                      <SelectTrigger id="userRole">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">System Administrator (Full Access)</SelectItem>
                        <SelectItem value="AGENT">Sales Agent (Agent Portal)</SelectItem>
                        <SelectItem value="CLIENT">Direct Client (Messaging & Billing)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Account"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-sm flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
          </form>
          <div className="text-sm text-muted-foreground ml-auto">
            Total: <span className="font-semibold text-foreground">{users.length}</span> registered users
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Identity</TableHead>
                <TableHead>Role Assignment</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>2FA Security</TableHead>
                <TableHead>Registered Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading system users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No users matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded bg-primary/10 text-primary mt-0.5">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{u.name || "Unnamed User"}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(u.roles)}</TableCell>
                    <TableCell>
                      {u.status === "ACTIVE" ? (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-600/30 bg-emerald-500/10">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">{u.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.mfaEnabled ? (
                        <div className="flex items-center gap-1 text-xs text-emerald-600">
                          <Shield className="w-3.5 h-3.5" />
                          <span>Enabled</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Disabled</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(u.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          toast.info(`User ID: ${u.id} • ${u.email}`);
                        }}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
