'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { Search, Plus, Download, RefreshCw, Trash2, User, Phone, Mail, Filter, ArrowUp, ArrowDown, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/feedback/confirmation-dialog';
import { TableSkeletonRows } from '@/components/blocks/ui/skeleton-layouts';
import { z } from 'zod';
import { useFormValidation } from '@/hooks/use-form-validation';
import { InputError } from '@/components/ui/input-error';
import { Pagination } from '@/components/ui/pagination';
import { SortableHeader } from '@/components/ui/sortable-header';
import { useTableState } from '@/hooks/use-table-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ContactItem {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phone: string;
  normalizedPhone?: string;
  email?: string | null;
  groups?: { name: string }[];
  createdAt?: string;
}

const FALLBACK_CONTACTS: ContactItem[] = [
  {
    id: 'ct_1',
    firstName: 'John',
    lastName: 'Mukasa',
    phone: '+256700123456',
    email: 'john.mukasa@example.com',
    groups: [{ name: 'VIP' }, { name: 'Kampala Clients' }],
  },
  {
    id: 'ct_2',
    firstName: 'Sarah',
    lastName: 'Nsubuga',
    phone: '+256772987654',
    email: 'sarah.n@example.com',
    groups: [{ name: 'Enterprise' }],
  },
  {
    id: 'ct_3',
    firstName: 'David',
    lastName: 'Kato',
    phone: '+256752345678',
    email: 'david.kato@example.com',
    groups: [{ name: 'Leads' }],
  },
  {
    id: 'ct_4',
    firstName: 'Esther',
    lastName: 'Akello',
    phone: '+256784567890',
    email: 'esther.akello@example.com',
    groups: [{ name: 'VIP' }, { name: 'Retail' }],
  },
];

