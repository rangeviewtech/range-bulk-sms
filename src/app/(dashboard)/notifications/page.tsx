import * as React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/session';
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
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Bell className="w-6 h-6 text-gray-500" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      <div className="grid gap-4">
        {notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500 border rounded-lg bg-gray-50/50">
            No notifications available.
          </div>
        ) : (
          notifications.map((n) => (
            <Card key={n.id} className={!n.readAt ? 'border-blue-200 bg-blue-50/50' : ''}>
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">{n.title}</CardTitle>
                <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <p className="text-sm text-gray-700">{n.body}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
