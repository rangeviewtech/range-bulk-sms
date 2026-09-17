import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
          "border border-[#67A0AF]/30 bg-[#A6CBD8]/20 text-[#04648C] dark:border-[#67A0AF]/40 dark:bg-[#A6CBD8]/15 dark:text-[#A6CBD8] font-medium",
        "light-yellow":
          "border border-[#FBCA07]/40 bg-[#FBE392]/30 text-[#554C3B] dark:border-[#FBCA07]/30 dark:bg-[#FBE392]/15 dark:text-[#FBE392] font-semibold",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 font-medium",
        error:
          "border border-red-500/30 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-400 font-medium",
        outline: "border border-border bg-background text-foreground font-medium",
        neutral: "border border-border bg-muted/60 text-muted-foreground font-medium",
        success:
          "border-transparent bg-green-500 text-white hover:bg-green-600 font-medium",
        warning:
          "border border-amber-500/30 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300 font-medium",
        info:
          "border border-[#67A0AF]/30 bg-sky-50 text-[#04648C] dark:border-[#67A0AF]/30 dark:bg-sky-950/40 dark:text-[#A6CBD8] font-medium",
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
