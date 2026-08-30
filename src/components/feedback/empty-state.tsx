import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-muted-foreground mb-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            {icon}
          </div>
        </div>
      )}
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          {description}
        </p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex items-center justify-center gap-4">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
