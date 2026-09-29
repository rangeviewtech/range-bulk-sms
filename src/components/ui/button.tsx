import * as React from "react"
import { Slot, Slottable } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-transparent transition-all duration-150 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground font-semibold shadow-none hover:brightness-95 active:brightness-90",
        primary:
          "bg-primary text-primary-foreground font-semibold shadow-none hover:brightness-95 active:brightness-90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-none hover:bg-destructive/90",
        outline:
          "border border-input/60 text-brand-blue dark:text-brand-yellow bg-background shadow-none hover:border-brand-blue/60 hover:bg-brand-blue/10 dark:hover:border-brand-yellow/60 dark:hover:bg-brand-yellow/10",
        secondary:
          "bg-secondary text-secondary-foreground font-semibold shadow-none hover:brightness-95",
        ghost: "hover:bg-brand-blue/10 hover:text-brand-blue dark:hover:bg-brand-yellow/10 dark:hover:text-brand-yellow",
        link: "text-brand-blue dark:text-brand-yellow underline-offset-4 hover:underline font-semibold",
        brand:
          "bg-brand-yellow text-brand-navy font-semibold shadow-none hover:bg-brand-yellow/90",
        "brand-blue":
          "bg-brand-blue text-white font-semibold shadow-none hover:bg-brand-blue/90",
        success:
          "bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white dark:text-white dark:hover:text-white font-medium border border-emerald-600 hover:border-emerald-700 dark:border-emerald-600 shadow-none active:bg-emerald-800 transition-all duration-150",
      },
      size: {
        default: "h-9 rounded-full px-5 py-2",
        sm: "h-8 rounded-full px-4 text-xs",
        md: "h-10 rounded-full px-5 text-sm",
        lg: "h-11 rounded-full px-8 text-base",
        icon: "h-9 w-9 rounded-full",
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
  loading?: boolean
  loadingLabel?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, loading, loadingLabel, children, disabled, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isBusy = Boolean(loading || isLoading)
    const isDisabled = Boolean(isBusy || disabled)

    const handleClick = (onClick || (isDisabled && !asChild))
      ? (e: React.MouseEvent<HTMLButtonElement>) => {
          if (isDisabled) {
            e.preventDefault()
            e.stopPropagation()
            return
          }
          onClick?.(e)
        }
      : undefined

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          isDisabled && "cursor-not-allowed opacity-50"
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={isBusy || undefined}
        {...(handleClick ? { onClick: handleClick } : {})}
        {...props}
      >
        {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />}
        {isBusy && loadingLabel ? loadingLabel : asChild ? <Slottable>{children}</Slottable> : children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
