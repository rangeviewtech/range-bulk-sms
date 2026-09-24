"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { notify } from "@/lib/notifications/toast";

function FlashToastListener() {
  const pathname = usePathname();

  useEffect(() => {
    // Check and trigger any flash toast saved before navigation
    notify.consumeFlash();
  }, [pathname]);

  return null;
}

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function ToastProvider({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <>
      <FlashToastListener />
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg font-sans pr-11 !rounded-xl",
            description: "group-[.toast]:text-muted-foreground",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
            closeButton:
              "!left-auto !right-3 !top-3 !transform-none !border-transparent !bg-transparent hover:!bg-black/10 dark:hover:!bg-white/15 text-inherit opacity-70 hover:opacity-100 !rounded-md !w-6 !h-6 transition-all",
          },
        }}
        {...props}
      />
    </>
  );
}
