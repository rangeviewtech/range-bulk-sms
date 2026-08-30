"use client";

import * as React from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { Header } from "@/components/navigation/header";
import { navConfig } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { SupportChatbox } from "@/components/chat/support-chatbox";

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
  user?: { name?: string | null; email?: string | null; image?: string | null; } | null;
}

export function DashboardShell({ children, className, user }: DashboardShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        groups={navConfig} 
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        className="hidden md:flex z-10" 
      />
      <div className="flex flex-col flex-1 min-w-0">
        <Header user={user} />
        <main className={cn("flex-1 overflow-y-auto p-4 md:p-8", className)}>
          {children}
        </main>
      </div>
      <SupportChatbox />
    </div>
  );
}
