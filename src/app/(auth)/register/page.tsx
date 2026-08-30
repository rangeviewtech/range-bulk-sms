'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { registerSchema } from '@/lib/validations/auth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { isDev, formatErrorForEnv } from '@/lib/env';
import { appConfig } from '@/config/app';
import { appAssets } from '@/config/assets';
import { socialLogin, register as registerAction } from '@/app/(auth)/actions';
import { TurnstileWidget } from '@/components/forms/turnstile-widget';

type RegisterFormValues = z.infer<typeof registerSchema>;

const LANGUAGES: { code: string; name: string; flag?: string }[] = [
  { code: '-1', name: 'Default Language' },
  { code: 'EN', name: 'English', flag: 'gb' },
  { code: 'DE', name: 'German', flag: 'de' },
  { code: 'ES', name: 'Spanish', flag: 'es' },
  { code: 'AE', name: 'Arabic', flag: 'sa' },
  { code: 'FR', name: 'French', flag: 'fr' },
  { code: 'FA', name: 'Persian', flag: 'ir' },
  { code: 'SQ', name: 'Albanian', flag: 'al' },
  { code: 'TH', name: 'Thai', flag: 'th' },
  { code: 'HE', name: 'Hebrew', flag: 'il' },
  { code: 'RU', name: 'Russian', flag: 'ru' },
  { code: 'PT', name: 'Portuguese', flag: 'pt' },
  { code: 'JA', name: 'Japanese', flag: 'jp' },
  { code: 'KO', name: 'Korean', flag: 'kr' },
  { code: 'ZH', name: 'Chinese', flag: 'cn' },
  { code: 'MN', name: 'Mongolian', flag: 'mn' },
  { code: 'NE', name: 'Nepali', flag: 'np' },
  { code: 'HI', name: 'Hindi', flag: 'in' },
  { code: 'IT', name: 'Italian', flag: 'it' },
  { code: 'MY', name: 'Burmese', flag: 'mm' },
  { code: 'TR', name: 'Turkish', flag: 'tr' },
  { code: 'SR', name: 'Serbian', flag: 'rs' },
  { code: 'HU', name: 'Hungarian', flag: 'hu' },
  { code: 'PL', name: 'Polish', flag: 'pl' },
  { code: 'DU', name: 'Dutch', flag: 'nl' },
  { code: 'TE', name: 'Telugu', flag: 'in' },
  { code: 'KM', name: 'Cambodian', flag: 'kh' },
  { code: 'IN', name: 'Indonesian', flag: 'id' },
  { code: 'GJ', name: 'Gujarati', flag: 'in' },
  { code: 'BN', name: 'Bengali', flag: 'bd' },
  { code: 'MR', name: 'Marathi', flag: 'in' },
  { code: 'KN', name: 'Kannada', flag: 'in' },
  { code: 'EL', name: 'Greek', flag: 'gr' },
  { code: 'BR', name: 'Portuguese Brazil', flag: 'br' },
  { code: 'CZ', name: 'Czech', flag: 'cz' },
  { code: 'MS', name: 'Malay', flag: 'my' },
  { code: 'TA', name: 'Tamil', flag: 'in' },
  { code: 'ML', name: 'Malayalam', flag: 'in' },
  { code: 'UR', name: 'Urdu', flag: 'pk' },
  { code: 'BS', name: 'Bosnian', flag: 'ba' },
  { code: 'HR', name: 'Croatian', flag: 'hr' },
  { code: 'GR', name: 'Greek Athens', flag: 'gr' },
  { code: 'AO', name: 'Portuguese AO', flag: 'ao' },
  { code: 'KU', name: 'Kurdish', flag: 'iq' },
  { code: 'AM', name: 'Amharic', flag: 'et' },
  { code: 'OM', name: 'Oromo', flag: 'et' },
  { code: 'TI', name: 'Tigrinya', flag: 'er' },
  { code: 'PA', name: 'Punjabi', flag: 'in' },
  { code: 'ET', name: 'Estonian', flag: 'ee' },
];

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

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState('Default Language');
  const [selectedFlag, setSelectedFlag] = useState<string | undefined>(undefined);
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
    setValue,
    formState: { errors, touchedFields, dirtyFields },
    watch,
    trigger,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'all',
    reValidateMode: 'onChange',
  });

  
  // eslint-disable-next-line react-hooks/incompatible-library
  const passwordValue = watch('password') || '';
  // eslint-disable-next-line react-hooks/incompatible-library
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
  
  let strengthText = 'Weak';
  let strengthColor = 'hsl(var(--destructive))';
  let strengthWidth = '0%';
  
  if (passwordValue.length > 0) {
    if (requirementsMet <= 2) {
      strengthText = 'Weak';
      strengthColor = 'hsl(var(--destructive))';
      strengthWidth = '33%';
    } else if (requirementsMet === 3) {
      strengthText = 'Good';
      strengthColor = '#ffc107';
      strengthWidth = '66%';
    } else if (requirementsMet === 4) {
      strengthText = 'Strong';
      strengthColor = 'hsl(var(--success, 142 71% 45%))';
      strengthWidth = '100%';
    }
  }

  const onSubmit = async (data: RegisterFormValues) => {
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
      Object.entries(data).forEach(([key, value]) => formData.append(key, value || ''));
      if (turnstileToken) {
        formData.append('turnstileToken', turnstileToken);
      }

      const res = await registerAction(formData);
      
      if (res?.error) {
        toast.error(res.error);
        setLoading(false);
      } else {
        toast.success('Account created successfully');
        router.push('/dashboard');
      }
    } catch (err) {
      const formatted = formatErrorForEnv(err, 'Could not create account.');
      
      if (isDev) {
        toast.error(`[DEV ERROR] ${formatted.code}`, {
          description: `${formatted.message} (Timestamp: ${formatted.timestamp})`,
        });
      } else {
        toast.error(formatted.message);
      }
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
        toast.error(`Could not sign in with ${name}`, { id: toastId });
      }
    } catch {
      toast.error(`Connection error with ${name}. Please try again.`, { id: toastId });
    } finally {
      setSocialLoading(null);
    }
  };



  const filteredLanguages = LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <div
      className="relative min-h-screen w-full bg-white overflow-hidden select-none"
      style={{ fontFamily: FONT_STACK, fontSize: '13px', color: '#444' }}
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
          <img
            key={src}
            src={src}
            alt={`Background Slide ${index + 1}`}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '100%',
              minHeight: '100%',
              objectFit: 'cover',
              transition: 'opacity 1.5s ease-in-out',
              opacity: index === currentImageIndex ? 1 : 0,
              zIndex: index === currentImageIndex ? 2 : 1,
            }}
          />
        ))}
      </div>

      {/* ================= .form-main-container ================= */}
      <div
        className="form-main-container"
        style={{
          position: 'fixed',
          width: '340px',
          height: '100vh',
          right: '0px',
          top: '0px',
          left: 'auto',
          margin: 'auto',
          backgroundColor: 'hsl(var(--card))',
          display: 'flex',
          flexDirection: 'column',
          padding: '30px',
          boxSizing: 'border-box',
          zIndex: 20,
          boxShadow: '0 0 20px rgba(0,0,0,0.12)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* ================= Language Icon — Top-Right Corner ================= */}
        {langOpen && (
          <div
            id="dropdown-overlay"
            onClick={() => setLangOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'transparent' }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            zIndex: 50,
          }}
        >
          <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="dropbtn"
              aria-label="Select language"
              style={{
                backgroundColor: 'transparent',
                color: 'hsl(var(--foreground))',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                lineHeight: '16px',
                fontWeight: 400,
                opacity: 0.6,
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                borderRadius: '4px',
                transition: 'opacity 0.15s ease, background-color 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {selectedFlag ? (
                <img
                  src={`https://flagcdn.com/20x15/${selectedFlag}.png`}
                  id="def-lang"
                  alt={selectedLang}
                  style={{
                    width: '18px',
                    height: '13px',
                    borderRadius: '1px',
                    objectFit: 'cover',
                    boxShadow: '0 0 1px rgba(0,0,0,0.3)',
                  }}
                />
              ) : (
                <Globe size={14} style={{ flexShrink: 0, opacity: 0.7, color: 'hsl(var(--foreground))' }} />
              )}

            </button>

            {langOpen && (
              <div
                id="myDropdown"
                className="dropdown-content show"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  left: 'auto',
                  backgroundColor: '#f6f6f6',
                  minWidth: '230px',
                  border: '1px solid #ddd',
                  zIndex: 40,
                  maxHeight: '260px',
                  overflow: 'auto',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                  borderRadius: '0 0 4px 4px',
                  marginTop: '2px',
                }}
              >
                <div style={{ position: 'sticky', top: 0, backgroundColor: '#f6f6f6', zIndex: 2 }}>
                  <input
                    type="text"
                    placeholder="Search.."
                    id="myInput"
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    autoFocus
                    style={{
                      boxSizing: 'border-box',
                      fontSize: '13px',
                      padding: '5px 5px 5px 30px',
                      border: 'none',
                      borderBottom: '1px solid #ddd',
                      width: '100%',
                      outline: '0px solid #ddd',
                      backgroundColor: 'hsl(var(--card))',
                      fontFamily: FONT_STACK,
                    }}
                  />
                </div>
                {filteredLanguages.map((l) => (
                  <a
                    key={l.code}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedLang(l.name);
                      setSelectedFlag(l.flag);
                      setLangOpen(false);
                      toast.info(`Language set to ${l.name}`);
                    }}
                    style={{
                      color: selectedLang === l.name ? '#29A4FF' : 'hsl(var(--foreground))',
                      padding: '5px 8px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontFamily: FONT_STACK,
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'hsl(var(--accent))')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {l.flag ? (
                      <img
                        src={`https://flagcdn.com/20x15/${l.flag}.png`}
                        alt={l.name}
                        style={{
                          width: '16px',
                          height: '12px',
                          borderRadius: '1px',
                          objectFit: 'cover',
                          flexShrink: 0,
                          boxShadow: '0 0 1px rgba(0,0,0,0.3)',
                        }}
                      />
                    ) : (
                      <Globe size={14} style={{ flexShrink: 0, opacity: 0.7, color: 'hsl(var(--foreground))' }} />
                    )}
                    <span>{l.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* .logo-container (Standardized Brand Logo) */}
        <>
            <img
          src={appAssets.logo}
          alt={`${appConfig.name} logo`}
          className="logo-container theme-logo-light"
          style={{
            margin: '50px auto 20px',
            width: '180px',
            height: '75px',
            objectFit: 'contain',
          }}
        />
            <img
          src={appAssets.logoLight}
          alt={`${appConfig.name} logo`}
          className="logo-container theme-logo-dark"
          style={{
            margin: '50px auto 20px',
            width: '180px',
            height: '75px',
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
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* ================= REGISTER FORM ================= */}
            <form id="register_form" onSubmit={handleSubmit(onSubmit)} style={{ width: '100%', float: 'left' }}>
              <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--foreground))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
                Create an account
              </h3>

              <p style={{ fontSize: '13px', color: 'hsl(var(--foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
                Enter your information to get started.
              </p>

              {/* Name Field */}
              <div className="form-group" style={{ position: 'relative', marginBottom: '0.9rem' }}>
                <input
                  {...register('name')}
                  type="text"
                  className="form-control width100"
                  placeholder="Full Name"
                  autoComplete="off"
                  disabled={loading || !!socialLoading}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    backgroundColor: 'hsl(var(--muted))',
                    border: errors.name
                      ? '1px solid #dc3545'
                      : (dirtyFields.name || touchedFields.name) && !errors.name
                      ? '1px solid #28a745'
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
                {errors.name && <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px', fontFamily: FONT_STACK }}>{errors.name.message}</p>}
              </div>

              {/* Email Field */}
              <div className="form-group usernamefd" style={{ position: 'relative', marginBottom: '0.9rem' }}>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="form-control width100"
                  placeholder="Email"
                  autoComplete="off"
                  disabled={loading || !!socialLoading}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    backgroundColor: 'hsl(var(--muted))',
                    border: errors.email
                      ? '1px solid #dc3545'
                      : (dirtyFields.email || touchedFields.email) && !errors.email
                      ? '1px solid #28a745'
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
                {errors.email && <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px', fontFamily: FONT_STACK }}>{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div className="form-group passwordfd" style={{ position: 'relative', marginBottom: '0.9rem' }}>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-control width100"
                  placeholder="Password"
                  disabled={loading || !!socialLoading}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '6px 36px 6px 12px',
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
                    right: '12px',
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
                  }}
                >
                  {showPassword ? <EyeOff size={16} color='hsl(var(--muted-foreground))' /> : <Eye size={16} color='hsl(var(--muted-foreground))' />}
                </button>
                {errors.password && <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px', fontFamily: FONT_STACK }}>{errors.password.message}</p>}
                
                {passwordValue.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontFamily: FONT_STACK }}>Password Strength:</span>
                      <span style={{ fontSize: '11px', color: strengthColor, fontWeight: 600, fontFamily: FONT_STACK }}>{strengthText}</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', backgroundColor: 'hsl(var(--border))', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: strengthWidth, height: '100%', backgroundColor: strengthColor, transition: 'all 0.3s ease' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group" style={{ position: 'relative', marginBottom: '0.9rem' }}>
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control width100"
                  placeholder="Confirm Password"
                  disabled={loading || !!socialLoading}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '6px 36px 6px 12px',
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
                    right: '12px',
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
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} color='hsl(var(--muted-foreground))' /> : <Eye size={16} color='hsl(var(--muted-foreground))' />}
                </button>
                {errors.confirmPassword ? (
                  <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px', fontFamily: FONT_STACK }}>{errors.confirmPassword.message}</p>
                ) : (touchedFields.confirmPassword && passwordValue !== confirmPasswordValue) ? (
                  <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px', fontFamily: FONT_STACK }}>Passwords don't match</p>
                ) : null}
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

              {/* Login Button */}
              <div className="login-con" style={{ marginTop: '10px' }}>
                <button
                  type="submit"
                  id="submit_button"
                  className="btn btn-primary btn-main"
                  disabled={loading || !!socialLoading}
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
                    cursor: loading || !!socialLoading ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    fontFamily: 'sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: loading ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && !socialLoading) e.currentTarget.style.backgroundColor = '#727271';
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && !socialLoading) e.currentTarget.style.backgroundColor = '#29A4FF';
                  }}
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>

              {/* Sign in Link */}
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '12px', color: '#888', fontFamily: FONT_STACK }}>
                  Already have an account?{' '}
                </span>
                <a
                  href="/login"
                  style={{
                    fontSize: '12px',
                    color: '#29A4FF',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontFamily: FONT_STACK,
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#1a7fd4')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#29A4FF')}
                >
                  Sign in
                </a>
              </div>

              {/* Divider */}
              <div
                className="OR_separator"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  margin: '10% 0 0% 0',
                  fontFamily: FONT_STACK,
                }}
              >
                <span className="OR_left-line" style={{ flexGrow: 1, height: '1px', backgroundColor: 'hsl(var(--border))' }}></span>
                <span className="OR_or-text" style={{ margin: '0 5px', color: 'hsl(var(--muted-foreground))', fontSize: '12px', fontFamily: FONT_STACK }}>OR</span>
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
                  }}
                >
                  {/* Google */}
                  <button
                    type="button"
                    title="Sign in with Google"
                    disabled={!!socialLoading || loading}
                    onClick={() => handleSocialSignIn('google', 'Google')}
                    style={{
                      flex: 1,
                      height: '36px',
                      backgroundColor: socialLoading === 'google' ? 'hsl(var(--accent))' : 'hsl(var(--card))',
                      border: socialLoading === 'google' ? '1px solid #4285F4' : '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: socialLoading || loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.1s ease',
                      outline: 'none',
                      opacity: socialLoading && socialLoading !== 'google' ? 0.45 : 1,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      transform: 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!socialLoading && !loading) {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
                        e.currentTarget.style.borderColor = '#4285F4';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(66, 133, 244, 0.22)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!socialLoading && !loading) {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--card))';
                        e.currentTarget.style.borderColor = 'hsl(var(--border))';
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!socialLoading && !loading) e.currentTarget.style.transform = 'scale(0.93)';
                    }}
                    onMouseUp={(e) => {
                      if (!socialLoading && !loading) e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {socialLoading === 'google' ? <Loader2 size={16} className="animate-spin text-[#4285F4]" /> : <GoogleIcon size={18} />}
                  </button>

                  {/* Microsoft */}
                  <button
                    type="button"
                    title="Sign in with Microsoft"
                    disabled={!!socialLoading || loading}
                    onClick={() => handleSocialSignIn('microsoft', 'Microsoft')}
                    style={{
                      flex: 1,
                      height: '36px',
                      backgroundColor: socialLoading === 'microsoft' ? 'hsl(var(--accent))' : 'hsl(var(--card))',
                      border: socialLoading === 'microsoft' ? '1px solid #05A6F0' : '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: socialLoading || loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.1s ease',
                      outline: 'none',
                      opacity: socialLoading && socialLoading !== 'microsoft' ? 0.45 : 1,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      transform: 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!socialLoading && !loading) {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
                        e.currentTarget.style.borderColor = '#05A6F0';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(5, 166, 240, 0.22)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!socialLoading && !loading) {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--card))';
                        e.currentTarget.style.borderColor = 'hsl(var(--border))';
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!socialLoading && !loading) e.currentTarget.style.transform = 'scale(0.93)';
                    }}
                    onMouseUp={(e) => {
                      if (!socialLoading && !loading) e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {socialLoading === 'microsoft' ? <Loader2 size={16} className="animate-spin text-[#05A6F0]" /> : <MicrosoftIcon size={17} />}
                  </button>

                  {/* Apple */}
                  <button
                    type="button"
                    title="Sign in with Apple"
                    disabled={!!socialLoading || loading}
                    onClick={() => handleSocialSignIn('apple', 'Apple')}
                    style={{
                      flex: 1,
                      height: '36px',
                      backgroundColor: socialLoading === 'apple' ? 'hsl(var(--accent))' : 'hsl(var(--card))',
                      border: socialLoading === 'apple' ? '1px solid hsl(var(--foreground))' : '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: socialLoading || loading ? 'not-allowed' : 'pointer',
                      color: 'hsl(var(--foreground))',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.1s ease',
                      outline: 'none',
                      opacity: socialLoading && socialLoading !== 'apple' ? 0.45 : 1,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      transform: 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!socialLoading && !loading) {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
                        e.currentTarget.style.borderColor = 'hsl(var(--foreground))';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.18)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!socialLoading && !loading) {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--card))';
                        e.currentTarget.style.borderColor = 'hsl(var(--border))';
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!socialLoading && !loading) e.currentTarget.style.transform = 'scale(0.93)';
                    }}
                    onMouseUp={(e) => {
                      if (!socialLoading && !loading) e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {socialLoading === 'apple' ? <Loader2 size={16} className="animate-spin text-foreground" /> : <AppleIcon size={18} />}
                  </button>

                  {/* GitHub */}
                  <button
                    type="button"
                    title="Sign in with GitHub"
                    disabled={!!socialLoading || loading}
                    onClick={() => handleSocialSignIn('github', 'GitHub')}
                    style={{
                      flex: 1,
                      height: '36px',
                      backgroundColor: socialLoading === 'github' ? 'hsl(var(--accent))' : 'hsl(var(--card))',
                      border: socialLoading === 'github' ? '1px solid hsl(var(--foreground))' : '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: socialLoading || loading ? 'not-allowed' : 'pointer',
                      color: 'hsl(var(--foreground))',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.1s ease',
                      outline: 'none',
                      opacity: socialLoading && socialLoading !== 'github' ? 0.45 : 1,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      transform: 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!socialLoading && !loading) {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
                        e.currentTarget.style.borderColor = 'hsl(var(--foreground))';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.18)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!socialLoading && !loading) {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--card))';
                        e.currentTarget.style.borderColor = 'hsl(var(--border))';
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!socialLoading && !loading) e.currentTarget.style.transform = 'scale(0.93)';
                    }}
                    onMouseUp={(e) => {
                      if (!socialLoading && !loading) e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {socialLoading === 'github' ? <Loader2 size={16} className="animate-spin text-[#24292e]" /> : <GitHubIcon size={18} />}
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    title="Sign in with Facebook"
                    disabled={!!socialLoading || loading}
                    onClick={() => handleSocialSignIn('facebook', 'Facebook')}
                    style={{
                      flex: 1,
                      height: '36px',
                      backgroundColor: socialLoading === 'facebook' ? 'hsl(var(--accent))' : 'hsl(var(--card))',
                      border: socialLoading === 'facebook' ? '1px solid #1877F2' : '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: socialLoading || loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.1s ease',
                      outline: 'none',
                      opacity: socialLoading && socialLoading !== 'facebook' ? 0.45 : 1,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      transform: 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!socialLoading && !loading) {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
                        e.currentTarget.style.borderColor = '#1877F2';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(24, 119, 242, 0.22)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!socialLoading && !loading) {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--card))';
                        e.currentTarget.style.borderColor = 'hsl(var(--border))';
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!socialLoading && !loading) e.currentTarget.style.transform = 'scale(0.93)';
                    }}
                    onMouseUp={(e) => {
                      if (!socialLoading && !loading) e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {socialLoading === 'facebook' ? <Loader2 size={16} className="animate-spin text-[#1877F2]" /> : <FacebookIcon size={18} />}
                  </button>

                  {/* X (Twitter) */}
                  <button
                    type="button"
                    title="Sign in with X"
                    disabled={!!socialLoading || loading}
                    onClick={() => handleSocialSignIn('x', 'X')}
                    style={{
                      flex: 1,
                      height: '36px',
                      backgroundColor: socialLoading === 'x' ? 'hsl(var(--accent))' : 'hsl(var(--card))',
                      border: socialLoading === 'x' ? '1px solid hsl(var(--foreground))' : '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: socialLoading || loading ? 'not-allowed' : 'pointer',
                      color: 'hsl(var(--foreground))',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.1s ease',
                      outline: 'none',
                      opacity: socialLoading && socialLoading !== 'x' ? 0.45 : 1,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      transform: 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!socialLoading && !loading) {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
                        e.currentTarget.style.borderColor = 'hsl(var(--foreground))';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.18)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!socialLoading && !loading) {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--card))';
                        e.currentTarget.style.borderColor = 'hsl(var(--border))';
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!socialLoading && !loading) e.currentTarget.style.transform = 'scale(0.93)';
                    }}
                    onMouseUp={(e) => {
                      if (!socialLoading && !loading) e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {socialLoading === 'x' ? <Loader2 size={16} className="animate-spin text-foreground" /> : <XIcon size={16} />}
                  </button>
                </div>
              </div>
            </form>

          {/* .application-container with direct Google Play Store, Apple App Store, and Microsoft Store links */}
          <div className="application-container" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
              <div style={{ fontSize: '11px', color: '#888888', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: FONT_STACK }}>
                Get Mobile & Desktop App
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
                <a
                  href="https://play.google.com/store/apps/details?id=com.uffizio.trakzee&hl=en_IN"
                  target="_blank"
                  rel="noreferrer"
                  title="Google Play Store"
                  style={{ flex: 1, textDecoration: 'none' }}
                >
                  <img src={appAssets.storeBadges.googlePlay} alt="Google Play Store" style={{ width: '100%', height: '30px', objectFit: 'contain' }} />
                </a>
                <a
                  href="https://apps.apple.com/in/app/trakzee/id1396516275"
                  target="_blank"
                  rel="noreferrer"
                  title="Apple App Store"
                  style={{ flex: 1, textDecoration: 'none' }}
                >
                  <img src={appAssets.storeBadges.appStore} alt="Apple App Store" style={{ width: '100%', height: '30px', objectFit: 'contain' }} />
                </a>
                <a
                  href="https://apps.microsoft.com/store"
                  target="_blank"
                  rel="noreferrer"
                  title="Microsoft Store"
                  style={{ flex: 1, textDecoration: 'none' }}
                >
                  <img src={appAssets.storeBadges.microsoftStore} alt="Microsoft Store" style={{ width: '100%', height: '30px', objectFit: 'contain' }} />
                </a>
              </div>
            </div>
        </div>

      </div>
    </div>
  );
}


