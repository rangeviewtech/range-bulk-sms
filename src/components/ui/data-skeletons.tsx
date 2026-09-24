import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCardsSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading metrics"
      className={cn("grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", className)}
    >
      <span className="sr-only">Loading metrics...</span>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading table data"
      className={cn("rounded-xl border border-border bg-card p-4 space-y-4", className)}
    >
      <span className="sr-only">Loading table data...</span>
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between gap-4 py-2 border-b border-border/30 last:border-0">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn("h-5", c === 0 ? "w-32" : c === cols - 1 ? "w-16" : "w-24")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 4, className }: { fields?: number; className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading form"
      className={cn("space-y-5 rounded-xl border border-border bg-card p-6", className)}
    >
      <span className="sr-only">Loading form...</span>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end gap-3 pt-4">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}
