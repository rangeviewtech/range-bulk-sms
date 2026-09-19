 
 
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPassword } from '../actions';
import { notify, toast } from '@/lib/notifications/toast';
import { toastCatalog } from '@/lib/notifications/toast-catalog';
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
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, control, trigger } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: { email: '' }
  });

  const turnstileToken = useWatch({ control, name: 'turnstileToken' });
  const emailValue = useWatch({ control, name: 'email' }) || '';
  const isEmailValid = z.string().email().safeParse(emailValue).success && !errors.email;
  const isForgotValid = isEmailValid && (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || (turnstileToken && !turnstileExpired));

  const showEmailError = (emailTouched || submitAttempted || emailValue.length > 0) && (!emailValue || !isEmailValid || !!errors.email);
  const emailRegister = register('email');

  const onSubmit = async (data: ForgotPasswordValues) => {
    setSubmitAttempted(true);

    if (turnstileExpired) {
      notify.error(dict.validation.securityCheckExpired || toastCatalog.security.checkExpired);
      setValue('turnstileToken', '');
      return;
    }

    if (!isForgotValid) {
      await trigger('email');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value || ''));
    
    const res = await forgotPassword(formData);
    
    if (res?.error) {
      notify.error(res.error);
      setLoading(false);
    } else {
      notify.success(toastCatalog.passwordReset.forgotPasswordSent);
      setSubmitted(true);
    }
  };
  
  if (submitted) {
    return (
      <AuthLayout>
        <div className="auth-fade-in" style={{ width: '100%', float: 'left' }}>
          <div className="auth-stagger-1">
            <h3 style={{ fontSize: '26px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '6px', lineHeight: '32px', fontFamily: FONT_STACK }}>
              {dict.auth.checkInboxTitle}
            </h3>
            <p className="auth-subtitle" style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '20px', lineHeight: '19.5px', fontFamily: FONT_STACK, width: '100%', textAlign: 'justify', textJustify: 'inter-word' }}>
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
          <p className="auth-subtitle" style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK, width: '100%', textAlign: 'justify', textJustify: 'inter-word' }}>
            {dict.auth.forgotPasswordSubtitle}
          </p>
        </div>

        {/* Email Field */}
        <div className="form-group auth-stagger-2" style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <input
            {...emailRegister}
            type="email"
            className="form-control auth-input"
            placeholder={dict.auth.emailPlaceholder}
            autoComplete="email"
            disabled={loading}
            onBlur={(e) => {
              emailRegister.onBlur(e);
              setEmailTouched(true);
              trigger('email');
            }}
            aria-invalid={showEmailError ? "true" : undefined}
            style={{
              width: '100%',
              height: '38px',
              padding: '6px 12px',
              fontSize: '13px',
              backgroundColor: 'hsl(var(--muted))',
              border: showEmailError
                ? '1px solid hsl(var(--destructive))'
                : isEmailValid && emailValue
                ? '1px solid hsl(var(--success))'
                : '1px solid hsl(var(--border))',
              borderRadius: '6px',
              color: 'hsl(var(--foreground))',
              lineHeight: '19.5px',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: FONT_STACK,
              transition: 'border-color 0.2s ease',
            }}
          />
          {showEmailError && (
            <p className="auth-error-msg" style={{ fontFamily: FONT_STACK }}>
              {!emailValue ? (dict.validation.emailRequired || 'Please enter your email address') : (errors.email?.message || dict.validation.invalidEmail)}
            </p>
          )}
        </div>

        {/* Turnstile */}
        <div className="auth-stagger-3" style={{ width: '100%', marginBottom: '10px' }}>
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

        {/* Side-by-side Actions: Sign in (secondary) + Send reset link (primary) */}
        <div className="form-group auth-stagger-4" style={{ marginTop: '10px', marginBottom: '0px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', direction: 'ltr' }}>
          <div className="forget-con" style={{ flex: 1 }}>
            <Link href="/login" style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary auth-btn-secondary"
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '6px 16px',
                  fontSize: '13.5px',
                  borderRadius: '7px',
                  fontFamily: FONT_STACK,
                }}
              >
                {dict.auth.signInLink}
              </button>
            </Link>
          </div>
          <div className="login-con" style={{ flex: 1 }}>
            <button
              type="submit"
              disabled={loading || !isForgotValid}
              className="btn btn-primary btn-main auth-btn-primary"
              style={{
                width: '100%',
                height: '38px',
                padding: '6px 16px',
                fontSize: '13.5px',
                lineHeight: '19.5px',
                backgroundColor: '#FBCA07',
                color: '#141B2D',
                fontWeight: 700,
                borderRadius: '7px',
                border: '0',
                cursor: loading || !isForgotValid ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                boxSizing: 'border-box',
                fontFamily: FONT_STACK,
                opacity: loading || !isForgotValid ? 0.7 : 1,
              }}
            >
              {loading ? dict.auth.sendingResetLink : dict.auth.sendResetLinkButton}
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}

