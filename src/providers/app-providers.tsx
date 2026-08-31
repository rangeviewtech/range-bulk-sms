"use client";

import * as React from "react";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { LanguageProvider } from "./language-provider";
import { RippleProvider } from "./ripple-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <RippleProvider>
          {children}
          <ToastProvider />
        </RippleProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
