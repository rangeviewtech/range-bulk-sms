'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { LanguageToggle } from "@/components/navigation/language-toggle";
import { useLanguage } from "@/hooks/use-language";
import { Globe, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { loginSchema } from '@/lib/validations/auth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { isDev, formatErrorForEnv } from '@/lib/env';
import { appConfig } from '@/config/app';
import { appAssets } from '@/config/assets';
import { socialLogin, login as loginAction } from '@/app/(auth)/actions';
import { TurnstileWidget } from '@/components/forms/turnstile-widget';

type LoginFormValues = z.infer<typeof loginSchema>;

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function MicrosoftIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 23 23">
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  );
}

function AppleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 170 170" fill="currentColor">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.03-1.9-14.06-6.08-3.38-2.82-7.3-7.53-11.78-14.13-6.19-9.15-11.02-19.46-14.48-30.93-3.46-11.47-5.19-22.18-5.19-32.13 0-14.82 3.65-27.13 10.95-36.93 7.3-9.8 16.71-14.77 28.23-14.92 4.67 0 9.77 1.15 15.31 3.45 5.54 2.3 9.4 3.45 11.58 3.45 1.94 0 5.89-1.15 11.87-3.45 5.97-2.3 10.74-3.45 14.31-3.45 11.36.27 20.67 4.74 27.93 13.41-10.02 6.06-14.95 14.49-14.79 25.3.2 8.78 3.62 16.12 10.27 22.02 6.65 5.9 14.42 9.17 23.31 9.8-2.6 7.42-6 15.02-10.2 22.82zm-33.8-106.69c0-6.15 2.21-12.19 6.63-18.12 4.42-5.93 10.02-9.67 16.8-11.23.23.95.35 1.9.35 2.85 0 6.13-2.26 12.19-6.78 18.17-4.52 5.98-10.13 9.72-16.83 11.22-.05-.97-.17-1.93-.17-2.89z" />
    </svg>
  );
}

function GitHubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function LoginPage() {
  const { dict, isRtl } = useLanguage();
  const [view, setView] = useState<'login' | 'forgot' | 'app'>('login');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [forgotUsername, setForgotUsername] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileExpired, setTurnstileExpired] = useState(false);
  const router = useRouter();

  // Background Carousel Slides from Centralized Assets
  const slides = appAssets.slides;

  // 10s Background Slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, dirtyFields },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data: LoginFormValues) => {
    // Block if Turnstile key is configured but token is missing
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (siteKey && !turnstileToken) {
      toast.error('Please complete the security check before logging in.');
      return;
    }
    if (siteKey && turnstileExpired) {
      toast.error('Security check has expired. Please verify again.');
      setTurnstileToken(null);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.set('email', data.email);
      formData.set('password', data.password);
      if (turnstileToken) formData.set('turnstileToken', turnstileToken);
      const res = await loginAction(formData);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      if (res?.redirect) router.push(res.redirect);
    } catch (err) {
      const formatted = formatErrorForEnv(err, 'Incorrect username / password.');
      
      if (isDev) {
        toast.error(`[DEV ERROR] ${formatted.code}`, {
          description: `${formatted.message} (Timestamp: ${formatted.timestamp})`,
        });
      } else {
        toast.error(formatted.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (
    provider: 'google' | 'microsoft' | 'apple' | 'github' | 'facebook' | 'x',
    name: string
  ) => {
    if (socialLoading || loading) return;
    setSocialLoading(provider);
    const toastId = toast.loading(`Connecting to ${name}...`);

    try {
      const res = await socialLogin(provider);
      if (res?.success) {
        toast.success(`Welcome! Signed in with ${name}`, { id: toastId });
        router.push('/dashboard');
      } else {
        toast.error(res.error || `Could not sign in with ${name}`, { id: toastId });
      }
    } catch {
      toast.error(`Connection error with ${name}. Please try again.`, { id: toastId });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotUsername) {
      toast.error('Please enter your username');
      return;
    }
    router.push('/forgot-password');
    setView('login');
  };

  return (
    <div
      className="relative min-h-screen w-full bg-white overflow-hidden select-none"
      style={{ fontFamily: FONT_STACK, fontSize: '13px', color: 'hsl(var(--foreground))' }}
    >
      {/* ================= #img-holder (Background Carousel) ================= */}
      <div 
        id="img-holder"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: '100vh',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {slides.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`Background Slide ${index + 1}`}
            fill
            priority={index === 0}
            className="auth-carousel-slide"
            style={{
              objectFit: 'cover',
              opacity: index === currentImageIndex ? 1 : 0,
              zIndex: index === currentImageIndex ? 2 : 1,
            }}
          />
        ))}
      </div>

      {/* ================= .form-main-container ================= */}
      <div
        className="form-main-container auth-fade-in w-full sm:w-[340px]"
        style={{
          position: 'fixed',
          maxWidth: '100%',
          height: '100vh',
          right: '0px',
          top: '0px',
          left: 'auto',
          margin: 'auto',
          backgroundColor: 'hsl(var(--card))',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 24px',
          boxSizing: 'border-box',
          zIndex: 20,
          boxShadow: '0 0 30px rgba(0,0,0,0.14)',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          transition: 'background-color 0.3s ease',
        }}
      >
        {/* ================= Theme & Language Icons - Top-Right Corner ================= */}
        <div
          className="auth-stagger-1"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ThemeToggle />
          <LanguageToggle />
        </div>
        {/* Centered Wrapper for Logo + All Views (Safe scroll-centering with margin: auto 0) */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', margin: 'auto 0', paddingTop: '24px', paddingBottom: '36px', boxSizing: 'border-box' }}>
        {/* .logo-container (Standardized Brand Logo) */}
          <>
            <Image
            src={appAssets.logo}
            alt={`${appConfig.name} logo`}
            width={275}
            height={88}
            priority
            className="logo-container theme-logo-light"
            style={{
              margin: '0 auto 24px',
              width: '275px',
              maxWidth: '92%',
              height: 'auto',
              maxHeight: '88px',
              objectFit: 'contain',
            }}
          />
            <Image
            src={appAssets.logoLight}
            alt={`${appConfig.name} logo`}
            width={275}
            height={88}
            priority
            className="logo-container theme-logo-dark"
            style={{
              margin: '0 auto 24px',
              width: '275px',
              maxWidth: '92%',
              height: 'auto',
              maxHeight: '88px',
              objectFit: 'contain',
            }}
          />
          </>

        {/* .main-container */}
        <div
          className="main-container"
          style={{
            width: '100%',
            backgroundColor: 'hsl(var(--card))',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* ================= VIEW 1: LOGIN ================= */}
          {view === 'login' && (
            <form id="login_form" onSubmit={handleSubmit(onSubmit)} className="auth-fade-in" style={{ width: '100%', float: 'left' }}>
              <div className="auth-stagger-1">
                <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--foreground))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
                  {dict.auth.signInTitle}
                </h3>

                <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
                  {dict.auth.signInSubtitle}
                </p>
              </div>

              {/* Email / Username Field */}
              <div className="form-group usernamefd auth-stagger-2" style={{ position: 'relative', marginBottom: '0.9rem' }}>
                <input
                  {...register('email')}
                  type="text"
                  id="username"
                  className="form-control width100 auth-input"
                  placeholder={dict.auth.emailOrUsernamePlaceholder}
                  autoComplete="email"
                  disabled={loading || !!socialLoading}
                  aria-invalid={errors.email ? "true" : undefined}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    backgroundColor: 'hsl(var(--muted))',
                    border: errors.email
                      ? '1px solid hsl(var(--destructive))'
                      : touchedFields.email && !errors.email
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

              {/* Password Field */}
              <div className="form-group passwordfd auth-stagger-3" style={{ position: 'relative', marginBottom: '0.9rem' }}>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-control width100 auth-input"
                  placeholder={dict.auth.passwordPlaceholder}
                  autoComplete="current-password"
                  disabled={loading || !!socialLoading}
                  aria-invalid={errors.password ? "true" : undefined}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: isRtl ? '6px 12px 6px 36px' : '6px 36px 6px 12px',
                    fontSize: '13px',
                    backgroundColor: 'hsl(var(--muted))',
                    border: errors.password
                      ? '1px solid hsl(var(--destructive))'
                      : touchedFields.password && !errors.password
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
                {errors.password && <p className="auth-error-msg" style={{ fontFamily: FONT_STACK }}>{errors.password.message}</p>}
              </div>

              {/* Options */}
              <div className="form-group auth-stagger-4" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="remember-con" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    id="remember"
                    className="prod-checkbox"
                  />
                  <label htmlFor="remember" style={{ color: 'hsl(var(--foreground))', fontSize: '12px', cursor: 'pointer', fontFamily: FONT_STACK, margin: 0, lineHeight: '14px' }}>
                    {dict.auth.rememberMe}
                  </label>
                </div>
                <div className="forget-con">
                  <a
                    href="#"
                    id="forget-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setView('forgot');
                    }}
                    className="auth-link"
                    style={{
                      color: 'var(--brand-link)',
                      fontSize: '12px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontFamily: FONT_STACK,
                      transition: 'opacity 0.2s ease, color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    {dict.auth.forgotPasswordLink}
                  </a>
                </div>
              </div>

              {/* Cloudflare Turnstile — Bot Protection */}
              <div className="auth-stagger-4">
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

              {/* Login Button */}
              <div className="login-con auth-stagger-5" style={{ marginTop: '10px' }}>
                <button
                  type="submit"
                  id="submit_button"
                  className="btn btn-primary btn-main auth-btn-primary"
                  disabled={loading || !!socialLoading}
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
                    cursor: loading || !!socialLoading ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    fontFamily: FONT_STACK,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? dict.auth.signingIn : dict.auth.signInButton}
                </button>
              </div>

              {/* Register Link */}
              <div className="auth-stagger-5" style={{ textAlign: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', fontFamily: FONT_STACK }}>
                  {dict.auth.noAccountPrompt}{' '}
                </span>
                <a
                  href="/register"
                  className="auth-link"
                  style={{
                    fontSize: '12px',
                    color: 'var(--brand-link)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontFamily: FONT_STACK,
                    transition: 'opacity 0.2s ease, color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  {dict.auth.createOneLink}
                </a>
              </div>

              {/* Divider */}
              <div
                className="OR_separator auth-stagger-6"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  margin: '10% 0 0% 0',
                  fontFamily: FONT_STACK,
                }}
              >
                <span className="OR_left-line" style={{ flexGrow: 1, height: '1px', backgroundColor: 'hsl(var(--border))' }}></span>
                <span className="OR_or-text" style={{ margin: '0 8px', color: 'hsl(var(--muted-foreground))', fontSize: '12px', fontFamily: FONT_STACK }}>{dict.auth.orContinueWith}</span>
                <span className="OR_right-line" style={{ flexGrow: 1, height: '1px', backgroundColor: 'hsl(var(--border))' }}></span>
              </div>

              {/* Fully Functional Social Sign-In Providers Row */}
              <div style={{ marginTop: '16px', width: '100%' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                    width: '100%',
                    direction: 'ltr',
                  }}
                >
                  {/* Google */}
                  <button
                    type="button"
                    title="Sign in with Google"
                    className="auth-social-btn"
                    disabled={!!socialLoading || loading}
                    onClick={() => handleSocialSignIn('google', 'Google')}
                    style={{
                      flex: 1,
                      height: '38px',
                      borderRadius: '7px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: socialLoading || loading ? 'not-allowed' : 'pointer',
                      outline: 'none',
                      opacity: socialLoading && socialLoading !== 'google' ? 0.45 : 1,
                    }}
                  >
                    {socialLoading === 'google' ? <Loader2 size={16} className="animate-spin text-[#4285F4]" /> : <GoogleIcon size={18} />}
                  </button>

                  {/* Microsoft */}
                  <button
                    type="button"
                    title="Sign in with Microsoft"
                    className="auth-social-btn"
                    disabled={!!socialLoading || loading}
                    onClick={() => handleSocialSignIn('microsoft', 'Microsoft')}
                    style={{
                      flex: 1,
                      height: '38px',
                      borderRadius: '7px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: socialLoading || loading ? 'not-allowed' : 'pointer',
                      outline: 'none',
                      opacity: socialLoading && socialLoading !== 'microsoft' ? 0.45 : 1,
                    }}
                  >
                    {socialLoading === 'microsoft' ? <Loader2 size={16} className="animate-spin text-[#05A6F0]" /> : <MicrosoftIcon size={17} />}
                  </button>

                  {/* Apple */}
                  <button
                    type="button"
                    title="Sign in with Apple"
                    className="auth-social-btn"
                    disabled={!!socialLoading || loading}
                    onClick={() => handleSocialSignIn('apple', 'Apple')}
                    style={{
                      flex: 1,
                      height: '38px',
                      borderRadius: '7px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: socialLoading || loading ? 'not-allowed' : 'pointer',
                      color: 'hsl(var(--foreground))',
                      outline: 'none',
                      opacity: socialLoading && socialLoading !== 'apple' ? 0.45 : 1,
                    }}
                  >
                    {socialLoading === 'apple' ? <Loader2 size={16} className="animate-spin text-foreground" /> : <AppleIcon size={18} />}
                  </button>

                  {/* GitHub */}
                  <button
                    type="button"
                    title="Sign in with GitHub"
                    className="auth-social-btn"
                    disabled={!!socialLoading || loading}
                    onClick={() => handleSocialSignIn('github', 'GitHub')}
                    style={{
                      flex: 1,
                      height: '38px',
                      borderRadius: '7px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: socialLoading || loading ? 'not-allowed' : 'pointer',
                      color: 'hsl(var(--foreground))',
                      outline: 'none',
                      opacity: socialLoading && socialLoading !== 'github' ? 0.45 : 1,
                    }}
                  >
                    {socialLoading === 'github' ? <Loader2 size={16} className="animate-spin text-foreground" /> : <GitHubIcon size={18} />}
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    title="Sign in with Facebook"
                    className="auth-social-btn"
                    disabled={!!socialLoading || loading}
                    onClick={() => handleSocialSignIn('facebook', 'Facebook')}
                    style={{
                      flex: 1,
                      height: '38px',
                      borderRadius: '7px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: socialLoading || loading ? 'not-allowed' : 'pointer',
                      outline: 'none',
                      opacity: socialLoading && socialLoading !== 'facebook' ? 0.45 : 1,
                    }}
                  >
                    {socialLoading === 'facebook' ? <Loader2 size={16} className="animate-spin text-[#1877F2]" /> : <FacebookIcon size={18} />}
                  </button>

                  {/* X (Twitter) */}
                  <button
                    type="button"
                    title="Sign in with X"
                    className="auth-social-btn"
                    disabled={!!socialLoading || loading}
                    onClick={() => handleSocialSignIn('x', 'X')}
                    style={{
                      flex: 1,
                      height: '38px',
                      borderRadius: '7px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: socialLoading || loading ? 'not-allowed' : 'pointer',
                      color: 'hsl(var(--foreground))',
                      outline: 'none',
                      opacity: socialLoading && socialLoading !== 'x' ? 0.45 : 1,
                    }}
                  >
                    {socialLoading === 'x' ? <Loader2 size={16} className="animate-spin text-foreground" /> : <XIcon size={16} />}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ================= VIEW 2: FORGOT PASSWORD ================= */}
          {view === 'forgot' && (
            <form id="fgpwd_main" onSubmit={handleRecover} style={{ width: '100%', float: 'left' }}>
              <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--foreground))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
                {dict.auth.forgotPasswordTitle}
              </h3>
              <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
                {dict.auth.forgotPasswordSubtitle}
              </p>

              <div className="form-group usernamefd" style={{ position: 'relative', marginBottom: '1rem' }}>
                <input
                  type="email"
                  id="forgot_username"
                  className="form-control"
                  placeholder={dict.auth.emailPlaceholder}
                  autoComplete="email"
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    backgroundColor: 'hsl(var(--muted))',
                    border: forgotUsername.length > 0 && !forgotUsername.includes('@')
                      ? '1px solid hsl(var(--destructive))'
                      : forgotUsername.length > 0 && forgotUsername.includes('@')
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
              </div>

              {/* Cloudflare Turnstile Ã¢â‚¬â€ Bot Protection */}
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

              <div className="form-group" style={{ marginTop: '10px', marginBottom: '0px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', direction: 'ltr' }}>
                <div className="forget-con" style={{ flex: 1 }}>
                  <button
                    type="button"
                    className="btn btn-secondary auth-btn-secondary"
                    onClick={() => setView('login')}
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
                </div>
                <div className="login-con" style={{ flex: 1 }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-main auth-btn-primary"
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '6px 16px',
                      fontSize: '13.5px',
                      borderRadius: '7px',
                      fontFamily: FONT_STACK,
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? dict.auth.sendingResetLink : dict.auth.sendResetLinkButton}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ================= VIEW 3: GET MOBILE APP ================= */}
          {view === 'app' && (
            <div style={{ width: '100%' }}>
              <div
                id="page-back-line"
                className="page-back-line"
                onClick={() => setView('login')}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '20px' }}
              >
                <img className="back-img" src={appAssets.uiIcons.arrowLeft} alt="logo" style={{ width: '24px', marginRight: '10px', marginTop: '5px' }} />
                <h3 className="back-head" style={{ fontSize: '20px', fontWeight: 500, color: 'hsl(var(--foreground))', margin: 0, lineHeight: '40px', fontFamily: FONT_STACK }}>
                  Login
                </h3>
              </div>

              <div className="main-container" style={{ textAlign: 'center' }}>
                <div className="rangesms-app" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '18px' }}>
                  <img className="rangesms-img" src={appAssets.icon} alt="logo" style={{ width: '110px' }} />
                  <h3 style={{ fontSize: '24px', fontWeight: 500, color: 'hsl(var(--foreground))', margin: '0 0 16px 0', fontFamily: FONT_STACK }}>{appConfig.name}</h3>
                </div>

                <p style={{ fontSize: '13px', color: 'hsl(var(--foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK, textAlign: 'center' }}>
                  Manage your SMS campaigns, contacts, and API integrations from anywhere. Scan the QR code to get the application:
                </p>

                <div className="qr-code-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <img src={appAssets.qrCode} alt={`qr-code-${appConfig.name.toLowerCase()}`} className="qr-code" style={{ maxWidth: '150px' }} />
                </div>

                <div className="appstore-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <a href="https://play.google.com/store/apps/details?id=com.uffizio.rangesms&hl=en_IN" data-value="android" target="_blank" rel="noreferrer" style={{ flex: 1 }}>
                      <img src={appAssets.storeBadges.googlePlay} alt="Google Play Store" style={{ width: '100%', height: '36px', objectFit: 'contain' }} />
                    </a>
                    <a href="https://apps.apple.com/in/app/rangesms/id1396516275" data-value="ios" target="_blank" rel="noreferrer" style={{ flex: 1 }}>
                      <img src={appAssets.storeBadges.appStore} alt="Apple App Store" style={{ width: '100%', height: '36px', objectFit: 'contain' }} />
                    </a>
                  </div>
                  <a href="https://apps.microsoft.com/store" data-value="microsoft" target="_blank" rel="noreferrer" style={{ width: '100%' }}>
                    <img src={appAssets.storeBadges.microsoftStore} alt="Microsoft Store" style={{ width: '100%', height: '36px', objectFit: 'contain' }} />
                  </a>
                </div>
              </div>
            </div>
          )}

          </div>
          {/* .application-container with direct Google Play Store, Apple App Store, and Microsoft Store links */}
          {view === 'login' && (
            <div className="application-container" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
              <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: FONT_STACK }}>
                Get Mobile & Desktop App
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', flexWrap: 'wrap' }}>
                <a
                  href="https://play.google.com/store/apps/details?id=com.uffizio.rangesms&hl=en_IN"
                  target="_blank"
                  rel="noreferrer"
                  title="Google Play Store"
                  className="auth-store-badge hover-scale"
                  style={{ textDecoration: 'none' }}
                >
                  <img src={appAssets.storeBadges.googlePlay} alt="Google Play Store" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
                </a>
                <a
                  href="https://apps.apple.com/in/app/rangesms/id1396516275"
                  target="_blank"
                  rel="noreferrer"
                  title="Apple App Store"
                  className="auth-store-badge hover-scale"
                  style={{ textDecoration: 'none' }}
                >
                  <img src={appAssets.storeBadges.appStore} alt="Apple App Store" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
                </a>
                <a
                  href="https://apps.microsoft.com/store"
                  target="_blank"
                  rel="noreferrer"
                  title="Microsoft Store"
                  className="auth-store-badge hover-scale"
                  style={{ textDecoration: 'none' }}
                >
                  <img src={appAssets.storeBadges.microsoftStore} alt="Microsoft Store" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
                </a>
              </div>

              {/* Legal Links Footer */}
              <div style={{ marginTop: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', flexWrap: 'wrap', width: '100%' }}>
                <Link
                  href="/terms"
                  target="_blank"
                  className="auth-link"
                  style={{
                    fontSize: '10.5px',
                    color: 'var(--brand-link)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontFamily: FONT_STACK,
                    whiteSpace: 'nowrap',
                    transition: 'opacity 0.2s ease, color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  {dict.legal?.termsAndConditions || 'Terms & Conditions'}
                </Link>
                <span aria-hidden="true" style={{ fontSize: '10px', color: 'var(--brand-link)', opacity: 0.5 }}>&bull;</span>
                <Link
                  href="/privacy"
                  target="_blank"
                  className="auth-link"
                  style={{
                    fontSize: '10.5px',
                    color: 'var(--brand-link)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontFamily: FONT_STACK,
                    whiteSpace: 'nowrap',
                    transition: 'opacity 0.2s ease, color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  {dict.legal?.privacyPolicy || 'Privacy Policy'}
                </Link>
                <span aria-hidden="true" style={{ fontSize: '10px', color: 'var(--brand-link)', opacity: 0.5 }}>&bull;</span>
                <Link
                  href="/cookies"
                  target="_blank"
                  className="auth-link"
                  style={{
                    fontSize: '10.5px',
                    color: 'var(--brand-link)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontFamily: FONT_STACK,
                    whiteSpace: 'nowrap',
                    transition: 'opacity 0.2s ease, color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  {dict.legal?.cookiePolicy || 'Cookie Policy'}
                </Link>
              </div>
            </div>
          )}
        </div>{/* end centered wrapper */}


        {/* Language icon removed from bottom Ã¢â‚¬â€ repositioned to top-right corner below */}
      </div>
    </div>
  );
}





