 
 
'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { unlockScreen, logout } from '../actions';
import { notify, toast } from '@/lib/notifications/toast';
import { toastCatalog } from '@/lib/notifications/toast-catalog';
import { pinSchema } from '@/lib/validations/auth';
import { PinInput } from '@/components/forms/pin-input';
import { TurnstileWidget } from '@/components/forms/turnstile-widget';
import { AuthLayout } from '@/components/layout/auth-layout';
import { useLanguage } from '@/hooks/use-language';

type PinValues = z.infer<typeof pinSchema>;
const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export default function ScreenLockPage() {
  const { dict } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileExpired, setTurnstileExpired] = useState(false);

  const { handleSubmit, setValue, control, formState: { errors } } = useForm<PinValues>({
    resolver: zodResolver(pinSchema),
    mode: 'all',
  });

  const pinValue = useWatch({ control, name: 'pin' });

  const onSubmit = async (data: PinValues) => {
    if (turnstileExpired) {
      notify.error(dict.validation.securityCheckExpired || toastCatalog.security.checkExpired);
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('pin', data.pin);
    if (turnstileToken) {
      formData.append('turnstileToken', turnstileToken);
    }
    
    const res = await unlockScreen(formData);
    
    if (res?.error) {
      notify.error(res.error);
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout>
      <div className="auth-fade-in" style={{ width: '100%', float: 'left' }}>
        <div className="auth-stagger-1">
          <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--foreground))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
            {dict.auth.sessionLockedTitle}
          </h3>
          <p className="auth-subtitle" style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK, width: '100%', textAlign: 'justify', textJustify: 'inter-word' }}>
            {dict.auth.sessionLockedSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="auth-stagger-2" style={{ padding: '16px 0 8px 0' }}>
            <PinInput 
              value={pinValue || ''}
              onChange={(val) => setValue('pin', val, { shouldValidate: true })}
            />
          </div>
          {errors.pin && <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px', fontFamily: FONT_STACK }}>{errors.pin.message}</p>}

          {/* Cloudflare Turnstile â€” Bot Protection */}
          <div className="auth-stagger-3" style={{ width: '100%', marginTop: '8px' }}>
            <TurnstileWidget
              variant="inline"
              onVerify={(token) => {
                setTurnstileToken(token);
                setTurnstileExpired(false);
              }}
              onError={() => {
                setTurnstileToken(null);
                toast.error('Security check failed. Please refresh and try again.');
              }}
              onExpire={() => {
                setTurnstileToken(null);
                setTurnstileExpired(true);
              }}
            />
            {turnstileExpired && (
              <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px', textAlign: 'center', fontFamily: FONT_STACK }}>
                {dict.validation.securityCheckExpired}
              </p>
            )}
          </div>

          <div className="login-con auth-stagger-4" style={{ width: '100%', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={loading || (pinValue?.length !== 6) || (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? !turnstileToken || turnstileExpired : false)}
              className="btn btn-primary btn-main auth-btn-primary"
              style={{
                width: '100%',
                height: '38px',
                padding: '6px 28px',
                fontSize: '13.5px',
                lineHeight: '19.5px',
                backgroundColor: '#FBCA07',
                color: '#141B2D',
                fontWeight: 700,
                borderRadius: '7px',
                border: '0',
                cursor: loading || (pinValue?.length !== 6) || (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? !turnstileToken || turnstileExpired : false) ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                boxSizing: 'border-box',
                fontFamily: FONT_STACK,
                opacity: loading || (pinValue?.length !== 6) || (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? !turnstileToken || turnstileExpired : false) ? 0.7 : 1,
              }}
            >
              {loading ? dict.auth.unlocking : dict.auth.unlockSessionButton}
            </button>
          </div>
        </form>

        <div className="auth-stagger-5" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid hsl(var(--border))', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', fontFamily: FONT_STACK, marginBottom: '12px' }}>{dict.auth.notYourAccountPrompt}</p>
          <form action={logout}>
            <button 
              type="submit"
              className="btn btn-secondary auth-btn-secondary"
              style={{
                width: '100%',
                height: '38px',
                padding: '6px 28px',
                fontSize: '13.5px',
                lineHeight: '19.5px',
                borderRadius: '7px',
                fontFamily: FONT_STACK,
              }}
            >
              {dict.auth.signOutButton}
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
