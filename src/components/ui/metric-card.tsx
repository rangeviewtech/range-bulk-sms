import * as React from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { MagicCard } from "@/components/ui/magic-card";

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
    <MagicCard
      className={cn(
        "overflow-hidden transition-all duration-150 hover:bg-muted/40 cursor-default bg-card shadow-sm border border-border/60 rounded-xl",
        className
      )}
      gradientColor={"rgba(120,119,198,0.15)"}
      {...props}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-none">
            <Icon className={cn("h-4 w-4 text-inherit", iconClassName)} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          <AnimatedNumber value={value} />
        </div>
        {(trend || description) && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {trend && (
              <span
                className={cn(
                  "font-bold inline-flex items-center",
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
    </MagicCard>
  );
}
