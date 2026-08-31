"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full transition-transform active:scale-95">
          {mounted && resolvedTheme === "dark" ? (
            <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 p-1.5 rounded-xl border bg-popover text-popover-foreground shadow-xl">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground"
        >
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span className={`font-medium ${theme === 'light' ? 'text-[#29A4FF]' : 'text-foreground'}`}>Light</span>
          </div>
          {theme === "light" && <Check className="h-4 w-4 text-[#29A4FF]" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground"
        >
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span className={`font-medium ${theme === 'dark' ? 'text-[#29A4FF]' : 'text-foreground'}`}>Dark</span>
          </div>
          {theme === "dark" && <Check className="h-4 w-4 text-[#29A4FF]" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground"
        >
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span className={`font-medium ${theme === 'system' ? 'text-[#29A4FF]' : 'text-foreground'}`}>System</span>
          </div>
          {theme === "system" && <Check className="h-4 w-4 text-[#29A4FF]" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
