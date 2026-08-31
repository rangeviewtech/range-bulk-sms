'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { appConfig } from '@/config/app';
import { appAssets } from '@/config/assets';
import { ThemeToggle } from '@/components/navigation/theme-toggle';
import { LanguageToggle } from '@/components/navigation/language-toggle';
import { useLanguage } from '@/hooks/use-language';
import { ShieldCheck, FileText, Cookie, ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  toc?: { id: string; title: string }[];
}

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  icon,
  children,
  toc = [],
}: LegalLayoutProps) {
  const pathname = usePathname();
  const { dict, isRtl } = useLanguage();

  const legalNav = [
    { href: '/terms', label: dict.legal?.termsAndConditions || 'Terms & Conditions', icon: FileText },
    { href: '/privacy', label: dict.legal?.privacyPolicy || 'Privacy Policy', icon: ShieldCheck },
    { href: '/cookies', label: dict.legal?.cookiePolicy || 'Cookie Policy', icon: Cookie },
  ];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground"
      style={{ fontFamily: FONT_STACK }}
    >
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/login" className="flex items-center gap-2 group">
              <img
                src={appAssets.logo}
                alt={appConfig.name}
                className="h-8 object-contain theme-logo-light group-hover:opacity-90 transition-opacity"
              />
              <img
                src={appAssets.logoLight}
                alt={appConfig.name}
                className="h-8 object-contain theme-logo-dark group-hover:opacity-90 transition-opacity"
              />
            </Link>

            {/* Nav Tabs for Legal Pages */}
            <nav className="hidden md:flex items-center gap-1">
              {legalNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      isActive
                        ? 'shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    style={{
                      backgroundColor: isActive ? '#29A4FF' : 'transparent',
                      color: isActive ? '#ffffff' : undefined,
                    }}
                  >
                    <Icon size={14} style={{ color: isActive ? '#ffffff' : undefined }} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <LanguageToggle />
            <div className="hidden sm:flex items-center gap-2 ml-1">
              <Link
                href="/login"
                className="btn btn-secondary auth-btn-secondary px-3 py-1.5 text-xs font-semibold rounded-md"
                style={{ height: '34px' }}
              >
                {dict.auth?.signInButton || 'Sign In'}
              </Link>
              <Link
                href="/register"
                className="btn btn-primary auth-btn-primary px-3 py-1.5 text-xs font-bold rounded-md bg-[#29A4FF] text-white"
                style={{ height: '34px' }}
              >
                {dict.auth?.createAccountButton || 'Register'}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-border bg-muted/40 py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={13} className={isRtl ? 'rotate-180' : ''} />
              <span>{dict.legal?.backToRegister || 'Back to Registration'}</span>
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs font-medium text-[#29A4FF] bg-[#29A4FF]/10 px-2.5 py-0.5 rounded-full border border-[#29A4FF]/20">
              {lastUpdated}
            </span>
          </div>

          <div className="flex items-start gap-4">
            {icon && (
              <div className="hidden sm:flex p-3 rounded-xl bg-[#29A4FF]/10 text-[#29A4FF] border border-[#29A4FF]/20 mt-1">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Table of Contents (Sticky on Desktop) */}
          {toc.length > 0 && (
            <aside className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <FileText size={14} className="text-[#29A4FF]" />
                  <span>{dict.legal?.tableOfContents || 'Table of Contents'}</span>
                </div>
                <nav className="space-y-1">
                  {toc.map((item, idx) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                    >
                      <span className="font-mono text-[#29A4FF] mr-1.5">{idx + 1}.</span>
                      {item.title}
                    </a>
                  ))}
                </nav>

                <div className="pt-3 border-t border-border">
                  <div className="p-3 rounded-lg bg-muted/60 text-xs text-muted-foreground space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <CheckCircle2 size={13} className="text-green-500" />
                      <span>Legally Binding</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      By registering or accessing {appConfig.name}, you confirm compliance with these terms and policies.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Document Content */}
          <main className={toc.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-8 prose prose-neutral dark:prose-invert max-w-none text-foreground">
              {children}
            </div>

            {/* Quick Actions at bottom */}
            <div className="mt-8 p-5 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="text-xs text-muted-foreground text-center sm:text-left">
                Questions about our policies? Contact our Legal & Data Protection team at{' '}
                <a href="mailto:support@trakzee.com" className="text-[#29A4FF] hover:underline font-semibold">
                  support@trakzee.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/register"
                  className="btn btn-primary auth-btn-primary px-4 py-2 text-xs font-bold rounded-md bg-[#29A4FF] text-white"
                  style={{ height: '36px' }}
                >
                  {dict.legal?.backToRegister || 'Back to Registration'}
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto py-8 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} {appConfig.name} GPS Tracking & Telematics. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              {dict.legal?.termsAndConditions || 'Terms'}
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              {dict.legal?.privacyPolicy || 'Privacy'}
            </Link>
            <span>•</span>
            <Link href="/cookies" className="hover:text-foreground transition-colors">
              {dict.legal?.cookiePolicy || 'Cookies'}
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
              <span>{dict.auth?.signInButton || 'Sign In'}</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
