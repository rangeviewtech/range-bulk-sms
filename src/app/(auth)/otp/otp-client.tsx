'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { requestOtp, verifyLoginOtp } from '@/app/(auth)/actions';
import { PinInput } from '@/components/forms/pin-input';
import { TurnstileWidget } from '@/components/forms/turnstile-widget';
import { toast } from 'sonner';

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

type OtpChannel = 'EMAIL' | 'WHATSAPP' | 'SMS' | 'TELEGRAM';

export default function OtpClient({ userId, defaultChannel }: { userId: string; defaultChannel: string }) {
  const [code, setCode] = useState('');
  const [channel, setChannel] = useState<OtpChannel>((defaultChannel as OtpChannel) || 'EMAIL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileExpired, setTurnstileExpired] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (turnstileExpired) {
      toast.error('Security check has expired. Please verify again.');
      return;
    }
    setLoading(true);
    setError('');
    
    const result = await verifyLoginOtp(userId, channel, code, turnstileToken || undefined);
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleResend = async (newChannel: OtpChannel) => {
    setLoading(true);
    setError('');
    setChannel(newChannel);
    
    const result = await requestOtp(userId, newChannel);
    if (result?.error) {
      setError(result.error);
    } else {
      const channelLabel = newChannel === 'WHATSAPP' ? 'WhatsApp' : newChannel === 'SMS' ? 'SMS' : 'Telegram';
      toast.success(`A new verification code has been sent via ${channelLabel}.`);
      setCountdown(60);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleVerify} style={{ width: '100%', float: 'left' }}>
      <div className="form-group" style={{ position: 'relative', marginBottom: '1rem' }}>
        <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
          <PinInput 
            value={code}
            onChange={(val) => setCode(val)}
          />
        </div>
        {error && (
          <p style={{ fontSize: '11px', color: error.includes('sent') ? 'hsl(var(--success, 142 71% 45%))' : 'hsl(var(--destructive))', marginTop: '4px', textAlign: 'center', fontFamily: FONT_STACK }}>
            {error}
          </p>
        )}
      </div>

      {/* Cloudflare Turnstile — Bot Protection */}
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

      <div className="login-con" style={{ marginTop: '10px', marginBottom: '16px' }}>
        <button
          type="submit"
          disabled={loading || code.length !== 6}
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
            cursor: loading || code.length !== 6 ? 'not-allowed' : 'pointer',
            textAlign: 'center',
            boxSizing: 'border-box',
            fontFamily: FONT_STACK,
            opacity: loading || code.length !== 6 ? 0.7 : 1,
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!loading && code.length === 6) e.currentTarget.style.backgroundColor = '#1a7fd4';
          }}
          onMouseLeave={(e) => {
            if (!loading && code.length === 6) e.currentTarget.style.backgroundColor = '#29A4FF';
          }}
        >
          {loading ? 'Verifying code...' : 'Verify code'}
        </button>
      </div>

      <div style={{ paddingTop: '16px', borderTop: '1px solid hsl(var(--border))', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', fontFamily: FONT_STACK, margin: 0, display: 'flex', justifyContent: 'space-between' }}>
          <span>Didn&apos;t receive the code?</span>
          {countdown > 0 && <span style={{ color: 'hsl(var(--destructive))' }}>Resend in {countdown}s</span>}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['WHATSAPP', 'SMS', 'TELEGRAM'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleResend(c as OtpChannel)}
              disabled={loading || countdown > 0}
              style={{
                flex: 1,
                minWidth: '30%',
                height: '30px',
                padding: '0 8px',
                fontSize: '11px',
                backgroundColor: 'hsl(var(--secondary))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: loading || countdown > 0 ? 'hsl(var(--muted-foreground))' : 'hsl(var(--secondary-foreground))',
                cursor: loading || countdown > 0 ? 'not-allowed' : 'pointer',
                fontFamily: FONT_STACK,
                opacity: loading || countdown > 0 ? 0.7 : 1,
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading && countdown === 0) e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
              }}
              onMouseLeave={(e) => {
                if (!loading && countdown === 0) e.currentTarget.style.backgroundColor = 'hsl(var(--secondary))';
              }}
            >
              {c === 'WHATSAPP' ? 'WhatsApp' : c === 'SMS' ? 'SMS' : 'Telegram'}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center" style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center' }}>
        <Link
          href="/login"
          style={{ color: '#29A4FF', fontSize: '12px', textDecoration: 'none', fontWeight: 600, fontFamily: FONT_STACK }}
        >
          Back to sign in
        </Link>
      </div>
    </form>
  );
}

