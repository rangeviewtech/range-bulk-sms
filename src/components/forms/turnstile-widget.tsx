'use client';

import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { useRef, useState } from 'react';
import { useTheme } from 'next-themes';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  /** Visual style for the widget placement context */
  variant?: 'default' | 'inline';
  /** Turnstile appearance: 'always' | 'execute' | 'interaction-only' */
  appearance?: 'always' | 'execute' | 'interaction-only';
}

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  variant = 'default',
  appearance = 'always',
}: TurnstileWidgetProps) {
  const ref = useRef<TurnstileInstance>(null);
  const { resolvedTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 10px',
            marginTop: '12px',
            marginBottom: '4px',
            background: resolvedTheme === 'dark' ? '#1f1f22' : '#f8f8f8',
            border: resolvedTheme === 'dark' ? '1px dashed #333' : '1px dashed #DEE2E6',
            borderRadius: '4px',
            fontSize: '11px',
            color: resolvedTheme === 'dark' ? '#aaa' : '#999',
            gap: '6px',
            fontFamily: FONT_STACK,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 28 32" fill="none">
            <path d="M14 0L0 6v12c0 8.284 5.716 14 14 16 8.284-2 14-7.716 14-16V6L14 0z" fill="#F38020" />
          </svg>
          <span>Turnstile bypassed (dev — add NEXT_PUBLIC_TURNSTILE_SITE_KEY)</span>
        </div>
      );
    }
    return null;
  }


  if (variant === 'inline') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '12px', marginBottom: '16px' }}>
        <div style={{ 
          display: 'inline-block',
          overflow: 'hidden',
          borderRadius: isLoaded ? '6px' : '0',
          border: isLoaded ? '1px solid hsl(var(--border))' : 'none',
          width: 'fit-content',
          background: 'transparent'
        }}>
          <div style={{ margin: isLoaded ? '-1px' : '0', display: 'flex', width: isLoaded ? 'calc(100% + 2px)' : '100%' }}>
            <Turnstile
              ref={ref}
              siteKey={siteKey}
              onSuccess={(token) => { setIsLoaded(true); onVerify(token); }}
              onError={() => { setIsLoaded(true); onError?.(); }}
              onExpire={() => {
                onExpire?.();
                ref.current?.reset();
              }}
              onBeforeInteractive={() => setIsLoaded(true)}
              onAfterInteractive={() => setIsLoaded(true)}
              options={{
                theme: resolvedTheme === 'dark' ? 'dark' : 'light',
                appearance,
                size: 'normal',
              }}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full my-3">
      <div style={{ 
        display: 'inline-block',
        overflow: 'hidden',
        borderRadius: isLoaded ? '6px' : '0',
        border: isLoaded ? '1px solid hsl(var(--border))' : 'none',
        width: 'fit-content',
        background: 'transparent'
      }}>
        <div style={{ margin: isLoaded ? '-1px' : '0', display: 'flex', width: isLoaded ? 'calc(100% + 2px)' : '100%' }}>
          <Turnstile
            ref={ref}
            siteKey={siteKey}
            onSuccess={(token) => { setIsLoaded(true); onVerify(token); }}
            onError={() => { setIsLoaded(true); onError?.(); }}
            onExpire={() => {
              onExpire?.();
              ref.current?.reset();
            }}
            onBeforeInteractive={() => setIsLoaded(true)}
            onAfterInteractive={() => setIsLoaded(true)}
            options={{
              theme: resolvedTheme === 'dark' ? 'dark' : 'light',
              appearance,
              size: 'normal',
            }}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
