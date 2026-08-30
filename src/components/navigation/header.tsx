import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { appConfig } from "@/config/app";
import { navConfig } from "@/config/navigation";

import { Search } from "lucide-react";

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  user?: { name?: string | null; email?: string | null; image?: string | null; } | null;
}

export function Header({ className, user, ...props }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full h-[60px] bg-[#f4f5f9] flex items-center justify-end px-6",
        className
      )}
      {...props}
    >
      <div className="cursor-pointer">
        <Search className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" strokeWidth={1.5} />
      </div>
    </header>
  );
}
