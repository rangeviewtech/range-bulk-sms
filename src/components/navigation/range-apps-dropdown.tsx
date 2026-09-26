"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
 * Matches Google Apps launcher icon with 3x3 circular dot matrix.
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
 * Complete suite of 9 ecosystem products configured with brand logos and domains
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
    accentGradient: "from-amber-500/20 to-yellow-500/10",
    accentShadow: "rgba(251, 202, 7, 0.2)",
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
    accentGradient: "from-blue-500/20 to-cyan-500/10",
    accentShadow: "rgba(4, 100, 140, 0.2)",
  },
  {
    id: "range-invoices",
    name: "Range Invoices",
    domain: "www.invoices.rangeview.com",
    url: "https://www.invoices.rangeview.com",
    description: "Automated Invoicing, Payment Receipts & Billing",
    isCurrentApp: false,
    isExternal: true,
    logoSrc: "/images/brand/range-invoices-icon.svg",
    logoAlt: "Range Invoices Logo",
    accentGradient: "from-emerald-500/20 to-teal-500/10",
    accentShadow: "rgba(16, 185, 129, 0.2)",
  },
  {
    id: "range-students",
    name: "Range Students",
    domain: "www.students.rangeview.com",
    url: "https://www.students.rangeview.com",
    description: "School SIS, Campus Fees & Student Parent Alerts",
    isCurrentApp: false,
    isExternal: true,
    logoSrc: "/images/brand/range-students-icon.svg",
    logoAlt: "Range Students Logo",
    accentGradient: "from-indigo-500/20 to-violet-500/10",
    accentShadow: "rgba(99, 102, 241, 0.2)",
  },
  {
    id: "range-market",
    name: "Range Market",
    domain: "www.market.rangeview.com",
    url: "https://www.market.rangeview.com",
    description: "Digital Commerce, Vendor Storefronts & Orders",
    isCurrentApp: false,
    isExternal: true,
    logoSrc: "/images/brand/range-market-icon.svg",
    logoAlt: "Range Market Logo",
    accentGradient: "from-rose-500/20 to-orange-500/10",
    accentShadow: "rgba(244, 63, 94, 0.2)",
  },
  {
    id: "range-wifi-billing",
    name: "Range Wifi Billing",
    domain: "www.wifi.rangeview.com",
    url: "https://www.wifi.rangeview.com",
    description: "Captive Portal, Hotspot Vouchers & Bandwidth",
    isCurrentApp: false,
    isExternal: true,
    logoSrc: "/images/brand/range-wifi-icon.svg",
    logoAlt: "Range Wifi Billing Logo",
    accentGradient: "from-sky-500/20 to-blue-500/10",
    accentShadow: "rgba(14, 165, 233, 0.2)",
  },
  {
    id: "range-subscription",
    name: "Range Subscription",
    domain: "www.subscription.rangeview.com",
    url: "https://www.subscription.rangeview.com",
    description: "Recurring Billing, Retainers & Plan Lifecycle",
    isCurrentApp: false,
    isExternal: true,
    logoSrc: "/images/brand/range-subscription-icon.svg",
    logoAlt: "Range Subscription Logo",
    accentGradient: "from-amber-500/20 to-orange-500/10",
    accentShadow: "rgba(245, 158, 11, 0.2)",
  },
  {
    id: "range-gps-tracking",
    name: "Range GPS Tracking",
    domain: "www.gps.rangeview.com",
    url: "https://www.gps.rangeview.com",
    description: "Real-time Vehicle Telematics & Fleet Monitoring",
    isCurrentApp: false,
    isExternal: true,
    logoSrc: "/images/brand/range-gps-icon.svg",
    logoAlt: "Range GPS Tracking Logo",
    accentGradient: "from-teal-500/20 to-emerald-500/10",
    accentShadow: "rgba(20, 184, 166, 0.2)",
  },
  {
    id: "range-pay",
    name: "Range Pay",
    domain: "www.pay.rangeview.com",
    url: "https://www.pay.rangeview.com",
    description: "Unified Mobile Money & Card Payment Gateway",
    isCurrentApp: false,
    isExternal: true,
    logoSrc: "/images/brand/range-pay-icon.svg",
    logoAlt: "Range Pay Logo",
    accentGradient: "from-yellow-500/20 to-amber-500/10",
    accentShadow: "rgba(234, 179, 8, 0.2)",
  },
];

interface RangeAppsDropdownProps {
  className?: string;
  align?: "start" | "center" | "end";
}

