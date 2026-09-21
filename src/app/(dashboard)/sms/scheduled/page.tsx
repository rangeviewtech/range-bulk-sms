'use client';

import { useState } from 'react';
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
import { CalendarClock, Trash2, PauseCircle, PlayCircle, Plus, Search, Filter, ArrowUp, ArrowDown, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/feedback/confirmation-dialog';
import { Pagination } from '@/components/ui/pagination';
import { SortableHeader } from '@/components/ui/sortable-header';
import { useTableState } from '@/hooks/use-table-state';

interface ScheduledItem {
  id: string;
  name: string;
  scheduledAt: string;
  recipients: number;
  status: 'SCHEDULED' | 'PAUSED';
}

const INITIAL_SCHEDULED: ScheduledItem[] = [
  { id: '1', name: 'Weekend Promo', scheduledAt: '2026-09-20 09:00', recipients: 1250, status: 'SCHEDULED' },
  { id: '2', name: 'Reminder: Webinar', scheduledAt: '2026-09-22 14:30', recipients: 450, status: 'PAUSED' },
  { id: '3', name: 'End of Month Statement', scheduledAt: '2026-09-30 08:00', recipients: 5200, status: 'SCHEDULED' },
  { id: '4', name: 'System Maintenance Notice', scheduledAt: '2026-10-02 22:00', recipients: 1800, status: 'SCHEDULED' },
  { id: '5', name: 'VIP Loyalty Discount', scheduledAt: '2026-10-05 11:30', recipients: 620, status: 'PAUSED' },
];

export default function ScheduledSmsPage() {
  const [items, setItems] = useState<ScheduledItem[]>(INITIAL_SCHEDULED);

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
    data: items,
    searchFields: ['name', 'scheduledAt', (i) => i.recipients, 'status'],
    initialSortKey: 'scheduledAt',
    initialSortOrder: 'asc',
    initialPageSize: 10,
    filterFn: (item, currentFilters) => {
      const status = currentFilters.status;
      if (status && status !== 'ALL') {
        if (item.status !== status) return false;
      }
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

  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'SCHEDULED' ? 'PAUSED' : 'SCHEDULED';
          toast.info(`Campaign "${item.name}" ${nextStatus === 'PAUSED' ? 'paused' : 'resumed'}.`);
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    setItems((prev) => prev.filter((item) => item.id !== deleteConfirm.id));
    toast.success(`Scheduled message "${deleteConfirm.name}" cancelled.`);
    setDeleteConfirm(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader
        title="Scheduled Messages"
        description="View and manage messages queued for future delivery."
        action={
          <Button asChild className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
            <Link href="/sms/send">
              <Plus className="w-4 h-4 mr-2" />
              Schedule New SMS
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center bg-card p-3 sm:p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
            <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs">
              <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="PAUSED">Paused</SelectItem>
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
          <div className="w-full">
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHeader
                      column="name"
                      label="Campaign / Name"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="scheduledAt"
                      label="Scheduled Time"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="recipients"
                      label="Recipients"
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
                  <TableHead className="text-right">Actions</TableHead>
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
                  paginatedData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-primary shrink-0" />
                        <span>{item.scheduledAt}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.recipients.toLocaleString()} contacts
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.status === 'SCHEDULED' ? 'default' : 'secondary'}
                          className={`font-medium text-xs ${
                            item.status === 'SCHEDULED'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-amber-500"
                          onClick={() => handleToggleStatus(item.id)}
                          aria-label={item.status === 'SCHEDULED' ? 'Pause message' : 'Resume message'}
                        >
                          {item.status === 'SCHEDULED' ? (
                            <PauseCircle className="w-4 h-4" />
                          ) : (
                            <PlayCircle className="w-4 h-4 text-emerald-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive/40 dark:text-destructive/50 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(item.id, item.name)}
                          aria-label={`Cancel scheduled message ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
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
    </div>
  );
}

