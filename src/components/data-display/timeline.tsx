import * as React from "react";
import { cn } from "@/lib/utils";

interface TimelineItemProps {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  statusNode?: React.ReactNode;
}

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TimelineItemProps[];
}

export function Timeline({ items, className, ...props }: TimelineProps) {
  return (
    <div className={cn("relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent", className)} {...props}>
      {items.map((item) => (
        <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          {/* Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
            {item.icon ? (
              item.icon
            ) : (
              <div className="w-3 h-3 bg-primary rounded-full" />
            )}
          </div>
          
          {/* Content */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-foreground">{item.title}</h4>
              <time className="text-xs text-muted-foreground">{item.timestamp}</time>
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
            {item.statusNode && (
              <div className="mt-3">
                {item.statusNode}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
