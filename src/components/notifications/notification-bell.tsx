'use client';

import * as React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  actionUrl: string | null;
};

export function NotificationBell() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const router = useRouter();

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark-all-read' })
    });
    fetchNotifications();
  };

  const handleClick = async (id: string, actionUrl: string | null) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark-read', id })
    });
    fetchNotifications();
    if (actionUrl?.startsWith('/') && !actionUrl.startsWith('//') && !actionUrl.includes('\\')) {
      router.push(actionUrl);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            notifications.map(n => (
              <DropdownMenuItem 
                key={n.id} 
                className={`flex flex-col items-start p-3 cursor-pointer ${!n.readAt ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                onClick={() => handleClick(n.id, n.actionUrl)}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-medium text-sm">{n.title}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <div className="p-2 border-t text-center">
          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => router.push('/notifications')}>
            View all
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
