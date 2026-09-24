import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: "default" | "full" | "form" | "prose";
}

export function PageShell({
  children,
  maxWidth = "default",
  className,
  ...props
}: PageShellProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in-50 duration-150",
        maxWidth === "default" && "max-w-[1600px]",
        maxWidth === "form" && "max-w-[720px]",
        maxWidth === "prose" && "max-w-[72ch]",
        maxWidth === "full" && "max-w-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
