import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  heading?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({
  heading,
  title,
  description,
  action,
  children,
  className,
  ...props
}: PageHeaderProps) {
  const displayHeading = heading ?? title;
  return (
    <div
      className={cn("flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between pb-6 border-b border-border/40", className)}
      {...props}
    >
      <div className="flex-1 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">{displayHeading}</h1>
        {description && (
          <p className="text-base text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      {(children || action) && <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">{children ?? action}</div>}
    </div>
  );
}
