'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/navigation/theme-toggle';
import {
  Search,
  Key,
  Menu,
  X,
  BookOpen,
  Zap,
  Code2,
  Radio,
  GitBranch,
  ExternalLink,
} from 'lucide-react';
import { PORTAL_COLORS } from './portal-tokens';

interface DocsHeaderProps {
  environment: 'sandbox' | 'production';
  onEnvironmentChange: (env: 'sandbox' | 'production') => void;
  onOpenSearch: () => void;
  onSelectTab?: (tab: string) => void;
  activeTab?: string;
}

export function DocsHeader({
  environment,
  onEnvironmentChange,
  onOpenSearch,
  onSelectTab,
  activeTab = 'reference',
}: DocsHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { id: 'portal', label: 'Dev Portal', href: '/dashboard', icon: ExternalLink },
    { id: 'reference', label: 'API Reference', icon: BookOpen },
    { id: 'quickstart', label: 'Quick Start', icon: Zap },
    { id: 'snippets', label: 'SDKs & Code', icon: Code2 },
    { id: 'webhooks', label: 'Webhooks & DLR', icon: Radio },
    { id: 'changelog', label: 'Changelog', icon: GitBranch },
  ];

  return (
    <header
      className="sticky top-0 z-40 w-full border-b transition-colors"
      style={{
        backgroundColor: PORTAL_COLORS.headerBg,
        borderColor: PORTAL_COLORS.border,
      }}
    >
      {/* Main Navbar Bar */}
      <div className="max-w-[1600px] mx-auto px-2 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left Section: Brand Logo */}
        <div className="flex items-center gap-3 2xl:gap-8 shrink-0">
          <Link
            href="/api/docs"
            className="flex items-center gap-2 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#35B6FF] rounded-lg"
          >
            <div className="relative h-7 sm:h-9 w-24 sm:w-40 flex items-center shrink-0">
              <Image
                src="/images/brand/range-logo-light.svg"
                alt="Range Bulk SMS Platform"
                width={160}
                height={40}
                priority
                className="dark:hidden object-contain"
              />
              <Image
                src="/images/brand/range-logo-dark.svg"
                alt="Range Bulk SMS Platform"
                width={160}
                height={40}
                priority
                className="hidden dark:block object-contain"
              />
            </div>
          </Link>

          {/* Center Nav Links (Desktop 2xl+ only, hidden on iPads, tablets, and sub-2xl screens to prevent collisions) */}
          <nav className="hidden 2xl:flex items-center gap-1 h-16 shrink-0" aria-label="Developer Navigation">
            {navItems.map((item) => {
              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="px-3.5 h-16 flex items-center text-xs font-semibold transition-colors hover:opacity-90 shrink-0 whitespace-nowrap"
                    style={{ color: PORTAL_COLORS.secondaryText }}
                  >
                    {item.label}
                  </Link>
                );
              }

              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab?.(item.id)}
                  className="px-3.5 h-16 flex items-center text-xs font-semibold transition-all relative shrink-0 whitespace-nowrap"
                  style={{
                    color: isActive ? PORTAL_COLORS.activeTab : PORTAL_COLORS.secondaryText,
                  }}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: PORTAL_COLORS.activeTab }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Search + Environment + Theme + Get API Key + Mobile Menu */}
        <div className="flex items-center gap-1 sm:gap-2.5 lg:gap-3 shrink-0">
          {/* Desktop Search Trigger Input (lg+) */}
          <button
            onClick={onOpenSearch}
            aria-label="Search API docs (Ctrl+K)"
            className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-xl border transition-all hover:opacity-90 shrink-0"
            style={{
              backgroundColor: PORTAL_COLORS.sidebarBg,
              borderColor: PORTAL_COLORS.border,
              color: PORTAL_COLORS.secondaryText,
            }}
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">Search API docs...</span>
            <kbd
              className="px-1.5 py-0.5 text-[10px] font-mono rounded border shrink-0"
              style={{
                backgroundColor: PORTAL_COLORS.cardBg,
                borderColor: PORTAL_COLORS.border,
                color: PORTAL_COLORS.mutedText,
              }}
            >
              Ctrl K
            </kbd>
          </button>

          {/* Mobile/Tablet Search Icon Button (<lg) */}
          <button
            onClick={onOpenSearch}
            aria-label="Search API docs"
            className="lg:hidden p-1.5 sm:p-2 rounded-xl border flex items-center justify-center shrink-0"
            style={{
              backgroundColor: PORTAL_COLORS.sidebarBg,
              borderColor: PORTAL_COLORS.border,
              color: PORTAL_COLORS.secondaryText,
            }}
          >
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          {/* Environment Switcher: Clean Two-Pill Segmented Switcher (No dropdown, no arrow) */}
          <div className="hidden sm:block shrink-0">
            <div
              className="flex items-center p-0.5 rounded-xl border text-xs font-semibold"
              style={{
                backgroundColor: PORTAL_COLORS.sidebarBg,
                borderColor: PORTAL_COLORS.border,
              }}
            >
              <button
                type="button"
                onClick={() => onEnvironmentChange('sandbox')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-bold shrink-0 ${
                  environment === 'sandbox' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: environment === 'sandbox' ? PORTAL_COLORS.cardBg : 'transparent',
                  color: environment === 'sandbox' ? PORTAL_COLORS.primaryText : PORTAL_COLORS.secondaryText,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: PORTAL_COLORS.successGreen }}
                />
                <span className="whitespace-nowrap">Sandbox</span>
              </button>

              <button
                type="button"
                onClick={() => onEnvironmentChange('production')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-bold shrink-0 ${
                  environment === 'production' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: environment === 'production' ? PORTAL_COLORS.cardBg : 'transparent',
                  color: environment === 'production' ? PORTAL_COLORS.primaryText : PORTAL_COLORS.secondaryText,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: PORTAL_COLORS.dangerRed }}
                />
                <span className="whitespace-nowrap">Production</span>
              </button>
            </div>
          </div>

          {/* Environment Switcher: Mobile Compact Single Pill */}
          <div className="sm:hidden shrink-0">
            <button
              onClick={() => onEnvironmentChange(environment === 'sandbox' ? 'production' : 'sandbox')}
              aria-label={`Current environment: ${environment}. Tap to switch.`}
              className="px-1.5 py-1 rounded-lg border flex items-center gap-1 text-[10px] font-bold shrink-0"
              style={{
                backgroundColor: PORTAL_COLORS.sidebarBg,
                borderColor: PORTAL_COLORS.border,
                color: PORTAL_COLORS.primaryText,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{
                  backgroundColor: environment === 'sandbox' ? PORTAL_COLORS.successGreen : PORTAL_COLORS.dangerRed,
                }}
              />
              <span className="whitespace-nowrap">{environment === 'sandbox' ? 'Sandbox' : 'Live'}</span>
            </button>
          </div>

          {/* Theme Switcher */}
          <div className="shrink-0">
            <ThemeToggle />
          </div>

          {/* Yellow Primary Action Button: "Get API Key" (Desktop/Tablet) */}
          <Link
            href="/developer/api-keys"
            className="hidden md:inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:brightness-105 shrink-0 whitespace-nowrap"
            style={{
              backgroundColor: PORTAL_COLORS.primaryYellow,
              color: '#0B1729',
            }}
          >
            <Key className="h-3.5 w-3.5 shrink-0" />
            <span>Get API Key</span>
          </Link>

          {/* Mobile/Tablet Menu Hamburger Button (shown below 2xl) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="2xl:hidden p-1.5 sm:p-2 rounded-xl border flex items-center justify-center shrink-0"
            style={{
              backgroundColor: PORTAL_COLORS.sidebarBg,
              borderColor: PORTAL_COLORS.border,
              color: PORTAL_COLORS.primaryText,
            }}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer (below 2xl) */}
      {isMobileMenuOpen && (
        <div className="2xl:hidden fixed inset-0 top-16 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm ml-auto h-full p-5 space-y-6 overflow-y-auto border-l shadow-2xl"
            style={{
              backgroundColor: PORTAL_COLORS.sidebarBg,
              borderColor: PORTAL_COLORS.border,
            }}
          >
            {/* Quick Actions */}
            <div className="space-y-3">
              <Link
                href="/developer/api-keys"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                style={{
                  backgroundColor: PORTAL_COLORS.primaryYellow,
                  color: '#0B1729',
                }}
              >
                <Key className="h-4 w-4" />
                <span>Get API Key</span>
              </Link>

              {/* Environment Toggle in Drawer */}
              <div
                className="p-3 rounded-xl border space-y-2"
                style={{
                  backgroundColor: PORTAL_COLORS.cardBg,
                  borderColor: PORTAL_COLORS.border,
                }}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: PORTAL_COLORS.secondaryText }}>
                  Active Environment
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onEnvironmentChange('sandbox')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      environment === 'sandbox' ? 'shadow-xs' : 'opacity-60'
                    }`}
                    style={{
                      backgroundColor: environment === 'sandbox' ? PORTAL_COLORS.elevatedBg : 'transparent',
                      borderColor: environment === 'sandbox' ? PORTAL_COLORS.borderLight : 'transparent',
                      color: PORTAL_COLORS.primaryText,
                    }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PORTAL_COLORS.successGreen }} />
                    <span>Sandbox</span>
                  </button>
                  <button
                    onClick={() => onEnvironmentChange('production')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      environment === 'production' ? 'shadow-xs' : 'opacity-60'
                    }`}
                    style={{
                      backgroundColor: environment === 'production' ? PORTAL_COLORS.elevatedBg : 'transparent',
                      borderColor: environment === 'production' ? PORTAL_COLORS.borderLight : 'transparent',
                      color: PORTAL_COLORS.primaryText,
                    }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PORTAL_COLORS.dangerRed }} />
                    <span>Production</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider px-3 mb-2" style={{ color: PORTAL_COLORS.secondaryText }}>
                Navigation
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors hover:opacity-90"
                      style={{ color: PORTAL_COLORS.secondaryText }}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                }

                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab?.(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isActive ? 'shadow-xs' : 'hover:opacity-90'
                    }`}
                    style={{
                      backgroundColor: isActive ? PORTAL_COLORS.elevatedBg : 'transparent',
                      color: isActive ? PORTAL_COLORS.activeTab : PORTAL_COLORS.secondaryText,
                      border: isActive ? `1px solid ${PORTAL_COLORS.borderLight}` : '1px solid transparent',
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
