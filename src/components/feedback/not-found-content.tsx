'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RangeLogo } from '@/components/brand/range-logo';
import { ThemeToggle } from '@/components/navigation/theme-toggle';
import { LanguageToggle } from '@/components/navigation/language-toggle';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import {
  Home,
  ArrowLeft,
  LifeBuoy,
  Send,
  CalendarClock,
  BarChart3,
  Compass,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

export function NotFoundContent() {
  const router = useRouter();
  const { isRtl } = useLanguage();

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      router.push('/dashboard');
    }
  };

  const quickLinks = [
    {
      title: 'Send Broadcast',
      description: 'Compose single or high-throughput bulk SMS campaigns',
      href: '/sms/send',
      icon: Send,
      badge: 'Messaging',
    },
    {
      title: 'Scheduled SMS',
      description: 'Review queued dispatches and recurring campaigns',
      href: '/sms/scheduled',
      icon: CalendarClock,
      badge: 'Automation',
    },
    {
      title: 'Delivery Reports',
      description: 'Real-time delivery receipts, status codes & analytics',
      href: '/reports',
      icon: BarChart3,
      badge: 'Insights',
    },
    {
      title: 'Help & Support',
      description: 'Open a support ticket or consult technical guides',
      href: '/support',
      icon: LifeBuoy,
      badge: 'Assistance',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl opacity-70"
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
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted/60 border border-border/60 text-[11px] text-muted-foreground font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>SMS Gateway Operational</span>
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
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16 max-w-5xl mx-auto w-full text-center relative z-10">
        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-6 shadow-sm">
          <Compass className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '10s' }} />
          <span>HTTP 404 • ROUTE NOT FOUND</span>
        </div>

        {/* 404 Hero Illustration & Card */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Subtle watermark 404 */}
          <span
            className="text-[100px] sm:text-[140px] md:text-[160px] font-black tracking-tighter text-muted/30 dark:text-slate-800/40 select-none leading-none absolute -top-8 sm:-top-12 z-0"
            aria-hidden="true"
          >
            404
          </span>

          {/* Foreground glowing icon card */}
          <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-card border border-border/80 shadow-2xl flex items-center justify-center p-5 ring-4 ring-primary/10">
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary/15 via-[#04648C]/15 to-transparent flex items-center justify-center">
              <Compass className="w-12 h-12 text-[#04648C] dark:text-[#FBCA07]" strokeWidth={1.75} />
            </div>
          </div>
        </div>

        {/* Primary Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground max-w-xl">
          Page Not Found
        </h1>

        {/* Short, clear, user-friendly explanation */}
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
          The requested address could not be located. The link may be out of date, mistyped,
          or the page might have been retired.
        </p>

        {/* Primary Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 w-full max-w-md">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-[#FBCA07] hover:bg-[#FBCA07]/90 text-slate-900 font-bold px-6 h-11 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Link href="/dashboard" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              <span>Go Back Home</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-border/80 hover:bg-muted font-semibold px-5 h-11 rounded-xl"
          >
            <Link href="/support" className="flex items-center justify-center gap-2">
              <LifeBuoy className="w-4 h-4 text-[#04648C] dark:text-[#FBCA07]" />
              <span>Contact Support</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="text-xs text-muted-foreground hover:text-foreground font-medium px-3 mt-1 sm:mt-0 flex items-center gap-1.5"
          >
            <ArrowLeft className={cn("w-3.5 h-3.5", isRtl && "rotate-180")} />
            <span>Return to Previous Page</span>
          </Button>
        </div>

        {/* Quick Navigation Section */}
        <div className="w-full max-w-3xl mt-12 pt-10 border-t border-border/60">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Helpful Platform Destinations
            </h2>
            <span className="text-xs text-muted-foreground hidden sm:inline-block">
              Quick shortcuts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative flex items-start gap-3.5 p-4 rounded-xl border border-border/70 bg-card hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/15 text-[#04648C] dark:text-[#FBCA07] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {link.title}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground">
                        {link.badge}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 px-4 sm:px-6 bg-muted/20 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>All gateway clusters operating with nominal latency.</span>
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
