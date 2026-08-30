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
    <Card className={className} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || change) && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {change && (
              <span
                className={cn(
                  "flex items-center mr-2 font-medium",
                  change.trend === "up" && "text-success",
                  change.trend === "down" && "text-destructive",
                  change.trend === "neutral" && "text-muted-foreground"
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
