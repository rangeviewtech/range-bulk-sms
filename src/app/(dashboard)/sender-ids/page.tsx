'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Info, RefreshCw, AtSign, Search, X, ArrowDownUp } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { TableSkeletonRows } from '@/components/blocks/ui/skeleton-layouts';
import { useTableState } from '@/hooks/use-table-state';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Pagination } from '@/components/ui/pagination';

interface UserSenderId {
  id: string;
  senderId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  purpose: string | null;
  createdAt: string;
  approvedAt: string | null;
}

export default function SenderIdsPage() {
  const [senderIds, setSenderIds] = useState<UserSenderId[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSenderIds = useCallback(async () => {
    try {
      const res = await fetch('/api/sender-ids');
      if (!res.ok) throw new Error('Failed to load sender IDs');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSenderIds(data.data);
      }
    } catch {
      toast.error('Unable to fetch sender IDs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSenderIds();
  }, [fetchSenderIds]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSenderIds();
  };

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
    paginatedData: displayedSenderIds,
  } = useTableState<UserSenderId>({
    data: senderIds,
    searchFields: [
      'senderId',
      (s) => s.purpose || '',
      'status',
      'createdAt',
      (s) => s.approvedAt || '',
    ],
    initialSortKey: 'createdAt',
    initialSortOrder: 'desc',
    initialPageSize: 10,
    initialFilters: { status: 'ALL' },
    filterFn: (item, currentFilters) => {
      if (currentFilters.status && currentFilters.status !== 'ALL' && item.status !== currentFilters.status) {
        return false;
      }
      return true;
    },
    customSortFn: (a, b, key, order) => {
      let comp = 0;
      if (key === 'senderId') {
        comp = a.senderId.localeCompare(b.senderId);
      } else if (key === 'purpose') {
        comp = (a.purpose || '').localeCompare(b.purpose || '');
      } else if (key === 'status') {
        comp = a.status.localeCompare(b.status);
      } else if (key === 'createdAt') {
        comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (key === 'approvedAt') {
        const aTime = a.approvedAt ? new Date(a.approvedAt).getTime() : 0;
        const bTime = b.approvedAt ? new Date(b.approvedAt).getTime() : 0;
        comp = aTime - bTime;
      }
      return order === 'asc' ? comp : -comp;
    },
  });

  const getStatusBadge = (status: UserSenderId['status']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/30">
            Approved
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/30">
            Pending Review
          </Badge>
        );
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'SUSPENDED':
        return <Badge variant="outline" className="text-destructive border-destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sender IDs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage alphanumeric sender IDs for your campaigns.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh sender IDs"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/sender-ids/apply" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Request Sender ID
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3 text-sm">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p>
          Sender IDs are the alphanumeric brand names that appear on a recipient&apos;s phone when they receive your SMS (max 11 characters).
          Telecom operator registration fee is UGX 250,000 (VAT Incl.) per Sender ID. Approvals take 24–48 business hours upon KYC verification.
        </p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden mt-2">
        {/* Toolbar: Search, Status Filter & Sort Order */}
        <div className="p-4 border-b flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sender ID or purpose..."
              className="pl-8 pr-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search sender IDs"
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
            <div className="w-36">
              <Select
                value={filters.status || 'ALL'}
                onValueChange={(val) => setFilter('status', val)}
              >
                <SelectTrigger className="h-9 text-xs" aria-label="Filter by status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING">Pending Review</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1 text-xs"
              onClick={() => toggleSort(sortKey || 'createdAt')}
              title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              aria-label="Toggle sort order"
            >
              <ArrowDownUp className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Order:</span> {sortOrder.toUpperCase()}
            </Button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableHeader
                    column="senderId"
                    label="Sender ID"
                    currentSort={sortKey}
                    currentOrder={sortOrder}
                    onSort={toggleSort}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    column="purpose"
                    label="Purpose"
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
                    column="createdAt"
                    label="Requested On"
                    currentSort={sortKey}
                    currentOrder={sortOrder}
                    onSort={toggleSort}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    column="approvedAt"
                    label="Approved On"
                    currentSort={sortKey}
                    currentOrder={sortOrder}
                    onSort={toggleSort}
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeletonRows columns={5} rows={5} />
              ) : displayedSenderIds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <AtSign className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="font-medium text-foreground">
                      {senderIds.length === 0 ? 'No Sender IDs requested yet' : 'No matching Sender IDs found'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      {senderIds.length === 0
                        ? 'Submit an alphanumeric sender mask (e.g. your brand name) for approval.'
                        : 'Try adjusting your search query or status filter.'}
                    </p>
                    {senderIds.length === 0 ? (
                      <Link href="/sender-ids/apply">
                        <Button size="sm" variant="outline">Request Sender ID</Button>
                      </Link>
                    ) : (
                      (search || filters.status !== 'ALL') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            clearSearch();
                            setFilter('status', 'ALL');
                          }}
                        >
                          Reset Filters
                        </Button>
                      )
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                displayedSenderIds.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-bold text-base tracking-wider text-foreground">
                      {item.senderId}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[240px] truncate">
                      {item.purpose || 'General notifications & alerts'}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.approvedAt
                        ? new Date(item.approvedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {senderIds.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        )}
      </div>
    </div>
  );
}
