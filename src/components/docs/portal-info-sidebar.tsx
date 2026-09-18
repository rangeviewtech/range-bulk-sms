'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Rocket,
  Key,
  CheckCircle2,
  Link as LinkIcon,
  Copy,
  Check,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { PORTAL_COLORS } from './portal-tokens';
import { GuideTopic } from './portal-guides-modal';

interface PortalInfoSidebarProps {
  environment: 'sandbox' | 'production';
  onOpenGuide: (topic: GuideTopic) => void;
  layout?: 'rail' | 'inline';
}

export function PortalInfoSidebar({
  environment,
  onOpenGuide,
  layout = 'rail',
}: PortalInfoSidebarProps) {
  const [copiedUrl, setCopiedUrl] = React.useState(false);
  const [statusState, setStatusState] = React.useState<{
    operational: boolean;
    text: string;
  }>({
    operational: true,
    text: 'All Systems Operational',
  });

  const baseUrl =
    environment === 'sandbox'
      ? 'https://api.range.co.ug/api/v1'
      : 'https://api.range.co.ug/api/v1';

  // Live health probe check
  React.useEffect(() => {
    let active = true;
    async function checkHealth() {
      try {
        const res = await fetch('/api/health?type=readiness', { cache: 'no-store' });
        if (!active) return;
        if (res.ok) {
          setStatusState({ operational: true, text: 'All Systems Operational' });
        } else {
          setStatusState({ operational: false, text: 'Partial System Degradation' });
        }
      } catch {
        if (active) {
          setStatusState({ operational: true, text: 'All Systems Operational' });
        }
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const cardA = (
    <div
      className="p-5 rounded-2xl border transition-all space-y-4"
      style={{
        backgroundColor: PORTAL_COLORS.cardBg,
        borderColor: PORTAL_COLORS.border,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: PORTAL_COLORS.elevatedBg,
            color: PORTAL_COLORS.accentBlue,
          }}
        >
          <Rocket className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm" style={{ color: PORTAL_COLORS.primaryText }}>
            Start Building Today
          </h3>
          <p className="text-xs mt-0.5 leading-snug" style={{ color: PORTAL_COLORS.secondaryText }}>
            Get your API key and start integrating in minutes.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <Link
        href="/developer/api-keys"
        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:brightness-105"
        style={{
          backgroundColor: PORTAL_COLORS.primaryYellow,
          color: '#0B1729',
        }}
      >
        <Key className="h-4 w-4" />
        <span>Get API Key</span>
      </Link>

      {/* Checklist */}
      <div className="space-y-2 pt-1">
        {[
          'Instant access',
          'Sandbox environment',
          'Comprehensive docs',
          'Dedicated support',
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 text-xs" style={{ color: PORTAL_COLORS.secondaryText }}>
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: PORTAL_COLORS.successGreen }} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const cardB = (
    <div
      className="p-5 rounded-2xl border transition-all space-y-3"
      style={{
        backgroundColor: PORTAL_COLORS.cardBg,
        borderColor: PORTAL_COLORS.border,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: PORTAL_COLORS.elevatedBg,
            color: PORTAL_COLORS.accentBlue,
          }}
        >
          <LinkIcon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm" style={{ color: PORTAL_COLORS.primaryText }}>
            Base URL
          </h3>
          <p className="text-xs mt-0.5 leading-snug" style={{ color: PORTAL_COLORS.secondaryText }}>
            Use the following base URL in your API requests.
          </p>
        </div>
      </div>

      {/* URL Pill with Copy */}
      <div
        className="flex items-center justify-between px-2.5 py-2 rounded-xl border font-mono text-[10.5px]"
        style={{
          backgroundColor: PORTAL_COLORS.codeBg,
          borderColor: PORTAL_COLORS.border,
          color: PORTAL_COLORS.primaryText,
        }}
      >
        <span className="mr-1 select-all tracking-tight truncate">{baseUrl}</span>
        <button
          onClick={() => handleCopy(baseUrl)}
          aria-label="Copy API Base URL"
          className="p-1 rounded hover:opacity-80 transition-opacity shrink-0"
          style={{ color: PORTAL_COLORS.secondaryText }}
        >
          {copiedUrl ? (
            <Check className="h-3.5 w-3.5" style={{ color: PORTAL_COLORS.successGreen }} />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <button
        onClick={() => onOpenGuide('authentication')}
        className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline transition-all"
        style={{ color: PORTAL_COLORS.accentBlue }}
      >
        <span>View authentication guide</span>
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );

  const cardC = (
    <div
      className="p-5 rounded-2xl border transition-all space-y-3"
      style={{
        backgroundColor: PORTAL_COLORS.cardBg,
        borderColor: PORTAL_COLORS.border,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 relative"
          style={{
            backgroundColor: PORTAL_COLORS.elevatedBg,
            color: statusState.operational ? PORTAL_COLORS.successGreen : PORTAL_COLORS.dangerRed,
          }}
        >
          <Activity className="h-4 w-4" />
          <span
            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full animate-ping"
            style={{
              backgroundColor: statusState.operational ? PORTAL_COLORS.successGreen : PORTAL_COLORS.dangerRed,
            }}
          />
        </div>
        <div>
          <h3 className="font-bold text-sm" style={{ color: PORTAL_COLORS.primaryText }}>
            API Status
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{
                backgroundColor: statusState.operational ? PORTAL_COLORS.successGreen : PORTAL_COLORS.dangerRed,
              }}
            />
            <span className="text-xs font-medium" style={{ color: PORTAL_COLORS.primaryText }}>
              {statusState.text}
            </span>
          </div>
        </div>
      </div>

      <Link
        href="/api/health?type=readiness"
        target="_blank"
        className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline transition-all"
        style={{ color: PORTAL_COLORS.accentBlue }}
      >
        <span>View status page</span>
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );

  if (layout === 'inline') {
    return (
      <section
        aria-label="API Information and Quick Links"
        className="xl:hidden w-full pt-6 border-t mt-6"
        style={{ borderColor: PORTAL_COLORS.border }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cardA}
          {cardB}
          {cardC}
        </div>
      </section>
    );
  }

  return (
    <aside
      className="hidden xl:block w-[300px] shrink-0 border-l p-4 space-y-4"
      style={{
        backgroundColor: PORTAL_COLORS.sidebarBg,
        borderColor: PORTAL_COLORS.border,
      }}
    >
      {cardA}
      {cardB}
      {cardC}
    </aside>
  );
}
