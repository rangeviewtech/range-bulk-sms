'use client';

import { useState, useEffect } from 'react';
import { Cookie, X, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { dict, isRtl } = useLanguage();

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie_consent');
      if (!consent) {
        const timer = setTimeout(() => setIsVisible(true), 1500);
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

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500 max-w-[92vw] sm:max-w-md"
    >
      <div className="bg-card p-5 sm:p-6 rounded-xl border border-border shadow-2xl relative space-y-4">
        <button 
          onClick={handleReject}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex gap-3.5 items-start">
          <div className="hidden sm:flex mt-0.5">
            <div className="w-9 h-9 bg-[#29A4FF]/10 text-[#29A4FF] rounded-lg flex items-center justify-center border border-[#29A4FF]/20">
              <Cookie className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2.5 flex-1 pr-4 sm:pr-0">
            <div>
              <h3 className="font-semibold tracking-tight text-sm sm:text-base text-foreground flex items-center gap-2">
                <Cookie className="w-4 h-4 text-[#29A4FF] sm:hidden" />
                {dict.legal?.cookiesTitle || 'Cookie & Privacy Preferences'}
              </h3>
              <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                {dict.legal?.cookiesSubtitle || 'We use essential cookies and telemetry caching to ensure optimal GPS tracking performance and security.'}
              </p>
            </div>
            
            <div className="flex gap-2 pt-1" style={{ direction: 'ltr' }}>
              <button
                onClick={handleAccept}
                className="btn btn-primary auth-btn-primary flex-1 text-xs font-bold text-white bg-[#29A4FF] rounded-md"
                style={{ height: '34px' }}
              >
                Accept All
              </button>
              <button
                onClick={handleReject}
                className="btn btn-secondary auth-btn-secondary flex-1 text-xs font-semibold rounded-md"
                style={{ height: '34px' }}
              >
                Essential Only
              </button>
            </div>

            <div className="text-[11px] flex items-center justify-between gap-2 pt-1 text-muted-foreground">
              <Link href="/cookies" className="text-[#29A4FF] hover:underline font-medium">
                {dict.legal?.cookiePolicy || 'Cookie Policy'}
              </Link>
              <span>•</span>
              <Link href="/privacy" className="text-[#29A4FF] hover:underline font-medium">
                {dict.legal?.privacyPolicy || 'Privacy Policy'}
              </Link>
              <span>•</span>
              <Link href="/terms" className="text-[#29A4FF] hover:underline font-medium">
                {dict.legal?.termsAndConditions || 'Terms'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

