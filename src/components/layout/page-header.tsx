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
      className={cn("flex flex-col gap-3 sm:gap-4 pb-6 sm:pb-8 md:flex-row md:items-center md:justify-between", className)}
      {...props}
    >
      <div className="flex-1 space-y-1 sm:space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{displayHeading}</h1>
        {description && (
          <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
        )}
      </div>
      {(children || action) && <div className="flex flex-wrap items-center gap-2">{children ?? action}</div>}
    </div>
  );
}
