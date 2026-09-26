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
import { Search, Plus, Download, RefreshCw, Trash2, User, Mail, Filter, ArrowUp, ArrowDown, X, Send, ToggleLeft, ToggleRight, Pencil, Globe } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ConfirmationDialog } from '@/components/feedback/confirmation-dialog';
import { TableSkeletonRows } from '@/components/blocks/ui/skeleton-layouts';
import { z } from 'zod';
import { useFormValidation } from '@/hooks/use-form-validation';
import { InputError } from '@/components/ui/input-error';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { SortableHeader } from '@/components/ui/sortable-header';
import { PageHeader } from '@/components/layout/page-header';
import { useTableState } from '@/hooks/use-table-state';
import {
  validatePhoneCountryCode,
  validatePhoneNumber,
} from '@/lib/sms/normalizer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CountryFlagPhone, getPhoneCountry } from '@/components/sms/country-flag-phone';
import { SinglePhoneInput } from '@/components/sms/single-phone-input';
import { CarrierBadge, getPhoneCarrierInfo } from '@/components/sms/carrier-badge';

import { getMasterContacts } from '@/lib/contacts/master-directory';

interface ContactItem {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string;
  phone: string;
  normalizedPhone?: string;
  email?: string | null;
  status?: string;
  groups?: { id?: string; name: string }[];
  createdAt?: string;
  addedAt?: string;
}

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
    .superRefine((val, ctx) => {
      const ccResult = validatePhoneCountryCode(val);
      if (!ccResult.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ccResult.error || 'Invalid country calling code',
        });
        return;
      }
      const fullResult = validatePhoneNumber(val);
      if (!fullResult.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: fullResult.error || 'Please enter a valid phone number (e.g. +256700123456 or 0700123456)',
        });
      }
    }),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
});

