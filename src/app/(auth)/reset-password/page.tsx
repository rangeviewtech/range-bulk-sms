 
 
'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { resetPassword, validateResetToken } from '@/app/(auth)/actions';
import { notify, toast } from '@/lib/notifications/toast';
import { toastCatalog } from '@/lib/notifications/toast-catalog';
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
  
  // Real-time interaction flags matching login & forgot-password pages
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [isTokenValidating, setIsTokenValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsTokenValidating(false);
      return;
    }
    validateResetToken(token).then((isValid) => {
      setIsTokenValid(isValid);
      setIsTokenValidating(false);
    }).catch(() => {
      setIsTokenValid(false);
      setIsTokenValidating(false);
    });
  }, [token]);

  const { register, handleSubmit, formState: { errors }, setValue, control, trigger } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: { token, password: '', confirmPassword: '' }
  });

  const turnstileToken = useWatch({ control, name: 'turnstileToken' });
  const passwordValue = useWatch({ control, name: 'password' }) || '';
  const confirmPasswordValue = useWatch({ control, name: 'confirmPassword' }) || '';

  useEffect(() => {
    if (confirmPasswordTouched || confirmPasswordValue) {
      trigger('confirmPassword');
    }
  }, [passwordValue, confirmPasswordValue, confirmPasswordTouched, trigger]);

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
      strengthColor = 'hsl(var(--success))';
      strengthWidth = '100%';
    }
  }

  // Exact validation state indicators
  const isPasswordValid = hasLength && hasUpper && hasLower && hasNumber && !errors.password;
  const isConfirmValid = confirmPasswordValue.length > 0 && confirmPasswordValue === passwordValue && !errors.confirmPassword;
  const isTurnstileValid = !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || (turnstileToken && !turnstileExpired);
  const isResetValid = isPasswordValid && isConfirmValid && isTurnstileValid;

  // Error visibility states (triggered on click-out/blur or submit attempt)
  const showPasswordError = (passwordTouched || submitAttempted || passwordValue.length > 0) && !!errors.password;
  const showConfirmPasswordError = (confirmPasswordTouched || submitAttempted || confirmPasswordValue.length > 0) && (
    !!errors.confirmPassword || (passwordValue && confirmPasswordValue && passwordValue !== confirmPasswordValue) || (!confirmPasswordValue && (confirmPasswordTouched || submitAttempted))
  );

  const passwordRegister = register('password');
  const confirmPasswordRegister = register('confirmPassword');

  const onSubmit = async (data: ResetPasswordValues) => {
    setSubmitAttempted(true);

    if (turnstileExpired) {
      notify.error(dict.validation.securityCheckExpired || toastCatalog.security.checkExpired);
      setValue('turnstileToken', '');
      return;
    }

    if (!isResetValid) {
      await trigger();
      return;
    }

    setLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value != null) formData.append(key, value);
    });

    const res = await resetPassword(formData);

    if (res?.error) {
      notify.error(res.error);
      setValue('turnstileToken', '');
      setLoading(false);
    } else {
      setSuccess(true);
      notify.flash('success', toastCatalog.passwordReset.passwordResetSuccess);
      notify.success(dict.auth.passwordUpdatedTitle || toastCatalog.passwordReset.passwordResetSuccess);
    }
  };

  if (isTokenValidating) {
    return (
      <AuthLayout>
        <div className="auth-fade-in" style={{ width: '100%', float: 'left', textAlign: 'center', padding: '40px 0' }}>
          <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid rgba(251, 202, 7, 0.3)', borderTopColor: '#FBCA07', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      </AuthLayout>
    );
  }

  if (!token || !isTokenValid) {
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
          <p className="auth-subtitle" style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK, width: '100%', textAlign: 'justify', textJustify: 'inter-word' }}>
            {dict.auth.resetPasswordSubtitle}
          </p>
        </div>

        <input type="hidden" {...register('token')} />

        {/* Password Field */}
        <div className="form-group passwordfd auth-stagger-2" style={{ position: 'relative', marginBottom: '0.9rem' }}>
          <input
            {...passwordRegister}
            type={showPassword ? 'text' : 'password'}
            className="form-control width100 auth-input"
            placeholder={dict.auth.newPasswordPlaceholder}
            autoComplete="new-password"
            disabled={loading}
            onBlur={(e) => {
              passwordRegister.onBlur(e);
              setPasswordTouched(true);
              trigger('password');
            }}
            aria-invalid={showPasswordError ? "true" : undefined}
            style={{
              width: '100%',
              height: '38px',
              padding: isRtl ? '6px 12px 6px 36px' : '6px 36px 6px 12px',
              fontSize: '13px',
              backgroundColor: 'hsl(var(--muted))',
              border: showPasswordError
                ? '1px solid hsl(var(--destructive))'
                : isPasswordValid
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
          
          {showPasswordError && (
            <p className="auth-error-msg" style={{ fontFamily: FONT_STACK }}>
              {errors.password?.message || dict.validation.passwordRequired}
            </p>
          )}
          
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
            {...confirmPasswordRegister}
            type={showConfirmPassword ? 'text' : 'password'}
            className="form-control width100 auth-input"
            placeholder={dict.auth.confirmPasswordPlaceholder}
            autoComplete="new-password"
            disabled={loading}
            onBlur={(e) => {
              confirmPasswordRegister.onBlur(e);
              setConfirmPasswordTouched(true);
              trigger('confirmPassword');
            }}
            aria-invalid={showConfirmPasswordError ? "true" : undefined}
            style={{
              width: '100%',
              height: '38px',
              padding: isRtl ? '6px 12px 6px 36px' : '6px 36px 6px 12px',
              fontSize: '13px',
              backgroundColor: 'hsl(var(--muted))',
              border: showConfirmPasswordError
                ? '1px solid hsl(var(--destructive))'
                : isConfirmValid
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
          
          {showConfirmPasswordError && (
            <p className="auth-error-msg" style={{ fontFamily: FONT_STACK }}>
              {!confirmPasswordValue 
                ? (dict.validation.confirmPasswordRequired || 'Please confirm your password')
                : (dict.validation.passwordsMismatch || "Passwords don't match")}
            </p>
          )}
        </div>

        {/* Turnstile — Full Width Matching Inputs */}
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

        {/* Side-by-side Actions: Sign in (secondary) + Update password (primary) */}
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
              disabled={loading || !isResetValid}
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
                cursor: loading || !isResetValid ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                boxSizing: 'border-box',
                fontFamily: FONT_STACK,
                opacity: loading || !isResetValid ? 0.65 : 1,
              }}
            >
              {loading ? dict.auth.updatingPassword : dict.auth.updatePasswordButton}
            </button>
          </div>
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

