'use client';

import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { useRef } from 'react';
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

  // The overlay trick masks the harsh white border rendered by Cloudflare in testing mode.
  // It paints a 2px border matching the page background over the white edge, 
  // and an inner box-shadow of #333 to create the faint grey border the user wants.
  const MaskOverlay = () => {
    if (resolvedTheme !== 'dark') return null;
    return (
      <div 
        style={{ 
          position: 'absolute', 
          top: '-1.5px', left: '-1.5px', right: '-1.5px', bottom: '-1.5px', 
          border: '2px solid hsl(var(--card))', 
          borderRadius: '6px',
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 0 1px #333333'
        }} 
      />
    );
  };

  if (variant === 'inline') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '12px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '300px' }}>
          <Turnstile
            ref={ref}
            siteKey={siteKey}
            onSuccess={(token) => onVerify(token)}
            onError={() => onError?.()}
            onExpire={() => {
              onExpire?.();
              ref.current?.reset();
            }}
            options={{
              theme: (resolvedTheme === 'dark' ? 'dark' : 'light') as any,
              appearance,
              size: 'flexible',
            }}
            style={{ width: '100%' }}
          />
          <MaskOverlay />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full my-3">
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Turnstile
          ref={ref}
          siteKey={siteKey}
          onSuccess={(token) => onVerify(token)}
          onError={() => onError?.()}
          onExpire={() => {
            onExpire?.();
            ref.current?.reset();
          }}
          options={{
            theme: (resolvedTheme === 'dark' ? 'dark' : 'light') as any,
            appearance,
          }}
        />
        <MaskOverlay />
      </div>
    </div>
  );
}
