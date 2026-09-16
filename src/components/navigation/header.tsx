import * as React from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { NotificationBell } from "@/components/notifications/notification-bell";

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  user?: { name?: string | null; email?: string | null; image?: string | null; } | null;
}

export function Header({ className, user: _user, ...props }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full h-[60px] bg-[#f4f5f9] flex items-center justify-end px-6 space-x-4",
        className
      )}
      {...props}
    >
      <div className="cursor-pointer">
        <Search className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" strokeWidth={1.5} />
      </div>
      <NotificationBell />
    </header>
  );
}
