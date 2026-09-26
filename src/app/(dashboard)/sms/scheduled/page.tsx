'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalendarClock,
  Trash2,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  X,
  Pencil,
  Lock,
  Clock,
  AlertTriangle,
  Users,
  Repeat,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/feedback/confirmation-dialog';
import { Pagination } from '@/components/ui/pagination';
import { SortableHeader } from '@/components/ui/sortable-header';
import { useTableState } from '@/hooks/use-table-state';
import {
  EditScheduledMessageDialog,
  ScheduledMessageData,
} from '@/components/sms/edit-scheduled-message-dialog';
import { cn } from '@/lib/utils';
import {
  isScheduledViewItem,
  describeRecurrence,
  serializeRecurrence,
} from '@/lib/sms/recurrence';

interface ScheduledItem {
  id: string;
  name: string;
  message?: string;
  senderId?: string;
  senderName?: string;
  scheduledAt: string;
  recipients: number;
  status: 'SCHEDULED' | 'PAUSED';
  isEditingPaused?: boolean;
  isRecurring?: boolean;
  cronExpression?: string | null;
}

export function formatScheduledTime(dateStr: string) {
  const dt = new Date(dateStr);
  if (isNaN(dt.getTime())) return dateStr;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

const INITIAL_SCHEDULED: ScheduledItem[] = [
  {
    id: '1',
    name: 'Weekly VIP Member Offer',
    message: 'Hello {{firstName}}, enjoy 20% off all Range SMS packages this week! Use code WEEKLY20 at checkout.',
    senderName: 'RANGESMS',
    scheduledAt: '2026-09-28T09:00:00.000Z',
    recipients: 1250,
    status: 'SCHEDULED',
    isRecurring: true,
    cronExpression: serializeRecurrence(
      { frequency: 'WEEKLY', interval: 1, daysOfWeek: [1], endType: 'NEVER' },
      '09:00'
    ),
  },
  {
    id: '2',
    name: 'Reminder: Carrier Routing Webinar',
    message: 'Hi {{firstName}}, our live carrier routing webinar starts today at 2:30 PM. Join link: https://sms.rangeview.com/webinar',
    senderName: 'RANGENOTIF',
    scheduledAt: '2026-10-01T14:30:00.000Z',
    recipients: 450,
    status: 'PAUSED',
    isRecurring: false,
  },
  {
    id: '3',
    name: 'End of Month Statement',
    message: 'Dear {{firstName}}, your September billing statement is now available in your Range View dashboard account.',
    senderName: 'RANGEBILL',
    scheduledAt: '2026-09-30T08:00:00.000Z',
    recipients: 5200,
    status: 'SCHEDULED',
    isRecurring: false,
  },
  {
    id: '4',
    name: 'Daily System Health Summary',
    message: 'System Status: All telecom gateway routes operating at 99.98% delivery rate. MTN, Airtel, and Safaricom active.',
    senderName: 'RANGESMS',
    scheduledAt: '2026-09-27T08:00:00.000Z',
    recipients: 890,
    status: 'SCHEDULED',
    isRecurring: true,
    cronExpression: serializeRecurrence(
      { frequency: 'DAILY', interval: 1, endType: 'NEVER' },
      '08:00'
    ),
  },
  {
    id: '5',
    name: 'Telecom Gateway Maintenance Notice',
    message: 'Notice: Telecom gateway maintenance scheduled on Oct 2, 22:00-23:00 EAT. SMS delivery will queue automatically during this window.',
    senderName: 'RANGESMS',
    scheduledAt: '2026-10-02T22:00:00.000Z',
    recipients: 1800,
    status: 'SCHEDULED',
    isRecurring: false,
  },
  {
    id: '6',
    name: 'VIP Loyalty Bonus Alert',
    message: 'Exclusive VIP alert for {{company}}: Top up 1,000,000 UGX today and receive 100,000 UGX bonus credits instantly.',
    senderName: 'RANGEVIP',
    scheduledAt: '2026-10-05T11:30:00.000Z',
    recipients: 620,
    status: 'PAUSED',
    isRecurring: false,
  },
];

export default function ScheduledSmsPage() {
  const [items, setItems] = useState<ScheduledItem[]>(INITIAL_SCHEDULED);
  const [now, setNow] = useState(() => Date.now());

  // Editing state
  const [editingItem, setEditingItem] = useState<ScheduledMessageData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // 1-second ticker for real-time countdowns and 10s rule check
  useEffect(() => {
    const ticker = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    async function loadScheduled() {
      try {
        const res = await fetch('/api/sms/schedule?limit=50');
        if (res.ok) {
          const json = await res.json();
          const list: Array<{
            id: string;
            message?: string;
            scheduledAt: string;
            recipientCount?: number;
            status?: string;
            isRecurring?: boolean;
            cronExpression?: string | null;
            senderId?: { id: string; senderId: string };
          }> = json.data || [];

          if (list.length > 0) {
            const mapped: ScheduledItem[] = list.map((item) => ({
              id: item.id,
              name: item.message?.slice(0, 30) || 'Scheduled Broadcast',
              message: item.message || '',
              senderName: item.senderId?.senderId || 'RANGESMS',
              scheduledAt: new Date(item.scheduledAt).toISOString(),
              recipients: item.recipientCount || 0,
              status: item.status === 'PAUSED' ? 'PAUSED' : 'SCHEDULED',
              isRecurring: Boolean(item.isRecurring),
              cronExpression: item.cronExpression || null,
            }));

            setItems([...mapped, ...INITIAL_SCHEDULED.filter((is) => !mapped.some((m) => m.id === is.id))]);
          }
        }
      } catch {
        // Retain fallback
      }
    }
    loadScheduled();
  }, []);

  // Filter items according to user requirement:
  // "show only messages that are unsent, paused, or whose sending dates have not yet arrived, as well as recurring ones"
  const visibleScheduledItems = useMemo(() => {
    return items.filter((item) => isScheduledViewItem(item, now));
  }, [items, now]);

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
  } = useTableState<ScheduledItem>({
    data: visibleScheduledItems,
    searchFields: ['name', 'scheduledAt', (i) => i.recipients, 'status'],
    initialSortKey: 'scheduledAt',
    initialSortOrder: 'asc',
    initialPageSize: 10,
    filterFn: (item, currentFilters) => {
      const status = currentFilters.status;
      if (!status || status === 'ALL') return true;
      if (status === 'RECURRING') return Boolean(item.isRecurring);
      if (status === 'SCHEDULED') return item.status === 'SCHEDULED' && !item.isRecurring;
      if (status === 'PAUSED') return item.status === 'PAUSED';
      return true;
    },
    customSortFn: (a, b, key, order) => {
      let comp = 0;
      if (key === 'name') {
        comp = a.name.localeCompare(b.name);
      } else if (key === 'scheduledAt') {
        comp = new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      } else if (key === 'recipients') {
        comp = a.recipients - b.recipients;
      } else if (key === 'status') {
        comp = a.status.localeCompare(b.status);
      }
      return order === 'asc' ? comp : -comp;
    },
  });

  // Check 10-second rule helper
  const isLockedWithin10s = (item: ScheduledItem) => {
    if (item.status !== 'SCHEDULED') return false;
    const timeMs = new Date(item.scheduledAt).getTime();
    return timeMs - now < 10_000;
  };

  // Remaining time and badge formatter
  const getRemainingTimeMeta = (item: ScheduledItem) => {
    const dt = new Date(item.scheduledAt);
    if (isNaN(dt.getTime())) {
      return { text: 'Invalid Date', isLocked: false, isPast: false };
    }

    const diffMs = dt.getTime() - now;

    if (item.status === 'PAUSED') {
      return {
        text: 'Paused',
        isLocked: false,
        isPast: diffMs <= 0,
      };
    }

    if (diffMs <= 0) {
      return {
        text: 'Past Due (Reschedule Required)',
        isLocked: false,
        isPast: true,
      };
    }

    if (diffMs < 10_000) {
      const secs = Math.max(1, Math.ceil(diffMs / 1000));
      return {
        text: `Sending in ${secs}s (Locked)`,
        isLocked: true,
        isPast: false,
      };
    }

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return { text: `in ${days}d ${hours % 24}h`, isLocked: false, isPast: false };
    if (hours > 0) return { text: `in ${hours}h ${minutes % 60}m`, isLocked: false, isPast: false };
    if (minutes > 0) return { text: `in ${minutes}m`, isLocked: false, isPast: false };
    return { text: `in ${Math.floor(diffMs / 1000)}s`, isLocked: false, isPast: false };
  };

  // Handle Edit Action
  const handleEditClick = async (item: ScheduledItem) => {
    const diffMs = new Date(item.scheduledAt).getTime() - now;

    // 10-second rule enforcement
    if (item.status === 'SCHEDULED' && diffMs < 10_000) {
      toast.error(
        'Cannot edit message within 10 seconds of scheduled transmission. The dispatch window has already started.',
        {
          description: 'Messages queued for carrier handoff cannot be edited within 10 seconds of dispatch.',
          duration: 5000,
        }
      );
      return;
    }

    // "and while the user is editing the scheduled message, please pause the message from being sent again, please"
    if (item.status === 'SCHEDULED') {
      try {
        await fetch('/api/sms/schedule', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, action: 'pause_for_edit' }),
        });
      } catch {
        // Best-effort
      }

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: 'PAUSED', isEditingPaused: true } : i
        )
      );

      toast.info(`Campaign "${item.name}" paused for safe editing.`, {
        description: 'Transmission has been held so it will not send while you make changes.',
      });
    }

    setEditingItem({
      id: item.id,
      name: item.name,
      message: item.message || item.name,
      senderName: item.senderName || 'RANGESMS',
      scheduledAt: item.scheduledAt,
      recipients: item.recipients,
      status: 'PAUSED',
      isEditingPaused: true,
      isRecurring: item.isRecurring,
      cronExpression: item.cronExpression,
    });
    setIsEditDialogOpen(true);
  };

  // Handle Save in Edit Modal
  const handleSaveEdit = async (updated: {
    id: string;
    message: string;
    scheduledAt: string;
    status: 'SCHEDULED' | 'PAUSED';
    senderId?: string;
    isRecurring?: boolean;
    cronExpression?: string | null;
  }) => {
    const res = await fetch('/api/sms/schedule', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: updated.id,
        message: updated.message,
        scheduledAt: updated.scheduledAt,
        status: updated.status,
        senderId: updated.senderId,
        isRecurring: updated.isRecurring,
        cronExpression: updated.cronExpression,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.error || 'Failed to update scheduled message.');
    }

    const formattedDate = new Date(updated.scheduledAt)
      .toISOString()
      .replace('T', ' ')
      .slice(0, 16);

    setItems((prev) =>
      prev.map((i) => {
        if (i.id === updated.id) {
          return {
            ...i,
            message: updated.message,
            name: updated.message.slice(0, 30) || i.name,
            scheduledAt: formattedDate,
            status: updated.status,
            isEditingPaused: false,
            isRecurring: updated.isRecurring,
            cronExpression: updated.cronExpression,
          };
        }
        return i;
      })
    );

    toast.success(
      updated.status === 'SCHEDULED'
        ? `Scheduled message updated and queued for ${formattedDate}.`
        : 'Scheduled message updated and kept paused.'
    );
  };

  const [statusConfirm, setStatusConfirm] = useState<{
    open: boolean;
    id: string;
    name: string;
    nextStatus: 'PAUSED' | 'SCHEDULED';
  } | null>(null);

  const handleRequestToggleStatus = (id: string, name: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'SCHEDULED' ? 'PAUSED' : 'SCHEDULED';
    setStatusConfirm({
      open: true,
      id,
      name,
      nextStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusConfirm) return;
    const { id, name, nextStatus } = statusConfirm;
    const item = items.find((i) => i.id === id);

    // If resuming a non-recurring message, enforce future time rule
    if (nextStatus === 'SCHEDULED' && item && !item.isRecurring) {
      const diffMs = new Date(item.scheduledAt).getTime() - now;
      if (diffMs < 10_000) {
        toast.error(
          'Cannot resume a message whose scheduled time has passed or is within 10 seconds.',
          {
            description: 'Please edit the message and update its scheduled date and time to a future time first.',
            duration: 5000,
          }
        );
        setStatusConfirm(null);
        handleEditClick(item);
        return;
      }
    }

    try {
      await fetch('/api/sms/schedule', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'toggle_status' }),
      });
    } catch {
      // Best-effort
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, status: nextStatus, isEditingPaused: false };
        }
        return item;
      })
    );

    toast.info(`Campaign "${name}" ${nextStatus === 'PAUSED' ? 'paused' : 'resumed'}.`);
    setStatusConfirm(null);
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await fetch(`/api/sms/schedule?id=${deleteConfirm.id}`, { method: 'DELETE' });
    } catch {
      // Best-effort
    }
    setItems((prev) => prev.filter((item) => item.id !== deleteConfirm.id));
    toast.success(`Scheduled message "${deleteConfirm.name}" cancelled.`);
    setDeleteConfirm(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader
        title="Scheduled Messages"
        description="View, edit, and manage messages queued for future delivery."
        action={
          <Button asChild className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
            <Link href="/sms/send">
              <Plus className="w-4 h-4 mr-2" />
              Schedule New SMS
            </Link>
          </Button>
        }
      />

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center bg-card p-3 sm:p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search scheduled campaigns..."
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

          {/* Status Filter */}
          <Select
            value={filters.status || 'ALL'}
            onValueChange={(val) => setFilter('status', val)}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
              <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Active Queue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Active Queue</SelectItem>
              <SelectItem value="SCHEDULED">One-time Broadcasts</SelectItem>
              <SelectItem value="RECURRING">Recurring Series</SelectItem>
              <SelectItem value="PAUSED">Paused Messages</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-3 gap-1.5 shrink-0"
            onClick={() => toggleSort(sortKey || 'scheduledAt')}
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
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Dual Table/Card Layout */}
          {/* 1. Desktop Table (hidden md:block) */}
          <div className="hidden md:block w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[28%]">
                    <SortableHeader
                      column="name"
                      label="Campaign / Message"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead className="w-[24%]">
                    <SortableHeader
                      column="scheduledAt"
                      label="Scheduled / Recurrence"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead className="w-[16%]">
                    <SortableHeader
                      column="recipients"
                      label="Recipients"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead className="w-[16%]">
                    <SortableHeader
                      column="status"
                      label="Status"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead className="w-[16%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No scheduled messages matching &ldquo;{search || filters.status}&rdquo;.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => {
                    const locked = isLockedWithin10s(item);
                    const timeMeta = getRemainingTimeMeta(item);

                    return (
                      <TableRow key={item.id} className="hover:bg-muted/30 transition-colors group">
                        {/* Campaign Name & preview */}
                        <TableCell className="font-medium text-foreground">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.name}
                            </span>
                            {item.message && (
                              <span className="text-[11px] text-muted-foreground line-clamp-1">
                                {item.message}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Scheduled Time + Recurrence info */}
                        <TableCell className="text-muted-foreground">
                          {item.isRecurring ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-xs text-foreground">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] border border-indigo-500/20">
                                  <Repeat className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                  {describeRecurrence(item.cronExpression)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <CalendarClock className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                                <span>Next: {formatScheduledTime(item.scheduledAt)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-xs text-foreground">
                                <CalendarClock className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>{formatScheduledTime(item.scheduledAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {timeMeta.isPast ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-destructive dark:text-red-400">
                                    <AlertTriangle className="w-3 h-3" /> Past Due
                                  </span>
                                ) : timeMeta.isLocked ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                    <Lock className="w-3 h-3" /> {timeMeta.text}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                                    <Clock className="w-3 h-3 text-muted-foreground/70" /> {timeMeta.text}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </TableCell>

                        {/* Recipients */}
                        <TableCell className="text-muted-foreground text-xs">
                          {item.recipients.toLocaleString()} contacts
                        </TableCell>

                        {/* Status Badge */}
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            {item.status === 'PAUSED' ? (
                              <Badge
                                variant="secondary"
                                className="font-medium text-xs bg-muted text-muted-foreground"
                              >
                                PAUSED
                              </Badge>
                            ) : item.isRecurring ? (
                              <Badge
                                variant="outline"
                                className="font-semibold text-[11px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 gap-1"
                              >
                                <Repeat className="w-2.5 h-2.5" /> RECURRING
                              </Badge>
                            ) : (
                              <Badge
                                variant="default"
                                className="font-medium text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                              >
                                SCHEDULED
                              </Badge>
                            )}
                            {item.isEditingPaused && (
                              <span className="text-[9px] font-medium text-amber-600 dark:text-amber-400">
                                (Editing)
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Actions: Edit, Pause/Resume, Delete */}
                        <TableCell className="text-right space-x-1.5">
                          {/* Edit Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={locked}
                            className={cn(
                              'h-8 w-8 transition-colors rounded-lg',
                              locked
                                ? 'opacity-40 cursor-not-allowed text-muted-foreground'
                                : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                            )}
                            onClick={() => handleEditClick(item)}
                            title={
                              locked
                                ? 'Locked for transmission (< 10s before delivery)'
                                : 'Edit scheduled message'
                            }
                            aria-label={`Edit scheduled message ${item.name}`}
                          >
                            {locked ? (
                              <Lock className="w-4 h-4 text-amber-500" />
                            ) : (
                              <Pencil className="w-4 h-4" />
                            )}
                          </Button>

                          {/* Pause / Resume Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                            onClick={() => handleRequestToggleStatus(item.id, item.name, item.status)}
                            aria-label={item.status === 'SCHEDULED' ? 'Pause message' : 'Resume message'}
                            title={item.status === 'SCHEDULED' ? 'Pause message' : 'Resume message'}
                          >
                            {item.status === 'SCHEDULED' ? (
                              <PauseCircle className="w-4 h-4" />
                            ) : (
                              <PlayCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            )}
                          </Button>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300 transition-colors rounded-lg"
                            onClick={() => handleDeleteClick(item.id, item.name)}
                            aria-label={`Cancel scheduled message ${item.name}`}
                            title="Cancel scheduled broadcast"
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

          {/* 2. Mobile Card Deck (block md:hidden) */}
          <div className="block md:hidden divide-y divide-border/60">
            {paginatedData.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                No scheduled messages matching &ldquo;{search || filters.status}&rdquo;.
              </div>
            ) : (
              paginatedData.map((item) => {
                const locked = isLockedWithin10s(item);
                const timeMeta = getRemainingTimeMeta(item);

                return (
                  <div key={item.id} className="p-4 space-y-3 bg-card hover:bg-muted/10 transition-colors">
                    {/* Header Row: Title & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-foreground truncate">
                            {item.name}
                          </h4>
                          {item.isRecurring && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded shrink-0">
                              <Repeat className="w-2.5 h-2.5" /> Recurring
                            </span>
                          )}
                        </div>
                        {item.message && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 font-mono">
                            {item.message}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={item.status === 'SCHEDULED' ? 'default' : 'secondary'}
                        className={cn(
                          'font-medium text-[11px] shrink-0',
                          item.status === 'PAUSED'
                            ? 'bg-muted text-muted-foreground'
                            : item.isRecurring
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                            : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                        )}
                      >
                        {item.status}
                      </Badge>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-1.5">
                        <CalendarClock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{formatScheduledTime(item.scheduledAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                        <span>{item.recipients.toLocaleString()} contacts</span>
                      </div>
                    </div>

                    {/* Relative Time Alert / Recurrence Pill */}
                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                      {item.isRecurring ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium border border-indigo-500/20">
                          <Repeat className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          {describeRecurrence(item.cronExpression)}
                        </span>
                      ) : timeMeta.isPast ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[11px] font-medium">
                          <AlertTriangle className="w-3 h-3" /> Past Due — Rescheduling Required
                        </span>
                      ) : timeMeta.isLocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-medium">
                          <Lock className="w-3 h-3" /> {timeMeta.text}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 text-foreground text-[11px] font-mono">
                          <Clock className="w-3 h-3 text-muted-foreground" /> {timeMeta.text}
                        </span>
                      )}
                    </div>

                    {/* Mobile Action Buttons (Full 44px touch targets) */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={locked}
                        onClick={() => handleEditClick(item)}
                        className={cn(
                          'flex-1 h-9 text-xs gap-1.5 font-medium',
                          locked ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'
                        )}
                        aria-label={`Edit ${item.name}`}
                      >
                        {locked ? <Lock className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                        {locked ? 'Locked (<10s)' : 'Edit Message'}
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRequestToggleStatus(item.id, item.name, item.status)}
                        className="h-9 px-3 text-xs gap-1"
                        aria-label={item.status === 'SCHEDULED' ? 'Pause' : 'Resume'}
                      >
                        {item.status === 'SCHEDULED' ? (
                          <>
                            <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Resume</span>
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(item.id, item.name)}
                        className="h-9 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Cancel ${item.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
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

      {/* Edit Scheduled Message Dialog */}
      <EditScheduledMessageDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        item={editingItem}
        onSave={handleSaveEdit}
      />

      {/* Confirmation Dialog for Scheduled Broadcast Cancellation */}
      <ConfirmationDialog
        open={Boolean(deleteConfirm?.open)}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Cancel Scheduled Broadcast"
        description={`Are you sure you want to cancel the scheduled broadcast "${deleteConfirm?.name}"? Queued SMS dispatches will be stopped and will not be sent.`}
        confirmLabel="Cancel Broadcast"
        cancelLabel="Keep Scheduled"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />

      {/* Confirmation Dialog for Pausing/Resuming Scheduled Broadcast */}
      <ConfirmationDialog
        open={Boolean(statusConfirm?.open)}
        onOpenChange={(open) => !open && setStatusConfirm(null)}
        title={statusConfirm?.nextStatus === 'PAUSED' ? 'Pause Scheduled Broadcast' : 'Resume Scheduled Broadcast'}
        description={
          statusConfirm?.nextStatus === 'PAUSED'
            ? `Are you sure you want to pause "${statusConfirm?.name}"? Scheduled messages will be held and will not be dispatched until resumed.`
            : `Are you sure you want to resume "${statusConfirm?.name}"? Messages will be queued for dispatch according to their schedule.`
        }
        confirmLabel={statusConfirm?.nextStatus === 'PAUSED' ? 'Pause Broadcast' : 'Resume Broadcast'}
        cancelLabel="Cancel"
        variant={statusConfirm?.nextStatus === 'PAUSED' ? 'destructive' : 'default'}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}


