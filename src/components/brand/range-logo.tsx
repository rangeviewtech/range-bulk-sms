import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface RangeLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "dark-alt" | "icon" | "monochrome" | "auto";
  showDescriptor?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
  asLink?: boolean;
  href?: string;
  priority?: boolean;
}

const sizeClasses = {
  xs: "h-7 w-auto",
  sm: "h-9 w-auto",
  md: "h-12 w-auto",
  lg: "h-16 w-auto",
  xl: "h-20 w-auto",
  full: "w-full h-auto",
};

const iconSizeClasses = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
  full: "w-full h-full",
};

export function RangeLogo({
  variant = "auto",
  showDescriptor: _showDescriptor = true,
  size = "md",
  asLink = false,
  href = "/dashboard",
  className,
  ...props
}: RangeLogoProps) {
  const isIcon = variant === "icon";
  const effectiveSizeClass = isIcon ? iconSizeClasses[size] : sizeClasses[size];

  const renderContent = () => {
    if (variant === "icon") {
      return (
        <img
          src="/images/brand/range-icon.svg"
          alt="Range Bulk SMS Mark"
          className={cn(effectiveSizeClass, "object-contain shrink-0 select-none")}
        />
      );
    }

    if (variant === "light") {
      return (
        <img
          src="/images/brand/range-logo-light.svg"
          alt="Range Bulk SMS Platform"
          className={cn(effectiveSizeClass, "object-contain select-none")}
        />
      );
    }

    if (variant === "dark") {
      return (
        <img
          src="/images/brand/range-logo-dark.svg"
          alt="Range Bulk SMS Platform"
          className={cn(effectiveSizeClass, "object-contain select-none")}
        />
      );
    }

    if (variant === "dark-alt") {
      return (
        <img
          src="/images/brand/range-logo-dark-alt.svg"
          alt="Range Bulk SMS Platform"
          className={cn(effectiveSizeClass, "object-contain select-none")}
        />
      );
    }

    if (variant === "monochrome") {
      return (
        <img
          src="/images/brand/range-logo-monochrome.svg"
          alt="Range Bulk SMS Platform"
          className={cn(effectiveSizeClass, "object-contain select-none")}
        />
      );
    }

    // Auto variant: Switch between light and dark according to theme
    return (
      <>
        <img
          src="/images/brand/range-logo-light.svg"
          alt="Range Bulk SMS Platform"
          className={cn(effectiveSizeClass, "object-contain select-none dark:hidden")}
        />
        <img
          src="/images/brand/range-logo-dark.svg"
          alt="Range Bulk SMS Platform"
          className={cn(effectiveSizeClass, "object-contain select-none hidden dark:block")}
        />
      </>
    );
  };

  const containerContent = (
    <div
      className={cn("inline-flex items-center justify-center relative", className)}
      {...props}
    >
      {renderContent()}
    </div>
  );

  if (asLink) {
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md transition-opacity hover:opacity-95"
        title="Range Bulk SMS Platform"
      >
        {containerContent}
      </Link>
    );
  }

  return containerContent;
}
