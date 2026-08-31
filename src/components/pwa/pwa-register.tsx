'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Download, WifiOff, X } from 'lucide-react';
import { appConfig } from '@/config/app';
import { appAssets } from '@/config/assets';
import { useLanguage } from '@/hooks/use-language';

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWARegister() {
  const { dict, isRtl } = useLanguage();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
          });
      });
    }

    // 2. Capture Deferred Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Monitor Online / Offline Status
    const handleOnline = () => {
      setIsOffline(false);
      toast.success(dict.pwa?.onlineTitle || 'Connection restored', { 
        description: dict.pwa?.onlineSubtitle || 'You are back online.' 
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.error(dict.pwa?.offlineTitle || 'Offline Mode', { 
        description: dict.pwa?.offlineSubtitle || 'App is running offline using cached assets.' 
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dict]);

  const triggerInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      const successMsg = (dict.pwa?.installedSuccess || '{app} installed successfully!').replace('{app}', appConfig.name);
      toast.success(successMsg);
      setInstallPrompt(null);
    }
  };

  const installTitle = (dict.pwa?.installTitle || `Install ${appConfig.name} App`).replace('{app}', appConfig.name);
  const installSubtitle = dict.pwa?.installSubtitle || 'Fast offline access & telematics tracking';
  const installBtnText = dict.pwa?.installButton || 'Install';
  const dismissBtnText = dict.pwa?.dismissButton || 'Dismiss';
  const offlineBannerText = dict.pwa?.offlineBanner || 'You are currently offline. Running in PWA offline mode.';

  return (
    <>
      {/* Offline Status Banner */}
      {isOffline && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-md"
          style={{ fontFamily: FONT_STACK, direction: isRtl ? 'rtl' : 'ltr' }}
        >
          <WifiOff size={14} />
          <span>{offlineBannerText}</span>
        </div>
      )}

      {/* PWA Install Floating Banner / Prompt - Always Floating Bottom Left */}
      {installPrompt && (
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className="fixed bottom-6 left-6 z-50 border border-border shadow-2xl p-4 rounded-lg flex flex-col gap-3.5 max-w-xs transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
          style={{
            fontFamily: FONT_STACK,
            width: '300px',
            backgroundColor: 'hsl(var(--card))',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={appAssets.icon} alt={`${appConfig.name} Icon`} className="w-9 h-9 object-contain theme-logo-light" />
              <img src={appAssets.iconLight} alt={`${appConfig.name} Icon`} className="w-9 h-9 object-contain theme-logo-dark" />
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--foreground))', margin: 0, lineHeight: '18px' }}>
                  {installTitle}
                </h4>
                <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', margin: '2px 0 0 0', lineHeight: '16px' }}>
                  {installSubtitle}
                </p>
              </div>
            </div>
            <button
              onClick={() => setInstallPrompt(null)}
              style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}
              title="Close"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex gap-2" style={{ marginTop: '4px', direction: 'ltr' }}>
            <button
              onClick={triggerInstall}
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
              <Download size={14} />
              <span>{installBtnText}</span>
            </button>
            <button
              onClick={() => setInstallPrompt(null)}
              className="auth-btn-secondary"
              style={{
                height: '36px',
                borderRadius: '7px',
                fontSize: '13px',
                fontWeight: 600,
                padding: '0 14px',
              }}
            >
              {dismissBtnText}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
