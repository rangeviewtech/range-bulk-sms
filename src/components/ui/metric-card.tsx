import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconClassName?: string;
}

export function MetricCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  iconClassName,
  className,
  ...props
}: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all duration-150 hover:shadow-md", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 text-foreground">
            <Icon className={cn("h-4 w-4 text-muted-foreground", iconClassName)} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{value}</div>
        {(trend || description) && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {trend && (
              <span
                className={cn(
                  "font-semibold inline-flex items-center",
                  trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value}
              </span>
            )}
            {trend?.label && <span>{trend.label}</span>}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