/**
 * Range View Apps Launcher Dropdown
 * 
 * Modeled directly after the Google Apps Launcher 3-column matrix:
 * - 3 items in the same row (`grid grid-cols-3`)
 * - Large official brand icon centered on top
 * - Clean app title centered directly underneath
 * - Active badge indicator for the current app
 * - Corporate suite link footer to rangeview.com
 */
export function RangeAppsDropdown({ className, align = "end" }: RangeAppsDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const isPointerDownRef = React.useRef(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          id="top-nav-range-apps-trigger"
          aria-label="Range View apps"
          title="Range View apps"
          onPointerDown={() => {
            isPointerDownRef.current = true;
          }}
          onClick={() => {
            if (!isPointerDownRef.current) {
              setOpen((prev) => !prev);
            }
            isPointerDownRef.current = false;
          }}
          className={cn(
            "h-9 w-9 rounded-full transition-transform active:scale-95 text-muted-foreground hover:text-foreground hover:bg-accent/80",
            open && "bg-accent text-foreground",
            className
          )}
        >
          <WaffleGridIcon className="w-[18px] h-[18px]" />
          <span className="sr-only">Range View apps</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        className="w-[330px] sm:w-[360px] max-w-[calc(100vw-16px)] p-2 rounded-2xl border bg-popover text-popover-foreground shadow-2xl z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="px-2.5 py-2 flex items-center justify-between border-b border-border/50 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Image
                src="/images/brand/range-icon-transparent.svg"
                alt="Range View"
                width={16}
                height={16}
                className="w-4 h-4 object-contain"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground leading-tight">Range View Apps</span>
              <span className="text-[10px] text-muted-foreground">Enterprise Ecosystem</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-[10px] font-mono font-semibold text-primary uppercase tracking-wider">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
            Ecosystem
          </div>
        </div>

        {/* 3-Column Apps Grid Matching Google Apps Launcher */}
        <div className="grid grid-cols-3 gap-2 px-0.5 py-1">
          {RANGE_APPS.map((app) => {
            const isLocal =
              typeof window !== "undefined" &&
              (window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1");
            const href = app.isCurrentApp && isLocal ? "/dashboard" : app.url;

            const itemContent = (
              <div className="flex flex-col items-center justify-start text-center p-1.5 rounded-xl transition-all duration-150 hover:bg-accent/80 group cursor-pointer relative w-full h-[96px]">
                {/* Active Indicator Badge for Current App */}
                {app.isCurrentApp && (
                  <span className="absolute top-1 right-1 flex items-center gap-0.5 px-1 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                )}

                {/* Top App Icon Container */}
                <div
                  className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center p-2 transition-all duration-200 group-hover:scale-105 border shrink-0",
                    app.isCurrentApp
                      ? "bg-primary/10 border-primary/30 shadow-xs"
                      : "bg-muted/60 dark:bg-muted/30 border-border/60 group-hover:border-primary/30 group-hover:bg-accent"
                  )}
                >
                  <Image
                    src={app.logoSrc}
                    alt={app.logoAlt}
                    width={32}
                    height={32}
                    className="w-7 h-7 object-contain drop-shadow-xs"
                  />
                </div>

                {/* Centered App Label Directly Underneath */}
                <span
                  className={cn(
                    "text-[11px] font-medium leading-[1.2] mt-1.5 text-center line-clamp-2 w-full px-0.5 transition-colors",
                    app.isCurrentApp
                      ? "text-primary font-semibold"
                      : "text-foreground group-hover:text-primary"
                  )}
                >
                  {app.name}
                </span>
              </div>
            );

            const itemClassName =
              "p-0 rounded-xl focus:bg-transparent cursor-pointer";

            if (app.isCurrentApp && isLocal) {
              return (
                <DropdownMenuItem
                  key={app.id}
                  asChild
                  className={itemClassName}
                >
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    title={`${app.name} (${app.domain})`}
                  >
                    {itemContent}
                  </Link>
                </DropdownMenuItem>
              );
            }

            return (
              <DropdownMenuItem
                key={app.id}
                asChild
                className={itemClassName}
              >
                <a
                  href={href}
                  target={app.isExternal ? "_blank" : undefined}
                  rel={app.isExternal ? "noopener noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  title={`${app.name} (${app.domain})`}
                >
                  {itemContent}
                </a>
              </DropdownMenuItem>
            );
          })}
        </div>

        {/* Footer */}
        <DropdownMenuSeparator className="-mx-1 my-1.5 h-px bg-border/50" />
        <DropdownMenuItem
          asChild
          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground group"
        >
          <a
            href="https://www.rangeview.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="w-full flex items-center justify-between text-muted-foreground hover:text-foreground"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-foreground/90 text-xs">More from Range View</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-0.5 group-hover:text-primary transition-colors">
              rangeview.com
              <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
