'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarClock, Trash2, PauseCircle, PlayCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ScheduledItem {
  id: string;
  name: string;
  scheduledAt: string;
  recipients: number;
  status: 'SCHEDULED' | 'PAUSED';
}

const INITIAL_SCHEDULED: ScheduledItem[] = [
  { id: '1', name: 'Weekend Promo', scheduledAt: '2026-09-20 09:00', recipients: 1250, status: 'SCHEDULED' },
  { id: '2', name: 'Reminder: Webinar', scheduledAt: '2026-09-22 14:30', recipients: 450, status: 'PAUSED' },
];

export default function ScheduledSmsPage() {
  const [items, setItems] = useState<ScheduledItem[]>(INITIAL_SCHEDULED);

  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'SCHEDULED' ? 'PAUSED' : 'SCHEDULED';
          toast.info(`Campaign "${item.name}" ${nextStatus === 'PAUSED' ? 'paused' : 'resumed'}.`);
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const handleDelete = (id: string, name: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success(`Scheduled message "${name}" cancelled.`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Scheduled Messages"
        description="View and manage messages queued for future delivery."
        action={
          <Button asChild className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
            <Link href="/sms/send">
              <Plus className="w-4 h-4 mr-2" />
              Schedule New SMS
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="w-full">
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign / Name</TableHead>
                  <TableHead>Scheduled Time</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No scheduled messages in the queue.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-primary shrink-0" />
                        <span>{item.scheduledAt}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.recipients.toLocaleString()} contacts
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.status === 'SCHEDULED' ? 'default' : 'secondary'}
                          className={`font-medium text-xs ${
                            item.status === 'SCHEDULED'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-amber-500"
                          onClick={() => handleToggleStatus(item.id)}
                          aria-label={item.status === 'SCHEDULED' ? 'Pause message' : 'Resume message'}
                        >
                          {item.status === 'SCHEDULED' ? (
                            <PauseCircle className="w-4 h-4" />
                          ) : (
                            <PlayCircle className="w-4 h-4 text-emerald-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(item.id, item.name)}
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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

