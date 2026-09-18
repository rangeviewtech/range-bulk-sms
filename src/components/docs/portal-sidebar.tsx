'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Home,
  Wallet,
  Users,
  Tag,
  Share2,
  BarChart3,
  Lock,
  AlertTriangle,
  Gauge,
  BookOpen,
  Headphones,
  ExternalLink,
  X,
} from 'lucide-react';
import { PORTAL_COLORS } from './portal-tokens';
import { GuideTopic } from './portal-guides-modal';

interface PortalSidebarProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
  onOpenGuide: (topic: GuideTopic) => void;
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
}

export function PortalSidebar({
  activeSection,
  onSelectSection,
  onOpenGuide,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer,
}: PortalSidebarProps) {
  const apiItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'WalletBalance', label: 'WalletBalance', icon: Wallet },
    { id: 'Contact', label: 'Contact', icon: Users },
    { id: 'SenderId', label: 'SenderId', icon: Tag },
    { id: 'WebhookSimulateRequest', label: 'WebhookSimulateRequest', icon: Share2 },
    { id: 'WebhookDeliveryEvent', label: 'WebhookDeliveryEvent', icon: BarChart3 },
  ];

  const guideItems: { id: GuideTopic; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'authentication', label: 'Authentication', icon: Lock },
    { id: 'errors', label: 'Error Codes', icon: AlertTriangle },
    { id: 'rate-limits', label: 'Rate Limits', icon: Gauge },
    { id: 'best-practices', label: 'Best Practices', icon: BookOpen },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full min-h-[calc(100vh-65px)] p-4">
      <div className="space-y-6">
        {/* Mobile close header */}
        {onCloseMobileDrawer && (
          <div className="lg:hidden flex items-center justify-between pb-3 border-b" style={{ borderColor: PORTAL_COLORS.border }}>
            <span className="font-bold text-sm" style={{ color: PORTAL_COLORS.primaryText }}>
              API Reference & Guides
            </span>
            <button
              onClick={onCloseMobileDrawer}
              aria-label="Close sidebar"
              className="p-1.5 rounded-lg border"
              style={{
                backgroundColor: PORTAL_COLORS.cardBg,
                borderColor: PORTAL_COLORS.border,
                color: PORTAL_COLORS.secondaryText,
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* API REFERENCE section */}
        <div>
          <h2
            className="text-[11px] font-bold uppercase tracking-wider px-3 mb-2"
            style={{ color: PORTAL_COLORS.secondaryText }}
          >
            API Reference
          </h2>
          <nav className="space-y-1" aria-label="API Reference Sections">
            {apiItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSection(item.id);
                    onCloseMobileDrawer?.();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    isActive ? 'shadow-xs font-semibold' : 'hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: isActive ? PORTAL_COLORS.elevatedBg : 'transparent',
                    color: isActive ? PORTAL_COLORS.primaryText : PORTAL_COLORS.secondaryText,
                    border: isActive ? `1px solid ${PORTAL_COLORS.borderLight}` : '1px solid transparent',
                  }}
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: isActive ? PORTAL_COLORS.accentBlue : PORTAL_COLORS.secondaryText }}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* GUIDES section */}
        <div>
          <h2
            className="text-[11px] font-bold uppercase tracking-wider px-3 mb-2"
            style={{ color: PORTAL_COLORS.secondaryText }}
          >
            Guides
          </h2>
          <nav className="space-y-1" aria-label="Developer Guides">
            {guideItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onOpenGuide(item.id);
                    onCloseMobileDrawer?.();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left hover:opacity-90"
                  style={{
                    color: PORTAL_COLORS.secondaryText,
                    backgroundColor: 'transparent',
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Help Card */}
      <div
        className="mt-6 p-4 rounded-2xl border text-left transition-all"
        style={{
          backgroundColor: PORTAL_COLORS.cardBg,
          borderColor: PORTAL_COLORS.border,
        }}
      >
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center mb-3"
          style={{
            backgroundColor: PORTAL_COLORS.elevatedBg,
            color: PORTAL_COLORS.accentBlue,
          }}
        >
          <Headphones className="h-4 w-4" />
        </div>
        <h3 className="font-bold text-xs mb-1" style={{ color: PORTAL_COLORS.primaryText }}>
          Need Help?
        </h3>
        <p className="text-[11px] leading-relaxed mb-3" style={{ color: PORTAL_COLORS.secondaryText }}>
          Get support from our team or check our documentation.
        </p>
        <Link
          href="/support"
          className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg border text-xs font-medium transition-opacity hover:opacity-90"
          style={{
            borderColor: PORTAL_COLORS.borderLight,
            backgroundColor: PORTAL_COLORS.elevatedBg,
            color: PORTAL_COLORS.primaryText,
          }}
        >
          <span>Visit Support</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className="hidden lg:block w-[260px] shrink-0 border-r"
        style={{
          backgroundColor: PORTAL_COLORS.sidebarBg,
          borderColor: PORTAL_COLORS.border,
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile/Tablet Slide-over Drawer */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-150">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={onCloseMobileDrawer}
          />
          {/* Drawer Panel */}
          <div
            className="relative w-full max-w-xs h-full overflow-y-auto border-r shadow-2xl z-10 animate-in slide-in-from-left duration-200"
            style={{
              backgroundColor: PORTAL_COLORS.sidebarBg,
              borderColor: PORTAL_COLORS.border,
            }}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
