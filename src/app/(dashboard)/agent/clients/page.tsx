'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, RefreshCw, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

interface AgentClient {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  totalSms: number;
  totalRevenue: number;
  totalCommission: number;
  status: string;
}

export default function AgentClientsPage() {
  const [clients, setClients] = useState<AgentClient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/agent/clients');
      if (!res.ok) throw new Error('Failed to load clients list');
      const data = await res.json();
      setClients(data.clients || []);
    } catch {
      toast.error('Unable to fetch assigned clients');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchClients();
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" asChild className="p-0 h-auto text-muted-foreground hover:text-foreground">
              <Link href="/agent/dashboard" className="flex items-center gap-1 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Agent Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">My Clients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overview of clients managed under your agency portfolio.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh clients"
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border-secondary/20 shadow-sm">
        <CardHeader>
          <CardTitle>Client Portfolio ({clients.length})</CardTitle>
          <CardDescription>
            Performance metrics including all-time SMS volume and your commissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="space-y-3 p-4 sm:p-0 py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-full bg-muted/40 animate-pulse rounded" />
              ))}
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12 m-4 sm:m-0 border border-dashed rounded-lg">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-foreground">
                {search ? 'No clients match your search' : 'No clients enrolled yet'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {search
                  ? 'Try searching with a different name or email address.'
                  : 'Clients onboarded with your agent referral code will appear here automatically.'}
              </p>
            </div>
          ) : (
            <div className="w-full">
              <Table className="min-w-[750px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead>SMS Sent (All Time)</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Commission Earned</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-semibold text-foreground">
                        {c.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {c.email}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(c.joinedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {c.totalSms.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        UGX {c.totalRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-bold text-sm text-secondary dark:text-primary">
                        UGX {c.totalCommission.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={c.status === 'ACTIVE' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
