'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Info, RefreshCw, AtSign } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { TableSkeletonRows } from '@/components/blocks/ui/skeleton-layouts';

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
        <Info className="w-5 h-5 text-primary shrink-0" />
        <p>
          Sender IDs are the names that appear on a recipient&apos;s phone when they receive your SMS.
          New Sender IDs must be approved by telecom operators before they can be used for outbound campaigns.
        </p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden mt-2">
        <div className="w-full">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>Sender ID</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested On</TableHead>
                <TableHead>Approved On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeletonRows columns={5} rows={5} />
              ) : senderIds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <AtSign className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="font-medium text-foreground">No Sender IDs requested yet</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Submit an alphanumeric sender mask (e.g. your brand name) for approval.
                    </p>
                    <Link href="/sender-ids/apply">
                      <Button size="sm" variant="outline">Request Sender ID</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                senderIds.map((item) => (
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
      </div>
    </div>
  );
}

