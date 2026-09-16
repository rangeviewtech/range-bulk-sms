'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PinInput } from '@/components/forms/pin-input';
import { TurnstileWidget } from '@/components/forms/turnstile-widget';
import { verifyUnifiedVerification, resendUnifiedVerification } from '@/app/(auth)/actions';
import { CommunicationChannel } from '@/generated/prisma';
import { toast } from 'sonner';
import { ShieldCheck, Smartphone, MessageSquare, Send, Mail } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export type VerificationMethod = 'APP' | 'SMS' | 'WHATSAPP' | 'TELEGRAM' | 'EMAIL';

interface UnifiedVerificationProps {
  userId?: string;
  defaultChannel?: string;
  defaultMethod?: VerificationMethod;
  allowedMethods?: VerificationMethod[];
}

export function UnifiedVerification({ userId, defaultChannel, defaultMethod, allowedMethods }: UnifiedVerificationProps) {
  const { dict } = useLanguage();
  const initialMethod: VerificationMethod = defaultMethod 
    ? defaultMethod 
    : defaultChannel === 'WHATSAPP' 
    ? 'WHATSAPP' 
    : defaultChannel === 'TELEGRAM' 
    ? 'TELEGRAM' 
    : defaultChannel === 'SMS' 
    ? 'SMS' 
    : defaultChannel === 'EMAIL' 
    ? 'EMAIL' 
    : 'APP';

  const [method, setMethod] = useState<VerificationMethod>(initialMethod);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(method === 'APP' ? 0 : 60);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileExpired, setTurnstileExpired] = useState(false);

  const METHODS: { id: VerificationMethod; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'APP', label: dict.auth.tabAuthApp || 'Auth App', icon: ShieldCheck },
    { id: 'SMS', label: dict.auth.tabSms || 'SMS', icon: Smartphone },
    { id: 'WHATSAPP', label: dict.auth.tabWhatsApp || 'WhatsApp', icon: MessageSquare },
    { id: 'TELEGRAM', label: dict.auth.tabTelegram || 'Telegram', icon: Send },
    { id: 'EMAIL', label: dict.auth.tabEmail || 'Email', icon: Mail },
  ];

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleMethodChange = async (newMethod: VerificationMethod) => {
    setMethod(newMethod);
    setCode('');
    setError('');

    if (newMethod !== 'APP' && newMethod !== method) {
      await handleResend(newMethod);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError(dict.validation.pinLength || 'Please enter the complete 6-digit code.');
      return;
    }

    if (turnstileExpired) {
      toast.error(dict.validation.securityCheckExpired || 'Security check has expired. Please verify again.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('code', code);
    formData.append('method', method);
    if (userId) formData.append('userId', userId);
    if (turnstileToken) formData.append('turnstileToken', turnstileToken);

    try {
      const res = await verifyUnifiedVerification(formData);
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
        setLoading(false);
      }
    } catch {
      setError(dict.common.error || 'Verification failed. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async (targetMethod: VerificationMethod = method) => {
    if (targetMethod === 'APP' || resending) return;
    setResending(true);
    setError('');

    try {
      const channel = targetMethod as CommunicationChannel;
      const res = await resendUnifiedVerification(userId, channel);
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        const label = METHODS.find((m) => m.id === targetMethod)?.label || targetMethod;
        toast.success(`A new verification code has been sent via ${label}.`);
        setCountdown(60);
      }
    } catch {
      toast.error('Could not resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-fade-in" style={{ width: '100%', float: 'left' }}>
      {/* Title & Description */}
      <div className="auth-stagger-1">
        <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--foreground))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
          {dict.auth.twoStepTitle}
        </h3>
        <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
          {method === 'APP'
            ? dict.auth.instructAuthApp
            : method === 'SMS'
            ? dict.auth.instructSms
            : method === 'WHATSAPP'
            ? dict.auth.instructWhatsApp
            : method === 'TELEGRAM'
            ? dict.auth.instructTelegram
            : dict.auth.instructEmail}
        </p>
      </div>

      {/* Verification Method Pills / Tabs */}
      <div className="auth-stagger-2" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontFamily: FONT_STACK }}>
          {dict.auth.twoStepSubtitle}
        </div>
        <div
          style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: 'hsl(var(--muted))',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid hsl(var(--border))',
            direction: 'ltr',
          }}
        >
          {METHODS.filter(item => !allowedMethods || allowedMethods.includes(item.id)).map((m) => {
            const Icon = m.icon;
            const isActive = method === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleMethodChange(m.id)}
                disabled={loading || resending}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '6px 4px',
                  fontSize: '11px',
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? 'hsl(var(--card))' : 'transparent',
                  color: isActive ? '#29A4FF' : 'hsl(var(--muted-foreground))',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  fontFamily: FONT_STACK,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'hsl(var(--foreground))';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
                }}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Verification Form */}
      <form onSubmit={handleVerify} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* 6-Digit PIN Box */}
        <div className="auth-stagger-2" style={{ padding: '8px 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <PinInput
            value={code}
            onChange={(val) => {
              setCode(val);
              if (error) setError('');
            }}
          />
        </div>

        {error && (
          <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px', textAlign: 'center', fontFamily: FONT_STACK }}>
            {error}
          </p>
        )}

        {/* Cloudflare Turnstile — Bot Protection */}
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

        {/* Submit Button */}
        <div className="login-con auth-stagger-4" style={{ width: '100%', marginTop: '10px' }}>
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="btn btn-primary btn-main auth-btn-primary"
            style={{
              width: '100%',
              height: '38px',
              padding: '6px 28px',
              fontSize: '13.5px',
              lineHeight: '19.5px',
              backgroundColor: '#29A4FF',
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: '7px',
              border: '0',
              cursor: loading || code.length !== 6 ? 'not-allowed' : 'pointer',
              textAlign: 'center',
              boxSizing: 'border-box',
              fontFamily: FONT_STACK,
              opacity: loading || code.length !== 6 ? 0.7 : 1,
            }}
          >
            {loading ? dict.auth.verifying : dict.auth.verifyAndContinueButton}
          </button>
        </div>

        {/* Resend Section (for OTP channels) */}
        {method !== 'APP' && (
          <div className="auth-stagger-4" style={{ width: '100%', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', fontFamily: FONT_STACK }}>
              {dict.auth.didntReceiveCode}
            </span>
            {countdown > 0 ? (
              <span style={{ fontSize: '12px', color: 'hsl(var(--destructive))', fontWeight: 600, fontFamily: FONT_STACK }}>
                {dict.auth.resendIn} {countdown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleResend(method)}
                disabled={resending || loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#29A4FF',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: FONT_STACK,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {resending ? dict.auth.resending : dict.auth.resendCode}
              </button>
            )}
          </div>
        )}

        {/* Back to Sign In Link */}
        <div className="text-center auth-stagger-5" style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center' }}>
          <Link
            href="/login"
            style={{ color: '#29A4FF', fontSize: '12px', textDecoration: 'none', fontWeight: 600, fontFamily: FONT_STACK, transition: 'opacity 0.2s' }}
            className="hover:opacity-80"
          >
            {dict.auth.signInLink}
          </Link>
        </div>
      </form>
    </div>
  );
}
