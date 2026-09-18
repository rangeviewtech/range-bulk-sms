'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, BarChart2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function CampaignsPage() {
  const mockCampaigns = [
    { id: '1', name: 'Summer Sale 2026', status: 'COMPLETED', recipients: 15420, sent: 15400, failed: 20, progress: 100, date: '2026-06-15' },
    { id: '2', name: 'VIP Customer Update', status: 'PROCESSING', recipients: 5000, sent: 2500, failed: 0, progress: 50, date: '2026-09-16' },
    { id: '3', name: 'Flash Deal Alert', status: 'SCHEDULED', recipients: 45000, sent: 0, failed: 0, progress: 0, date: '2026-09-20' },
    { id: '4', name: 'New Product Launch', status: 'DRAFT', recipients: 12000, sent: 0, failed: 0, progress: 0, date: '-' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'PROCESSING': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'SCHEDULED': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="SMS Campaigns"
        description="Manage your bulk messaging campaigns and view their performance."
        action={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/sms/campaigns/new">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Link>
          </Button>
        }
      />
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[650px]">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Campaign Name</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Progress</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockCampaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{camp.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`font-medium text-xs ${getStatusColor(camp.status)}`}>
                        {camp.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{camp.sent} / {camp.recipients}</span>
                          <span>{camp.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${camp.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary'}`} 
                            style={{ width: `${camp.progress}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{camp.date}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {camp.status === 'COMPLETED' || camp.status === 'PROCESSING' ? (
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Link href={`/sms/campaigns/${camp.id}`}>
                            <BarChart2 className="w-4 h-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Link href={`/sms/campaigns/${camp.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
