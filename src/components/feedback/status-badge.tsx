import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        success: "bg-success/15 text-success hover:bg-success/25",
        warning: "bg-warning/15 text-warning-foreground hover:bg-warning/25",
        error: "bg-destructive/15 text-destructive hover:bg-destructive/25",
        info: "bg-info/15 text-info hover:bg-info/25",
        pending: "bg-muted text-muted-foreground hover:bg-muted/80",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  showDot?: boolean;
}

export function StatusBadge({
  className,
  variant,
  showDot = true,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <div className={cn(statusBadgeVariants({ variant }), className)} {...props}>
      {showDot && (
        <span
          className={cn(
            "mr-1.5 h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "error" && "bg-destructive",
            variant === "info" && "bg-info",
            variant === "pending" && "bg-muted-foreground"
          )}
        />
      )}
      {children}
    </div>
  );
}
