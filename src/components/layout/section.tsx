import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}

export function Section({ title, description, children, className, ...props }: SectionProps) {
  return (
    <section className={cn("space-y-6", className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}
