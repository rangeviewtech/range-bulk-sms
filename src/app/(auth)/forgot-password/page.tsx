'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPassword } from '../actions';
import { toast } from 'sonner';
import { TurnstileWidget } from '@/components/forms/turnstile-widget';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { AuthLayout } from '@/components/layout/auth-layout';

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [turnstileExpired, setTurnstileExpired] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'all',
  });

  const turnstileToken = watch('turnstileToken');

  const onSubmit = async (data: ForgotPasswordValues) => {
    if (turnstileExpired) {
      toast.error('Security check has expired. Please verify again.');
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
        <div style={{ width: '100%', float: 'left' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--foreground))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
            Check your email
          </h3>
          <p style={{ fontSize: '13px', color: 'hsl(var(--foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
            If an account exists for that email, we have sent password reset instructions.
          </p>
          <div className="login-con" style={{ marginTop: '20px' }}>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button
                type="button"
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
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  fontFamily: FONT_STACK,
                }}
              >
                Return to login
              </button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form id="fgpwd_main" onSubmit={handleSubmit(onSubmit)} style={{ width: '100%', float: 'left' }}>
        <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--foreground))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
          Forgot password
        </h3>
        <p style={{ fontSize: '13px', color: 'hsl(var(--foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
          Password reset instructions will be sent after you type your email.
        </p>

        {/* Email Field */}
        <div className="form-group" style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <input
            {...register('email')}
            type="email"
            className="form-control"
            placeholder="Email address"
            autoComplete="off"
            disabled={loading}
            style={{
              width: '100%',
              height: '38px',
              padding: '6px 12px',
              fontSize: '13px',
              backgroundColor: 'hsl(var(--muted))',
              border: errors.email ? '1px solid #dc3545' : '1px solid #DEE2E6',
              borderRadius: '6px',
              color: 'hsl(var(--foreground))',
              lineHeight: '19.5px',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: FONT_STACK,
              transition: 'border-color 0.2s ease',
            }}
          />
          {errors.email && <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px', fontFamily: FONT_STACK }}>{errors.email.message}</p>}
        </div>

        {/* Turnstile */}
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
            Security check expired. Please re-verify.
          </p>
        )}

        <div className="login-con" style={{ marginTop: '10px' }}>
          <button
            type="submit"
            disabled={loading}
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
              cursor: loading ? 'not-allowed' : 'pointer',
              textAlign: 'center',
              boxSizing: 'border-box',
              fontFamily: FONT_STACK,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Sending...' : 'Send recovery link'}
          </button>
        </div>

        <div className="text-center" style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center' }}>
          <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px', fontFamily: FONT_STACK }}>Remember your password?</span>
          <Link
            href="/login"
            style={{ color: 'hsl(var(--foreground))', fontSize: '12px', textDecoration: 'none', fontWeight: 600, fontFamily: FONT_STACK }}
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

