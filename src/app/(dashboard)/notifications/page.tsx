import * as React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/dal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export const metadata = {
  title: 'Notifications | Dashboard',
};

export default async function NotificationsPage() {
  const session = await requireAuth();

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId, archivedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <Bell className="w-6 h-6 text-[#04648C] dark:text-[#FBCA07]" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Stay updated with system and account alerts.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {notifications.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/20">
            No notifications available.
          </div>
        ) : (
          notifications.map((n) => (
            <Card key={n.id} className={!n.readAt ? 'border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20' : ''}>
              <CardHeader className="py-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <CardTitle className="text-sm font-semibold">{n.title}</CardTitle>
                <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <p className="text-sm text-foreground/90">{n.body}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
