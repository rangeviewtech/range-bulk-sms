/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Search,
  Users,
  RefreshCw,
  FolderPlus,
  X,
  Send,
  Download,
  Mail,
  Calendar,
  CheckCircle2,
  Loader2,
  Globe,
  ToggleLeft,
  ToggleRight,
  UserMinus,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { buildSanitizedCsv } from '@/lib/security/csv-sanitizer';
import { Pagination } from '@/components/ui/pagination';
import { SortableHeader } from '@/components/ui/sortable-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CountryFlagPhone, getPhoneCountry } from '@/components/sms/country-flag-phone';
import { getMasterGroupMembers, type MasterContact } from '@/lib/contacts/master-directory';

export interface GroupDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: {
    id: string;
    name: string;
    description?: string | null;
    color?: string | null;
    createdAt?: string;
    contactCount?: number;
    count?: number;
  } | null;
  mode?: 'manage' | 'dispatch';
  excludedPhones?: string[];
  onExcludedPhonesChange?: (excludedPhones: string[]) => void;
  onSendSmsToGroup?: (group: { id: string; name: string; count?: number }) => void;
}

export interface GroupMemberContact {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string | null;
  status: 'ACTIVE' | 'OPTED_OUT';
  addedAt?: string;
}

const REGIONAL_CONFIGS = [
  {
    country: 'UG',
    countryName: 'Uganda',
    dialCode: '+256',
    prefixes: ['703', '704', '752', '774', '782', '701'],
    digitsCount: 6,
    firstNames: [
      'Agnes', 'Daniel', 'Julian', 'Mercy', 'Charles', 'Arthur', 'Claire', 'Ronald', 'Grace',
      'David', 'Brian', 'Fiona', 'Joseph', 'Patricia', 'Emmanuel', 'Ivan', 'Sarah',
      'Dennis', 'Sandra', 'Moses', 'Brenda', 'Timothy', 'Samuel', 'Gloria', 'Joshua',
    ],
    lastNames: [
      'Akello', 'Alinda', 'Mukasa', 'Kiconco', 'Byaruhanga', 'Kato', 'Sserwadda', 'Nabirye',
      'Katende', 'Nalubega', 'Kyomugisha', 'Kemigisa', 'Ochieng', 'Kigozi', 'Kasule', 'Tumwine',
    ],
    domains: [
      'gmail.com', 'yahoo.com', 'outlook.com', 'crestfoam.co.ug', 'stanbicbank.co.ug',
      'totalenergies.ug', 'umeme.co.ug', 'rangeview.co.ug',
    ],
  },
  {
    country: 'KE',
    countryName: 'Kenya',
    dialCode: '+254',
    prefixes: ['712', '722', '733', '790'],
    digitsCount: 6,
    firstNames: ['Amina', 'Brian', 'Fatuma', 'Hassan', 'Juma', 'Kariuki', 'Mwangi', 'Njeri', 'Wanjiku', 'Faith', 'Kevin'],
    lastNames: ['Mwangi', 'Kariuki', 'Odinga', 'Kamau', 'Otieno', 'Waweru', 'Kipchoge', 'Njoroge', 'Wambui'],
    domains: ['safaricom.co.ke', 'equitybank.co.ke', 'gmail.com', 'yahoo.com'],
  },
  {
    country: 'TZ',
    countryName: 'Tanzania',
    dialCode: '+255',
    prefixes: ['754', '784', '713', '767'],
    digitsCount: 6,
    firstNames: ['Baraka', 'Juma', 'Kassim', 'Aisha', 'Zainab', 'Rashid', 'Salim', 'Neema'],
    lastNames: ['Mollel', 'Mrema', 'Hassan', 'Makamba', 'Nyerere', 'Massawe', 'Shirima'],
    domains: ['vodacom.co.tz', 'crdbbank.co.tz', 'gmail.com'],
  },
  {
    country: 'RW',
    countryName: 'Rwanda',
    dialCode: '+250',
    prefixes: ['788', '781', '722'],
    digitsCount: 6,
    firstNames: ['Jean-Paul', 'Mutesi', 'Gatete', 'Diane', 'Patrick', 'Alain', 'Clarisse'],
    lastNames: ['Habimana', 'Murenzi', 'Kagabo', 'Bizimana', 'Uwase', 'Nkurunziza'],
    domains: ['bk.rw', 'mtn.co.rw', 'gmail.com'],
  },
  {
    country: 'GB',
    countryName: 'United Kingdom',
    dialCode: '+44',
    prefixes: ['7911', '7400', '7700'],
    digitsCount: 6,
    firstNames: ['Oliver', 'Emma', 'James', 'Sophie', 'George', 'Charlotte', 'Harry'],
    lastNames: ['Smith', 'Jones', 'Taylor', 'Brown', 'Wilson', 'Davies', 'Evans'],
    domains: ['rangeview.co.uk', 'gmail.com', 'outlook.com'],
  },
  {
    country: 'US',
    countryName: 'United States',
    dialCode: '+1',
    prefixes: ['415555', '212555', '312555', '650555'],
    digitsCount: 4,
    firstNames: ['Michael', 'Emily', 'Alex', 'Liam', 'Jessica', 'David', 'Sarah'],
    lastNames: ['Johnson', 'Williams', 'Chen', 'Miller', 'Davis', 'Rodriguez'],
    domains: ['techcorp.io', 'gmail.com', 'globalretail.com'],
  },
];

