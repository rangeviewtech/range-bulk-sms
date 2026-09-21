'use client';

import React, { useMemo } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  FileDown,
  CheckCircle2,
  Clock,
  XCircle,
  PhoneCall,
  Smartphone,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
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

interface DeliveryRecord {
  id: string;
  phone: string;
  network: string;
  campaign: string;
  status: 'DELIVERED' | 'FAILED' | 'PENDING';
  time: string;
  cost: number;
  segments: number;
}

const INITIAL_RECORDS: DeliveryRecord[] = [
  { id: 'dlr_1', phone: '+256772123456', network: 'MTN Uganda', campaign: 'Tuition Balance Notice', status: 'DELIVERED', time: '2026-09-18 17:42:10', cost: 70, segments: 2 },
  { id: 'dlr_2', phone: '+256701987654', network: 'Airtel Uganda', campaign: 'Tuition Balance Notice', status: 'DELIVERED', time: '2026-09-18 17:42:11', cost: 70, segments: 2 },
  { id: 'dlr_3', phone: '+256752345678', network: 'Airtel Uganda', campaign: 'Tuition Balance Notice', status: 'DELIVERED', time: '2026-09-18 17:42:12', cost: 70, segments: 2 },
  { id: 'dlr_4', phone: '+256784567890', network: 'MTN Uganda', campaign: 'Tuition Balance Notice', status: 'DELIVERED', time: '2026-09-18 17:42:14', cost: 70, segments: 2 },
  { id: 'dlr_5', phone: '+256772987654', network: 'MTN Uganda', campaign: 'Overdue Invoices', status: 'DELIVERED', time: '2026-09-18 16:30:05', cost: 70, segments: 2 },
  { id: 'dlr_6', phone: '+256701234567', network: 'Airtel Uganda', campaign: 'Overdue Invoices', status: 'PENDING', time: '2026-09-18 16:30:08', cost: 70, segments: 2 },
  { id: 'dlr_7', phone: '+256753456789', network: 'Airtel Uganda', campaign: 'Overdue Invoices', status: 'DELIVERED', time: '2026-09-18 16:30:10', cost: 70, segments: 2 },
  { id: 'dlr_8', phone: '+256771000011', network: 'MTN Uganda', campaign: 'Flash Promo Sale', status: 'DELIVERED', time: '2026-09-18 14:15:22', cost: 35, segments: 1 },
  { id: 'dlr_9', phone: '+256702000022', network: 'Airtel Uganda', campaign: 'Flash Promo Sale', status: 'FAILED', time: '2026-09-18 14:15:25', cost: 0, segments: 1 },
  { id: 'dlr_10', phone: '+256789000033', network: 'MTN Uganda', campaign: 'Flash Promo Sale', status: 'DELIVERED', time: '2026-09-18 14:15:28', cost: 35, segments: 1 },
  { id: 'dlr_11', phone: '+256775000044', network: 'MTN Uganda', campaign: 'Weekend Notice', status: 'DELIVERED', time: '2026-09-17 11:10:00', cost: 35, segments: 1 },
  { id: 'dlr_12', phone: '+256708000055', network: 'Airtel Uganda', campaign: 'Weekend Notice', status: 'DELIVERED', time: '2026-09-17 11:10:02', cost: 35, segments: 1 },
];

