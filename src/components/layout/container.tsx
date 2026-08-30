import * as React from "react";
import { cn } from "@/lib/utils";

const containerVariants = {
  default: "max-w-7xl",
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-screen-xl",
  full: "max-w-full",
};

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof containerVariants;
}

export function Container({ className, variant = "default", children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        containerVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
