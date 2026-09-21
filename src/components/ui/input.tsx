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
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground hover:border-foreground/35 focus:outline-none focus:border-[#04648C] focus:ring-2 focus:ring-[#04648C]/25 focus-visible:outline-none focus-visible:border-[#04648C] focus-visible:ring-2 focus-visible:ring-[#04648C]/25 dark:focus:border-[#38bdf8] dark:focus:ring-[#38bdf8]/30 dark:focus-visible:border-[#38bdf8] dark:focus-visible:ring-[#38bdf8]/30 disabled:cursor-not-allowed disabled:opacity-50 cursor-text pointer-events-auto select-text",
          error && "border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/25 focus-visible:border-destructive focus-visible:ring-destructive/25",
          className
        )}
        aria-invalid={error ? "true" : props["aria-invalid"]}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
