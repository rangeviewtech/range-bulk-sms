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
    <div className={cn("flex h-screen overflow-hidden bg-[#f4f4f4] dark:bg-background font-sans text-sm text-[#333333] dark:text-foreground", className)}>
      <RangeSidebar user={user} />
      <div className="flex flex-col flex-1 min-w-0 pl-[90px]">
        {/* The sidebar is position fixed in range-sidebar, so we pad left 90px */}
        <main className="flex-1 overflow-y-auto w-full h-full p-0 pt-14">
          {children}
        </main>
      </div>
    </div>
  );
}
