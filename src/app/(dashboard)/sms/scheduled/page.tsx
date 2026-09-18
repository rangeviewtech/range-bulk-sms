'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Edit, Trash2, PauseCircle } from 'lucide-react';

export default function ScheduledSmsPage() {
  const mockData = [
    { id: '1', name: 'Weekend Promo', scheduledAt: '2026-09-18 09:00', recipients: 1250, status: 'SCHEDULED' },
    { id: '2', name: 'Reminder: Webinar', scheduledAt: '2026-09-20 14:30', recipients: 450, status: 'PAUSED' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Scheduled Messages"
        description="View and manage messages queued for future delivery."
      />
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[650px]">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Campaign / Name</th>
                  <th className="px-6 py-4 font-medium">Scheduled Time</th>
                  <th className="px-6 py-4 font-medium">Recipients</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockData.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{item.name}</td>
                    <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                      <CalendarClock className="w-4 h-4" />
                      {item.scheduledAt}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{item.recipients}</td>
                    <td className="px-6 py-4">
                      <Badge variant={item.status === 'SCHEDULED' ? 'default' : 'secondary'} className="font-medium text-xs">
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-amber-500">
                        <PauseCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {mockData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No scheduled messages found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
