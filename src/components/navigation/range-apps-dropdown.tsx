"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, ExternalLink, ArrowUpRight } from "lucide-react";
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
 * Configured with production logos and domains
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
 * Range View Apps Launcher Dropdown
 * 
 * Modeled directly after the system design language and Language Switcher dropdown:
 * - High-density Radix DropdownMenu with clean elevation and popover styling
 * - Trigger button with 9-dot waffle grid icon matching system round buttons
 * - Refined list items with official product logos, titles, and descriptions
 * - Active checkmark indicator for the current app
 * - External link portal indicator for other ecosystem applications
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
        className="w-72 sm:w-80 p-1.5 rounded-xl border bg-popover text-popover-foreground shadow-xl z-50"
      >
        {/* Header */}
        <div className="px-2.5 py-2 flex items-center justify-between border-b border-border/50 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Image
                src="/images/brand/range-icon-transparent.svg"
                alt="Range View"
                width={14}
                height={14}
                className="w-3.5 h-3.5 object-contain"
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

        {/* Apps List (Matching Language Switcher list design) */}
        <div className="space-y-0.5">
          {RANGE_APPS.map((app) => {
            const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
            const href = app.isCurrentApp && isLocal ? "/dashboard" : app.url;
            const isSms = app.id === "range-bulk-sms";
            const categoryDesc = isSms ? "A2P & OTP Messaging" : "GSM Interactive Menus";

            const itemContent = (
              <>
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 p-1 transition-all border",
                      app.isCurrentApp
                        ? "bg-primary/10 border-primary/25 shadow-xs"
                        : "bg-muted/80 border-border/60"
                    )}
                  >
                    <Image
                      src={app.logoSrc}
                      alt={app.logoAlt}
                      width={24}
                      height={24}
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span
                      className={cn(
                        "text-xs truncate font-medium",
                        app.isCurrentApp ? "text-primary font-semibold" : "text-foreground"
                      )}
                    >
                      {app.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {categoryDesc}
                    </span>
                  </div>
                </div>

                {app.isCurrentApp ? (
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      Active
                    </span>
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1 shrink-0 ml-2 text-muted-foreground">
                    <span className="text-[10px] font-medium opacity-70">Portal</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                )}
              </>
            );

            const itemClassName =
              "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground group";

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
        <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-border/50" />
        <DropdownMenuItem
          asChild
          className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground group"
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
