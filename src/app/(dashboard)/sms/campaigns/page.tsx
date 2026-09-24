'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  BarChart2,
  Eye,
  Search,
  X,
  ArrowDownUp,
  Pencil,
  Trash2,
  MoreHorizontal,
  Copy,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTableState } from '@/hooks/use-table-state';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmationDialog } from '@/components/feedback/confirmation-dialog';
import {
  EditCampaignDialog,
  CampaignEditData,
} from '@/components/sms/edit-campaign-dialog';
import { EmptyState } from '@/components/ui/empty-state';

export interface CampaignItem {
  id: string;
  name: string;
  status: 'COMPLETED' | 'PROCESSING' | 'SCHEDULED' | 'DRAFT';
  recipients: number;
  sent: number;
  failed: number;
  progress: number;
  date: string;
  message?: string;
  senderId?: string;
  scheduledAt?: string;
  groupName?: string;
}

const INITIAL_CAMPAIGNS: CampaignItem[] = [
  {
    id: '1',
    name: 'Summer Sale 2026',
    status: 'COMPLETED',
    recipients: 15420,
    sent: 15400,
    failed: 20,
    progress: 100,
    date: '2026-06-15',
    message:
      'Summer Sale Alert! Enjoy up to 40% discount on all Range Bulk SMS bundles this week. Use code SUMMER26 at checkout: https://range.ug/promo',
    senderId: 'RANGESMS',
    groupName: 'All Customers',
  },
  {
    id: '2',
    name: 'VIP Customer Update',
    status: 'PROCESSING',
    recipients: 5000,
    sent: 2500,
    failed: 0,
    progress: 50,
    date: '2026-09-16',
    message:
      'Dear {{firstName}}, thank you for being a premier VIP client. Your priority message routing has been activated.',
    senderId: 'INFO',
    groupName: 'VIP Members',
  },
  {
    id: '3',
    name: 'Flash Deal Alert',
    status: 'SCHEDULED',
    recipients: 45000,
    sent: 0,
    failed: 0,
    progress: 0,
    date: '2026-09-20',
    message:
      '⚡ Flash Deal Alert! Top up your SMS credits today and receive 25% extra bonus units. Valid until midnight tonight: https://range.ug/topup',
    senderId: 'PROMO',
    groupName: 'Leads & Inquiries',
    scheduledAt: '2026-09-20T10:00:00Z',
  },
  {
    id: '4',
    name: 'New Product Launch',
    status: 'DRAFT',
    recipients: 12000,
    sent: 0,
    failed: 0,
    progress: 0,
    date: '2026-09-25',
    message:
      'Hello {{firstName}}, we are excited to introduce our new SMS APIs with instant delivery receipts. View documentation: https://range.ug/docs',
    senderId: 'RANGESMS',
    groupName: 'All Customers',
  },
  {
    id: '5',
    name: 'Back to School Promo',
    status: 'COMPLETED',
    recipients: 28000,
    sent: 27950,
    failed: 50,
    progress: 100,
    date: '2026-08-30',
    message:
      'Back to School Special! Send parent announcements and school fee reminders seamlessly with Range Bulk SMS.',
    senderId: 'RANGESMS',
    groupName: 'All Customers',
  },
  {
    id: '6',
    name: 'Weekend Discount Blast',
    status: 'COMPLETED',
    recipients: 8200,
    sent: 8180,
    failed: 20,
    progress: 100,
    date: '2026-07-22',
    message:
      'Weekend Savings! Top up with 50,000 UGX or more this Saturday and get 1,000 free SMS units added to your wallet.',
    senderId: 'RANGESMS',
    groupName: 'VIP Members',
  },
  {
    id: '7',
    name: 'Maintenance Notification',
    status: 'COMPLETED',
    recipients: 1950,
    sent: 1950,
    failed: 0,
    progress: 100,
    date: '2026-08-10',
    message:
      'Notice: Scheduled core gateway maintenance tonight from 02:00 to 03:00 EAT. Message queueing will operate as normal.',
    senderId: 'INFO',
    groupName: 'All Customers',
  },
  {
    id: '8',
    name: 'Loyalty Reward Points',
    status: 'PROCESSING',
    recipients: 14000,
    sent: 9800,
    failed: 12,
    progress: 70,
    date: '2026-09-18',
    message:
      'Hi {{name}}, you have earned 500 Range Rewards points for {{company}}. Redeem them for free SMS units in your portal.',
    senderId: 'RANGESMS',
    groupName: 'VIP Members',
  },
  {
    id: '9',
    name: 'Holiday Early Bird',
    status: 'SCHEDULED',
    recipients: 35000,
    sent: 0,
    failed: 0,
    progress: 0,
    date: '2026-10-01',
    message:
      'Festive Season Early Bird! Pre-book your end-of-year bulk SMS batches at our lowest volume rates.',
    senderId: 'RANGESMS',
    groupName: 'All Customers',
    scheduledAt: '2026-10-01T09:00:00Z',
  },
  {
    id: '10',
    name: 'End of Month Statement Alert',
    status: 'DRAFT',
    recipients: 6400,
    sent: 0,
    failed: 0,
    progress: 0,
    date: '2026-09-30',
    message:
      'Dear {{name}}, your monthly account statement for {{company}} is now available. Log in to your portal to download it.',
    senderId: 'INFO',
    groupName: 'All Customers',
  },
  {
    id: '11',
    name: 'Regional Network Survey',
    status: 'COMPLETED',
    recipients: 3200,
    sent: 3190,
    failed: 10,
    progress: 100,
    date: '2026-07-04',
    message:
      'How was your messaging experience this month? Reply with 1 for Excellent, 2 for Good, or 3 for Needs Improvement.',
    senderId: 'RANGESMS',
    groupName: 'Leads & Inquiries',
  },
  {
    id: '12',
    name: 'Uganda Independence Day Wishes',
    status: 'SCHEDULED',
    recipients: 52000,
    sent: 0,
    failed: 0,
    progress: 0,
    date: '2026-10-09',
    message:
      '🇺🇬 Happy 64th Independence Day! Range Bulk SMS wishes all our clients, partners, and friends a blessed and joyful celebration.',
    senderId: 'RANGESMS',
    groupName: 'All Customers',
    scheduledAt: '2026-10-09T08:30:00Z',
  },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);

  // Edit Campaign State
  const [editingCampaign, setEditingCampaign] = useState<CampaignEditData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Delete Campaign Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    campaign: CampaignItem;
  } | null>(null);

  // Cancel Schedule Confirmation State
  const [cancelScheduleConfirm, setCancelScheduleConfirm] = useState<{
    open: boolean;
    campaign: CampaignItem;
  } | null>(null);

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
            message?: string;
            senderId?: { senderId?: string } | string;
            scheduledAt?: string;
          }> = json.data || [];

          if (items.length > 0) {
            const mapped: CampaignItem[] = items.map((c) => ({
              id: c.id,
              name: c.name,
              status: (c.status as CampaignItem['status']) || 'DRAFT',
              recipients: c.totalRecipients || 0,
              sent: c.sentCount || 0,
              failed: c.failedCount || 0,
              progress: c.totalRecipients
                ? Math.round(((c.sentCount || 0) / c.totalRecipients) * 100)
                : 0,
              date: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '-',
              message: c.message,
              senderId:
                typeof c.senderId === 'object' && c.senderId?.senderId
                  ? c.senderId.senderId
                  : typeof c.senderId === 'string'
                  ? c.senderId
                  : 'RANGESMS',
              scheduledAt: c.scheduledAt ? new Date(c.scheduledAt).toISOString() : undefined,
            }));

            setCampaigns([
              ...mapped,
              ...INITIAL_CAMPAIGNS.filter((ic) => !mapped.some((m) => m.id === ic.id)),
            ]);
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
      (c) => c.message || '',
      (c) => c.senderId || '',
    ],
    initialSortKey: 'date',
    initialSortOrder: 'desc',
    initialPageSize: 5,
    initialFilters: { status: 'ALL' },
    filterFn: (item, currentFilters) => {
      if (
        currentFilters.status &&
        currentFilters.status !== 'ALL' &&
        item.status !== currentFilters.status
      ) {
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

  // Open Edit Dialog
  const handleOpenEdit = (camp: CampaignItem) => {
    setEditingCampaign({
      ...camp,
      message:
        camp.message ||
        `Campaign broadcast: ${camp.name}. Thank you for choosing Range Bulk SMS.`,
      senderId: camp.senderId || 'RANGESMS',
    });
    setEditDialogOpen(true);
  };

  // Save Edit Handler
  const handleSaveEdit = async (updated: Partial<CampaignEditData>) => {
    if (!editingCampaign) return;

    try {
      // If persisted in backend, sync with PUT
      const isInitialStatic = INITIAL_CAMPAIGNS.some((ic) => ic.id === editingCampaign.id);
      if (!isInitialStatic && !editingCampaign.id.startsWith('draft-')) {
        await fetch(`/api/campaigns/${editingCampaign.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: updated.name,
            senderId: updated.senderId,
            message: updated.message,
            scheduledAt: updated.scheduledAt,
          }),
        });
      }
    } catch {
      // Fallback local update
    }

    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === editingCampaign.id
          ? {
              ...c,
              ...updated,
              status: (updated.status as CampaignItem['status']) || c.status,
            }
          : c
      )
    );

    toast.success(`Campaign "${updated.name || editingCampaign.name}" updated successfully`);
  };

  // Duplicate / Clone Campaign (Brevo / Twilio standard feature)
  const handleDuplicate = (camp: CampaignItem) => {
    setCampaigns((prev) => {
      const copyCount = prev.filter((c) => c.name.startsWith(camp.name)).length;
      const newDraft: CampaignItem = {
        id: `draft-${camp.id}-${prev.length + 1}`,
        name: copyCount > 0 ? `${camp.name} (Copy ${copyCount})` : `${camp.name} (Copy)`,
        status: 'DRAFT',
        recipients: camp.recipients,
        sent: 0,
        failed: 0,
        progress: 0,
        date: camp.date,
        message:
          camp.message ||
          `Campaign broadcast: ${camp.name}. Thank you for choosing Range Bulk SMS.`,
        senderId: camp.senderId || 'RANGESMS',
        groupName: camp.groupName || 'Target Audience',
      };
      return [newDraft, ...prev];
    });
    toast.success(`Campaign "${camp.name}" duplicated as a new draft`);
  };

  // Cancel Scheduled Campaign Handlers
  const handleRequestCancelSchedule = (camp: CampaignItem) => {
    setCancelScheduleConfirm({
      open: true,
      campaign: camp,
    });
  };

  const handleConfirmCancelSchedule = async () => {
    if (!cancelScheduleConfirm) return;
    const { campaign: camp } = cancelScheduleConfirm;
    setCancelScheduleConfirm(null);

    try {
      const isInitialStatic = INITIAL_CAMPAIGNS.some((ic) => ic.id === camp.id);
      if (!isInitialStatic && !camp.id.startsWith('draft-')) {
        await fetch(`/api/campaigns/${camp.id}/cancel`, { method: 'POST' });
      }
    } catch {
      // continue
    }

    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === camp.id ? { ...c, status: 'DRAFT', scheduledAt: undefined } : c
      )
    );
    toast.success(`Scheduled broadcast for "${camp.name}" cancelled and moved to Draft`);
  };

  // Open Delete Confirmation
  const handleDeleteClick = (camp: CampaignItem) => {
    setDeleteConfirm({
      open: true,
      campaign: camp,
    });
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const { campaign } = deleteConfirm;

    try {
      const isInitialStatic = INITIAL_CAMPAIGNS.some((ic) => ic.id === campaign.id);
      if (!isInitialStatic && !campaign.id.startsWith('draft-')) {
        await fetch(`/api/campaigns/${campaign.id}`, { method: 'DELETE' });
      }
    } catch {
      // Continue
    }

    setCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
    toast.success(`Campaign "${campaign.name}" deleted successfully`);
    setDeleteConfirm(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader
        title="SMS Campaigns"
        description="Manage your bulk messaging campaigns and view their performance."
        action={
          <Button
            asChild
            className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
          >
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
            <Table className="min-w-[700px]">
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
                    <TableCell colSpan={5} className="p-0">
                      <EmptyState
                        className="rounded-none border-0 bg-transparent py-16"
                        icon={<BarChart2 className="h-8 w-8 text-muted-foreground" />}
                        title="No campaigns found"
                        description="Try adjusting your search query or status filter."
                        action={
                          (search || filters.status !== 'ALL') ? (
                            <Button
                              variant="outline"
                              onClick={() => {
                                clearSearch();
                                setFilter('status', 'ALL');
                              }}
                            >
                              Reset Filters
                            </Button>
                          ) : undefined
                        }
                      />
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
                        <Badge
                          variant="outline"
                          className={`font-medium text-xs ${getStatusColor(camp.status)}`}
                        >
                          {camp.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {camp.sent.toLocaleString()} / {camp.recipients.toLocaleString()}
                            </span>
                            <span>{camp.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                camp.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-primary'
                              }`}
                              style={{ width: `${camp.progress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{camp.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* 1. View / Analytics Button */}
                          {camp.status === 'COMPLETED' || camp.status === 'PROCESSING' ? (
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <Link
                                href={`/sms/campaigns/${camp.id}`}
                                title="View campaign analytics"
                                aria-label={`View ${camp.name} analytics`}
                              >
                                <BarChart2 className="w-4 h-4" />
                              </Link>
                            </Button>
                          ) : (
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <Link
                                href={`/sms/campaigns/${camp.id}`}
                                title="View campaign details"
                                aria-label={`View ${camp.name} details`}
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                          )}

                          {/* 2. Edit Action (Editable for DRAFT and SCHEDULED, Duplicate for COMPLETED/PROCESSING) */}
                          {camp.status === 'DRAFT' || camp.status === 'SCHEDULED' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              onClick={() => handleOpenEdit(camp)}
                              title="Edit campaign"
                              aria-label={`Edit ${camp.name}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                              onClick={() => handleDuplicate(camp)}
                              title="Sent campaigns cannot be edited. Click to duplicate as a new draft."
                              aria-label={`Duplicate ${camp.name}`}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}

                          {/* 3. Delete Action */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300 transition-colors rounded-lg"
                            onClick={() => handleDeleteClick(camp)}
                            title="Delete campaign"
                            aria-label={`Delete ${camp.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                          {/* 4. More Context Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                title="More options"
                                aria-label="More campaign options"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem asChild className="cursor-pointer">
                                <Link
                                  href={`/sms/campaigns/${camp.id}`}
                                  className="flex items-center gap-2"
                                >
                                  {camp.status === 'COMPLETED' ||
                                  camp.status === 'PROCESSING' ? (
                                    <BarChart2 className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                  <span>
                                    {camp.status === 'COMPLETED' ||
                                    camp.status === 'PROCESSING'
                                      ? 'View Analytics'
                                      : 'View Details'}
                                  </span>
                                </Link>
                              </DropdownMenuItem>

                              {(camp.status === 'DRAFT' || camp.status === 'SCHEDULED') && (
                                <DropdownMenuItem
                                  onClick={() => handleOpenEdit(camp)}
                                  className="cursor-pointer flex items-center gap-2"
                                >
                                  <Pencil className="w-4 h-4" />
                                  <span>Edit Campaign</span>
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={() => handleDuplicate(camp)}
                                className="cursor-pointer flex items-center gap-2"
                              >
                                <Copy className="w-4 h-4" />
                                <span>Duplicate Campaign</span>
                              </DropdownMenuItem>

                              {camp.status === 'SCHEDULED' && (
                                <DropdownMenuItem
                                  onClick={() => handleRequestCancelSchedule(camp)}
                                  className="cursor-pointer flex items-center gap-2 text-amber-600 dark:text-amber-400"
                                >
                                  <Clock className="w-4 h-4" />
                                  <span>Cancel Schedule</span>
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(camp)}
                                className="cursor-pointer flex items-center gap-2 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete Campaign</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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

      {/* Edit Campaign Dialog */}
      <EditCampaignDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        campaign={editingCampaign}
        onSave={handleSaveEdit}
      />

      {/* Confirmation Dialog for Campaign Deletion */}
      <ConfirmationDialog
        open={Boolean(deleteConfirm?.open)}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title={
          deleteConfirm?.campaign.status === 'SCHEDULED'
            ? 'Cancel & Delete Scheduled Campaign'
            : 'Delete Campaign'
        }
        description={
          deleteConfirm?.campaign.status === 'SCHEDULED'
            ? `Are you sure you want to delete "${deleteConfirm?.campaign.name}"? The scheduled dispatch will be cancelled and removed from the queue.`
            : `Are you sure you want to delete "${deleteConfirm?.campaign.name}"? This action will remove the campaign from your dashboard.`
        }
        confirmLabel={
          deleteConfirm?.campaign.status === 'SCHEDULED'
            ? 'Cancel & Delete'
            : 'Delete Campaign'
        }
        cancelLabel="Keep Campaign"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />

      {/* Confirmation Dialog for Cancelling Scheduled Broadcast */}
      <ConfirmationDialog
        open={Boolean(cancelScheduleConfirm?.open)}
        onOpenChange={(open) => !open && setCancelScheduleConfirm(null)}
        title="Cancel Scheduled Broadcast?"
        description={`Are you sure you want to cancel the scheduled broadcast for "${cancelScheduleConfirm?.campaign.name}"? The campaign will be reverted to Draft status and no SMS messages will be dispatched.`}
        confirmLabel="Yes, Cancel Broadcast"
        cancelLabel="Keep Schedule"
        variant="destructive"
        onConfirm={handleConfirmCancelSchedule}
      />
    </div>
  );
}
