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
          "flex min-h-[80px] w-full rounded-2xl border border-input/50 bg-muted/20 px-4 py-3 text-sm shadow-none transition-colors outline-none placeholder:text-muted-foreground hover:border-ring/60 focus:border-ring focus:outline-none focus:ring-0 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive hover:border-destructive focus:border-destructive focus-visible:border-destructive",
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