function generateMembersForAudience(groupId: string, targetCount: number, baseContacts: MasterContact[]): GroupMemberContact[] {
  const result: GroupMemberContact[] = baseContacts.map((c) => ({
    id: c.id,
    name: c.name,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    email: c.email,
    status: c.status,
    addedAt: c.addedAt,
  }));

  if (result.length >= targetCount) {
    return result.slice(0, targetCount);
  }

  const baseYear = 2026;
  const startId = result.length + 1;

  for (let i = startId; i <= targetCount; i++) {
    let configIndex = 0;
    const mod10 = i % 10;
    const mod20 = i % 20;

    if (mod10 === 7) {
      configIndex = 1; // KE
    } else if (mod20 === 8) {
      configIndex = 2; // TZ
    } else if (mod20 === 18) {
      configIndex = 3; // RW
    } else if (mod20 === 9) {
      configIndex = 4; // GB
    } else if (mod20 === 19) {
      configIndex = 5; // US
    }

    const cfg = REGIONAL_CONFIGS[configIndex];
    const fn = cfg.firstNames[(i * 11) % cfg.firstNames.length];
    const ln = cfg.lastNames[(i * 17) % cfg.lastNames.length];
    const prefix = cfg.prefixes[i % cfg.prefixes.length];
    const suffixBase = cfg.digitsCount === 4 ? 1000 : 100000;
    const suffixMod = cfg.digitsCount === 4 ? 9000 : 900000;
    const phoneSuffix = (suffixBase + ((i * 37) % suffixMod)).toString();
    const domain = cfg.domains[(i * 7) % cfg.domains.length];
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i > 20 ? (i % 99) : ''}@${domain}`;

    const day = (i % 28) + 1;
    const month = (i % 2 === 0) ? '09' : '08';
    const addedAt = `${baseYear}-${month}-${day < 10 ? '0' + day : day}`;

    result.push({
      id: `c_${groupId}_${i}`,
      name: `${fn} ${ln}`,
      firstName: fn,
      lastName: ln,
      phone: `${cfg.dialCode}${prefix}${phoneSuffix}`,
      email: i % 15 === 0 ? null : email,
      status: 'ACTIVE',
      addedAt,
    });
  }

  return result;
}

export function GroupDetailsDialog({
  open,
  onOpenChange,
  group,
  mode = 'dispatch',
  excludedPhones = [],
  onExcludedPhonesChange,
  onSendSmsToGroup,
}: GroupDetailsDialogProps) {
  const isDispatchMode = mode === 'dispatch';
  const [localExcludedPhones, setLocalExcludedPhones] = useState<string[]>(excludedPhones);
  const [viewMembers, setViewMembers] = useState<GroupMemberContact[]>([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewSearch, setViewSearch] = useState('');
  const [viewCountryFilter, setViewCountryFilter] = useState('ALL');
  const [viewSortKey, setViewSortKey] = useState<'name' | 'phone' | 'email' | 'status'>('name');
  const [viewSortOrder, setViewSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewPage, setViewPage] = useState(1);
  const [viewPageSize, setViewPageSize] = useState(5);

  useEffect(() => {
    setLocalExcludedPhones(excludedPhones);
  }, [excludedPhones]);

  const handleToggleDispatchExclusion = (phone: string, name: string) => {
    const isExcluded = localExcludedPhones.includes(phone);
    const nextExcluded = isExcluded
      ? localExcludedPhones.filter((p) => p !== phone)
      : [...localExcludedPhones, phone];

    setLocalExcludedPhones(nextExcluded);
    onExcludedPhonesChange?.(nextExcluded);

    if (isExcluded) {
      toast.success(`${name} included in this message`);
    } else {
      toast.info(`${name} excluded from this message (contacts list unchanged)`);
    }
  };

  useEffect(() => {
    if (!open || !group) return;

    setViewSearch('');
    setViewCountryFilter('ALL');
    setViewSortKey('name');
    setViewSortOrder('asc');
    setViewPage(1);
    setViewLoading(true);

    const targetAudience = group.contactCount ?? group.count ?? 142;

    try {
      // 1. Check master directory by ID or by Name
      const masterList = getMasterGroupMembers(group.id) || getMasterGroupMembers(group.name);
      const generated = generateMembersForAudience(group.id, targetAudience, masterList || []);
      setViewMembers(generated);
    } catch {
      const generated = generateMembersForAudience(group.id, targetAudience, []);
      setViewMembers(generated);
    } finally {
      setViewLoading(false);
    }
  }, [open, group]);

  const toggleViewSort = (column: string) => {
    const col = column as 'name' | 'phone' | 'email' | 'status';
    if (viewSortKey === col) {
      setViewSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setViewSortKey(col);
      setViewSortOrder('asc');
    }
    setViewPage(1);
  };

  // Derive distinct countries present in the loaded group audience
  const availableCountries = useMemo(() => {
    const map = new Map<string, { iso2: string; name: string; callingCode?: string; count: number }>();
    for (const m of viewMembers) {
      const meta = getPhoneCountry(m.phone);
      if (meta?.iso2) {
        const key = meta.iso2.toUpperCase();
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(key, { ...meta, count: 1 });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [viewMembers]);

  // Filter and sort members
  const filteredViewMembers = useMemo(() => {
    let result = viewMembers;

    // 1. Country Filter
    if (viewCountryFilter !== 'ALL') {
      result = result.filter((m) => {
        const meta = getPhoneCountry(m.phone);
        return meta?.iso2.toUpperCase() === viewCountryFilter.toUpperCase();
      });
    }

    // 2. Search
    if (viewSearch.trim()) {
      const rawQ = viewSearch.trim().toLowerCase();
      const digitsQ = rawQ.replace(/\D/g, '');
      const localQ = digitsQ.replace(/^0+/, '');
      const terms = rawQ.split(/\s+/).filter(Boolean);

      result = result.filter((m) => {
        const mName = m.name.toLowerCase();
        const mPhone = m.phone.toLowerCase();
        const mPhoneDigits = m.phone.replace(/\D/g, '');
        const mEmail = (m.email || '').toLowerCase();
        const mStatus = (m.status || 'ACTIVE').toLowerCase();
        const meta = getPhoneCountry(m.phone);

        if (digitsQ.length >= 2 && mPhoneDigits.includes(digitsQ)) return true;
        if (localQ.length >= 3 && mPhoneDigits.includes(localQ)) return true;

        return terms.every((term) => {
          const termDigits = term.replace(/\D/g, '').replace(/^0+/, '');
          if (termDigits.length >= 3 && mPhoneDigits.includes(termDigits)) {
            return true;
          }
          return (
            mName.includes(term) ||
            mPhone.includes(term) ||
            mEmail.includes(term) ||
            mStatus.includes(term) ||
            (meta && (
              meta.name.toLowerCase().includes(term) ||
              (meta.callingCode && meta.callingCode.toLowerCase().includes(term)) ||
              meta.iso2.toLowerCase() === term
            ))
          );
        });
      });
    }

    // 3. Sort
    result = [...result].sort((a, b) => {
      let comp = 0;
      if (viewSortKey === 'name') {
        comp = a.name.localeCompare(b.name);
      } else if (viewSortKey === 'phone') {
        comp = a.phone.localeCompare(b.phone);
      } else if (viewSortKey === 'email') {
        comp = (a.email || '').localeCompare(b.email || '');
      } else if (viewSortKey === 'status') {
        comp = (a.status || '').localeCompare(b.status || '');
      }
      return viewSortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [viewMembers, viewCountryFilter, viewSearch, viewSortKey, viewSortOrder]);

  const viewTotalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredViewMembers.length / viewPageSize)),
    [filteredViewMembers.length, viewPageSize]
  );

  const paginatedViewMembers = useMemo(() => {
    const start = (viewPage - 1) * viewPageSize;
    return filteredViewMembers.slice(start, start + viewPageSize);
  }, [filteredViewMembers, viewPage, viewPageSize]);

  const activeMemberCount = useMemo(
    () => viewMembers.filter((m) => (m.status || 'ACTIVE') === 'ACTIVE').length,
    [viewMembers]
  );

  const handleToggleMemberStatus = (id: string, name: string) => {
    setViewMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus = m.status === 'ACTIVE' ? 'OPTED_OUT' : 'ACTIVE';
          toast.success(`${name} is now ${nextStatus === 'ACTIVE' ? 'ACTIVE' : 'OPTED OUT'}`);
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  const handleRemoveMember = (id: string, name: string) => {
    setViewMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success(`Removed ${name} from this group.`);
  };

  const handleExportCsv = () => {
    if (!group || filteredViewMembers.length === 0) {
      toast.info('No contacts available to export.');
      return;
    }
    const headers = ['Name', 'Phone', 'Email', 'Status', 'Date Added'];
    const rows = filteredViewMembers.map((m) => [
      m.name,
      m.phone,
      m.email || '',
      m.status || 'ACTIVE',
      m.addedAt || '',
    ]);
    const csvContent = buildSanitizedCsv(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${group.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-contacts.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredViewMembers.length} contacts for "${group.name}".`);
  };

  if (!group) return null;

  const totalCount = group.contactCount ?? group.count ?? viewMembers.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl p-0 overflow-hidden shadow-2xl border-border bg-card">
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{
                backgroundColor: `${group.color || '#FBCA07'}20`,
                color: group.color || '#FBCA07',
              }}
            >
              <FolderPlus className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl font-bold truncate text-foreground">
                  {group.name}
                </DialogTitle>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/25 shrink-0">
                  {totalCount.toLocaleString()} contacts
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {group.description || 'High volume enterprise clients and corporate accounts.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-4 max-h-[70vh] overflow-y-auto p-4 sm:p-6 pt-4">
          {/* Meta details strip matching contacts/groups */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/50 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Total Audience</span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                {totalCount.toLocaleString()} subscribers
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Created Date</span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                {group.createdAt
                  ? new Date(group.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Sep 12, 2026'}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-muted-foreground block text-[11px]">Status</span>
              {isDispatchMode ? (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready for SMS ({Math.max(0, viewMembers.length - localExcludedPhones.length).toLocaleString()} active
                  {localExcludedPhones.length > 0 ? `, ${localExcludedPhones.length} excluded` : ''})
                </span>
              ) : (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready for SMS ({activeMemberCount.toLocaleString()} active)
                </span>
              )}
            </div>
          </div>

          {/* Contacts in Group Header, Country Filter & Search */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Member Contacts</h3>
                <span className="text-xs text-muted-foreground">
                  ({filteredViewMembers.length.toLocaleString()}
                  {filteredViewMembers.length !== viewMembers.length ? ` of ${viewMembers.length.toLocaleString()}` : ''}{' '}
                  {filteredViewMembers.length === 1 ? 'member' : 'members'})
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                {/* Country Filter Dropdown */}
                <div className="w-full sm:w-52">
                  <Select
                    value={viewCountryFilter}
                    onValueChange={(val) => {
                      setViewCountryFilter(val);
                      setViewPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>All Countries ({viewMembers.length.toLocaleString()})</span>
                        </span>
                      </SelectItem>
                      {availableCountries.map((c) => (
                        <SelectItem key={c.iso2} value={c.iso2.toUpperCase()}>
                          <span className="flex items-center gap-1.5">
                            <img
                              src={`https://flagcdn.com/20x15/${c.iso2}.png`}
                              alt=""
                              className="h-2.5 w-3.5 rounded-[1px] object-cover shrink-0 pointer-events-none"
                            />
                            <span>{c.name} ({c.callingCode})</span>
                            <span className="text-[10px] text-muted-foreground ml-auto">({c.count})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Input */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search name, phone, email..."
                    value={viewSearch}
                    onChange={(e) => {
                      setViewSearch(e.target.value);
                      setViewPage(1);
                    }}
                    className="h-8 text-xs pl-8 pr-7 w-full"
                  />
                  {viewSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setViewSearch('');
                        setViewPage(1);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Clear member search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Reset button if active */}
                {(viewCountryFilter !== 'ALL' || viewSearch) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setViewCountryFilter('ALL');
                      setViewSearch('');
                      setViewPage(1);
                    }}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                    title="Reset search and filters"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Members Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="max-h-[320px] overflow-y-auto">
                <Table className="min-w-full">
                  <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-2xs backdrop-blur-xs">
                    <TableRow className="text-[11px]">
                      <TableHead className="h-8">
                        <SortableHeader
                          column="name"
                          label="Subscriber"
                          currentSort={viewSortKey}
                          currentOrder={viewSortOrder}
                          onSort={toggleViewSort}
                        />
                      </TableHead>
                      <TableHead className="h-8">
                        <SortableHeader
                          column="phone"
                          label="Phone"
                          currentSort={viewSortKey}
                          currentOrder={viewSortOrder}
                          onSort={toggleViewSort}
                        />
                      </TableHead>
                      <TableHead className="h-8 hidden sm:table-cell">
                        <SortableHeader
                          column="email"
                          label="Email"
                          currentSort={viewSortKey}
                          currentOrder={viewSortOrder}
                          onSort={toggleViewSort}
                        />
                      </TableHead>
                      <TableHead className="h-8">
                        <SortableHeader
                          column="status"
                          label="Status"
                          currentSort={viewSortKey}
                          currentOrder={viewSortOrder}
                          onSort={toggleViewSort}
                        />
                      </TableHead>
                      <TableHead className="h-8 text-right pr-4 font-semibold text-muted-foreground">
                        {isDispatchMode ? 'Include' : 'Actions'}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            Loading group members...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredViewMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                          {viewSearch || viewCountryFilter !== 'ALL'
                            ? `No members found matching your search and filter criteria.`
                            : 'No contacts added to this group yet.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedViewMembers.map((member) => (
                        <TableRow key={member.id} className="text-xs hover:bg-muted/20">
                          <TableCell className="font-medium py-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="truncate max-w-[160px] sm:max-w-[240px] md:max-w-[320px]">
                                {member.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 whitespace-nowrap">
                            <CountryFlagPhone phone={member.phone} />
                          </TableCell>
                          <TableCell className="text-muted-foreground text-[11px] py-2.5 hidden sm:table-cell">
                            {member.email ? (
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                                <a
                                  href={`mailto:${member.email}`}
                                  title={`Send email to ${member.email}`}
                                  aria-label={`Send email to ${member.email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="truncate max-w-[180px] sm:max-w-[280px] md:max-w-[380px] hover:underline hover:text-primary transition-colors cursor-pointer"
                                >
                                  {member.email}
                                </a>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/40">—</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5 whitespace-nowrap">
                            {isDispatchMode ? (
                              <button
                                type="button"
                                onClick={() => handleToggleDispatchExclusion(member.phone, member.name)}
                                title={localExcludedPhones.includes(member.phone) ? `Click to include ${member.name} in this message` : `Click to exclude ${member.name} from this message`}
                                aria-label={`${member.name} is ${localExcludedPhones.includes(member.phone) ? 'excluded from this message' : 'included in this message'}. Click to toggle.`}
                                className={cn(
                                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer border select-none',
                                  !localExcludedPhones.includes(member.phone)
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                    : 'bg-muted/80 text-muted-foreground border-border/60 hover:bg-muted'
                                )}
                              >
                                <span
                                  className={cn(
                                    'w-1.5 h-1.5 rounded-full',
                                    !localExcludedPhones.includes(member.phone)
                                      ? 'bg-emerald-500 animate-pulse'
                                      : 'bg-muted-foreground/60'
                                  )}
                                />
                                {!localExcludedPhones.includes(member.phone) ? 'INCLUDED' : 'EXCLUDED'}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleMemberStatus(member.id, member.name)}
                                title={member.status === 'ACTIVE' ? `Click to opt out ${member.name}` : `Click to activate ${member.name}`}
                                className={cn(
                                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer border select-none',
                                  member.status === 'ACTIVE'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                                )}
                              >
                                <span
                                  className={cn(
                                    'w-1.5 h-1.5 rounded-full',
                                    member.status === 'ACTIVE'
                                      ? 'bg-emerald-500 animate-pulse'
                                      : 'bg-amber-500'
                                  )}
                                />
                                {member.status}
                              </button>
                            )}
                          </TableCell>
                          <TableCell className="text-right py-2.5 whitespace-nowrap pr-4">
                            <div className="flex items-center justify-end gap-1">
                              {isDispatchMode ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    'h-7 w-7 rounded-md transition-colors cursor-pointer',
                                    !localExcludedPhones.includes(member.phone)
                                      ? 'text-emerald-600 dark:text-emerald-400 hover:text-amber-600 hover:bg-amber-500/10'
                                      : 'text-muted-foreground/60 hover:text-emerald-600 hover:bg-emerald-500/10'
                                  )}
                                  onClick={() => handleToggleDispatchExclusion(member.phone, member.name)}
                                  title={!localExcludedPhones.includes(member.phone) ? `Exclude ${member.name} from this message` : `Include ${member.name} in this message`}
                                  aria-label={!localExcludedPhones.includes(member.phone) ? `Exclude ${member.name} from this message` : `Include ${member.name} in this message`}
                                >
                                  {!localExcludedPhones.includes(member.phone) ? (
                                    <ToggleRight className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <ToggleLeft className="w-4 h-4 text-muted-foreground/60" />
                                  )}
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      'h-7 w-7 rounded-md transition-colors',
                                      member.status === 'ACTIVE'
                                        ? 'text-emerald-600 dark:text-emerald-400 hover:text-amber-600 hover:bg-amber-500/10'
                                        : 'text-amber-600 dark:text-amber-400 hover:text-emerald-600 hover:bg-emerald-500/10'
                                    )}
                                    onClick={() => handleToggleMemberStatus(member.id, member.name)}
                                    title={member.status === 'ACTIVE' ? `Opt out ${member.name}` : `Activate ${member.name}`}
                                  >
                                    {member.status === 'ACTIVE' ? (
                                      <ToggleRight className="w-4 h-4" />
                                    ) : (
                                      <ToggleLeft className="w-4 h-4" />
                                    )}
                                  </Button>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                    asChild
                                  >
                                    <Link
                                      href={`/sms/send?deliveryMode=manual&recipients=${encodeURIComponent(member.phone)}`}
                                      title={`Send SMS to ${member.name}`}
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                    </Link>
                                  </Button>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                    onClick={() => handleRemoveMember(member.id, member.name)}
                                    title={`Remove ${member.name} from group`}
                                  >
                                    <UserMinus className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {!viewLoading && filteredViewMembers.length > 0 && (
                <Pagination
                  page={viewPage}
                  totalPages={viewTotalPages}
                  pageSize={viewPageSize}
                  totalItems={filteredViewMembers.length}
                  onPageChange={setViewPage}
                  onPageSizeChange={(newSize) => {
                    setViewPageSize(newSize);
                    setViewPage(1);
                  }}
                  pageSizeOptions={[5, 10, 20, 50]}
                  className="border-t border-border p-2 sm:p-2.5 bg-muted/20 text-xs"
                />
              )}
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center border-t border-border p-4 bg-muted/20">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9 cursor-pointer"
              onClick={handleExportCsv}
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
            {!isDispatchMode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-9"
                asChild
              >
                <Link href="/contacts/groups">
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Group
                </Link>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={isDispatchMode ? "default" : "outline"}
              size="sm"
              className={cn("text-xs h-9 cursor-pointer", isDispatchMode && "bg-primary text-primary-foreground font-semibold px-4")}
              onClick={() => onOpenChange(false)}
            >
              {isDispatchMode ? 'Done' : 'Close'}
            </Button>
            {!isDispatchMode && (
              <Button
                type="button"
                size="sm"
                className="gap-1.5 text-xs h-9 bg-amber-500 text-amber-950 hover:bg-amber-400 font-bold shadow-md cursor-pointer"
                onClick={() => {
                  if (onSendSmsToGroup) {
                    onSendSmsToGroup(group);
                  }
                  onOpenChange(false);
                }}
              >
                <Send className="w-3.5 h-3.5" />
                Send SMS to Group
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
