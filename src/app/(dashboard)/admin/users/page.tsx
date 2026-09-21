"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCw, Shield, User, X, ArrowDownUp } from "lucide-react";
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
import { format } from "date-fns";
import { z } from "zod";
import { useFormValidation } from "@/hooks/use-form-validation";
import { InputError } from "@/components/ui/input-error";
import { useTableState } from "@/hooks/use-table-state";
import { SortableHeader } from "@/components/ui/sortable-header";
import { Pagination } from "@/components/ui/pagination";

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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    values: userForm,
    errors: userErrors,
    touched: userTouched,
    setFieldValue: setUserField,
    handleBlur: handleUserBlur,
    validateAll: validateUserAll,
    reset: resetUserForm,
    setServerErrors: setUserServerErrors,
  } = useFormValidation({
    initialValues: {
      name: "",
      email: "",
      password: "Password123!",
      roleName: "CLIENT" as "ADMIN" | "AGENT" | "CLIENT",
    },
    schema: z.object({
      name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
      email: z.string().trim().email("Please enter a valid email address"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[a-z]/, "Must contain at least one lowercase letter")
        .regex(/[0-9]/, "Must contain at least one number"),
      roleName: z.enum(["ADMIN", "AGENT", "CLIENT"]),
    }),
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
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
    paginatedData: displayedUsers,
  } = useTableState<UserRecord>({
    data: users,
    searchFields: [
      (u) => u.name || "",
      (u) => u.email,
      (u) => u.roles.map((r) => r.role.name),
      (u) => u.status,
      (u) => (u.mfaEnabled ? "2FA Enabled MFA Protected" : "2FA Disabled"),
      (u) => u.id,
      (u) => u.createdAt,
    ],
    initialSortKey: "createdAt",
    initialSortOrder: "desc",
    initialPageSize: 10,
    initialFilters: { role: "ALL", status: "ALL" },
    filterFn: (user, currentFilters) => {
      if (currentFilters.role && currentFilters.role !== "ALL") {
        const hasRole = user.roles.some(
          (r) => r.role.name.toUpperCase() === currentFilters.role.toUpperCase()
        );
        if (!hasRole) return false;
      }
      if (currentFilters.status && currentFilters.status !== "ALL") {
        if (user.status.toUpperCase() !== currentFilters.status.toUpperCase()) return false;
      }
      return true;
    },
    customSortFn: (a, b, key, order) => {
      let comp = 0;
      if (key === "name") {
        comp = (a.name || a.email).localeCompare(b.name || b.email);
      } else if (key === "role") {
        const roleA = a.roles[0]?.role.name || "";
        const roleB = b.roles[0]?.role.name || "";
        comp = roleA.localeCompare(roleB);
      } else if (key === "status") {
        comp = a.status.localeCompare(b.status);
      } else if (key === "mfaEnabled") {
        comp = (a.mfaEnabled ? 1 : 0) - (b.mfaEnabled ? 1 : 0);
      } else if (key === "createdAt") {
        comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return order === "asc" ? comp : -comp;
    },
  });

  // Extract distinct roles and statuses dynamically
  const distinctStatuses = useMemo(() => {
    const statuses = new Set<string>();
    users.forEach((u) => {
      if (u.status) statuses.add(u.status.toUpperCase());
    });
    return Array.from(statuses);
  }, [users]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid } = validateUserAll();
    if (!isValid) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userForm.name.trim(),
          email: userForm.email.trim(),
          password: userForm.password,
          roleName: userForm.roleName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          setUserServerErrors(data.details);
        }
        throw new Error(data.error || "Failed to create user");
      }

      toast.success(`User ${userForm.email} created with role ${userForm.roleName}!`);
      setIsAddOpen(false);
      resetUserForm();
      fetchUsers();
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage user directory, RBAC role permissions, and multi-factor authentication security.
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers()}
            disabled={loading}
            className="flex-1 sm:flex-initial"
            aria-label="Refresh users list"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1 sm:flex-initial">
                <Plus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-md p-0 overflow-hidden">
              <DialogHeader>
                <DialogTitle>Create System User</DialogTitle>
                <DialogDescription>
                  Provision a login identity with designated platform access levels.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddUser} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <DialogBody>
                  <div className="space-y-1">
                    <Label htmlFor="userName" required>Full Name</Label>
                    <Input
                      id="userName"
                      placeholder="e.g. David Mukasa"
                      value={userForm.name}
                      onChange={(e) => setUserField("name", e.target.value)}
                      onBlur={() => handleUserBlur("name")}
                      error={userTouched.name && Boolean(userErrors.name)}
                      required
                    />
                    <InputError message={userTouched.name ? userErrors.name : undefined} />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="userEmail" required>Email Address</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder="david@example.com"
                      value={userForm.email}
                      onChange={(e) => setUserField("email", e.target.value)}
                      onBlur={() => handleUserBlur("email")}
                      error={userTouched.email && Boolean(userErrors.email)}
                      required
                    />
                    <InputError message={userTouched.email ? userErrors.email : undefined} />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="userPass" required>Initial Password</Label>
                    <Input
                      id="userPass"
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserField("password", e.target.value)}
                      onBlur={() => handleUserBlur("password")}
                      error={userTouched.password && Boolean(userErrors.password)}
                      required
                    />
                    <InputError message={userTouched.password ? userErrors.password : undefined} />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="userRole" required>Platform Role</Label>
                    <Select
                      value={userForm.roleName}
                      onValueChange={(val) => setUserField("roleName", val as "ADMIN" | "AGENT" | "CLIENT")}
                    >
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
                </DialogBody>

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
        <CardHeader className="flex flex-col space-y-4 p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">System Accounts ({users.length})</h2>
              <p className="text-xs text-muted-foreground">Directory of administrators, agents, and platform clients.</p>
            </div>
            <div className="text-xs text-muted-foreground">
              Filtered: <span className="font-semibold text-foreground">{totalItems}</span> matching
            </div>
          </div>

          {/* Filtering and Search Toolbar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2">
            {/* Multi-field search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, role, status, ID..."
                className="pl-8 pr-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search users"
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
              {/* Role filter */}
              <div className="w-36">
                <Select
                  value={filters.role || "ALL"}
                  onValueChange={(val) => setFilter("role", val)}
                >
                  <SelectTrigger className="h-9 text-xs" aria-label="Filter by role">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="AGENT">Agent</SelectItem>
                    <SelectItem value="CLIENT">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                    {distinctStatuses
                      .filter((s) => s !== "ACTIVE" && s !== "SUSPENDED")
                      .map((st) => (
                        <SelectItem key={st} value={st}>
                          {st}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

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
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHeader
                      column="name"
                      label="User Identity"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="role"
                      label="Role Assignment"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="status"
                      label="Account Status"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="mfaEnabled"
                      label="2FA Security"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="createdAt"
                      label="Registered Date"
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
                ) : displayedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="font-medium text-foreground">No users matching criteria.</p>
                        <p className="text-xs">Try adjusting your search query or filters.</p>
                        {(search || filters.role !== "ALL" || filters.status !== "ALL") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              clearSearch();
                              setFilter("role", "ALL");
                              setFilter("status", "ALL");
                            }}
                          >
                            Reset All Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedUsers.map((u) => (
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
                        ) : u.status === "SUSPENDED" ? (
                          <Badge variant="destructive">Suspended</Badge>
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
          </div>

          {/* Pagination Controls */}
          {users.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 20, 50, 100]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
