import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-input/60 bg-background px-3 py-2 text-sm shadow-sm transition-colors outline-none",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "hover:border-input",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/20 focus-visible:border-brand-blue",
          "dark:focus-visible:ring-brand-yellow/20 dark:focus-visible:border-brand-yellow",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
          error || props["aria-invalid"] === "true" || props["aria-invalid"] === true
            ? "border-destructive hover:border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20 dark:focus-visible:border-destructive dark:focus-visible:ring-destructive/20"
            : "",
          className
        )}
        aria-invalid={error || props["aria-invalid"]}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
