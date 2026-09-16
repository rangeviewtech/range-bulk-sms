"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  LayoutDashboard,
  BarChart2,
  BookOpen,
  Lock,
  Layers,
  Palette,
  Settings,
  Shield,
  Activity,
  MessageSquare,
  Server
} from "lucide-react";
import type { NavGroup } from "@/types/navigation";

interface SidebarProps {
  groups: NavGroup[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BarChart2,
  BookOpen,
  Lock,
  Layers,
  Palette,
  Settings,
  Shield,
  Activity,
  MessageSquare,
  Server
};

function getIcon(name?: string) {
  if (!name) return null;
  return iconMap[name] || null;
}

export function Sidebar({ groups, collapsed = false, onToggleCollapse, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 h-full",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="font-semibold text-sm truncate">Navigation</span>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
            />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-4 px-2">
          {groups.map((group, groupIndex) => (
            <div key={groupIndex} className="flex flex-col gap-1">
              {!collapsed && (
                <h4 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </h4>
              )}
              {group.items.map((item, itemIndex) => {
                const Icon = getIcon(item.icon);
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={itemIndex}
                    href={item.disabled ? "#" : item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                        : "transparent",
                      item.disabled && "cursor-not-allowed opacity-60",
                      collapsed && "justify-center"
                    )}
                  >
                    {Icon && <Icon className={cn("h-4 w-4 shrink-0", !collapsed && "mr-3")} />}
                    {!collapsed && <span className="truncate">{item.title}</span>}
                    {!collapsed && item.label && (
                      <span className="ml-auto text-xs text-muted-foreground">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
