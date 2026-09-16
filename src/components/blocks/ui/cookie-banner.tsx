'use client';

import { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { dict, isRtl } = useLanguage();

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie_consent');
      if (!consent) {
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('cookie_consent', 'accepted');
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  const handleReject = () => {
    try {
      localStorage.setItem('cookie_consent', 'rejected');
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const bannerTitle = dict.legal?.cookieBannerTitle || 'Cookie Preferences';
  const bannerSubtitle = dict.legal?.cookieBannerSubtitle || 'Essential cookies & telemetry caching';
  const acceptBtnText = dict.legal?.cookieAcceptButton || 'Accept All';
  const declineBtnText = dict.legal?.cookieDeclineButton || 'Decline';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed bottom-6 right-6 z-50 border border-border shadow-2xl p-4 rounded-lg flex flex-col gap-3.5 max-w-xs transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
      style={{
        fontFamily: FONT_STACK,
        width: '300px',
        backgroundColor: 'hsl(var(--card))',
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      }}
    >
      {/* Header Row — matching PWA prompt */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center border border-[#29A4FF]/25"
            style={{ backgroundColor: 'rgba(41, 164, 255, 0.1)', color: '#29A4FF' }}
          >
            <Cookie size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--foreground))', margin: 0, lineHeight: '18px' }}>
              {bannerTitle}
            </h4>
            <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', margin: '2px 0 0 0', lineHeight: '16px' }}>
              {bannerSubtitle}
            </p>
          </div>
        </div>
        <button
          onClick={handleReject}
          style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}
          title="Close"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Buttons Row — matching PWA prompt with locked LTR button ordering */}
      <div className="flex gap-2" style={{ marginTop: '4px', direction: 'ltr' }}>
        <button
          onClick={handleAccept}
          className="auth-btn-primary"
          style={{
            flex: 1,
            height: '36px',
            borderRadius: '7px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Check size={14} />
          <span>{acceptBtnText}</span>
        </button>
        <button
          onClick={handleReject}
          className="auth-btn-secondary"
          style={{
            height: '36px',
            borderRadius: '7px',
            fontSize: '13px',
            fontWeight: 600,
            padding: '0 14px',
          }}
        >
          {declineBtnText}
        </button>
      </div>

      {/* Policy Links Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'hsl(var(--muted-foreground))',
          paddingTop: '4px',
          borderTop: '1px solid hsl(var(--border) / 0.5)',
          marginTop: '2px',
        }}
      >
        <Link href="/cookies" className="text-foreground hover:underline font-semibold">
          {dict.legal?.cookiePolicy || 'Cookie Policy'}
        </Link>
        <span aria-hidden="true" style={{ opacity: 0.4 }}>•</span>
        <Link href="/privacy" className="hover:text-foreground transition-colors">
          {dict.legal?.privacyPolicy || 'Privacy'}
        </Link>
        <span aria-hidden="true" style={{ opacity: 0.4 }}>•</span>
        <Link href="/terms" className="hover:text-foreground transition-colors">
          {dict.legal?.termsAndConditions || 'Terms'}
        </Link>
      </div>
    </div>
  );
}


