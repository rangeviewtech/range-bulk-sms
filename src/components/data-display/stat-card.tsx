import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  change?: {
    value: number;
    trend: "up" | "down" | "neutral";
  };
}

export function StatCard({
  title,
  value,
  icon,
  description,
  change,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card className={cn("transition-all duration-200 hover:border-secondary/40 hover:shadow-xs", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary dark:bg-secondary/25 dark:text-secondary-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {(description || change) && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {change && (
              <span
                className={cn(
                  "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold mr-2",
                  change.trend === "up" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  change.trend === "down" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                  change.trend === "neutral" && "bg-muted text-muted-foreground"
                )}
              >
                {change.trend === "up" && <TrendingUp className="mr-1 h-3 w-3" />}
                {change.trend === "down" && <TrendingDown className="mr-1 h-3 w-3" />}
                {Math.abs(change.value)}%
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
