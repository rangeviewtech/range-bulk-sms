import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
  }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-all duration-200 placeholder:text-muted-foreground hover:border-foreground/35 focus:outline-none focus:border-[#04648C] focus:ring-2 focus:ring-[#04648C]/25 focus-visible:outline-none focus-visible:border-[#04648C] focus-visible:ring-2 focus-visible:ring-[#04648C]/25 dark:focus:border-[#38bdf8] dark:focus:ring-[#38bdf8]/30 dark:focus-visible:border-[#38bdf8] dark:focus-visible:ring-[#38bdf8]/30 disabled:cursor-not-allowed disabled:opacity-50 cursor-text pointer-events-auto select-text",
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
Textarea.displayName = "Textarea"

export { Textarea }
