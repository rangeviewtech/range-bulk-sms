"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RangeSidebar } from "./range-sidebar";

interface RangeShellProps {
  children: React.ReactNode;
  className?: string;
  user?: { name?: string | null; email?: string | null; image?: string | null; role?: string } | null;
}

export function RangeShell({ children, className, user }: RangeShellProps) {
  return (
    <div className={cn("flex h-screen overflow-hidden bg-muted/40 dark:bg-background font-sans text-sm text-foreground", className)}>
      <RangeSidebar user={user} />
      <div className="flex flex-col flex-1 min-w-0 pl-0 md:pl-[90px] pt-14">
        {/* pt-14 reserves space for the fixed top-navigation-bar (h-14 = 56px) */}
        <main className="flex-1 overflow-y-auto w-full min-h-0 p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
