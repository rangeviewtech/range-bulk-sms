import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground font-bold shadow-xs hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground font-semibold shadow-xs hover:bg-secondary/90",
        "brand-blue":
          "border-transparent bg-secondary text-secondary-foreground font-semibold shadow-xs hover:bg-secondary/90",
        "brand-yellow":
          "border-transparent bg-primary text-primary-foreground font-bold shadow-xs hover:bg-primary/90",
        "light-blue":
          "border border-brand-blue-medium/30 bg-brand-blue-light/20 text-brand-blue dark:border-brand-blue-medium/40 dark:bg-brand-blue-light/15 dark:text-brand-blue-light font-medium",
        "light-yellow":
          "border border-brand-yellow/40 bg-brand-yellow-light/30 text-brand-dark dark:border-brand-yellow/30 dark:bg-brand-yellow-light/15 dark:text-brand-yellow-light font-semibold",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 font-medium",
        error:
          "border border-red-500/30 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-400 font-medium",
        outline: "border border-border bg-background text-foreground font-medium",
        neutral: "border border-border bg-muted/60 text-muted-foreground font-medium",
        success:
          "border-transparent bg-emerald-600 text-white hover:bg-emerald-700 font-medium",
        warning:
          "border border-amber-500/30 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300 font-medium",
        info:
          "border border-brand-blue-medium/30 bg-sky-50 text-brand-blue dark:border-brand-blue-medium/30 dark:bg-sky-950/40 dark:text-brand-blue-light font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