export default function DeliveryReportsPage() {
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
    filteredData,
  } = useTableState<DeliveryRecord>({
    data: INITIAL_RECORDS,
    searchFields: ['phone', 'network', 'campaign', 'status', 'id'],
    initialSortKey: 'time',
    initialSortOrder: 'desc',
    initialPageSize: 8,
    filterFn: (item, currentFilters) => {
      const st = currentFilters.status;
      if (st && st !== 'ALL') {
        if (item.status !== st) return false;
      }
      const net = currentFilters.network;
      if (net && net !== 'ALL') {
        if (item.network !== net) return false;
      }
      return true;
    },
    customSortFn: (a, b, key, order) => {
      let comp = 0;
      if (key === 'time') {
        comp = new Date(a.time).getTime() - new Date(b.time).getTime();
      } else if (key === 'cost') {
        comp = a.cost - b.cost;
      } else if (key === 'segments') {
        comp = a.segments - b.segments;
      } else if (key === 'phone') {
        comp = a.phone.localeCompare(b.phone);
      } else if (key === 'network') {
        comp = a.network.localeCompare(b.network);
      } else if (key === 'campaign') {
        comp = a.campaign.localeCompare(b.campaign);
      } else if (key === 'status') {
        comp = a.status.localeCompare(b.status);
      }
      return order === 'asc' ? comp : -comp;
    },
  });

  const deliveredCount = useMemo(
    () => INITIAL_RECORDS.filter((r) => r.status === 'DELIVERED').length,
    []
  );
  const failedCount = useMemo(
    () => INITIAL_RECORDS.filter((r) => r.status === 'FAILED').length,
    []
  );
  const pendingCount = useMemo(
    () => INITIAL_RECORDS.filter((r) => r.status === 'PENDING').length,
    []
  );
  const totalSpend = useMemo(
    () => INITIAL_RECORDS.reduce((acc, curr) => acc + curr.cost, 0),
    []
  );

  const handleExportCSV = () => {
    const csvRows = [
      ['Report ID', 'Phone Number', 'Network', 'Campaign', 'Status', 'Segments', 'Cost (UGX)', 'Timestamp'],
      ...filteredData.map((r) => [
        r.id,
        r.phone,
        r.network,
        r.campaign,
        r.status,
        r.segments.toString(),
        r.cost.toString(),
        r.time,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `delivery_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredData.length} delivery records to CSV!`);
  };

  const getStatusBadge = (status: DeliveryRecord['status']) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Delivered
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs">
            <XCircle className="w-3 h-3 mr-1" /> Failed
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader
        title="Delivery Reports"
        description="Real-time carrier handset delivery logs, network routing receipts, and dispatch telemetry."
        action={
          <Button variant="outline" onClick={handleExportCSV} className="w-full sm:w-auto">
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV ({filteredData.length})
          </Button>
        }
      />

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Messages</span>
              <Smartphone className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">{INITIAL_RECORDS.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Across all campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Delivered</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-2">{deliveredCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {((deliveredCount / INITIAL_RECORDS.length) * 100).toFixed(1)}% handset success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Pending Carrier</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-500 mt-2">{pendingCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Queued for handset ACK</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Spend</span>
              <PhoneCall className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono mt-2">
              {totalSpend.toLocaleString()} UGX
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Calculated carrier billing</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="p-3 sm:p-4 border-b border-border flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center">
            {/* Search Input */}
            <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search phone, campaign, or network..."
                  className="pl-9 pr-8"
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

              {/* Network Filter */}
              <Select
                value={filters.network || 'ALL'}
                onValueChange={(val) => setFilter('network', val)}
              >
                <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs">
                  <SelectValue placeholder="All Networks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Networks</SelectItem>
                  <SelectItem value="MTN Uganda">MTN Uganda</SelectItem>
                  <SelectItem value="Airtel Uganda">Airtel Uganda</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order Toggle */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3 gap-1.5 shrink-0"
                onClick={() => toggleSort(sortKey || 'time')}
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

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <Button
                type="button"
                variant={(!filters.status || filters.status === 'ALL') ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8"
                onClick={() => setFilter('status', 'ALL')}
              >
                All ({INITIAL_RECORDS.length})
              </Button>
              <Button
                type="button"
                variant={filters.status === 'DELIVERED' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8"
                onClick={() => setFilter('status', 'DELIVERED')}
              >
                Delivered ({deliveredCount})
              </Button>
              <Button
                type="button"
                variant={filters.status === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8"
                onClick={() => setFilter('status', 'PENDING')}
              >
                Pending ({pendingCount})
              </Button>
              <Button
                type="button"
                variant={filters.status === 'FAILED' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8"
                onClick={() => setFilter('status', 'FAILED')}
              >
                Failed ({failedCount})
              </Button>
            </div>
          </div>

          <div className="w-full">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHeader
                      column="phone"
                      label="Recipient MSISDN"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="network"
                      label="Network Carrier"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="campaign"
                      label="Campaign Name"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="status"
                      label="Delivery State"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="segments"
                      label="Segments"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="cost"
                      label="Charged Rate"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      column="time"
                      label="Handset Timestamp (EAT)"
                      currentSort={sortKey}
                      currentOrder={sortOrder}
                      onSort={toggleSort}
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No delivery reports matching filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        {item.phone}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs font-normal">
                          {item.network}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {item.campaign}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {item.segments} SMS
                      </TableCell>
                      <TableCell className="font-mono text-xs text-foreground font-medium">
                        {item.cost} UGX
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {item.time}
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
            pageSizeOptions={[5, 8, 15, 30]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
