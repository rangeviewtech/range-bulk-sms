/* eslint-disable @typescript-eslint/no-unused-vars */
 
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPassword } from '../actions';
import { toast } from 'sonner';
import { TurnstileWidget } from '@/components/forms/turnstile-widget';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { AuthLayout } from '@/components/layout/auth-layout';
import { useLanguage } from '@/hooks/use-language';

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export default function ForgotPasswordPage() {
  const { dict } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [turnstileExpired, setTurnstileExpired] = useState(false);

  const { register, handleSubmit, formState: { errors, touchedFields, dirtyFields }, setValue, control } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const turnstileToken = useWatch({ control, name: 'turnstileToken' });

  const onSubmit = async (data: ForgotPasswordValues) => {
    if (turnstileExpired) {
      toast.error(dict.validation.securityCheckExpired || 'Security check has expired. Please verify again.');
      setValue('turnstileToken', '');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value || ''));
    
    const res = await forgotPassword(formData);
    
    if (res?.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      setSubmitted(true);
    }
  };
  
  if (submitted) {
    return (
      <AuthLayout>
        <div className="auth-fade-in" style={{ width: '100%', float: 'left' }}>
          <div className="auth-stagger-1">
            <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--foreground))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
              {dict.auth.checkInboxTitle}
            </h3>
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '20px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
              {dict.auth.checkInboxSubtitle}
            </p>
          </div>
          <div className="login-con auth-stagger-2" style={{ marginTop: '20px' }}>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button
                type="button"
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
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  fontFamily: FONT_STACK,
                }}
              >
                {dict.auth.returnToSignInButton}
              </button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form id="fgpwd_main" onSubmit={handleSubmit(onSubmit)} className="auth-fade-in" style={{ width: '100%', float: 'left' }}>
        <div className="auth-stagger-1">
          <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--foreground))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
            {dict.auth.forgotPasswordTitle}
          </h3>
          <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
            {dict.auth.forgotPasswordSubtitle}
          </p>
        </div>

        {/* Email Field */}
        <div className="form-group auth-stagger-2" style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <input
            {...register('email')}
            type="email"
            className="form-control auth-input"
            placeholder={dict.auth.emailPlaceholder}
            autoComplete="email"
            disabled={loading}
            aria-invalid={errors.email ? "true" : undefined}
            style={{
              width: '100%',
              height: '38px',
              padding: '6px 12px',
              fontSize: '13px',
              backgroundColor: 'hsl(var(--muted))',
              border: errors.email
                ? '1px solid hsl(var(--destructive))'
                : (dirtyFields.email || touchedFields.email) && !errors.email
                ? '1px solid hsl(var(--success))'
                : '1px solid hsl(var(--border))',
              borderRadius: '6px',
              color: 'hsl(var(--foreground))',
              lineHeight: '19.5px',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: FONT_STACK,
            }}
          />
          {errors.email && <p className="auth-error-msg" style={{ fontFamily: FONT_STACK }}>{errors.email.message}</p>}
        </div>

        {/* Turnstile */}
        <div className="auth-stagger-3">
          <TurnstileWidget
            variant="inline"
            onVerify={(token) => {
              setValue('turnstileToken', token, { shouldValidate: true });
              setTurnstileExpired(false);
            }}
            onError={() => {
              setValue('turnstileToken', '', { shouldValidate: true });
              toast.error('Security check failed. Please refresh and try again.');
            }}
            onExpire={() => {
              setValue('turnstileToken', '', { shouldValidate: true });
              setTurnstileExpired(true);
            }}
          />
          {errors.turnstileToken && <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px', textAlign: 'center', fontFamily: FONT_STACK }}>{errors.turnstileToken.message}</p>}
          {turnstileExpired && (
            <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px', textAlign: 'center', fontFamily: FONT_STACK }}>
              {dict.validation.securityCheckExpired}
            </p>
          )}
        </div>

        <div className="login-con auth-stagger-4" style={{ marginTop: '10px' }}>
          <button
            type="submit"
            disabled={loading}
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
              cursor: loading ? 'not-allowed' : 'pointer',
              textAlign: 'center',
              boxSizing: 'border-box',
              fontFamily: FONT_STACK,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? dict.auth.sendingResetLink : dict.auth.sendResetLinkButton}
          </button>
        </div>

        <div className="text-center auth-stagger-5" style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center' }}>
          <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px', fontFamily: FONT_STACK }}>{dict.auth.rememberPasswordPrompt}</span>
          <Link
            href="/login"
            className="auth-link hover:opacity-80"
            style={{ color: 'var(--brand-link)', fontSize: '12px', textDecoration: 'none', fontWeight: 600, fontFamily: FONT_STACK, transition: 'opacity 0.2s, color 0.2s' }}
          >
            {dict.auth.signInLink}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