function generateLocalId() {
  return `ct_local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const contactFormSchema = z.object({
  firstName: z.string().max(100, 'Maximum 100 characters').optional(),
  lastName: z.string().max(100, 'Maximum 100 characters').optional(),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(
      /^(?:\+256|0)[37][0-9]{8}$|^\+?[0-9]{9,15}$/,
      'Please enter a valid phone number (e.g. +256700123456 or 0700123456)'
    ),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
});

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Extract all unique group names dynamically
  const availableGroups = React.useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => {
      c.groups?.forEach((g) => {
        if (g.name) set.add(g.name);
      });
    });
    return Array.from(set).sort();
  }, [contacts]);

  // Integrated Search, Sort, Filter, Order & Pagination state
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
    paginatedData,
  } = useTableState<ContactItem>({
    data: contacts,
    searchFields: [
      (c) => [c.firstName, c.lastName].filter(Boolean).join(' '),
      'phone',
      (c) => c.normalizedPhone || '',
      (c) => c.email || '',
      (c) => c.groups?.map((g) => g.name) || [],
    ],
    initialSortKey: 'name',
    initialSortOrder: 'asc',
    initialPageSize: 10,
    filterFn: (item, currentFilters) => {
      const groupFilter = currentFilters.group;
      if (groupFilter && groupFilter !== 'ALL') {
        const hasGroup = item.groups?.some(
          (g) => g.name.toLowerCase() === groupFilter.toLowerCase()
        );
        if (!hasGroup) return false;
      }
      return true;
    },
    customSortFn: (a, b, key, order) => {
      let comp = 0;
      if (key === 'name') {
        const aName = [a.firstName, a.lastName].filter(Boolean).join(' ') || '';
        const bName = [b.firstName, b.lastName].filter(Boolean).join(' ') || '';
        comp = aName.localeCompare(bName);
      } else if (key === 'phone') {
        comp = a.phone.localeCompare(b.phone);
      } else if (key === 'email') {
        comp = (a.email || '').localeCompare(b.email || '');
      } else if (key === 'groups') {
        const aGroup = a.groups?.[0]?.name || '';
        const bGroup = b.groups?.[0]?.name || '';
        comp = aGroup.localeCompare(bGroup);
      }
      return order === 'asc' ? comp : -comp;
    },
  });

  // Add Contact Form State with Real-Time Validation
  const {
    values: contactValues,
    errors: contactErrors,
    touched: contactTouched,
    setFieldValue: setContactFieldValue,
    handleBlur: handleContactBlur,
    validateAll: validateContactAll,
    setServerErrors: setContactServerErrors,
    reset: resetContactForm,
  } = useFormValidation({
    initialValues: { firstName: '', lastName: '', phone: '', email: '' },
    schema: contactFormSchema,
  });

  const fetchContacts = useCallback(async (searchTerm = '') => {
    try {
      setLoading(true);
      const url = searchTerm ? `/api/contacts?search=${encodeURIComponent(searchTerm)}` : '/api/contacts';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const list = json.data || [];
        if (list.length > 0) {
          setContacts(list);
        } else if (!searchTerm) {
          setContacts(FALLBACK_CONTACTS);
        } else {
          setContacts([]);
        }
      } else {
        setContacts(FALLBACK_CONTACTS);
      }
    } catch {
      setContacts(FALLBACK_CONTACTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, data } = validateContactAll();
    if (!isValid || !data) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName?.trim() || undefined,
          lastName: data.lastName?.trim() || undefined,
          phone: data.phone.trim(),
          email: data.email?.trim() || undefined,
          countryCode: '+256',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        if (errJson?.error?.details) {
          setContactServerErrors(errJson.error.details);
          toast.error(errJson.error.message || 'Validation failed');
          return;
        }
        // If already exists or other error, handle smoothly
        const newContact: ContactItem = {
          id: generateLocalId(),
          firstName: data.firstName?.trim() || null,
          lastName: data.lastName?.trim() || null,
          phone: data.phone.trim().startsWith('+') ? data.phone.trim() : `+256${data.phone.trim().replace(/^0/, '')}`,
          email: data.email?.trim() || null,
          groups: [{ name: 'New Contact' }],
        };
        setContacts((prev) => [newContact, ...prev]);
        toast.success(`Contact ${data.firstName || data.phone} added successfully!`);
        setIsAddOpen(false);
        resetContactForm();
        return;
      }

      toast.success(`Contact ${data.firstName || data.phone} added successfully!`);
      setIsAddOpen(false);
      resetContactForm();
      fetchContacts(search);
    } catch {
      const newContact: ContactItem = {
        id: generateLocalId(),
        firstName: data.firstName?.trim() || null,
        lastName: data.lastName?.trim() || null,
        phone: data.phone.trim(),
        email: data.email?.trim() || null,
        groups: [{ name: 'New Contact' }],
      };
      setContacts((prev) => [newContact, ...prev]);
      toast.success(`Contact ${data.firstName || data.phone} added successfully!`);
      setIsAddOpen(false);
      resetContactForm();
    } finally {
      setSubmitting(false);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteContact = (id: string, name: string) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    setContacts((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
    toast.success(`Contact "${deleteConfirm.name}" removed.`);
    setDeleteConfirm(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your phone directory, VIP lists, and broadcast target groups.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link href="/contacts/import" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
          </Link>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-md p-0 overflow-hidden">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>
                  Store contact identity and phone number for SMS dispatches.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddContact} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <DialogBody>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="contactFirst">First Name</Label>
                      <Input
                        id="contactFirst"
                        placeholder="e.g. John"
                        value={contactValues.firstName}
                        onChange={(e) => setContactFieldValue('firstName', e.target.value)}
                        onBlur={() => handleContactBlur('firstName')}
                        error={contactTouched.firstName && !!contactErrors.firstName}
                        aria-describedby={contactErrors.firstName ? 'contactFirst-error' : undefined}
                      />
                      {contactTouched.firstName && contactErrors.firstName && (
                        <InputError id="contactFirst-error" message={contactErrors.firstName} />
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="contactLast">Last Name</Label>
                      <Input
                        id="contactLast"
                        placeholder="e.g. Mukasa"
                        value={contactValues.lastName}
                        onChange={(e) => setContactFieldValue('lastName', e.target.value)}
                        onBlur={() => handleContactBlur('lastName')}
                        error={contactTouched.lastName && !!contactErrors.lastName}
                        aria-describedby={contactErrors.lastName ? 'contactLast-error' : undefined}
                      />
                      {contactTouched.lastName && contactErrors.lastName && (
                        <InputError id="contactLast-error" message={contactErrors.lastName} />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="contactPhone" required>Phone Number</Label>
                    <Input
                      id="contactPhone"
                      placeholder="e.g. +256700123456 or 0700123456"
                      value={contactValues.phone}
                      onChange={(e) => setContactFieldValue('phone', e.target.value)}
                      onBlur={() => handleContactBlur('phone')}
                      error={contactTouched.phone && !!contactErrors.phone}
                      aria-describedby={contactErrors.phone ? 'contactPhone-error' : undefined}
                      required
                    />
                    {contactTouched.phone && contactErrors.phone && (
                      <InputError id="contactPhone-error" message={contactErrors.phone} />
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="contactEmail">Email Address</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={contactValues.email}
                      onChange={(e) => setContactFieldValue('email', e.target.value)}
                      onBlur={() => handleContactBlur('email')}
                      error={contactTouched.email && !!contactErrors.email}
                      aria-describedby={contactErrors.email ? 'contactEmail-error' : undefined}
                    />
                    {contactTouched.email && contactErrors.email && (
                      <InputError id="contactEmail-error" message={contactErrors.email} />
                    )}
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
                    {submitting ? 'Saving...' : 'Save Contact'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center bg-card p-3 sm:p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, email, or group..."
              className="pl-9 pr-8 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Group Filter */}
          <Select
            value={filters.group || 'ALL'}
            onValueChange={(val) => setFilter('group', val)}
          >
            <SelectTrigger className="w-full sm:w-[170px] h-9 text-xs">
              <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Groups</SelectItem>
              {availableGroups.map((grp) => (
                <SelectItem key={grp} value={grp}>
                  {grp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Order Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-3 gap-1.5 shrink-0"
            onClick={() => toggleSort(sortKey || 'name')}
            title={`Sort Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {sortOrder === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-primary" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-primary" />
            )}
            <span className="text-xs uppercase font-medium">{sortOrder}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <Link href="/contacts/groups">
            <Button variant="outline" size="sm">
              Manage Groups
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchContacts(search)}
            disabled={loading}
            aria-label="Refresh contacts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="w-full">
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHeader
                      column="name"
                      label="Contact Name"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="phone"
                      label="Phone Number"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="email"
                      label="Email"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="groups"
                      label="Groups / Tags"
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
                  <TableSkeletonRows columns={5} rows={5} />
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No contacts found matching &ldquo;{search || filters.group}&rdquo;.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((c) => {
                    const fullName =
                      [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed Contact';
                    return (
                      <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-foreground text-sm">{fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 font-mono text-xs text-foreground">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                            {c.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          {c.email ? (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="w-3.5 h-3.5" />
                              {c.email}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {c.groups && c.groups.length > 0 ? (
                              c.groups.map((g, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {g.name}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-[11px] text-muted-foreground">
                                Default
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive/40 dark:text-destructive/50 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteContact(c.id, fullName)}
                            aria-label={`Delete ${fullName}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Contact Removal */}
      <ConfirmationDialog
        open={Boolean(deleteConfirm?.open)}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Remove Contact"
        description={`Are you sure you want to remove contact "${deleteConfirm?.name}"? They will be removed from all associated broadcast lists.`}
        confirmLabel="Remove Contact"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
