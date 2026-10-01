'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  RefreshCw,
  Shield,
  User,
  X,
  ArrowDownUp,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TableSkeletonRows } from '@/components/blocks/ui/skeleton-layouts';
import { ConfirmationDialog } from '@/components/feedback/confirmation-dialog';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { z } from 'zod';
import { useFormValidation } from '@/hooks/use-form-validation';
import { InputError } from '@/components/ui/input-error';
import { useTableState } from '@/hooks/use-table-state';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Pagination } from '@/components/ui/pagination';

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

  // Status Change Confirmation State
  const [statusConfirm, setStatusConfirm] = useState<{
    open: boolean;
    user: UserRecord;
    nextStatus: 'ACTIVE' | 'SUSPENDED';
  } | null>(null);

  const handleRequestToggleStatus = (user: UserRecord) => {
    const nextStatus = user.status.toUpperCase() === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setStatusConfirm({
      open: true,
      user,
      nextStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusConfirm) return;
    const { user, nextStatus } = statusConfirm;
    setStatusConfirm(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user status');
      }

      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
      toast.success(
        `User ${user.email} status updated to ${nextStatus === 'ACTIVE' ? 'Active' : 'Suspended'}`
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error updating user status');
    }
  };

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
      name: '',
      email: '',
      password: 'Password123!',
      roleName: 'CLIENT' as 'ADMIN' | 'AGENT' | 'CLIENT',
    },
    schema: z.object({
      name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
      email: z.string().trim().email('Please enter a valid email address'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Must contain at least one number'),
      roleName: z.enum(['ADMIN', 'AGENT', 'CLIENT']),
    }),
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching users';
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
      (u) => u.name || '',
      (u) => u.email,
      (u) => u.roles.map((r) => r.role.name),
      (u) => u.status,
      (u) => (u.mfaEnabled ? '2FA Enabled MFA Protected' : '2FA Disabled'),
      (u) => u.id,
      (u) => u.createdAt,
    ],
    initialSortKey: 'createdAt',
    initialSortOrder: 'desc',
    initialPageSize: 10,
    initialFilters: { role: 'ALL', status: 'ALL' },
    filterFn: (user, currentFilters) => {
      if (currentFilters.role && currentFilters.role !== 'ALL') {
        const hasRole = user.roles.some(
          (r) => r.role.name.toUpperCase() === currentFilters.role.toUpperCase()
        );
        if (!hasRole) return false;
      }
      if (currentFilters.status && currentFilters.status !== 'ALL') {
        if (user.status.toUpperCase() !== currentFilters.status.toUpperCase()) return false;
      }
      return true;
    },
    customSortFn: (a, b, key, order) => {
      let comp = 0;
      if (key === 'name') {
        comp = (a.name || a.email).localeCompare(b.name || b.email);
      } else if (key === 'role') {
        const roleA = a.roles[0]?.role.name || '';
        const roleB = b.roles[0]?.role.name || '';
        comp = roleA.localeCompare(roleB);
      } else if (key === 'status') {
        comp = a.status.localeCompare(b.status);
      } else if (key === 'mfaEnabled') {
        comp = (a.mfaEnabled ? 1 : 0) - (b.mfaEnabled ? 1 : 0);
      } else if (key === 'createdAt') {
        comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return order === 'asc' ? comp : -comp;
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
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        throw new Error(data.error || 'Failed to create user');
      }

      toast.success(`User ${userForm.email} created with role ${userForm.roleName}!`);
      setIsAddOpen(false);
      resetUserForm();
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating user';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (roles: UserRecord['roles']) => {
    if (!roles || roles.length === 0) {
      return <Badge variant="secondary">User</Badge>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {roles.map((r) => {
          const roleNameUpper = r.role.name.toUpperCase();
          if (roleNameUpper === 'ADMIN') {
            return (
              <Badge key={r.role.id} className="border-rose-500/30 bg-rose-500/10 text-rose-600">
                Admin
              </Badge>
            );
          }
          if (roleNameUpper === 'AGENT') {
            return (
              <Badge
                key={r.role.id}
                className="border-indigo-500/30 bg-indigo-500/10 text-indigo-600"
              >
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
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">System Users</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Manage user directory, RBAC role permissions, and multi-factor authentication security.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers()}
            disabled={loading}
            className="flex-1 sm:flex-initial"
            aria-label="Refresh users list"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1 sm:flex-initial">
                <Plus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-md overflow-hidden p-0">
              <DialogHeader>
                <DialogTitle>Create System User</DialogTitle>
                <DialogDescription>
                  Provision a login identity with designated platform access levels.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleAddUser}
                noValidate
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                <DialogBody>
                  <div className="space-y-1">
                    <Label htmlFor="userName" required>
                      Full Name
                    </Label>
                    <Input
                      id="userName"
                      placeholder="e.g. David Mukasa"
                      value={userForm.name}
                      onChange={(e) => setUserField('name', e.target.value)}
                      onBlur={() => handleUserBlur('name')}
                      aria-invalid={userTouched.name && Boolean(userErrors.name)}
                      aria-describedby={
                        userTouched.name && userErrors.name ? 'userName-error' : undefined
                      }
                      required
                    />
                    <InputError
                      id="userName-error"
                      message={userTouched.name ? userErrors.name : undefined}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="userEmail" required>
                      Email Address
                    </Label>
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder="david@example.com"
                      value={userForm.email}
                      onChange={(e) => setUserField('email', e.target.value)}
                      onBlur={() => handleUserBlur('email')}
                      aria-invalid={userTouched.email && Boolean(userErrors.email)}
                      aria-describedby={
                        userTouched.email && userErrors.email ? 'userEmail-error' : undefined
                      }
                      required
                    />
                    <InputError
                      id="userEmail-error"
                      message={userTouched.email ? userErrors.email : undefined}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="userPass" required>
                      Initial Password
                    </Label>
                    <Input
                      id="userPass"
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserField('password', e.target.value)}
                      onBlur={() => handleUserBlur('password')}
                      aria-invalid={userTouched.password && Boolean(userErrors.password)}
                      aria-describedby={
                        userTouched.password && userErrors.password ? 'userPass-error' : undefined
                      }
                      required
                    />
                    <InputError
                      id="userPass-error"
                      message={userTouched.password ? userErrors.password : undefined}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="userRole" required>
                      Platform Role
                    </Label>
                    <Select
                      value={userForm.roleName}
                      onValueChange={(val) =>
                        setUserField('roleName', val as 'ADMIN' | 'AGENT' | 'CLIENT')
                      }
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Account'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="flex flex-col space-y-4 p-4 pb-4 sm:p-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                System Accounts ({users.length})
              </h2>
              <p className="text-muted-foreground text-xs">
                Directory of administrators, agents, and platform clients.
              </p>
            </div>
            <div className="text-muted-foreground text-xs">
              Filtered: <span className="text-foreground font-semibold">{totalItems}</span> matching
            </div>
          </div>

          {/* Filtering and Search Toolbar */}
          <div className="flex flex-col items-stretch justify-between gap-3 pt-2 lg:flex-row lg:items-center">
            {/* Multi-field search */}
            <div className="relative max-w-md flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="admin-users-search"
                name="admin-users-search"
                placeholder="Search by name, email, role, status, ID..."
                className="pr-8 pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search users"
              />
              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5"
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
                  name="filter-user-role"
                  value={filters.role || 'ALL'}
                  onValueChange={(val) => setFilter('role', val)}
                >
                  <SelectTrigger
                    id="filter-user-role"
                    className="h-9 text-xs"
                    aria-label="Filter by role"
                  >
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
                  name="filter-user-status"
                  value={filters.status || 'ALL'}
                  onValueChange={(val) => setFilter('status', val)}
                >
                  <SelectTrigger
                    id="filter-user-status"
                    className="h-9 text-xs"
                    aria-label="Filter by status"
                  >
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    {distinctStatuses
                      .filter((s) => s !== 'ACTIVE' && s !== 'SUSPENDED')
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
                onClick={() => toggleSort(sortKey || 'createdAt')}
                title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                aria-label="Toggle sort order"
              >
                <ArrowDownUp className="mr-1 h-3.5 w-3.5" />
                <span className="hidden sm:inline">Order:</span> {sortOrder.toUpperCase()}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-0 sm:p-6">
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
                  <TableHead className="hidden md:table-cell">
                    <SortableHeader
                      column="status"
                      label="Account Status"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <SortableHeader
                      column="mfaEnabled"
                      label="2FA Security"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
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
                    <TableCell colSpan={6} className="text-muted-foreground py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-foreground font-medium">No users matching criteria.</p>
                        <p className="text-xs">Try adjusting your search query or filters.</p>
                        {(search || filters.role !== 'ALL' || filters.status !== 'ALL') && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              clearSearch();
                              setFilter('role', 'ALL');
                              setFilter('status', 'ALL');
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
                          <div className="bg-brand-blue/10 text-brand-blue dark:bg-brand-yellow/15 dark:text-brand-yellow mt-0.5 rounded-2xl p-1.5">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-foreground font-medium">
                              {u.name || 'Unnamed User'}
                            </p>
                            <p className="text-muted-foreground text-xs">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(u.roles)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <button
                          type="button"
                          onClick={() => handleRequestToggleStatus(u)}
                          title={
                            u.status === 'ACTIVE'
                              ? `Click to suspend ${u.name || u.email}`
                              : `Click to activate ${u.name || u.email}`
                          }
                          aria-label={`Toggle user status for ${u.email}. Currently ${u.status}.`}
                          className={cn(
                            'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all select-none',
                            u.status === 'ACTIVE'
                              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
                              : 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              u.status === 'ACTIVE'
                                ? 'animate-pulse bg-emerald-500'
                                : 'bg-destructive'
                            )}
                          />
                          {u.status === 'ACTIVE'
                            ? 'Active'
                            : u.status === 'SUSPENDED'
                              ? 'Suspended'
                              : u.status}
                        </button>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {u.mfaEnabled ? (
                          <div className="flex items-center gap-1 text-xs text-emerald-600">
                            <Shield className="h-3.5 w-3.5" />
                            <span>Enabled</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Disabled</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden text-xs lg:table-cell">
                        {format(new Date(u.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRequestToggleStatus(u)}
                            className="text-muted-foreground hover:text-foreground h-8 w-8"
                            title={
                              u.status === 'ACTIVE'
                                ? 'Suspend user account'
                                : 'Activate user account'
                            }
                            aria-label={`Toggle status for ${u.email}`}
                          >
                            {u.status === 'ACTIVE' ? (
                              <ToggleRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <ToggleLeft className="text-destructive h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast.info(`User ID: ${u.id} • ${u.email}`);
                            }}
                          >
                            Details
                          </Button>
                        </div>
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

      {/* User Status Change Confirmation Dialog */}
      <ConfirmationDialog
        open={Boolean(statusConfirm?.open)}
        onOpenChange={(open) => !open && setStatusConfirm(null)}
        title={
          statusConfirm?.nextStatus === 'SUSPENDED'
            ? `Suspend User ${statusConfirm?.user.name || statusConfirm?.user.email}?`
            : `Activate User ${statusConfirm?.user.name || statusConfirm?.user.email}?`
        }
        description={
          statusConfirm?.nextStatus === 'SUSPENDED'
            ? `Are you sure you want to suspend "${statusConfirm?.user.email}"? The user will immediately lose access to their account, API keys, and active sessions.`
            : `Are you sure you want to reactivate "${statusConfirm?.user.email}"? They will regain full access to their dashboard, campaigns, and API integrations.`
        }
        confirmLabel={
          statusConfirm?.nextStatus === 'SUSPENDED' ? 'Yes, Suspend User' : 'Yes, Activate User'
        }
        variant={statusConfirm?.nextStatus === 'SUSPENDED' ? 'destructive' : 'default'}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}
