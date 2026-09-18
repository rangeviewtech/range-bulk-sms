'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DELIVERED' | 'PENDING' | 'FAILED'>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return INITIAL_RECORDS.filter((r) => {
      const matchSearch =
        r.phone.toLowerCase().includes(search.toLowerCase()) ||
        r.campaign.toLowerCase().includes(search.toLowerCase()) ||
        r.network.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page]);

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
      ...filteredRecords.map((r) => [
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

    toast.success(`Exported ${filteredRecords.length} delivery records to CSV!`);
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Delivery Reports"
        description="Real-time carrier handset delivery logs, network routing receipts, and dispatch telemetry."
        action={
          <Button variant="outline" onClick={handleExportCSV} className="w-full sm:w-auto">
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV ({filteredRecords.length})
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
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search phone number or campaign..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <Button
                type="button"
                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8"
                onClick={() => {
                  setStatusFilter('ALL');
                  setPage(1);
                }}
              >
                All ({INITIAL_RECORDS.length})
              </Button>
              <Button
                type="button"
                variant={statusFilter === 'DELIVERED' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8"
                onClick={() => {
                  setStatusFilter('DELIVERED');
                  setPage(1);
                }}
              >
                Delivered ({deliveredCount})
              </Button>
              <Button
                type="button"
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8"
                onClick={() => {
                  setStatusFilter('PENDING');
                  setPage(1);
                }}
              >
                Pending ({pendingCount})
              </Button>
              <Button
                type="button"
                variant={statusFilter === 'FAILED' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8"
                onClick={() => {
                  setStatusFilter('FAILED');
                  setPage(1);
                }}
              >
                Failed ({failedCount})
              </Button>
            </div>
          </div>

          <div className="w-full">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient MSISDN</TableHead>
                  <TableHead>Network Carrier</TableHead>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Delivery State</TableHead>
                  <TableHead>Segments</TableHead>
                  <TableHead>Charged Rate</TableHead>
                  <TableHead>Handset Timestamp (EAT)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No delivery reports matching filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRecords.map((item) => (
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

          <div className="p-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
            <div>
              Showing {filteredRecords.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(page * pageSize, filteredRecords.length)} of {filteredRecords.length} entries
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="flex-1 sm:flex-initial"
              >
                Previous
              </Button>
              <span className="flex items-center px-2 text-xs font-mono">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="flex-1 sm:flex-initial"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
