'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, BarChart2, Eye, Search } from 'lucide-react';
import Link from 'next/link';

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
  { id: '4', name: 'New Product Launch', status: 'DRAFT', recipients: 12000, sent: 0, failed: 0, progress: 0, date: '-' },
];

export default function CampaignsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  const filteredCampaigns = INITIAL_CAMPAIGNS.filter((camp) => {
    const matchesSearch = camp.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || camp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="w-full sm:w-auto h-auto flex-wrap">
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
            <TabsTrigger value="PROCESSING">Processing</TabsTrigger>
            <TabsTrigger value="SCHEDULED">Scheduled</TabsTrigger>
            <TabsTrigger value="DRAFT">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="w-full">
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      No campaigns match your search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((camp) => (
                    <TableRow key={camp.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">{camp.name}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}

