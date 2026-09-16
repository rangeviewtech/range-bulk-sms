 
 
/* eslint-disable react-hooks/incompatible-library */
'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { resetPassword } from '@/app/(auth)/actions';
import { TurnstileWidget } from '@/components/forms/turnstile-widget';
import { AuthLayout } from '@/components/layout/auth-layout';
import { useLanguage } from '@/hooks/use-language';
import { Eye, EyeOff } from 'lucide-react';

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

function ResetPasswordForm() {
  const { dict, isRtl } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [turnstileExpired, setTurnstileExpired] = useState(false);
  
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const { register, handleSubmit, formState: { errors, touchedFields, dirtyFields }, setValue, watch, trigger } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'all',
    defaultValues: { token }
  });

  const passwordValue = watch('password') || '';
  const confirmPasswordValue = watch('confirmPassword') || '';

  useEffect(() => {
    if (confirmPasswordValue) {
      trigger('confirmPassword');
    }
  }, [passwordValue, confirmPasswordValue, trigger]);

  const hasLength = passwordValue.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordValue);
  const hasLower = /[a-z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const requirementsMet = [hasLength, hasUpper, hasLower, hasNumber].filter(Boolean).length;
  
  let strengthText = dict.auth.strengthWeak;
  let strengthColor = 'hsl(var(--destructive))';
  let strengthWidth = '0%';
  
  if (passwordValue.length > 0) {
    if (requirementsMet <= 2) {
      strengthText = dict.auth.strengthWeak;
      strengthColor = 'hsl(var(--destructive))';
      strengthWidth = '33%';
    } else if (requirementsMet === 3) {
      strengthText = dict.auth.strengthGood;
      strengthColor = '#ffc107';
      strengthWidth = '66%';
    } else if (requirementsMet === 4) {
      strengthText = dict.auth.strengthStrong;
      strengthColor = 'hsl(var(--success, 142 71% 45%))';
      strengthWidth = '100%';
    }
  }

  const onSubmit = async (data: ResetPasswordValues) => {
    if (turnstileExpired) {
      toast.error(dict.validation.securityCheckExpired || 'Security check has expired. Please verify again.');
      setValue('turnstileToken', '');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value != null) formData.append(key, value);
    });

    const res = await resetPassword(formData);

    if (res?.error) {
      toast.error(res.error);
      setValue('turnstileToken', '');
      setLoading(false);
    } else {
      setSuccess(true);
      toast.success(dict.auth.passwordUpdatedTitle || 'Password reset successfully! You can now log in.');
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <div className="auth-fade-in" style={{ width: '100%', float: 'left' }}>
          <div className="auth-stagger-1">
            <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--destructive))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
              {dict.auth.invalidOrExpiredTitle}
            </h3>
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '20px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
              {dict.auth.invalidOrExpiredSubtitle}
            </p>
          </div>
          <div className="login-con auth-stagger-2" style={{ marginTop: '20px' }}>
            <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
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
                {dict.auth.requestNewLinkButton}
              </button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout>
        <div className="auth-fade-in" style={{ width: '100%', float: 'left' }}>
          <div className="auth-stagger-1">
            <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--foreground))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
              {dict.auth.passwordUpdatedTitle}
            </h3>
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '20px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
              {dict.auth.passwordUpdatedSubtitle}
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
                {dict.auth.signInButton}
              </button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form id="resetpwd_main" onSubmit={handleSubmit(onSubmit)} className="auth-fade-in" style={{ width: '100%', float: 'left' }}>
        <div className="auth-stagger-1">
          <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--foreground))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
            {dict.auth.resetPasswordTitle}
          </h3>
          <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
            {dict.auth.resetPasswordSubtitle}
          </p>
        </div>

        <input type="hidden" {...register('token')} />

        {/* Password Field */}
        <div className="form-group passwordfd auth-stagger-2" style={{ position: 'relative', marginBottom: '0.9rem' }}>
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            className="form-control width100 auth-input"
            placeholder={dict.auth.newPasswordPlaceholder}
            autoComplete="new-password"
            disabled={loading}
            style={{
              width: '100%',
              height: '38px',
              padding: isRtl ? '6px 12px 6px 36px' : '6px 36px 6px 12px',
              fontSize: '13px',
              backgroundColor: 'hsl(var(--muted))',
              border: errors.password
                ? '1px solid #dc3545'
                : (dirtyFields.password || touchedFields.password) && !errors.password
                ? '1px solid #28a745'
                : '1px solid hsl(var(--border))',
              borderRadius: '6px',
              color: 'hsl(var(--foreground))',
              lineHeight: '19.5px',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: FONT_STACK,
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="field-icon"
            style={{
              position: 'absolute',
              top: '19px',
              right: isRtl ? 'auto' : '12px',
              left: isRtl ? '12px' : 'auto',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--muted-foreground))',
              transition: 'transform 0.15s ease, opacity 0.15s ease',
            }}
          >
            {showPassword ? <EyeOff size={16} color='hsl(var(--muted-foreground))' /> : <Eye size={16} color='hsl(var(--muted-foreground))' />}
          </button>
          {errors.password && <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px', fontFamily: FONT_STACK }}>{errors.password.message}</p>}
          
          {passwordValue.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontFamily: FONT_STACK }}>{dict.auth.strengthLabel}:</span>
                <span style={{ fontSize: '11px', color: strengthColor, fontWeight: 600, fontFamily: FONT_STACK }}>{strengthText}</span>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: 'hsl(var(--border))', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: strengthWidth, height: '100%', backgroundColor: strengthColor, transition: 'all 0.3s ease' }} />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="form-group auth-stagger-3" style={{ position: 'relative', marginBottom: '0.9rem' }}>
          <input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            className="form-control width100 auth-input"
            placeholder={dict.auth.confirmPasswordPlaceholder}
            autoComplete="new-password"
            disabled={loading}
            style={{
              width: '100%',
              height: '38px',
              padding: isRtl ? '6px 12px 6px 36px' : '6px 36px 6px 12px',
              fontSize: '13px',
              backgroundColor: 'hsl(var(--muted))',
              border: errors.confirmPassword || (touchedFields.confirmPassword && passwordValue !== confirmPasswordValue)
                ? '1px solid #dc3545'
                : (dirtyFields.confirmPassword || touchedFields.confirmPassword) && !errors.confirmPassword && passwordValue === confirmPasswordValue && confirmPasswordValue.length > 0
                ? '1px solid #28a745'
                : '1px solid hsl(var(--border))',
              borderRadius: '6px',
              color: 'hsl(var(--foreground))',
              lineHeight: '19.5px',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: FONT_STACK,
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            className="field-icon"
            style={{
              position: 'absolute',
              top: '19px',
              right: isRtl ? 'auto' : '12px',
              left: isRtl ? '12px' : 'auto',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--muted-foreground))',
              transition: 'transform 0.15s ease, opacity 0.15s ease',
            }}
          >
            {showConfirmPassword ? <EyeOff size={16} color='hsl(var(--muted-foreground))' /> : <Eye size={16} color='hsl(var(--muted-foreground))' />}
          </button>
          {errors.confirmPassword ? (
            <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px', fontFamily: FONT_STACK }}>{errors.confirmPassword.message}</p>
          ) : (touchedFields.confirmPassword && passwordValue !== confirmPasswordValue) ? (
            <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px', fontFamily: FONT_STACK }}>{dict.validation.passwordsMismatch}</p>
          ) : null}
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
            {loading ? dict.auth.updatingPassword : dict.auth.updatePasswordButton}
          </button>
        </div>

        <div className="text-center auth-stagger-5" style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center' }}>
          <Link
            href="/login"
            style={{ color: '#04648C', fontSize: '12px', textDecoration: 'none', fontWeight: 600, fontFamily: FONT_STACK, transition: 'opacity 0.2s' }}
            className="hover:opacity-80"
          >
            {dict.auth.signInLink}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem', fontFamily: FONT_STACK }}>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

