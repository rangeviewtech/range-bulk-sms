/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import {
  Search,
  Plus,
  Trash2,
  Users,
  RefreshCw,
  FolderPlus,
  Filter,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
  Pencil,
  Send,
  Download,
  Mail,
  Calendar,
  Check,
  CheckCircle2,
  Tag,
  Loader2,
  Pipette,
  Globe,
  ToggleLeft,
  ToggleRight,
  UserMinus,
} from 'lucide-react';
import { toast } from 'sonner';
import { buildSanitizedCsv } from '@/lib/security/csv-sanitizer';
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
import { cn } from '@/lib/utils';
import { CountryFlagPhone, getPhoneCountry } from '@/components/sms/country-flag-phone';
import { getMasterGroupMembers } from '@/lib/contacts/master-directory';

function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

const groupFormSchema = z.object({
  name: z.string().trim().min(1, 'Group name is required').max(100, 'Group name cannot exceed 100 characters'),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
});

interface GroupItem {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  createdAt?: string;
  updatedAt?: string;
  contactCount?: number;
  memberCount?: number;
}

interface GroupMemberContact {
  id: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  phone: string;
  email?: string | null;
  status?: string;
  addedAt?: string;
}

const PRESET_COLORS = [
  { label: 'Brand Blue', value: '#04648C' },
  { label: 'Brand Gold', value: '#FBCA07' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Rose', value: '#F43F5E' },
  { label: 'Slate', value: '#64748B' },
];

const FALLBACK_GROUPS: GroupItem[] = [
  {
    id: 'grp_1',
    name: 'VIP Customers',
    description: 'High volume enterprise clients and corporate accounts.',
    color: '#04648C',
    createdAt: '2026-09-10',
    contactCount: 1245,
  },
  {
    id: 'grp_2',
    name: 'Kampala Retail Leads',
    description: 'Prospective business leads from retail activations.',
    color: '#FBCA07',
    createdAt: '2026-09-12',
    contactCount: 3890,
  },
  {
    id: 'grp_3',
    name: 'School Fee Reminders',
    description: 'Parents and guardians enrolled for term notifications.',
    color: '#10B981',
    createdAt: '2026-09-15',
    contactCount: 560,
  },
];

const SAMPLE_MEMBERS_MAP: Record<string, GroupMemberContact[]> = {
  grp_1: [
    { id: 'c_1', name: 'Dr. Arthur Sserwadda', phone: '+256702950322', email: 'arthur.s@crestfoam.co.ug', status: 'ACTIVE', addedAt: '2026-09-10' },
    { id: 'c_2', name: 'Claire Nabirye', phone: '+256772123456', email: 'claire@stanbicbank.co.ug', status: 'ACTIVE', addedAt: '2026-09-11' },
    { id: 'c_3', name: 'Amina Mwangi', phone: '+254712345678', email: 'amina.m@safaricom.co.ke', status: 'ACTIVE', addedAt: '2026-09-11' },
    { id: 'c_4', name: 'Ronald Mukasa', phone: '+256782998877', email: 'ronald.m@totalenergies.ug', status: 'ACTIVE', addedAt: '2026-09-12' },
    { id: 'c_5', name: 'Oliver Smith', phone: '+447911123456', email: 'oliver.smith@rangeview.co.uk', status: 'ACTIVE', addedAt: '2026-09-13' },
  ],
  grp_2: [
    { id: 'c_6', name: 'Agnes Mukasa', phone: '+256703100592', email: 'agnes.mukasa@outlook.com', status: 'ACTIVE', addedAt: '2026-09-12' },
    { id: 'c_7', name: 'Daniel Kiconco', phone: '+256704100629', email: 'daniel.kiconco@rangeview.co.ug', status: 'ACTIVE', addedAt: '2026-09-12' },
    { id: 'c_8', name: 'Julian Byaruhanga', phone: '+256752100666', email: 'julian.byaruhanga@umeme.co.ug', status: 'ACTIVE', addedAt: '2026-09-13' },
    { id: 'c_9', name: 'Mercy Alinda', phone: '+256774100703', email: 'mercy.alinda@crestfoam.co.ug', status: 'ACTIVE', addedAt: '2026-09-13' },
    { id: 'c_10', name: 'Charles Kato', phone: '+256703100740', email: 'charles.kato@gmail.com', status: 'ACTIVE', addedAt: '2026-09-14' },
    { id: 'c_11', name: 'Amina Kariuki', phone: '+254722334455', email: 'akariuki@safaricom.co.ke', status: 'ACTIVE', addedAt: '2026-09-14' },
    { id: 'c_12', name: 'Juma Hassan', phone: '+255754123456', email: 'jhassan@vodacom.co.tz', status: 'ACTIVE', addedAt: '2026-09-15' },
    { id: 'c_13', name: 'Jean-Paul Habimana', phone: '+250788123456', email: 'habimana.jp@bk.rw', status: 'ACTIVE', addedAt: '2026-09-15' },
    { id: 'c_14', name: 'Oliver Smith', phone: '+447911123456', email: 'oliver.smith@rangeview.co.uk', status: 'ACTIVE', addedAt: '2026-09-16' },
    { id: 'c_15', name: 'Michael Chen', phone: '+14155552671', email: 'mchen@techcorp.io', status: 'ACTIVE', addedAt: '2026-09-16' },
  ],
  grp_3: [
    { id: 'c_15', name: 'Margaret Akello', phone: '+256702667788', email: 'akello.m@gmail.com', status: 'ACTIVE', addedAt: '2026-09-15' },
    { id: 'c_16', name: 'Patrick Tumwine', phone: '+256773889900', email: 'tumwine.p@outlook.com', status: 'ACTIVE', addedAt: '2026-09-16' },
    { id: 'c_17', name: 'Grace Wanjiku', phone: '+254733445566', email: 'gwanjiku@gmail.com', status: 'ACTIVE', addedAt: '2026-09-16' },
    { id: 'c_18', name: 'Beatrice Nakato', phone: '+256751224466', email: 'bnakato@gmail.com', status: 'ACTIVE', addedAt: '2026-09-17' },
  ],
};

const REGIONAL_CONFIGS = [
  {
    country: 'UG',
    countryName: 'Uganda',
    dialCode: '+256',
    prefixes: ['703', '704', '752', '774', '782', '701'],
    digitsCount: 6,
    firstNames: [
      'Dennis', 'Sandra', 'Moses', 'Julian', 'Arthur', 'Claire', 'Ronald', 'Grace',
      'David', 'Brian', 'Fiona', 'Joseph', 'Patricia', 'Emmanuel', 'Mercy', 'Ivan',
      'Sarah', 'Kevin', 'Brenda', 'Timothy', 'Agnes', 'Samuel', 'Gloria', 'Joshua',
      'Rebecca', 'Charles', 'Diana', 'Derrick', 'Christine', 'Robert', 'Esther',
      'Daniel', 'Faith', 'Paul', 'Peace', 'Gerald', 'Harriet', 'Stephen', 'Dorothy',
    ],
    lastNames: [
      'Katende', 'Nalubega', 'Byaruhanga', 'Kyomugisha', 'Sserwadda', 'Nabirye', 'Mukasa',
      'Kemigisa', 'Ochieng', 'Kigozi', 'Namutebi', 'Kasule', 'Akello', 'Tumwine', 'Nakato',
      'Ssemwogerere', 'Mugisha', 'Nanyanzi', 'Lubega', 'Alinda', 'Okello', 'Asiimwe',
      'Birungi', 'Kiconco', 'Nsubuga', 'Opio', 'Atuhaire', 'Babirye', 'Musoke', 'Ntale',
      'Kintu', 'Kiwanuka', 'Namaganda', 'Muwonge', 'Lwanga', 'Wasswa', 'Kato', 'Kibuuka',
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
    domains: ['rangeview.co.uk', 'gmail.com', 'outlook.com', 'bbc.co.uk'],
  },
  {
    country: 'US',
    countryName: 'United States',
    dialCode: '+1',
    prefixes: ['415555', '212555', '312555', '650555'],
    digitsCount: 4,
    firstNames: ['Michael', 'Emily', 'Alex', 'Liam', 'Jessica', 'David', 'Sarah'],
    lastNames: ['Johnson', 'Williams', 'Chen', 'Miller', 'Davis', 'Rodriguez', 'Martinez'],
    domains: ['techcorp.io', 'gmail.com', 'globalretail.com'],
  },
];

function generateDeterministicMembers(group: GroupItem, initialList: GroupMemberContact[]): GroupMemberContact[] {
  const targetCount = group.contactCount ?? (
    group.id === 'grp_1' ? 1245 : group.id === 'grp_2' ? 3890 : group.id === 'grp_3' ? 560 : 100
  );

  const result: GroupMemberContact[] = [...initialList];
  if (result.length >= targetCount) {
    return result;
  }

  const baseYear = 2026;
  const startId = result.length + 1;

  for (let i = startId; i <= targetCount; i++) {
    // Multi-country deterministic distribution:
    // ~70% Uganda (i % 10 < 7)
    // ~10% Kenya (i % 10 === 7)
    // ~5% Tanzania (i % 20 === 8)
    // ~5% Rwanda (i % 20 === 18)
    // ~5% United Kingdom (i % 20 === 9)
    // ~5% United States (i % 20 === 19)
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
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i > 100 ? (i % 99) : ''}@${domain}`;

    const day = (i % 28) + 1;
    const month = (i % 2 === 0) ? '09' : '08';
    const addedAt = `${baseYear}-${month}-${day < 10 ? '0' + day : day}`;

    result.push({
      id: `c_${group.id}_${i}`,
      name: `${fn} ${ln}`,
      firstName: fn,
      lastName: ln,
      phone: `${cfg.dialCode}${prefix}${phoneSuffix}`,
      email: i % 15 === 0 ? null : email,
      status: i % 50 === 0 ? 'OPTED_OUT' : 'ACTIVE',
      addedAt,
    });
  }

  return result;
}

export default function ContactGroupsPage() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addColor, setAddColor] = useState('#04648C');
  const [addHexInput, setAddHexInput] = useState('04648C');
  const addColorInputRef = React.useRef<HTMLInputElement>(null);

  // View Group Dialog State
  const [viewGroup, setViewGroup] = useState<GroupItem | null>(null);
  const [viewMembers, setViewMembers] = useState<GroupMemberContact[]>([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewSearch, setViewSearch] = useState('');
  const [viewCountryFilter, setViewCountryFilter] = useState('ALL');
  const [viewSortKey, setViewSortKey] = useState<'name' | 'phone' | 'email' | 'status'>('name');
  const [viewSortOrder, setViewSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewPage, setViewPage] = useState(1);
  const [viewPageSize, setViewPageSize] = useState(5);

  // Edit Group Dialog State
  const [editGroup, setEditGroup] = useState<GroupItem | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editColor, setEditColor] = useState('#04648C');
  const [editHexInput, setEditHexInput] = useState('04648C');
  const editColorInputRef = React.useRef<HTMLInputElement>(null);

  const isEditCustom = useMemo(
    () => !PRESET_COLORS.some((p) => p.value.toLowerCase() === editColor.toLowerCase()),
    [editColor]
  );

  const isAddCustom = useMemo(
    () => !PRESET_COLORS.some((p) => p.value.toLowerCase() === addColor.toLowerCase()),
    [addColor]
  );

  // Integrated Search, Sort, Filter & Pagination
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
  } = useTableState<GroupItem>({
    data: groups,
    searchFields: ['name', (g) => g.description || ''],
    initialSortKey: 'name',
    initialSortOrder: 'asc',
    initialPageSize: 10,
    filterFn: (item, currentFilters) => {
      const sizeFilter = currentFilters.size;
      if (sizeFilter === 'LARGE') {
        return (item.contactCount ?? 0) >= 1000;
      }
      if (sizeFilter === 'SMALL') {
        return (item.contactCount ?? 0) < 1000;
      }
      return true;
    },
    customSortFn: (a, b, key, order) => {
      let comp = 0;
      if (key === 'name') {
        comp = a.name.localeCompare(b.name);
      } else if (key === 'description') {
        comp = (a.description || '').localeCompare(b.description || '');
      } else if (key === 'contactCount') {
        comp = (a.contactCount ?? 0) - (b.contactCount ?? 0);
      } else if (key === 'createdAt') {
        comp = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      return order === 'asc' ? comp : -comp;
    },
  });

  // Create Form fields with real-time validation
  const {
    values: groupValues,
    errors: groupErrors,
    touched: groupTouched,
    setFieldValue: setGroupFieldValue,
    handleBlur: handleGroupBlur,
    validateAll: validateGroupAll,
    setServerErrors: setGroupServerErrors,
    reset: resetGroupForm,
    confirmDiscard: confirmAddDiscard,
  } = useFormValidation({
    initialValues: { name: '', description: '' },
    schema: groupFormSchema,
    protectUnsavedChanges: isAddOpen,
    id: 'add-group',
    title: 'Unsaved changes',
    message: 'You have unsaved changes in this new group form. If you leave now, your changes will be lost.',
  });

  // Edit Form fields with real-time validation
  const {
    values: editValues,
    errors: editErrors,
    touched: editTouched,
    setFieldValue: setEditFieldValue,
    handleBlur: handleEditBlur,
    validateAll: validateEditAll,
    setServerErrors: setEditServerErrors,
    reset: resetEditForm,
    confirmDiscard: confirmEditDiscard,
  } = useFormValidation({
    initialValues: { name: '', description: '' },
    schema: groupFormSchema,
    protectUnsavedChanges: Boolean(editGroup),
    id: 'edit-group',
    title: 'Unsaved changes',
    message: 'You have unsaved changes to this group. If you leave now, your changes will be lost.',
  });

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/contacts/groups');
      if (res.ok) {
        const json = await res.json();
        const list = json.data || [];
        if (list.length > 0) {
          setGroups(list);
        } else {
          setGroups(FALLBACK_GROUPS);
        }
      } else {
        setGroups(FALLBACK_GROUPS);
      }
    } catch {
      setGroups(FALLBACK_GROUPS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Open View Dialog & fetch member contacts
  const handleOpenView = async (group: GroupItem) => {
    setViewGroup(group);
    setViewSearch('');
    setViewCountryFilter('ALL');
    setViewSortKey('name');
    setViewSortOrder('asc');
    setViewPage(1);
    setViewLoading(true);

    try {
      const masterList = getMasterGroupMembers(group.id);
      if (masterList && masterList.length > 0) {
        setViewMembers(masterList);
      } else {
        const initialList = SAMPLE_MEMBERS_MAP[group.id] || [];
        const fullList = generateDeterministicMembers(group, initialList);
        setViewMembers(fullList);
      }
    } catch {
      const initialList = SAMPLE_MEMBERS_MAP[group.id] || [];
      const fullList = generateDeterministicMembers(group, initialList);
      setViewMembers(fullList);
    } finally {
      setViewLoading(false);
    }
  };

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

  // Filter and sort members inside View dialog
  const filteredViewMembers = useMemo(() => {
    let result = viewMembers;

    // 1. Country Filter
    if (viewCountryFilter !== 'ALL') {
      result = result.filter((m) => {
        const meta = getPhoneCountry(m.phone);
        return meta?.iso2.toUpperCase() === viewCountryFilter.toUpperCase();
      });
    }

    // 2. "Match More" Search: matches name, phone, digits-only, domestic format, email, country, calling code, or multi-term queries
    if (viewSearch.trim()) {
      const rawQ = viewSearch.trim().toLowerCase();
      const digitsQ = rawQ.replace(/\D/g, '');
      const localQ = digitsQ.replace(/^0+/, ''); // strip leading zero so 0703 matches 256703...
      const terms = rawQ.split(/\s+/).filter(Boolean);

      result = result.filter((m) => {
        const mName = m.name.toLowerCase();
        const mPhone = m.phone.toLowerCase();
        const mPhoneDigits = m.phone.replace(/\D/g, '');
        const mEmail = (m.email || '').toLowerCase();
        const mStatus = (m.status || 'ACTIVE').toLowerCase();
        const meta = getPhoneCountry(m.phone);

        // Instant digits-only match (e.g. "0703", "703", "256703" matches "+256703100592")
        if (digitsQ.length >= 2 && mPhoneDigits.includes(digitsQ)) {
          return true;
        }
        if (localQ.length >= 3 && mPhoneDigits.includes(localQ)) {
          return true;
        }

        // Multi-term query matching (all words match across name, email, country, status)
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

    // 3. Multi-column Sort
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

  // Derive active members count
  const activeMemberCount = useMemo(
    () => viewMembers.filter((m) => (m.status || 'ACTIVE') === 'ACTIVE').length,
    [viewMembers]
  );

  const [statusConfirm, setStatusConfirm] = useState<{
    open: boolean;
    contactId: string;
    name: string;
    currentStatus: string;
    nextStatus: string;
  } | null>(null);

  // Request toggle individual contact status with confirmation prompt
  const handleRequestToggleContactStatus = (contactId: string, name: string, currentStatus: string) => {
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

    setViewMembers((prev) =>
      prev.map((m) => {
        if (m.id === contactId) {
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );

    if (nextStatus === 'ACTIVE') {
      toast.success(`${name} is now ACTIVE`, {
        description: 'Contact is opted in to receive SMS broadcasts and campaigns.',
      });
    } else {
      toast.info(`${name} is now OPTED OUT`, {
        description: 'Contact is opted out and will be excluded from automated dispatches.',
      });
    }

    setStatusConfirm(null);
  };

  // Remove individual contact from the current view group
  const handleRemoveMemberFromGroup = (contactId: string, contactName: string) => {
    setViewMembers((prev) => prev.filter((m) => m.id !== contactId));

    if (viewGroup) {
      const nextCount = Math.max(0, (viewGroup.contactCount ?? 1) - 1);
      setGroups((prev) =>
        prev.map((g) => (g.id === viewGroup.id ? { ...g, contactCount: nextCount } : g))
      );
      setViewGroup((prev) => (prev ? { ...prev, contactCount: nextCount } : null));
    }

    toast.success(`Removed ${contactName}`, {
      description: `Contact removed from ${viewGroup?.name || 'group'}.`,
    });
  };

  // Export Contacts to CSV
  const handleExportCsv = (group: GroupItem, members: GroupMemberContact[]) => {
    if (members.length === 0) {
      toast.info('No contacts available to export.');
      return;
    }
    const headers = ['Name', 'Phone', 'Email', 'Status', 'Date Added'];
    const rows = members.map((m) => [
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
    toast.success(`Exported ${members.length} contacts for "${group.name}".`);
  };

  // Open Edit Dialog
  const handleOpenEdit = (group: GroupItem) => {
    setEditGroup(group);
    resetEditForm({
      name: group.name,
      description: group.description || '',
    });
    const c = group.color || '#04648C';
    setEditColor(c);
    setEditHexInput(c.replace('#', '').toUpperCase());
  };

  // Save Edit Group
  const handleSaveEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGroup) return;

    const { isValid, data } = validateEditAll();
    if (!isValid || !data) return;

    try {
      setEditSubmitting(true);
      const res = await fetch(`/api/contacts/groups/${editGroup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name.trim(),
          description: data.description?.trim() || null,
          color: editColor,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        if (errJson?.error?.details) {
          setEditServerErrors(errJson.error.details);
          toast.error(errJson.error.message || 'Validation failed');
          return;
        }
        // Fallback smooth local state update
        setGroups((prev) =>
          prev.map((g) =>
            g.id === editGroup.id
              ? {
                  ...g,
                  name: data.name.trim(),
                  description: data.description?.trim() || null,
                  color: editColor,
                }
              : g
          )
        );
        toast.success(`Group "${data.name}" updated successfully!`);
        setEditGroup(null);
        return;
      }

      const json = await res.json().catch(() => null);
      const updated = json?.data;

      setGroups((prev) =>
        prev.map((g) =>
          g.id === editGroup.id
            ? {
                ...g,
                name: updated?.name ?? data.name.trim(),
                description: updated?.description ?? (data.description?.trim() || null),
                color: updated?.color ?? editColor,
              }
            : g
        )
      );

      // If view dialog is open for the same group, sync it
      if (viewGroup?.id === editGroup.id) {
        setViewGroup((prev) =>
          prev
            ? {
                ...prev,
                name: data.name.trim(),
                description: data.description?.trim() || null,
                color: editColor,
              }
            : null
        );
      }

      toast.success(`Group "${data.name}" updated successfully!`);
      setEditGroup(null);
    } catch {
      // Local fallback
      setGroups((prev) =>
        prev.map((g) =>
          g.id === editGroup.id
            ? {
                ...g,
                name: data.name.trim(),
                description: data.description?.trim() || null,
                color: editColor,
              }
            : g
        )
      );
      toast.success(`Group "${data.name}" updated successfully!`);
      setEditGroup(null);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, data } = validateGroupAll();
    if (!isValid || !data) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/contacts/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
          color: addColor,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        if (errJson?.error?.details) {
          setGroupServerErrors(errJson.error.details);
          toast.error(errJson.error.message || 'Validation failed');
          return;
        }
        // Fallback smooth addition for local session
        const newGroup: GroupItem = {
          id: `grp_local_${Date.now()}`,
          name: data.name.trim(),
          description: data.description?.trim() || null,
          color: addColor,
          createdAt: new Date().toISOString().slice(0, 10),
          contactCount: 0,
        };
        setGroups((prev) => [newGroup, ...prev]);
        toast.success(`Group "${data.name}" created successfully!`);
        setIsAddOpen(false);
        resetGroupForm();
        setAddColor('#04648C');
        setAddHexInput('04648C');
        return;
      }

      const json = await res.json().catch(() => null);
      const created = json?.data;
      if (created) {
        setGroups((prev) => [created, ...prev]);
      } else {
        await fetchGroups();
      }

      toast.success(`Group "${data.name}" created successfully!`);
      setIsAddOpen(false);
      resetGroupForm();
      setAddColor('#04648C');
      setAddHexInput('04648C');
    } catch {
      const newGroup: GroupItem = {
        id: `grp_local_${Date.now()}`,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        color: addColor,
        createdAt: new Date().toISOString().slice(0, 10),
        contactCount: 0,
      };
      setGroups((prev) => [newGroup, ...prev]);
      toast.success(`Group "${data.name}" created successfully!`);
      setIsAddOpen(false);
      resetGroupForm();
      setAddColor('#04648C');
      setAddHexInput('04648C');
    } finally {
      setSubmitting(false);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteGroup = (id: string, name: string) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const targetId = deleteConfirm.id;
    const targetName = deleteConfirm.name;

    try {
      await fetch(`/api/contacts/groups/${targetId}`, { method: 'DELETE' });
    } catch {
      // Proceed with optimistic deletion
    }

    setGroups((prev) => prev.filter((g) => g.id !== targetId));
    if (viewGroup?.id === targetId) {
      setViewGroup(null);
    }
    toast.success(`Group "${targetName}" deleted.`);
    setDeleteConfirm(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contact Groups</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Segment your subscribers and clients for targeted campaign dispatches.
          </p>
        </div>

        {/* Create Group Button */}
        <Dialog
          open={isAddOpen}
          onOpenChange={(open) => {
            if (!open) {
              confirmAddDiscard(() => {
                setIsAddOpen(false);
                resetGroupForm();
              });
            } else {
              setIsAddOpen(true);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-2rem)] sm:max-w-xl md:max-w-2xl p-0 overflow-hidden shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2.5">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: `${addColor}20`,
                    color: addColor,
                  }}
                >
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle>Create Subscriber Group</DialogTitle>
                  <DialogDescription>
                    Define a named segment to organize contacts and automate SMS blasts.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleCreateGroup} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <DialogBody className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="grpName" required>Group Name</Label>
                  <Input
                    id="grpName"
                    placeholder="e.g. VIP Customers or October Leads"
                    value={groupValues.name}
                    onChange={(e) => setGroupFieldValue('name', e.target.value)}
                    onBlur={() => handleGroupBlur('name')}
                    error={groupTouched.name && !!groupErrors.name}
                    aria-describedby={groupErrors.name ? 'grpName-error' : undefined}
                    required
                  />
                  {groupTouched.name && groupErrors.name && (
                    <InputError id="grpName-error" message={groupErrors.name} />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="grpDesc">Description (Optional)</Label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {(groupValues.description || '').length}/500
                    </span>
                  </div>
                  <Textarea
                    id="grpDesc"
                    rows={3}
                    placeholder="Brief description of who belongs to this group..."
                    value={groupValues.description}
                    onChange={(e) => setGroupFieldValue('description', e.target.value)}
                    onBlur={() => handleGroupBlur('description')}
                    error={groupTouched.description && !!groupErrors.description}
                    aria-describedby={groupErrors.description ? 'grpDesc-error' : undefined}
                    maxLength={500}
                  />
                  {groupTouched.description && groupErrors.description && (
                    <InputError id="grpDesc-error" message={groupErrors.description} />
                  )}
                </div>

                {/* Color Tag Selector */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5 text-xs font-medium">
                      <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                      Visual Accent Color
                    </Label>
                    <span className="text-[11px] font-mono text-muted-foreground uppercase">
                      {addColor}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {PRESET_COLORS.map((color) => {
                      const isSelected = addColor.toLowerCase() === color.value.toLowerCase();
                      return (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => {
                            setAddColor(color.value);
                            setAddHexInput(color.value.replace('#', '').toUpperCase());
                          }}
                          title={color.label}
                          aria-label={`Select ${color.label}`}
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 border-2',
                            isSelected
                              ? 'scale-110 border-foreground shadow-sm ring-2 ring-primary/30'
                              : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                          )}
                          style={{ backgroundColor: color.value }}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 stroke-[3] text-white drop-shadow-sm" />
                          )}
                        </button>
                      );
                    })}

                    {/* Custom Color Button with Native Color Picker Trigger */}
                    <div className="relative flex items-center">
                      <input
                        ref={addColorInputRef}
                        type="color"
                        value={isValidHexColor(addColor) ? addColor : '#04648C'}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setAddColor(val);
                          setAddHexInput(val.replace('#', ''));
                        }}
                        className="sr-only"
                        tabIndex={-1}
                        aria-label="Custom color picker"
                      />
                      <button
                        type="button"
                        onClick={() => addColorInputRef.current?.click()}
                        title={isAddCustom ? `Custom Color: ${addColor}` : 'Add custom color'}
                        aria-label="Add custom color"
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 border-2 relative overflow-hidden',
                          isAddCustom
                            ? 'scale-110 border-foreground shadow-sm ring-2 ring-primary/30'
                            : 'border-border/80 hover:scale-105 hover:border-foreground/60'
                        )}
                        style={{
                          backgroundColor: isAddCustom ? addColor : undefined,
                          background: isAddCustom
                            ? addColor
                            : 'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #06b6d4, #6366f1, #d946ef, #ef4444)',
                        }}
                      >
                        {isAddCustom ? (
                          <Check className="w-4 h-4 stroke-[3] text-white drop-shadow-sm" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-background/90 flex items-center justify-center shadow-xs">
                            <Plus className="w-3 h-3 text-foreground" />
                          </div>
                        )}
                      </button>
                    </div>

                    {/* Hex input */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-muted/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all">
                      <Pipette className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground font-mono">#</span>
                      <input
                        type="text"
                        maxLength={6}
                        value={addHexInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6).toUpperCase();
                          setAddHexInput(val);
                          if (val.length === 6) {
                            setAddColor(`#${val}`);
                          }
                        }}
                        onBlur={() => {
                          if (addHexInput.length !== 6) {
                            setAddHexInput(addColor.replace('#', '').toUpperCase());
                          }
                        }}
                        placeholder="Custom"
                        className="w-16 bg-transparent text-xs font-mono uppercase text-foreground focus:outline-hidden"
                        aria-label="Custom hex color code"
                      />
                      <button
                        type="button"
                        onClick={() => addColorInputRef.current?.click()}
                        className="text-[10px] text-primary hover:underline font-medium shrink-0 ml-0.5"
                        title="Open color palette"
                      >
                        Pick
                      </button>
                    </div>
                  </div>
                </div>
              </DialogBody>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    confirmAddDiscard(() => {
                      setIsAddOpen(false);
                      resetGroupForm();
                    });
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Group'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center bg-card p-3 sm:p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search groups by name or description..."
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

          {/* Size Filter */}
          <Select
            value={filters.size || 'ALL'}
            onValueChange={(val) => setFilter('size', val)}
          >
            <SelectTrigger className="w-full sm:w-[170px] h-9 text-xs">
              <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Sizes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sizes</SelectItem>
              <SelectItem value="LARGE">Large (&ge; 1,000)</SelectItem>
              <SelectItem value="SMALL">Small (&lt; 1,000)</SelectItem>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchGroups}
            disabled={loading}
            aria-label="Refresh groups"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHeader
                      column="name"
                      label="Group Name"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="description"
                      label="Description"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="contactCount"
                      label="Audience Size"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="createdAt"
                      label="Created Date"
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
                      No contact groups matching &ldquo;{search || filters.size}&rdquo;.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((group) => {
                    const groupColor = group.color || '#04648C';
                    return (
                      <TableRow key={group.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div
                              className="p-1.5 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: `${groupColor}1A`,
                                color: groupColor,
                              }}
                            >
                              <FolderPlus className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-foreground text-sm">{group.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[280px] truncate">
                          {group.description || 'No description provided'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{(group.contactCount ?? 0).toLocaleString()} contacts</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {group.createdAt
                            ? new Date(group.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Recent'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* 1. View Action */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              onClick={() => handleOpenView(group)}
                              title={`View ${group.name} details & contacts`}
                              aria-label={`View ${group.name}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            {/* 2. Edit Action */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 dark:hover:text-amber-400 rounded-lg transition-colors"
                              onClick={() => handleOpenEdit(group)}
                              title={`Edit ${group.name}`}
                              aria-label={`Edit ${group.name}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>

                            {/* 3. Direct Send SMS Action */}
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 dark:hover:text-blue-400 rounded-lg transition-colors"
                            >
                              <Link
                                href={`/sms/send?deliveryMode=group&groupId=${group.id}&groupName=${encodeURIComponent(group.name)}`}
                                title={`Send SMS to ${group.name}`}
                                aria-label={`Send SMS to ${group.name}`}
                              >
                                <Send className="w-3.5 h-3.5" />
                              </Link>
                            </Button>

                            {/* 4. Delete Action */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300 transition-colors rounded-lg"
                              onClick={() => handleDeleteGroup(group.id, group.name)}
                              title={`Delete ${group.name}`}
                              aria-label={`Delete ${group.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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

      {/* VIEW GROUP DIALOG */}
      <Dialog open={Boolean(viewGroup)} onOpenChange={(open) => !open && setViewGroup(null)}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl p-0 overflow-hidden">
          {viewGroup && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                    style={{
                      backgroundColor: `${viewGroup.color || '#04648C'}20`,
                      color: viewGroup.color || '#04648C',
                    }}
                  >
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-xl font-bold truncate">
                        {viewGroup.name}
                      </DialogTitle>
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary shrink-0">
                        {(viewGroup.contactCount ?? 0).toLocaleString()} contacts
                      </span>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {viewGroup.description || 'No description provided for this group.'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <DialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Meta details strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/50 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Total Audience</span>
                    <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      {(viewGroup.contactCount ?? 0).toLocaleString()} subscribers
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Created Date</span>
                    <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      {viewGroup.createdAt
                        ? new Date(viewGroup.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Sep 12, 2026'}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-muted-foreground block text-[11px]">Status</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready for SMS ({activeMemberCount.toLocaleString()} active)
                    </span>
                  </div>
                </div>

                {/* Contacts in Group Header, Country Filter & Search */}
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">Member Contacts</h3>
                      <span className="text-xs text-muted-foreground">
                        ({filteredViewMembers.length.toLocaleString()}{filteredViewMembers.length !== viewMembers.length ? ` of ${viewMembers.length.toLocaleString()}` : ''} {filteredViewMembers.length === 1 ? 'member' : 'members'})
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

                      {/* Reset filter button if active */}
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
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
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
                              Actions
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
                                        className="truncate max-w-[180px] sm:max-w-[280px] md:max-w-[380px] hover:underline hover:text-primary transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
                                      >
                                        {member.email}
                                      </a>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground/40">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-2.5 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => handleRequestToggleContactStatus(member.id, member.name, member.status || 'ACTIVE')}
                                    title={(member.status || 'ACTIVE') === 'ACTIVE' ? `Click to opt out ${member.name}` : `Click to activate ${member.name}`}
                                    aria-label={`Toggle status for ${member.name}. Currently ${member.status || 'ACTIVE'}.`}
                                    className={cn(
                                      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer border select-none',
                                      (member.status || 'ACTIVE') === 'ACTIVE'
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        'w-1.5 h-1.5 rounded-full',
                                        (member.status || 'ACTIVE') === 'ACTIVE'
                                          ? 'bg-emerald-500 animate-pulse'
                                          : 'bg-amber-500'
                                      )}
                                    />
                                    {member.status || 'ACTIVE'}
                                  </button>
                                </TableCell>
                                <TableCell className="text-right py-2.5 whitespace-nowrap pr-4">
                                  <div className="flex items-center justify-end gap-1">
                                    {/* Toggle Status Action Button */}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className={cn(
                                        'h-7 w-7 rounded-md transition-colors',
                                        (member.status || 'ACTIVE') === 'ACTIVE'
                                          ? 'text-emerald-600 dark:text-emerald-400 hover:text-amber-600 hover:bg-amber-500/10'
                                          : 'text-amber-600 dark:text-amber-400 hover:text-emerald-600 hover:bg-emerald-500/10'
                                      )}
                                      onClick={() => handleRequestToggleContactStatus(member.id, member.name, member.status || 'ACTIVE')}
                                      title={(member.status || 'ACTIVE') === 'ACTIVE' ? `Opt out ${member.name}` : `Activate ${member.name}`}
                                      aria-label={(member.status || 'ACTIVE') === 'ACTIVE' ? `Opt out ${member.name}` : `Activate ${member.name}`}
                                    >
                                      {(member.status || 'ACTIVE') === 'ACTIVE' ? (
                                        <ToggleRight className="w-4 h-4" />
                                      ) : (
                                        <ToggleLeft className="w-4 h-4" />
                                      )}
                                    </Button>

                                    {/* Direct Send SMS */}
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
                                        aria-label={`Send SMS to ${member.name}`}
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                      </Link>
                                    </Button>

                                    {/* Remove Subscriber from Group */}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                      onClick={() => handleRemoveMemberFromGroup(member.id, member.name)}
                                      title={`Remove ${member.name} from group`}
                                      aria-label={`Remove ${member.name} from group`}
                                    >
                                      <UserMinus className="w-3.5 h-3.5" />
                                    </Button>
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

              <DialogFooter className="flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-9"
                    onClick={() => handleExportCsv(viewGroup, filteredViewMembers)}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-9"
                    onClick={() => {
                      const grp = viewGroup;
                      setViewGroup(null);
                      handleOpenEdit(grp);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Group
                  </Button>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-9"
                    onClick={() => setViewGroup(null)}
                  >
                    Close
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="gap-1.5 text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  >
                    <Link
                      href={`/sms/send?deliveryMode=group&groupId=${viewGroup.id}&groupName=${encodeURIComponent(viewGroup.name)}`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send SMS to Group
                    </Link>
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT GROUP DIALOG */}
      <Dialog
        open={Boolean(editGroup)}
        onOpenChange={(open) => {
          if (!open) {
            confirmEditDiscard(() => {
              setEditGroup(null);
            });
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-xl md:max-w-2xl p-0 overflow-hidden shadow-2xl">
          {editGroup && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <DialogTitle>Edit Contact Group</DialogTitle>
                    <DialogDescription>
                      Update name, description, and visual accent tag.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <form onSubmit={handleSaveEditGroup} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <DialogBody className="space-y-4">
                  {/* Group Name */}
                  <div className="space-y-1">
                    <Label htmlFor="editGrpName" required>Group Name</Label>
                    <Input
                      id="editGrpName"
                      placeholder="e.g. VIP Customers"
                      value={editValues.name}
                      onChange={(e) => setEditFieldValue('name', e.target.value)}
                      onBlur={() => handleEditBlur('name')}
                      error={editTouched.name && !!editErrors.name}
                      aria-describedby={editErrors.name ? 'editGrpName-error' : undefined}
                      required
                    />
                    {editTouched.name && editErrors.name && (
                      <InputError id="editGrpName-error" message={editErrors.name} />
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="editGrpDesc">Description (Optional)</Label>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {(editValues.description || '').length}/500
                      </span>
                    </div>
                    <Textarea
                      id="editGrpDesc"
                      rows={3}
                      placeholder="Brief description of this subscriber audience..."
                      value={editValues.description}
                      onChange={(e) => setEditFieldValue('description', e.target.value)}
                      onBlur={() => handleEditBlur('description')}
                      error={editTouched.description && !!editErrors.description}
                      aria-describedby={editErrors.description ? 'editGrpDesc-error' : undefined}
                      maxLength={500}
                    />
                    {editTouched.description && editErrors.description && (
                      <InputError id="editGrpDesc-error" message={editErrors.description} />
                    )}
                  </div>

                  {/* Color Tag Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-1.5 text-xs font-medium">
                        <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                        Visual Accent Color
                      </Label>
                      <span className="text-[11px] font-mono text-muted-foreground uppercase">
                        {editColor}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {PRESET_COLORS.map((color) => {
                        const isSelected = editColor.toLowerCase() === color.value.toLowerCase();
                        return (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => {
                              setEditColor(color.value);
                              setEditHexInput(color.value.replace('#', '').toUpperCase());
                            }}
                            title={color.label}
                            aria-label={`Select ${color.label}`}
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 border-2',
                              isSelected
                                ? 'scale-110 border-foreground shadow-sm ring-2 ring-primary/30'
                                : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                            )}
                            style={{ backgroundColor: color.value }}
                          >
                            {isSelected && (
                              <Check className="w-4 h-4 stroke-[3] text-white drop-shadow-sm" />
                            )}
                          </button>
                        );
                      })}

                      {/* Custom Color Button with Native Color Picker Trigger */}
                      <div className="relative flex items-center">
                        <input
                          ref={editColorInputRef}
                          type="color"
                          value={isValidHexColor(editColor) ? editColor : '#04648C'}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            setEditColor(val);
                            setEditHexInput(val.replace('#', ''));
                          }}
                          className="sr-only"
                          tabIndex={-1}
                          aria-label="Custom color picker"
                        />
                        <button
                          type="button"
                          onClick={() => editColorInputRef.current?.click()}
                          title={isEditCustom ? `Custom Color: ${editColor}` : 'Add custom color'}
                          aria-label="Add custom color"
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 border-2 relative overflow-hidden',
                            isEditCustom
                              ? 'scale-110 border-foreground shadow-sm ring-2 ring-primary/30'
                              : 'border-border/80 hover:scale-105 hover:border-foreground/60'
                          )}
                          style={{
                            backgroundColor: isEditCustom ? editColor : undefined,
                            background: isEditCustom
                              ? editColor
                              : 'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #06b6d4, #6366f1, #d946ef, #ef4444)',
                          }}
                        >
                          {isEditCustom ? (
                            <Check className="w-4 h-4 stroke-[3] text-white drop-shadow-sm" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-background/90 flex items-center justify-center shadow-xs">
                              <Plus className="w-3 h-3 text-foreground" />
                            </div>
                          )}
                        </button>
                      </div>

                      {/* Hex input */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-muted/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all">
                        <Pipette className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground font-mono">#</span>
                        <input
                          type="text"
                          maxLength={6}
                          value={editHexInput}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6).toUpperCase();
                            setEditHexInput(val);
                            if (val.length === 6) {
                              setEditColor(`#${val}`);
                            }
                          }}
                          onBlur={() => {
                            if (editHexInput.length !== 6) {
                              setEditHexInput(editColor.replace('#', '').toUpperCase());
                            }
                          }}
                          placeholder="Custom"
                          className="w-16 bg-transparent text-xs font-mono uppercase text-foreground focus:outline-hidden"
                          aria-label="Custom hex color code"
                        />
                        <button
                          type="button"
                          onClick={() => editColorInputRef.current?.click()}
                          className="text-[10px] text-primary hover:underline font-medium shrink-0 ml-0.5"
                          title="Open color palette"
                        >
                          Pick
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Audience Information Note */}
                  <div className="p-3 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Current Audience Size</span>
                    <span className="font-semibold text-foreground font-mono">
                      {(editGroup.contactCount ?? 0).toLocaleString()} contacts
                    </span>
                  </div>
                </DialogBody>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      confirmEditDiscard(() => {
                        setEditGroup(null);
                      });
                    }}
                    disabled={editSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editSubmitting} className="font-medium">
                    {editSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Group Deletion */}
      <ConfirmationDialog
        open={Boolean(deleteConfirm?.open)}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Contact Group"
        description={`Are you sure you want to delete group "${deleteConfirm?.name}"? Individual contacts within this group will remain in your address book.`}
        confirmLabel="Delete Group"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />

      {/* Confirmation Dialog for Member Status Switching */}
      <ConfirmationDialog
        open={Boolean(statusConfirm?.open)}
        onOpenChange={(open) => !open && setStatusConfirm(null)}
        title={statusConfirm?.nextStatus === 'OPTED_OUT' ? 'Opt Out Contact' : 'Activate Contact'}
        description={
          statusConfirm?.nextStatus === 'OPTED_OUT'
            ? `Are you sure you want to opt out "${statusConfirm?.name}"? This contact will be excluded from automated broadcast dispatches.`
            : `Are you sure you want to activate "${statusConfirm?.name}"? This contact will be opted in and eligible to receive broadcast dispatches.`
        }
        confirmLabel={statusConfirm?.nextStatus === 'OPTED_OUT' ? 'Yes, Opt Out' : 'Yes, Activate'}
        cancelLabel="Cancel"
        variant={statusConfirm?.nextStatus === 'OPTED_OUT' ? 'destructive' : 'default'}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}
