'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RangeLogo } from '@/components/brand/range-logo';
import { ThemeToggle } from '@/components/navigation/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  LifeBuoy,
  Terminal,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { isDev, formatErrorForEnv } from '@/lib/env';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string; statusCode?: number; code?: string; details?: unknown };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(isDev);
  const formatted = formatErrorForEnv(error);

  useEffect(() => {
    console.error('[Platform Error Boundary Caught]:', error);
  }, [error]);

  const copyDiagnosticLog = () => {
    const log = JSON.stringify(
      {
        title: formatted.title,
        message: formatted.message,
        code: formatted.code,
        statusCode: formatted.statusCode,
        digest: formatted.digest,
        timestamp: formatted.timestamp,
        stack: isDev ? formatted.stack : undefined,
      },
      null,
      2
    );
    navigator.clipboard.writeText(log);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-destructive/20 selection:text-destructive relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-destructive/10 dark:bg-destructive/5 rounded-full blur-3xl opacity-70"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-40 w-[400px] h-[400px] bg-[#04648C]/15 dark:bg-[#04648C]/10 rounded-full blur-3xl opacity-60"
        aria-hidden="true"
      />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RangeLogo asLink href="/dashboard" size="sm" priority />
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] text-red-600 dark:text-red-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span>Error Intercepted</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground hidden sm:inline-flex"
            >
              <Link href="/support" className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-primary" />
                <span>Support Center</span>
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16 max-w-4xl mx-auto w-full text-center relative z-10">
        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 mb-6 shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          <span>HTTP {formatted.statusCode || 500} • RUNTIME ERROR</span>
        </div>

        {/* Hero Icon Card */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-card border border-destructive/30 shadow-2xl flex items-center justify-center p-5 ring-4 ring-destructive/10">
            <div className="w-full h-full rounded-xl bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="w-12 h-12 text-destructive animate-pulse" strokeWidth={1.75} />
            </div>
          </div>
        </div>

        {/* Primary Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground max-w-xl">
          Something Went Wrong
        </h1>

        {/* User-friendly explanation */}
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
          {formatted.message ||
            'An unexpected error interrupted this request. Our engineering telemetry has automatically recorded this occurrence.'}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 w-full max-w-md">
          <Button
            onClick={reset}
            size="lg"
            className="w-full sm:w-auto bg-[#FBCA07] hover:bg-[#FBCA07]/90 text-slate-900 font-bold px-6 h-11 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            <span>Try Again</span>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-border/80 hover:bg-muted font-semibold px-5 h-11 rounded-xl"
          >
            <Link href="/dashboard" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              <span>Go Back Home</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground font-medium px-3 mt-1 sm:mt-0 flex items-center gap-1.5"
          >
            <Link href="/support">
              <LifeBuoy className="w-3.5 h-3.5 text-primary" />
              <span>Contact Support</span>
            </Link>
          </Button>
        </div>

        {/* Collapsible Diagnostic Telemetry Section */}
        <div className="w-full max-w-2xl mt-10 text-left border border-border/70 rounded-xl bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="w-full flex items-center justify-between p-4 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="font-semibold uppercase tracking-wider">
                Technical Diagnostics & Telemetry
              </span>
              {formatted.digest && (
                <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">
                  Ref: {formatted.digest.slice(0, 8)}
                </span>
              )}
            </div>
            {showDiagnostics ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {showDiagnostics && (
            <div className="p-4 pt-0 border-t border-border/40 font-mono text-xs">
              <div className="flex justify-between items-center py-2 mb-2 border-b border-border/40 text-[11px] text-muted-foreground">
                <span>Incident Payload</span>
                <button
                  onClick={copyDiagnosticLog}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-sans font-medium transition-all duration-200 ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-white stroke-[2.5]" />
                      <span>Copied Diagnostics</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Diagnostics</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                <div>
                  <span className="text-muted-foreground">Exception:</span>{' '}
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    {formatted.title}
                  </span>
                </div>
                {formatted.code && (
                  <div>
                    <span className="text-muted-foreground">Code:</span>{' '}
                    <span className="text-amber-600 dark:text-amber-400">{formatted.code}</span>
                  </div>
                )}
                {formatted.digest && (
                  <div>
                    <span className="text-muted-foreground">Digest:</span>{' '}
                    <span className="text-cyan-600 dark:text-cyan-400">{formatted.digest}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Timestamp:</span>{' '}
                  <span>{formatted.timestamp}</span>
                </div>
              </div>

              {isDev && formatted.stack && (
                <div className="mt-3">
                  <div className="text-[10px] text-muted-foreground mb-1">Stack Trace:</div>
                  <pre className="p-3 rounded-lg bg-slate-950 text-slate-300 overflow-x-auto max-h-48 text-[11px] leading-relaxed whitespace-pre-wrap border border-slate-800">
                    {formatted.stack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 px-4 sm:px-6 bg-muted/20 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Infrastructure nodes operational. Incident report generated.</span>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground">
            <Link href="/support" className="hover:text-foreground transition-colors">
              Help Center
            </Link>
            <span>•</span>
            <a
              href="https://www.rangeview.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <span>Range View Tech</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <span>&copy; {new Date().getFullYear()} Range View SMS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
