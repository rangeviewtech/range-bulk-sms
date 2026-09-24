"use client";

import * as React from "react";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { LanguageProvider } from "./language-provider";
import { RippleProvider } from "./ripple-provider";
import { UnsavedChangesProvider } from "./unsaved-changes-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <RippleProvider>
          <UnsavedChangesProvider>
            {children}
            <ToastProvider />
          </UnsavedChangesProvider>
        </RippleProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
