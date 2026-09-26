"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RangeApp {
  id: string;
  name: string;
  domain: string;
  url: string;
  description: string;
  isCurrentApp?: boolean;
  isExternal?: boolean;
  logoSrc: string;
  logoAlt: string;
  accentGradient?: string;
  accentShadow?: string;
  icon?: React.ReactNode;
}

/**
 * 9-Dot Waffle Grid Icon
 * Faithfully matches Google Apps launcher icon with exact 3x3 circular dot matrix.
 */
export function WaffleGridIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <circle cx="5" cy="5" r="2" />
      <circle cx="12" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="12" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
    </svg>
  );
}

/**
 * Range View Official Apps List
 * Configured with actual production logos and domains
 */
export const RANGE_APPS: RangeApp[] = [
  {
    id: "range-bulk-sms",
    name: "Range Bulk SMS",
    domain: "www.sms.rangeview.com",
    url: "https://www.sms.rangeview.com",
    description: "Enterprise A2P Messaging, Campaigns & Delivery Logs",
    isCurrentApp: true,
    isExternal: false,
    logoSrc: "/images/brand/range-icon-transparent.svg",
    logoAlt: "Range Bulk SMS Logo",
  },
  {
    id: "range-bulk-ussd",
    name: "Range Bulk USSD",
    domain: "www.ussd.rangeview.com",
    url: "https://www.ussd.rangeview.com",
    description: "Real-time GSM USSD Menu Sessions & Gateway Dispatch",
    isCurrentApp: false,
    isExternal: true,
    logoSrc: "/images/brand/range-ussd-icon.svg",
    logoAlt: "Range Bulk USSD Logo",
  },
];

interface RangeAppsDropdownProps {
  className?: string;
  align?: "start" | "center" | "end";
}

/**
 * Google-Style Range View Apps Launcher Dropdown
 * 
 * Modeled directly after the Google Apps (9-dot waffle) launcher:
 * - Hover tooltip: "Range View apps"
 * - Rounded elevation card with smooth dark/light mode surface
 * - 2-column app tiles with actual official full-color product logos
 * - Production URLs: www.sms.rangeview.com and www.ussd.rangeview.com
 * - Bottom "More from Range View" link to root corporate portal
 */
export function RangeAppsDropdown({ className, align = "end" }: RangeAppsDropdownProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id="top-nav-range-apps-trigger"
          aria-label="Range View apps"
          title="Range View apps"
          className={cn(
            "h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all duration-200 cursor-pointer active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            open && "bg-accent text-foreground ring-2 ring-primary/20",
            className
          )}
        >
          <WaffleGridIcon className="w-[18px] h-[18px]" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        side="bottom"
        sideOffset={8}
        collisionPadding={12}
        className="w-[calc(100vw-24px)] max-w-[340px] sm:w-[350px] p-0 rounded-3xl border border-border/80 bg-popover/95 dark:bg-[#1a1b1e]/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
      >
        {/* Top Header with official Range logo */}
        <div className="px-4 py-3.5 border-b border-border/40 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center">
              <Image
                src="/images/brand/range-icon-transparent.svg"
                alt="Range View"
                width={16}
                height={16}
                className="w-4 h-4 object-contain shrink-0"
              />
            </div>
            <span className="text-xs font-semibold text-foreground tracking-tight">Range View Apps</span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded-full bg-muted/60 border border-border/40">
            Ecosystem
          </span>
        </div>

        {/* Apps Grid */}
        <div className="p-3 sm:p-4 grid grid-cols-2 gap-2.5">
          {RANGE_APPS.map((app) => {
            const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
            const href = app.isCurrentApp && isLocal ? "/dashboard" : app.url;

            const tileContent = (
              <>
                {/* Active indicator badge */}
                {app.isCurrentApp && (
                  <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                )}

                {app.isExternal && (
                  <span className="absolute top-2.5 right-2.5 text-muted-foreground group-hover:text-primary transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                  </span>
                )}

                {/* Actual App Logo Container */}
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/10 shadow-sm border border-slate-200/80 dark:border-white/10 flex items-center justify-center p-2.5 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md group-hover:border-primary/40 shrink-0">
                  <Image
                    src={app.logoSrc}
                    alt={app.logoAlt}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                  />
                </div>

                {/* App Name */}
                <div className="mt-2 text-xs sm:text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors tracking-tight">
                  {app.name}
                </div>

                {/* App Domain */}
                <div className="mt-0.5 text-[10px] font-mono text-muted-foreground group-hover:text-foreground/80 transition-colors line-clamp-1">
                  {app.domain}
                </div>
              </>
            );

            const tileClassName = cn(
              "relative flex flex-col items-center justify-center p-3.5 rounded-2xl text-center transition-all duration-200 cursor-pointer group active:scale-95 border",
              app.isCurrentApp
                ? "bg-primary/5 border-primary/20 shadow-xs"
                : "bg-muted/20 hover:bg-muted/60 border-transparent hover:border-border/60 hover:shadow-sm"
            );

            if (app.isCurrentApp && isLocal) {
              return (
                <Link
                  key={app.id}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={tileClassName}
                  title={`${app.name} (${app.domain})`}
                >
                  {tileContent}
                </Link>
              );
            }

            return (
              <a
                key={app.id}
                href={href}
                target={app.isExternal ? "_blank" : undefined}
                rel={app.isExternal ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className={tileClassName}
                title={`${app.name} (${app.domain})`}
              >
                {tileContent}
              </a>
            );
          })}
        </div>

        {/* Google-Style Footer */}
        <div className="px-4 py-2.5 bg-muted/30 border-t border-border/40 flex items-center justify-center">
          <a
            href="https://www.rangeview.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-xl hover:bg-background/80"
          >
            <span>More from Range View</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}
