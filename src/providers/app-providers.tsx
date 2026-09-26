"use client";

import * as React from "react";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { LanguageProvider } from "./language-provider";
import { RippleProvider } from "./ripple-provider";
import { UnsavedChangesProvider } from "./unsaved-changes-provider";
import { PageTitleSync } from "@/components/navigation/page-title-sync";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <RippleProvider>
          <UnsavedChangesProvider>
            <PageTitleSync />
            {children}
            <ToastProvider />
          </UnsavedChangesProvider>
        </RippleProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