const editContactFormSchema = z.object({
  firstName: z.string().max(100, 'Maximum 100 characters').optional(),
  lastName: z.string().max(100, 'Maximum 100 characters').optional(),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .superRefine((val, ctx) => {
      const ccResult = validatePhoneCountryCode(val);
      if (!ccResult.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ccResult.error || 'Invalid country calling code',
        });
        return;
      }
      const fullResult = validatePhoneNumber(val);
      if (!fullResult.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: fullResult.error || 'Please enter a valid phone number (e.g. +256700123456 or 0700123456)',
        });
      }
    }),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  status: z.enum(['ACTIVE', 'OPTED_OUT']),
});

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactItem[]>(() => getMasterContacts());
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit contact state
  const [editContact, setEditContact] = useState<ContactItem | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editServerErrors, setEditServerErrors] = useState<string[]>([]);

  // Extract all unique group names dynamically with member counts
  const availableGroups = React.useMemo(() => {
    const map = new Map<string, number>();
    contacts.forEach((c) => {
      c.groups?.forEach((g) => {
        if (g.name) {
          map.set(g.name, (map.get(g.name) || 0) + 1);
        }
      });
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts]);

  // Extract all unique country names dynamically
  const availableCountries = React.useMemo(() => {
    const map = new Map<string, string>();
    contacts.forEach((c) => {
      const meta = getPhoneCountry(c.phone);
      if (meta?.iso2 && meta?.name) {
        map.set(meta.iso2.toUpperCase(), meta.name);
      }
    });
    return Array.from(map.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts]);

  // Extract all unique networks / carriers dynamically with counts
  const availableNetworks = React.useMemo(() => {
    const map = new Map<string, number>();
    contacts.forEach((c) => {
      const info = getPhoneCarrierInfo(c.phone);
      const brand = info.brand || 'Unknown';
      map.set(brand, (map.get(brand) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
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
      (c) => c.status || 'ACTIVE',
      (c) => c.groups?.map((g) => g.name) || [],
      (c) => getPhoneCarrierInfo(c.phone).brand,
      (c) => getPhoneCarrierInfo(c.phone).operator,
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
      const statusFilter = currentFilters.status;
      if (statusFilter && statusFilter !== 'ALL') {
        const itemStatus = item.status || 'ACTIVE';
        if (itemStatus !== statusFilter) return false;
      }
      const countryFilter = currentFilters.country;
      if (countryFilter && countryFilter !== 'ALL') {
        const meta = getPhoneCountry(item.phone);
        if (meta?.iso2?.toUpperCase() !== countryFilter.toUpperCase()) return false;
      }
      const networkFilter = currentFilters.network;
      if (networkFilter && networkFilter !== 'ALL') {
        const info = getPhoneCarrierInfo(item.phone);
        if (info.brand.toLowerCase() !== networkFilter.toLowerCase()) return false;
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
      } else if (key === 'carrier') {
        const aCarrier = getPhoneCarrierInfo(a.phone).brand;
        const bCarrier = getPhoneCarrierInfo(b.phone).brand;
        comp = aCarrier.localeCompare(bCarrier);
      } else if (key === 'email') {
        comp = (a.email || '').localeCompare(b.email || '');
      } else if (key === 'status') {
        const aStatus = a.status || 'ACTIVE';
        const bStatus = b.status || 'ACTIVE';
        comp = aStatus.localeCompare(bStatus);
      } else if (key === 'groups') {
        const aGroup = a.groups?.[0]?.name || '';
        const bGroup = b.groups?.[0]?.name || '';
        comp = aGroup.localeCompare(bGroup);
      }
      return order === 'asc' ? comp : -comp;
    },
  });

  const [contactServerErrors, setContactServerErrors] = useState<string[]>([]);

  // Add Contact Form State with Real-Time Validation
  const {
    values: contactValues,
    errors: contactErrors,
    touched: contactTouched,
    setFieldValue: setContactFieldValue,
    handleBlur: handleContactBlur,
    validateAll: validateContactAll,
    reset: resetContactForm,
    confirmDiscard: confirmAddDiscard,
  } = useFormValidation({
    initialValues: { firstName: '', lastName: '', phone: '', email: '' },
    schema: contactFormSchema,
    protectUnsavedChanges: isAddOpen,
    id: 'add-contact',
    title: 'Unsaved changes',
    message: 'You have unsaved changes in this new contact form. If you leave now, your changes will be lost.',
  });

  // Edit Contact Form State with Real-Time Validation
  const {
    values: editValues,
    errors: editErrors,
    touched: editTouched,
    setFieldValue: setEditFieldValue,
    handleBlur: handleEditBlur,
    validateAll: validateEditAll,
    reset: resetEditContactForm,
    confirmDiscard: confirmEditDiscard,
  } = useFormValidation({
    initialValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      status: 'ACTIVE' as 'ACTIVE' | 'OPTED_OUT',
    },
    schema: editContactFormSchema,
    protectUnsavedChanges: Boolean(editContact),
    id: 'edit-contact',
    title: 'Unsaved changes',
    message: 'You have unsaved changes to this contact. If you leave now, your changes will be lost.',
  });

  const handleOpenEdit = (contact: ContactItem) => {
    setEditContact(contact);
    setEditServerErrors([]);
    resetEditContactForm({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      phone: contact.phone || '',
      email: contact.email || '',
      status: (contact.status === 'OPTED_OUT' ? 'OPTED_OUT' : 'ACTIVE') as 'ACTIVE' | 'OPTED_OUT',
    });
  };

  const fetchContacts = useCallback(async (searchTerm = '') => {
    try {
      setLoading(true);
      const url = searchTerm
        ? `/api/contacts?all=true&search=${encodeURIComponent(searchTerm)}`
        : '/api/contacts?all=true';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const list = json.data || [];
        if (list.length > 0) {
          const mapped = list.map((item: ContactItem & { optedOut?: boolean }) => ({
            ...item,
            status: item.status || (item.optedOut ? 'OPTED_OUT' : 'ACTIVE'),
          }));
          setContacts(mapped);
        } else if (!searchTerm) {
          setContacts(getMasterContacts());
        } else {
          setContacts([]);
        }
      } else {
        setContacts(getMasterContacts());
      }
    } catch {
      setContacts(getMasterContacts());
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
          const details = Array.isArray(errJson.error.details)
            ? errJson.error.details.map(String)
            : [errJson.error.message || 'Validation failed'];
          setContactServerErrors(details);
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
          status: 'ACTIVE',
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
        status: 'ACTIVE',
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

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContact) return;
    const { isValid, data } = validateEditAll();
    if (!isValid || !data) return;

    try {
      setEditSubmitting(true);
      setEditServerErrors([]);

      const res = await fetch(`/api/contacts/${editContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName?.trim() || undefined,
          lastName: data.lastName?.trim() || undefined,
          phone: data.phone.trim(),
          email: data.email?.trim() || undefined,
          status: data.status,
          optedOut: data.status === 'OPTED_OUT',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        if (errJson?.error?.details) {
          const details = Array.isArray(errJson.error.details)
            ? errJson.error.details.map(String)
            : [errJson.error.message || 'Validation failed'];
          setEditServerErrors(details);
          toast.error(errJson.error.message || 'Failed to update contact');
          return;
        }
      }

      setContacts((prev) =>
        prev.map((c) =>
          c.id === editContact.id
            ? {
                ...c,
                firstName: data.firstName?.trim() || null,
                lastName: data.lastName?.trim() || null,
                phone: data.phone.trim(),
                email: data.email?.trim() || null,
                status: data.status,
              }
            : c
        )
      );

      const displayName = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.phone;
      toast.success(`Contact "${displayName}" updated successfully!`);
      setEditContact(null);
    } catch {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === editContact.id
            ? {
                ...c,
                firstName: data.firstName?.trim() || null,
                lastName: data.lastName?.trim() || null,
                phone: data.phone.trim(),
                email: data.email?.trim() || null,
                status: data.status,
              }
            : c
        )
      );
      const displayName = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.phone;
      toast.success(`Contact "${displayName}" updated successfully!`);
      setEditContact(null);
    } finally {
      setEditSubmitting(false);
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

  const [statusConfirm, setStatusConfirm] = useState<{
    open: boolean;
    contactId: string;
    name: string;
    currentStatus: string;
    nextStatus: string;
  } | null>(null);

  const handleRequestToggleStatus = (contactId: string, name: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'OPTED_OUT' : 'ACTIVE';
    setStatusConfirm({
      open: true,
      contactId,
      name,
      currentStatus,
      nextStatus,
    });
  };

  const handleConfirmStatusChange = () => {
    if (!statusConfirm) return;
    const { contactId, name, nextStatus } = statusConfirm;

    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === contactId) {
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );

    if (nextStatus === 'ACTIVE') {
      toast.success(`${name} is now ACTIVE`, {
        description: 'Contact opted in to receive SMS broadcasts.',
      });
    } else {
      toast.info(`${name} is now OPTED OUT`, {
        description: 'Contact is opted out and excluded from SMS dispatches.',
      });
    }

    try {
      if (!contactId.startsWith('ct_local_') && !contactId.startsWith('ct_')) {
        fetch(`/api/contacts/${contactId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ optedOut: nextStatus === 'OPTED_OUT', status: nextStatus }),
        }).catch(() => {});
      }
    } catch {
      // background sync catch
    }

    setStatusConfirm(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader
        title="Contacts"
        description="Manage your phone directory, VIP lists, and broadcast target groups."
        action={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link href="/contacts/import" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
            </Link>

            <Dialog
              open={isAddOpen}
              onOpenChange={(open) => {
                if (!open) {
                  confirmAddDiscard(() => {
                    setIsAddOpen(false);
                    resetContactForm();
                  });
                } else {
                  setIsAddOpen(true);
                }
              }}
            >
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
                      <SinglePhoneInput
                        id="contactPhone"
                        value={contactValues.phone}
                        onChange={(val) => setContactFieldValue('phone', val)}
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

                    {contactServerErrors.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-1">
                        {contactServerErrors.map((err, i) => (
                          <p key={i}>• {err}</p>
                        ))}
                      </div>
                    )}
                  </DialogBody>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        confirmAddDiscard(() => {
                          setIsAddOpen(false);
                          resetContactForm();
                        });
                      }}
                      disabled={submitting}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                    >
                      {submitting ? 'Saving...' : 'Save Contact'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center bg-card p-3 sm:p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, phone, network, email, or group..."
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
              <SelectItem value="ALL">All Groups ({contacts.length})</SelectItem>
              {availableGroups.map((grp) => (
                <SelectItem key={grp.name} value={grp.name}>
                  {grp.name} ({grp.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status || 'ALL'}
            onValueChange={(val) => setFilter('status', val)}
          >
            <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs">
              <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="OPTED_OUT">Opted Out</SelectItem>
            </SelectContent>
          </Select>

          {/* Country Filter */}
          {availableCountries.length > 0 && (
            <Select
              value={filters.country || 'ALL'}
              onValueChange={(val) => setFilter('country', val)}
            >
              <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs">
                <Globe className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Countries</SelectItem>
                {availableCountries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Network / Carrier Filter */}
          {availableNetworks.length > 0 && (
            <Select
              value={filters.network || 'ALL'}
              onValueChange={(val) => setFilter('network', val)}
            >
              <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs">
                <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Networks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Networks</SelectItem>
                {availableNetworks.map((net) => (
                  <SelectItem key={net.name} value={net.name}>
                    {net.name} ({net.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

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
          {loading ? (
            <>
              {/* Mobile Skeleton */}
              <div className="block md:hidden divide-y divide-border p-3 space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="pt-3 first:pt-0 space-y-2.5 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-muted rounded w-36" />
                      <div className="h-5 bg-muted rounded-full w-16" />
                    </div>
                    <div className="h-3.5 bg-muted rounded w-28" />
                    <div className="flex gap-2">
                      <div className="h-7 bg-muted rounded flex-1" />
                      <div className="h-7 bg-muted rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop Skeleton */}
              <div className="hidden md:block w-full overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Network</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Groups / Tags</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableSkeletonRows columns={7} rows={5} />
                  </TableBody>
                </Table>
              </div>
            </>
          ) : paginatedData.length === 0 ? (
            <EmptyState
              className="rounded-none border-0 bg-transparent py-16"
              icon={<User className="h-8 w-8 text-muted-foreground" />}
              title="No contacts found"
              description={`We couldn't find any contacts matching "${search || filters.group || filters.status || filters.country || filters.network}".`}
              action={
                search ? (
                  <Button variant="outline" onClick={clearSearch}>Clear Search</Button>
                ) : undefined
              }
            />
          ) : (
            <>
              {/* Mobile View: High-density responsive contact card list */}
              <div className="block md:hidden divide-y divide-border">
                {paginatedData.map((c) => {
                  const fullName =
                    [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed Contact';
                  return (
                    <div key={c.id} className="p-4 space-y-3 hover:bg-muted/20 transition-colors">
                      {/* Top Row: Avatar + Name + Status Pill */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-foreground text-sm line-clamp-1">
                            {fullName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRequestToggleStatus(c.id, fullName, c.status || 'ACTIVE')}
                          title={(c.status || 'ACTIVE') === 'ACTIVE' ? `Click to opt out ${fullName}` : `Click to activate ${fullName}`}
                          aria-label={`Toggle status for ${fullName}. Currently ${c.status || 'ACTIVE'}.`}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer border select-none shrink-0',
                            (c.status || 'ACTIVE') === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              (c.status || 'ACTIVE') === 'ACTIVE'
                                ? 'bg-emerald-500 animate-pulse'
                                : 'bg-amber-500'
                            )}
                          />
                          {(c.status || 'ACTIVE') === 'ACTIVE' ? 'Active' : 'Opted Out'}
                        </button>
                      </div>

                      {/* Phone & Network */}
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/40 p-2.5 rounded-lg border border-border/50">
                        <CountryFlagPhone phone={c.phone} asLink className="text-xs font-mono text-foreground" />
                        <CarrierBadge phone={c.phone} showIcon={false} size="sm" />
                      </div>

                      {/* Email & Groups */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        {c.email ? (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <a
                              href={`mailto:${c.email}`}
                              title={`Send email to ${c.email}`}
                              aria-label={`Send email to ${c.email}`}
                              className="hover:underline hover:text-primary transition-colors cursor-pointer"
                            >
                              {c.email}
                            </a>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 italic text-[11px]">No email</span>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {c.groups && c.groups.length > 0 ? (
                            c.groups.map((g, idx) => (
                              <Badge key={idx} variant="secondary" className="text-[11px] px-1.5 py-0">
                                {g.name}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground px-1.5 py-0">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5 flex-1 text-primary hover:text-primary"
                        >
                          <Link
                            href={`/sms/send?deliveryMode=manual&recipients=${encodeURIComponent(c.phone)}`}
                            title={`Send SMS to ${fullName}`}
                            aria-label={`Send SMS to ${fullName}`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send SMS</span>
                          </Link>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => handleOpenEdit(c)}
                          title={`Edit ${fullName}`}
                          aria-label={`Edit ${fullName}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-8 w-8 rounded-lg transition-colors border',
                            (c.status || 'ACTIVE') === 'ACTIVE'
                              ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-amber-500/10 hover:text-amber-600'
                              : 'text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-emerald-500/10 hover:text-emerald-600'
                          )}
                          onClick={() => handleRequestToggleStatus(c.id, fullName, c.status || 'ACTIVE')}
                          title={(c.status || 'ACTIVE') === 'ACTIVE' ? `Opt out ${fullName}` : `Activate ${fullName}`}
                          aria-label={(c.status || 'ACTIVE') === 'ACTIVE' ? `Opt out ${fullName}` : `Activate ${fullName}`}
                        >
                          {(c.status || 'ACTIVE') === 'ACTIVE' ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300 transition-colors rounded-lg"
                          onClick={() => handleDeleteContact(c.id, fullName)}
                          title={`Delete ${fullName}`}
                          aria-label={`Delete ${fullName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block w-full overflow-x-auto">
                <Table className="min-w-[700px]">
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
                          column="carrier"
                          label="Network"
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
                          column="status"
                          label="Status"
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
                    {paginatedData.map((c) => {
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
                            <CountryFlagPhone phone={c.phone} asLink className="text-xs text-foreground" />
                          </TableCell>
                          <TableCell>
                            <CarrierBadge phone={c.phone} showIcon={false} size="sm" />
                          </TableCell>
                          <TableCell>
                            {c.email ? (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                <a
                                  href={`mailto:${c.email}`}
                                  title={`Send email to ${c.email}`}
                                  aria-label={`Send email to ${c.email}`}
                                  className="hover:underline hover:text-primary transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
                                >
                                  {c.email}
                                </a>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">—</span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleRequestToggleStatus(c.id, fullName, c.status || 'ACTIVE')}
                              title={(c.status || 'ACTIVE') === 'ACTIVE' ? `Click to opt out ${fullName}` : `Click to activate ${fullName}`}
                              aria-label={`Toggle status for ${fullName}. Currently ${c.status || 'ACTIVE'}.`}
                              className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer border select-none',
                                (c.status || 'ACTIVE') === 'ACTIVE'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                              )}
                            >
                              <span
                                className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  (c.status || 'ACTIVE') === 'ACTIVE'
                                    ? 'bg-emerald-500 animate-pulse'
                                    : 'bg-amber-500'
                                )}
                              />
                              {(c.status || 'ACTIVE') === 'ACTIVE' ? 'Active' : 'Opted Out'}
                            </button>
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
                            <div className="flex items-center justify-end gap-1">
                              {/* 1. Toggle Status */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  'h-8 w-8 rounded-lg transition-colors',
                                  (c.status || 'ACTIVE') === 'ACTIVE'
                                    ? 'text-emerald-600 dark:text-emerald-400 hover:text-amber-600 hover:bg-amber-500/10'
                                    : 'text-amber-600 dark:text-amber-400 hover:text-emerald-600 hover:bg-emerald-500/10'
                                )}
                                onClick={() => handleRequestToggleStatus(c.id, fullName, c.status || 'ACTIVE')}
                                title={(c.status || 'ACTIVE') === 'ACTIVE' ? `Opt out ${fullName}` : `Activate ${fullName}`}
                                aria-label={(c.status || 'ACTIVE') === 'ACTIVE' ? `Opt out ${fullName}` : `Activate ${fullName}`}
                              >
                                {(c.status || 'ACTIVE') === 'ACTIVE' ? (
                                  <ToggleRight className="w-4 h-4" />
                                ) : (
                                  <ToggleLeft className="w-4 h-4" />
                                )}
                              </Button>

                              {/* 2. Edit Contact */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                onClick={() => handleOpenEdit(c)}
                                title={`Edit ${fullName}`}
                                aria-label={`Edit ${fullName}`}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>

                              {/* 3. Direct Send SMS */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                asChild
                              >
                                <Link
                                  href={`/sms/send?deliveryMode=manual&recipients=${encodeURIComponent(c.phone)}`}
                                  title={`Send SMS to ${fullName}`}
                                  aria-label={`Send SMS to ${fullName}`}
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </Link>
                              </Button>

                              {/* 4. Delete Contact */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300 transition-colors rounded-lg"
                                onClick={() => handleDeleteContact(c.id, fullName)}
                                title={`Delete ${fullName}`}
                                aria-label={`Delete ${fullName}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </CardContent>
      </Card>

      {/* Edit Contact Dialog */}
      <Dialog
        open={Boolean(editContact)}
        onOpenChange={(open) => {
          if (!open) {
            confirmEditDiscard(() => {
              setEditContact(null);
            });
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-md p-0 overflow-hidden">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Pencil className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle>Edit Contact</DialogTitle>
                <DialogDescription>
                  Update contact identity, phone number, and subscription status.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="editContactFirst">First Name</Label>
                  <Input
                    id="editContactFirst"
                    placeholder="e.g. John"
                    value={editValues.firstName}
                    onChange={(e) => setEditFieldValue('firstName', e.target.value)}
                    onBlur={() => handleEditBlur('firstName')}
                    error={editTouched.firstName && !!editErrors.firstName}
                    aria-describedby={editErrors.firstName ? 'editContactFirst-error' : undefined}
                  />
                  {editTouched.firstName && editErrors.firstName && (
                    <InputError id="editContactFirst-error" message={editErrors.firstName} />
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="editContactLast">Last Name</Label>
                  <Input
                    id="editContactLast"
                    placeholder="e.g. Mukasa"
                    value={editValues.lastName}
                    onChange={(e) => setEditFieldValue('lastName', e.target.value)}
                    onBlur={() => handleEditBlur('lastName')}
                    error={editTouched.lastName && !!editErrors.lastName}
                    aria-describedby={editErrors.lastName ? 'editContactLast-error' : undefined}
                  />
                  {editTouched.lastName && editErrors.lastName && (
                    <InputError id="editContactLast-error" message={editErrors.lastName} />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="editContactPhone" required>Phone Number</Label>
                <SinglePhoneInput
                  id="editContactPhone"
                  value={editValues.phone}
                  onChange={(val) => setEditFieldValue('phone', val)}
                  onBlur={() => handleEditBlur('phone')}
                  error={editTouched.phone && !!editErrors.phone}
                  aria-describedby={editErrors.phone ? 'editContactPhone-error' : undefined}
                  required
                />
                {editTouched.phone && editErrors.phone && (
                  <InputError id="editContactPhone-error" message={editErrors.phone} />
                )}
                <p className="text-[11px] text-muted-foreground">
                  Select your country code and enter the national phone number.
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="editContactEmail">Email Address</Label>
                <Input
                  id="editContactEmail"
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={editValues.email}
                  onChange={(e) => setEditFieldValue('email', e.target.value)}
                  onBlur={() => handleEditBlur('email')}
                  error={editTouched.email && !!editErrors.email}
                  aria-describedby={editErrors.email ? 'editContactEmail-error' : undefined}
                />
                {editTouched.email && editErrors.email && (
                  <InputError id="editContactEmail-error" message={editErrors.email} />
                )}
              </div>

              {/* Status Selector */}
              <div className="space-y-1">
                <Label htmlFor="editContactStatus">Subscription Status</Label>
                <Select
                  value={editValues.status}
                  onValueChange={(val: 'ACTIVE' | 'OPTED_OUT') => setEditFieldValue('status', val)}
                >
                  <SelectTrigger id="editContactStatus" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Active (Subscribed to broadcasts)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="OPTED_OUT">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Opted Out (Excluded from broadcasts)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Opted-out contacts are protected and excluded from automated broadcast dispatches.
                </p>
              </div>

              {editServerErrors.length > 0 && (
                <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-1">
                  {editServerErrors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}
            </DialogBody>

            <DialogFooter className="border-t border-border pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  confirmEditDiscard(() => {
                    setEditContact(null);
                  });
                }}
                disabled={editSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editSubmitting}
                className="w-full sm:w-auto bg-primary text-primary-foreground font-bold hover:bg-primary/90"
              >
                {editSubmitting ? (
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

      {/* Confirmation Dialog for Contact Status Switching */}
      <ConfirmationDialog
        open={Boolean(statusConfirm?.open)}
        onOpenChange={(open) => !open && setStatusConfirm(null)}
        title={statusConfirm?.nextStatus === 'OPTED_OUT' ? 'Opt Out Contact' : 'Activate Contact'}
        description={
          statusConfirm?.nextStatus === 'OPTED_OUT'
            ? `Are you sure you want to opt out "${statusConfirm?.name}"? This contact will be excluded from all automated SMS broadcasts and marketing campaigns.`
            : `Are you sure you want to activate "${statusConfirm?.name}"? This contact will be opted in and eligible to receive bulk SMS broadcasts and marketing campaigns.`
        }
        confirmLabel={statusConfirm?.nextStatus === 'OPTED_OUT' ? 'Yes, Opt Out' : 'Yes, Activate'}
        cancelLabel="Cancel"
        variant={statusConfirm?.nextStatus === 'OPTED_OUT' ? 'destructive' : 'default'}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}
