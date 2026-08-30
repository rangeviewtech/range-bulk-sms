'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { unlockScreen, logout } from '../actions';
import { toast } from 'sonner';
import { pinSchema } from '@/lib/validations/auth';
import { PinInput } from '@/components/forms/pin-input';
import { TurnstileWidget } from '@/components/forms/turnstile-widget';
import { AuthLayout } from '@/components/layout/auth-layout';

type PinValues = z.infer<typeof pinSchema>;
const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export default function ScreenLockPage() {
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileExpired, setTurnstileExpired] = useState(false);

  const { handleSubmit, setValue, watch, formState: { errors } } = useForm<PinValues>({
    resolver: zodResolver(pinSchema),
    mode: 'all',
  });

  const pinValue = watch('pin');

  const onSubmit = async (data: PinValues) => {
    if (turnstileExpired) {
      toast.error('Security check has expired. Please verify again.');
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
      toast.error(res.error);
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout>
      <div style={{ width: '100%', float: 'left' }}>
        <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--foreground))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
          Session locked
        </h3>
        <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
          Your session was locked for security. Enter your 6-digit PIN to continue.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ padding: '16px 0 8px 0' }}>
            <PinInput 
              value={pinValue || ''}
              onChange={(val) => setValue('pin', val, { shouldValidate: true })}
            />
          </div>
          {errors.pin && <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px', fontFamily: FONT_STACK }}>{errors.pin.message}</p>}

          {/* Cloudflare Turnstile — Bot Protection */}
          <div style={{ width: '100%', marginTop: '8px' }}>
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
                Security check expired. Please re-verify.
              </p>
            )}
          </div>

          <div className="login-con" style={{ width: '100%', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={loading || (pinValue?.length !== 6)}
              style={{
                width: '100%',
                height: '33px',
                padding: '6px 28px',
                fontSize: '13px',
                lineHeight: '19.5px',
                backgroundColor: '#29A4FF',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '6px',
                border: '0',
                cursor: loading || (pinValue?.length !== 6) ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                boxSizing: 'border-box',
                fontFamily: FONT_STACK,
                opacity: loading || (pinValue?.length !== 6) ? 0.7 : 1,
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading && pinValue?.length === 6) e.currentTarget.style.backgroundColor = '#1a7fd4';
              }}
              onMouseLeave={(e) => {
                if (!loading && pinValue?.length === 6) e.currentTarget.style.backgroundColor = '#29A4FF';
              }}
            >
              {loading ? 'Unlocking...' : 'Unlock session'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid hsl(var(--border))', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', fontFamily: FONT_STACK, marginBottom: '12px' }}>Not your account?</p>
          <form action={logout}>
            <button 
              type="submit"
              style={{
                width: '100%',
                height: '33px',
                padding: '6px 28px',
                fontSize: '13px',
                lineHeight: '19.5px',
                backgroundColor: 'hsl(var(--secondary))',
                color: 'hsl(var(--secondary-foreground))',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid hsl(var(--border))',
                cursor: 'pointer',
                fontFamily: FONT_STACK,
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'hsl(var(--accent))')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'hsl(var(--secondary))')}
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
