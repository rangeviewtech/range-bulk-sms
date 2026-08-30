import * as React from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function FormSection({ title, description, children, className, ...props }: FormSectionProps) {
  return (
    <div className={cn("space-y-6", className)} {...props}>
      <div>
        <h3 className="text-lg font-medium leading-6">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
