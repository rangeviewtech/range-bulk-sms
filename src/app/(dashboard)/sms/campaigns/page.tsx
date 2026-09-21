'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, BarChart2, Eye, Search, X, ArrowDownUp } from 'lucide-react';
import Link from 'next/link';
import { useTableState } from '@/hooks/use-table-state';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Pagination } from '@/components/ui/pagination';

interface CampaignItem {
  id: string;
  name: string;
  status: 'COMPLETED' | 'PROCESSING' | 'SCHEDULED' | 'DRAFT';
  recipients: number;
  sent: number;
  failed: number;
  progress: number;
  date: string;
}

const INITIAL_CAMPAIGNS: CampaignItem[] = [
  { id: '1', name: 'Summer Sale 2026', status: 'COMPLETED', recipients: 15420, sent: 15400, failed: 20, progress: 100, date: '2026-06-15' },
  { id: '2', name: 'VIP Customer Update', status: 'PROCESSING', recipients: 5000, sent: 2500, failed: 0, progress: 50, date: '2026-09-16' },
  { id: '3', name: 'Flash Deal Alert', status: 'SCHEDULED', recipients: 45000, sent: 0, failed: 0, progress: 0, date: '2026-09-20' },
  { id: '4', name: 'New Product Launch', status: 'DRAFT', recipients: 12000, sent: 0, failed: 0, progress: 0, date: '2026-09-25' },
  { id: '5', name: 'Back to School Promo', status: 'COMPLETED', recipients: 28000, sent: 27950, failed: 50, progress: 100, date: '2026-08-30' },
  { id: '6', name: 'Weekend Discount Blast', status: 'COMPLETED', recipients: 8200, sent: 8180, failed: 20, progress: 100, date: '2026-07-22' },
  { id: '7', name: 'Maintenance Notification', status: 'COMPLETED', recipients: 1950, sent: 1950, failed: 0, progress: 100, date: '2026-08-10' },
  { id: '8', name: 'Loyalty Reward Points', status: 'PROCESSING', recipients: 14000, sent: 9800, failed: 12, progress: 70, date: '2026-09-18' },
  { id: '9', name: 'Holiday Early Bird', status: 'SCHEDULED', recipients: 35000, sent: 0, failed: 0, progress: 0, date: '2026-10-01' },
  { id: '10', name: 'End of Month Statement Alert', status: 'DRAFT', recipients: 6400, sent: 0, failed: 0, progress: 0, date: '2026-09-30' },
  { id: '11', name: 'Regional Network Survey', status: 'COMPLETED', recipients: 3200, sent: 3190, failed: 10, progress: 100, date: '2026-07-04' },
  { id: '12', name: 'Uganda Independence Day Wishes', status: 'SCHEDULED', recipients: 52000, sent: 0, failed: 0, progress: 0, date: '2026-10-09' },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await fetch('/api/campaigns?limit=50');
        if (res.ok) {
          const json = await res.json();
          const items: Array<{
            id: string;
            name: string;
            status: string;
            totalRecipients?: number;
            sentCount?: number;
            failedCount?: number;
            createdAt?: string;
          }> = json.data || [];

          if (items.length > 0) {
            const mapped: CampaignItem[] = items.map((c) => ({
              id: c.id,
              name: c.name,
              status: (c.status as CampaignItem['status']) || 'DRAFT',
              recipients: c.totalRecipients || 0,
              sent: c.sentCount || 0,
              failed: c.failedCount || 0,
              progress: c.totalRecipients ? Math.round(((c.sentCount || 0) / c.totalRecipients) * 100) : 0,
              date: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '-',
            }));

            setCampaigns([...mapped, ...INITIAL_CAMPAIGNS.filter((ic) => !mapped.some((m) => m.id === ic.id))]);
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
    loadCampaigns();
  }, []);

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
    paginatedData: displayedCampaigns,
  } = useTableState<CampaignItem>({
    data: campaigns,
    searchFields: [
      'name',
      'status',
      (c) => String(c.recipients),
      (c) => String(c.sent),
      (c) => String(c.failed),
      'date',
    ],
    initialSortKey: 'date',
    initialSortOrder: 'desc',
    initialPageSize: 5,
    initialFilters: { status: 'ALL' },
    filterFn: (item, currentFilters) => {
      if (currentFilters.status && currentFilters.status !== 'ALL' && item.status !== currentFilters.status) {
        return false;
      }
      return true;
    },
    customSortFn: (a, b, key, order) => {
      let comp = 0;
      if (key === 'name') {
        comp = a.name.localeCompare(b.name);
      } else if (key === 'status') {
        comp = a.status.localeCompare(b.status);
      } else if (key === 'progress') {
        comp = a.progress - b.progress;
      } else if (key === 'recipients') {
        comp = a.recipients - b.recipients;
      } else if (key === 'date') {
        comp = (a.date === '-' ? '' : a.date).localeCompare(b.date === '-' ? '' : b.date);
      }
      return order === 'asc' ? comp : -comp;
    },
  });

  const getStatusColor = (status: CampaignItem['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'PROCESSING':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'SCHEDULED':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader
        title="SMS Campaigns"
        description="Manage your bulk messaging campaigns and view their performance."
        action={
          <Button asChild className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
            <Link href="/sms/campaigns/new">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Link>
          </Button>
        }
      />

      {/* Filter Tabs & Search / Order Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <Tabs
          value={filters.status || 'ALL'}
          onValueChange={(val) => setFilter('status', val)}
          className="w-full md:w-auto"
        >
          <TabsList className="w-full md:w-auto h-auto flex-wrap">
            <TabsTrigger value="ALL">All ({campaigns.length})</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
            <TabsTrigger value="PROCESSING">Processing</TabsTrigger>
            <TabsTrigger value="SCHEDULED">Scheduled</TabsTrigger>
            <TabsTrigger value="DRAFT">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search campaigns..."
              className="pl-9 pr-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search campaigns"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1 text-xs"
            onClick={() => toggleSort(sortKey || 'date')}
            title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            aria-label="Toggle sort order"
          >
            <ArrowDownUp className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Order:</span> {sortOrder.toUpperCase()}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHeader
                      column="name"
                      label="Campaign Name"
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
                      column="progress"
                      label="Progress"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="date"
                      label="Date"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      <p className="font-medium text-foreground">No campaigns match your criteria.</p>
                      <p className="text-xs mt-1">Try adjusting your search query or status filter.</p>
                      {(search || filters.status !== 'ALL') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            clearSearch();
                            setFilter('status', 'ALL');
                          }}
                        >
                          Reset Filters
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedCampaigns.map((camp) => (
                    <TableRow key={camp.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">
                        <div>
                          <span>{camp.name}</span>
                          <p className="text-xs text-muted-foreground">
                            {camp.recipients.toLocaleString()} total recipients
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`font-medium text-xs ${getStatusColor(camp.status)}`}>
                          {camp.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{camp.sent.toLocaleString()} / {camp.recipients.toLocaleString()}</span>
                            <span>{camp.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${camp.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-primary'}`}
                              style={{ width: `${camp.progress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{camp.date}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {camp.status === 'COMPLETED' || camp.status === 'PROCESSING' ? (
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Link href={`/sms/campaigns/${camp.id}`} aria-label={`View ${camp.name} analytics`}>
                              <BarChart2 className="w-4 h-4" />
                            </Link>
                          </Button>
                        ) : (
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Link href={`/sms/campaigns/${camp.id}`} aria-label={`View ${camp.name} details`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {campaigns.length > 0 && (
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
        </CardContent>
      </Card>
    </div>
  );
}
