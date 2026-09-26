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
            "h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200 cursor-pointer active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
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
        className="w-[calc(100vw-24px)] max-w-[380px] sm:w-[390px] p-0 rounded-3xl border border-border/80 dark:border-white/10 bg-popover/98 dark:bg-[#14161c]/98 backdrop-blur-2xl shadow-[0_24px_60px_-10px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)] z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
      >
        {/* Top Header with official Range logo & live status */}
        <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/25 flex items-center justify-center shadow-xs">
              <Image
                src="/images/brand/range-icon-transparent.svg"
                alt="Range View"
                width={18}
                height={18}
                className="w-4.5 h-4.5 object-contain shrink-0"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground tracking-tight leading-tight">Range View Apps</span>
              <span className="text-[10px] text-muted-foreground font-medium">Enterprise Ecosystem</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-[10px] font-mono font-semibold text-primary uppercase tracking-wider">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
            Ecosystem
          </div>
        </div>

        {/* Apps Grid */}
        <div className="p-3.5 sm:p-4 grid grid-cols-2 gap-3">
          {RANGE_APPS.map((app) => {
            const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
            const href = app.isCurrentApp && isLocal ? "/dashboard" : app.url;
            const isSms = app.id === "range-bulk-sms";

            const tileContent = (
              <>
                {/* Active indicator badge with radar pulse */}
                {app.isCurrentApp && (
                  <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-md shadow-xs">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    Active
                  </span>
                )}

                {/* External Portal Badge */}
                {app.isExternal && (
                  <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium text-muted-foreground group-hover:text-foreground bg-muted/60 dark:bg-white/5 border border-border/40 transition-colors">
                    <span>Portal</span>
                    <ArrowUpRight className="w-3 h-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                )}

                {/* Luminous App Icon Squircle */}
                <div
                  className={cn(
                    "w-16 h-16 rounded-[20px] p-2.5 flex items-center justify-center transition-all duration-300 group-hover:scale-105 shrink-0",
                    isSms
                      ? "bg-gradient-to-br from-[#0c2e59] via-[#071d38] to-[#041122] shadow-[0_10px_25px_-5px_rgba(4,100,140,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-sky-500/35 group-hover:shadow-[0_14px_30px_-4px_rgba(4,100,140,0.7)] group-hover:border-sky-400/60"
                      : "bg-gradient-to-br from-[#241752] via-[#170e38] to-[#0d0722] shadow-[0_10px_25px_-5px_rgba(139,92,246,0.45),inset_0_1px_1px_rgba(255,255,255,0.25)] border border-purple-500/35 group-hover:shadow-[0_14px_30px_-4px_rgba(139,92,246,0.65)] group-hover:border-purple-400/60"
                  )}
                >
                  <Image
                    src={app.logoSrc}
                    alt={app.logoAlt}
                    width={52}
                    height={52}
                    className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] select-none"
                    draggable={false}
                    priority
                  />
                </div>

                {/* App Name */}
                <div className="mt-2.5 text-xs sm:text-[13px] font-bold text-foreground group-hover:text-primary transition-colors tracking-tight text-center">
                  {app.name}
                </div>

                {/* App Category Description */}
                <div className="mt-0.5 text-[10px] text-muted-foreground/80 font-medium text-center">
                  {isSms ? "A2P & OTP Messaging" : "GSM Interactive Menus"}
                </div>

                {/* Production Domain Tag */}
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-background/80 dark:bg-white/[0.04] border border-border/50 text-[10px] font-mono text-muted-foreground group-hover:text-foreground group-hover:border-primary/30 transition-all duration-200">
                  <span className={cn("w-1 h-1 rounded-full", isSms ? "bg-emerald-500" : "bg-indigo-400")} />
                  <span>{app.domain}</span>
                </div>
              </>
            );

            const tileClassName = cn(
              "relative flex flex-col items-center justify-center p-3.5 pt-6 rounded-2xl text-center transition-all duration-200 cursor-pointer group active:scale-95 border",
              app.isCurrentApp
                ? "bg-gradient-to-b from-primary/[0.08] via-background/60 to-background/30 dark:from-primary/[0.06] dark:via-white/[0.02] dark:to-transparent border-primary/30 shadow-[0_4px_20px_-6px_rgba(251,202,7,0.12)] hover:border-primary/50"
                : "bg-muted/20 dark:bg-white/[0.02] hover:bg-muted/50 dark:hover:bg-white/[0.05] border-border/50 dark:border-white/5 hover:border-border hover:shadow-md"
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

        {/* Enterprise Corporate Suite Footer */}
        <div className="p-2 bg-muted/30 border-t border-border/40">
          <a
            href="https://www.rangeview.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background/80 dark:hover:bg-white/5 border border-transparent hover:border-border/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <ExternalLink className="w-3 h-3" />
              </div>
              <span className="font-semibold text-foreground/90">More from Range View</span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
              rangeview.com
              <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}
