'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, FileDown, Filter } from 'lucide-react';

export default function DeliveryReportsPage() {
  const mockData = [
    { id: '1', phone: '+256700000001', campaign: 'Summer Sale 2026', status: 'DELIVERED', time: '2026-09-15 09:01:23', cost: 10 },
    { id: '2', phone: '+256700000002', campaign: 'Summer Sale 2026', status: 'DELIVERED', time: '2026-09-15 09:01:25', cost: 10 },
    { id: '3', phone: '+256700000003', campaign: 'Summer Sale 2026', status: 'FAILED', time: '2026-09-15 09:02:10', cost: 0 },
    { id: '4', phone: '+256700000004', campaign: 'Summer Sale 2026', status: 'PENDING', time: '-', cost: 10 },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'DELIVERED': return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">Delivered</Badge>;
      case 'FAILED': return <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">Failed</Badge>;
      case 'PENDING': return <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">Pending</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <PageHeader
        title="Delivery Reports"
        description="Detailed log of all messages sent and their delivery status."
        action={
          <Button variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        }
      />
      
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search phone number..." className="pl-9" />
            </div>
            <Button variant="secondary" className="sm:w-auto w-full">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Phone Number</th>
                  <th className="px-6 py-4 font-medium">Campaign / Source</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Cost</th>
                  <th className="px-6 py-4 font-medium">Time (EAT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockData.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{item.phone}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.campaign}</td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.cost} UGX</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
            <div>Showing 1 to 4 of 15,400 entries</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
