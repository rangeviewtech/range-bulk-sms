'use client';

import { useState, useEffect } from 'react';
import { requestOtp, verifyLoginOtp } from '@/app/(auth)/actions';
import { PinInput } from '@/components/forms/pin-input';

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export default function OtpClient({ userId, defaultChannel }: { userId: string; defaultChannel: string }) {
  const [code, setCode] = useState('');
  const [channel, setChannel] = useState(defaultChannel);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await verifyLoginOtp(userId, channel as any, code);
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleResend = async (newChannel: string) => {
    setLoading(true);
    setError('');
    setChannel(newChannel);
    
    const result = await requestOtp(userId, newChannel as any);
    if (result?.error) {
      setError(result.error);
    } else {
      setError('Code resent via ' + newChannel);
      setCountdown(60);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleVerify} style={{ width: '100%', float: 'left' }}>
      <div className="form-group" style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
          <PinInput 
            value={code}
            onChange={(val) => setCode(val)}
          />
        </div>
        {error && (
          <p style={{ fontSize: '11px', color: error.includes('resent') ? 'hsl(var(--success, 142 71% 45%))' : 'hsl(var(--destructive))', marginTop: '4px', textAlign: 'center', fontFamily: FONT_STACK }}>
            {error}
          </p>
        )}
      </div>

      <div className="login-con" style={{ marginTop: '10px', marginBottom: '20px' }}>
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
          }}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </div>

      <div style={{ paddingTop: '16px', borderTop: '1px solid #DEE2E6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', fontFamily: FONT_STACK, margin: 0, display: 'flex', justifyContent: 'space-between' }}>
          <span>Didn't receive the code?</span>
          {countdown > 0 && <span style={{ color: 'hsl(var(--destructive))' }}>Wait {countdown}s</span>}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['WHATSAPP', 'SMS', 'TELEGRAM'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleResend(c)}
              disabled={loading || countdown > 0}
              style={{
                flex: 1,
                minWidth: '30%',
                height: '30px',
                padding: '0 8px',
                fontSize: '11px',
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid #DEE2E6',
                borderRadius: '4px',
                color: loading || countdown > 0 ? '#999999' : 'hsl(var(--foreground))',
                cursor: loading || countdown > 0 ? 'not-allowed' : 'pointer',
                fontFamily: FONT_STACK,
                opacity: loading || countdown > 0 ? 0.7 : 1,
              }}
            >
              Try {c === 'WHATSAPP' ? 'WhatsApp' : c === 'SMS' ? 'SMS' : 'Telegram'}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}

