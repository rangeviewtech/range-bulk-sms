import * as React from "react"
import { Slot, Slottable } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground font-bold shadow-sm hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input text-[#04648C] dark:text-[#FBCA07] bg-background shadow-xs hover:border-[#04648C]/60 hover:bg-[#04648C]/10 dark:hover:border-[#FBCA07]/60 dark:hover:bg-[#FBCA07]/10",
        secondary:
          "bg-secondary text-secondary-foreground font-semibold shadow-sm hover:bg-secondary/90",
        ghost: "hover:bg-[#04648C]/10 hover:text-[#04648C] dark:hover:bg-[#FBCA07]/10 dark:hover:text-[#FBCA07]",
        link: "text-[#04648C] dark:text-[#FBCA07] underline-offset-4 hover:underline font-semibold",
        brand:
          "bg-[#FBCA07] text-[#141B2D] font-bold shadow-sm hover:bg-[#FBCA07]/90",
        "brand-blue":
          "bg-[#04648C] text-white font-semibold shadow-sm hover:bg-[#04648C]/90",
        success:
          "bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white dark:text-white dark:hover:text-white font-medium border border-emerald-600 hover:border-emerald-700 dark:border-emerald-600 shadow-sm active:bg-emerald-800 transition-all duration-150",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {asChild ? <Slottable>{children}</Slottable> : children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
