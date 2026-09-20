import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * DashboardSkeleton matches http://localhost:3000/dashboard 1:1:
 * - Header with title, subtitle, and action buttons (System Monitor, Manage Clients)
 * - 6 KPI Action Cards (Total Clients, Active Agents, SMS Sent Today, Delivery Rate, Client Balances, SMS Gateways)
 * - 2 Interactive Chart Cards (SMS Volume AreaChart & Revenue Trends BarChart)
 * - 2 Detailed Action Cards (Recent Client Campaigns & SMS Gateways / Providers)
 */
export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6", className)}>
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-8 sm:h-9 w-48 sm:w-64" />
          <Skeleton className="h-4 w-72 sm:w-96 max-w-full" />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Skeleton className="h-9 w-full sm:w-36 rounded-md" />
          <Skeleton className="h-9 w-full sm:w-36 rounded-md" />
        </div>
      </div>

      {/* KPI Cards Skeleton: 6 Action Cards matching real grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {[
          { titleW: "w-20", valW: "w-10", subW: "w-28" },
          { titleW: "w-24", valW: "w-8", subW: "w-24" },
          { titleW: "w-24", valW: "w-8", subW: "w-24" },
          { titleW: "w-20", valW: "w-16", subW: "w-28" },
          { titleW: "w-24", valW: "w-28", subW: "w-24" },
          { titleW: "w-24", valW: "w-20", subW: "w-28" },
        ].map((kpi, i) => (
          <Card key={i} className="h-full border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-5 pb-2">
              <Skeleton className={cn("h-3", kpi.titleW)} />
              <Skeleton className="h-7 w-7 rounded-md" />
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0 space-y-2">
              <Skeleton className={cn("h-7", kpi.valW)} />
              <Skeleton className={cn("h-3", kpi.subW)} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Charts Skeleton: 2 cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* SMS Volume Chart Skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3.5 w-64 max-w-full" />
            </div>
            <Skeleton className="h-5 w-24 rounded-full" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full flex flex-col justify-between p-4 border border-dashed border-border/70 rounded-lg bg-muted/10 relative overflow-hidden">
              {/* Subtle grid lines */}
              <div className="space-y-8 w-full opacity-40">
                <div className="border-b border-border/50 w-full" />
                <div className="border-b border-border/50 w-full" />
                <div className="border-b border-border/50 w-full" />
                <div className="border-b border-border/50 w-full" />
              </div>
              {/* Trend line / area bars */}
              <div className="flex items-end justify-between gap-2 h-36 z-10 px-2">
                {[35, 60, 25, 80, 50, 85, 65].map((h, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <Skeleton className="w-full rounded-t-sm bg-secondary/20" style={{ height: `${h}%` }} />
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trends Chart Skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3.5 w-64 max-w-full" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full flex flex-col justify-between p-4 border border-dashed border-border/70 rounded-lg bg-muted/10 relative overflow-hidden">
              <div className="space-y-8 w-full opacity-40">
                <div className="border-b border-border/50 w-full" />
                <div className="border-b border-border/50 w-full" />
                <div className="border-b border-border/50 w-full" />
                <div className="border-b border-border/50 w-full" />
              </div>
              <div className="flex items-end justify-between gap-3 h-36 z-10 px-4">
                {[20, 35, 15, 95, 40, 60, 45].map((h, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <Skeleton className="w-full max-w-[36px] rounded-t-md bg-secondary/30" style={{ height: `${h}%` }} />
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns & System Health Action Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Campaigns Skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3.5 w-56" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 first:pt-0 last:pb-0">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40 sm:w-48" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SMS Gateways & Providers Skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3.5 w-60" />
            </div>
            <Skeleton className="h-8 w-28 rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-52" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * TablePageSkeleton provides a matching skeleton for table & directory pages
 * (Admin Clients, Users, Agents, Audit Logs, Providers, Pricing, Sender IDs, Contacts, etc.)
 */
export function TablePageSkeleton({
  titleWidth = "w-48",
  subtitleWidth = "w-80",
  actionButtons = 2,
  columns = 6,
  rows = 6,
  className,
}: {
  titleWidth?: string;
  subtitleWidth?: string;
  actionButtons?: number;
  columns?: number;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6", className)}>
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className={cn("h-8 sm:h-9", titleWidth)} />
          <Skeleton className={cn("h-4 max-w-full", subtitleWidth)} />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          {Array.from({ length: actionButtons }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-md flex-1 sm:flex-initial" />
          ))}
        </div>
      </div>

      {/* Table Card Container */}
      <Card className="border">
        {/* Search & Filter Bar Skeleton */}
        <CardHeader className="p-4 sm:p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Skeleton className="h-9 w-full sm:w-72 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md shrink-0" />
          </div>
          <Skeleton className="h-4 w-28 sm:ml-auto" />
        </CardHeader>

        {/* Table Content Skeleton */}
        <CardContent className="p-0 sm:p-6 pt-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/80 text-left">
                  {Array.from({ length: columns }).map((_, i) => (
                    <th key={i} className="py-3 px-4 font-medium">
                      <Skeleton className={cn("h-3.5", i === 0 ? "w-28" : i === columns - 1 ? "w-16 ml-auto" : "w-20")} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {Array.from({ length: rows }).map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    {/* First column: usually entity with avatar/icon */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32 sm:w-40" />
                          <Skeleton className="h-3 w-40 sm:w-48" />
                        </div>
                      </div>
                    </td>
                    {/* Middle columns: status, text, amount, badge */}
                    {Array.from({ length: columns - 2 }).map((_, colIdx) => (
                      <td key={colIdx} className="py-3.5 px-4">
                        {colIdx % 2 === 0 ? (
                          <Skeleton className="h-4 w-24" />
                        ) : (
                          <Skeleton className="h-5 w-20 rounded-full" />
                        )}
                      </td>
                    ))}
                    {/* Last column: action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <Skeleton className="h-8 w-16 ml-auto rounded-md" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * FormPageSkeleton provides a matching skeleton for form/action pages
 * (/sms/send, /sms/custom, /sms/campaigns/new, /sender-ids/apply, /gateways/add, etc.)
 */
export function FormPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6", className)}>
      {/* Header Skeleton */}
      <div className="space-y-1.5">
        <Skeleton className="h-8 sm:h-9 w-44" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Grid: 2 columns layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form Card (2 cols) */}
        <Card className="lg:col-span-2 border">
          <CardHeader className="p-5 pb-3 space-y-1.5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-60" />
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28" />
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-24 rounded-md" />
                  <Skeleton className="h-7 w-20 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-36 w-full rounded-md" />
            </div>
            <div className="flex flex-wrap justify-between items-center p-3 rounded-lg border bg-muted/20 gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* Side Action Cards (1 col) */}
        <div className="space-y-4">
          <Card className="border">
            <CardHeader className="p-5 pb-3 space-y-1.5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3.5 w-48" />
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-3">
              <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-lg">
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
              <Skeleton className="h-16 w-full rounded-md" />
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="p-5 pb-3">
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-3">
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between items-center py-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * WalletPageSkeleton matches /wallet and billing screens:
 * - Header with Deposit Funds button
 * - 3 KPI Action Cards (Available Balance, Estimated SMS Credits, Pricing Tier)
 * - Recent Transactions Table Card
 */
export function WalletPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6", className)}>
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-8 sm:h-9 w-44" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>

      {/* 3 KPI Action Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { titleW: "w-28", valW: "w-36", subW: "w-32" },
          { titleW: "w-36", valW: "w-28", subW: "w-40" },
          { titleW: "w-24", valW: "w-28", subW: "w-36" },
        ].map((card, i) => (
          <Card key={i} className="border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-5 pb-2">
              <Skeleton className={cn("h-3.5", card.titleW)} />
              <Skeleton className="h-7 w-7 rounded-md" />
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0 space-y-2">
              <Skeleton className={cn("h-7", card.valW)} />
              <Skeleton className={cn("h-3", card.subW)} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transactions Table Card */}
      <Card className="border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-72" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/80 text-left">
                  <th className="py-3 px-4"><Skeleton className="h-3.5 w-16" /></th>
                  <th className="py-3 px-4"><Skeleton className="h-3.5 w-24" /></th>
                  <th className="py-3 px-4"><Skeleton className="h-3.5 w-20" /></th>
                  <th className="py-3 px-4"><Skeleton className="h-3.5 w-24" /></th>
                  <th className="py-3 px-4"><Skeleton className="h-3.5 w-20" /></th>
                  <th className="py-3 px-4 text-right"><Skeleton className="h-3.5 w-16 ml-auto" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-3.5 px-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-36 font-mono" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-3.5 w-28" /></td>
                    <td className="py-3.5 px-4 text-right"><Skeleton className="h-5 w-20 ml-auto rounded-full" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * SettingsPageSkeleton matches /settings and settings categories:
 * - Header with title and description
 * - 4 large settings category cards matching /settings
 */
export function SettingsPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6", className)}>
      {/* Header Skeleton */}
      <div className="space-y-1.5">
        <Skeleton className="h-8 sm:h-9 w-32" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      {/* Settings Action Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { titleW: "w-32", subW: "w-64" },
          { titleW: "w-24", subW: "w-60" },
          { titleW: "w-28", subW: "w-56" },
          { titleW: "w-36", subW: "w-64" },
        ].map((item, i) => (
          <Card key={i} className="border p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className={cn("h-5", item.titleW)} />
            </div>
            <Skeleton className={cn("h-4", item.subW)} />
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * ReportsPageSkeleton matches analytics and reports pages (/reports/*)
 */
export function ReportsPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6", className)}>
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-8 sm:h-9 w-44" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      {/* 4 KPI Metrics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-5 pb-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-7 w-7 rounded-md" />
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0 space-y-2">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Chart Skeleton */}
      <Card className="border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-64" />
          </div>
          <Skeleton className="h-5 w-24 rounded-full" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-72 w-full flex flex-col justify-between p-4 border border-dashed border-border/70 rounded-lg bg-muted/10">
            <div className="space-y-10 w-full opacity-40">
              <div className="border-b border-border/50 w-full" />
              <div className="border-b border-border/50 w-full" />
              <div className="border-b border-border/50 w-full" />
            </div>
            <div className="flex items-end justify-between gap-3 h-44 px-4">
              {[40, 65, 30, 85, 55, 90, 70, 45, 80, 60].map((h, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <Skeleton className="w-full max-w-[28px] rounded-t-sm bg-secondary/25" style={{ height: `${h}%` }} />
                  <Skeleton className="h-2.5 w-6" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * ProfileSkeleton for user profile and security credentials
 */
export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6", className)}>
      <div className="flex items-end gap-6">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="space-y-2 pb-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      
      <div className="space-y-4 pt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="flex justify-end pt-4">
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>
    </div>
  );
}

/**
 * TableSkeletonRows: Reusable skeleton rows for any <TableBody> during client-side loading
 */
export function TableSkeletonRows({
  columns = 6,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <TableRow key={rIdx} className="hover:bg-transparent">
          <TableCell className="py-3 px-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-lg shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32 sm:w-40" />
                <Skeleton className="h-3 w-40 sm:w-48" />
              </div>
            </div>
          </TableCell>
          {Array.from({ length: Math.max(0, columns - 2) }).map((_, cIdx) => (
            <TableCell key={cIdx} className="py-3 px-4">
              {cIdx % 2 === 0 ? (
                <Skeleton className="h-4 w-20 sm:w-28" />
              ) : (
                <Skeleton className="h-5 w-16 sm:w-20 rounded-full" />
              )}
            </TableCell>
          ))}
          <TableCell className="py-3 px-4 text-right">
            <Skeleton className="h-8 w-16 ml-auto rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
