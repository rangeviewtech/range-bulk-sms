'use server';

import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword } from '@/lib/auth/password';
import {
  createSession,
  destroySession,
  verifySession,
  requireAuth,
  setScreenLocked,
} from '@/lib/auth/session';
import { verifyTurnstileToken } from '@/lib/auth/turnstile';
import { verifyMfaToken } from '@/lib/auth/mfa';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  pinSchema,
} from '@/lib/validations/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { logAudit } from '@/lib/security/audit';
import { checkRateLimit } from '@/lib/security/rate-limit';

async function allowAuthAttempt(scope: string) {
  const h = await import('next/headers').then((m) => m.headers());
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || '127.0.0.1';
  return (await checkRateLimit('auth', `${scope}:${ip}`)).success;
}

export async function login(formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || 'Please check your information and try again.',
    };
  }

  // Rate Limiting
  const { checkRateLimit } = await import('@/lib/security/rate-limit');
  const headersList = await import('next/headers').then((m) => m.headers());
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const rl = await checkRateLimit('auth', ip);

  if (!rl.success) {
    return { error: 'Too many login attempts. Please try again in 15 minutes.' };
  }

  // Verify Turnstile
  if (
    parsed.data.turnstileToken ||
    process.env.TURNSTILE_SECRET_KEY ||
    process.env.NODE_ENV === 'production'
  ) {
    const isBotFree = await verifyTurnstileToken(parsed.data.turnstileToken || '');
    if (!isBotFree) {
      return { error: 'Security check failed. Please refresh and try again.' };
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user || !user.passwordHash) {
      return { error: 'Invalid email or password. Please try again.' };
    }

    if (user.status !== 'ACTIVE') {
      return { error: 'Your account is inactive. Please contact support.' };
    }

    const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!isValid) {
      return { error: 'Invalid email or password. Please try again.' };
    }

    const { needsRehash } = await import('@/lib/auth/password');
    if (needsRehash(user.passwordHash)) {
      const newHash = await hashPassword(parsed.data.password);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
    }

    // Determine MFA/OTP requirements
    if (user.mfaEnabled || user.phone || user.telegramChatId) {
      await createSession(user.id, false);

      let channel = 'APP';
      if (user.mfaEnabled) {
        channel = 'APP';
      } else if (user.telegramChatId) {
        channel = 'TELEGRAM';
      } else if (user.whatsappConsent) {
        channel = 'WHATSAPP';
      } else if (user.phone) {
        channel = 'SMS';
      }

      if (channel !== 'APP') {
        const otpResult = await requestOtp(user.id, channel as CommunicationChannel);
        if (otpResult.error) {
          return { error: 'Could not send verification code. ' + otpResult.error };
        }
      }

      await logAudit({
        userId: user.id,
        action: 'LOGIN_MFA_CHALLENGE',
        resourceType: 'User',
        category: 'SECURITY',
      });
      return { redirect: `/2fa/challenge?userId=${user.id}&channel=${channel}` };
    }

    // No 2FA/OTP configured - log them in directly
    await createSession(user.id, true);

    await logAudit({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      resourceType: 'User',
      category: 'SECURITY',
    });
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Something went wrong on our end. Please try again.' };
  }

  redirect('/dashboard');
}

export async function register(formData: FormData) {
  if (!(await allowAuthAttempt('register')))
    return { error: 'Too many requests. Please try again later.' };
  const data = Object.fromEntries(formData.entries());
  const acceptTerms = data.acceptTerms === 'true' || data.acceptTerms === 'on';

  const parsed = registerSchema.safeParse({ ...data, acceptTerms });
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || 'Please check your information and try again.',
    };
  }

  // Verify Turnstile
  const isBotFree = await verifyTurnstileToken(parsed.data.turnstileToken || '');
  if (!isBotFree) {
    return { error: 'Security check failed. Please refresh and try again.' };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return { error: 'An account with this email address already exists.' };
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash,
        status: 'ACTIVE',
      },
    });

    await createSession(user.id, true);

    await logAudit({
      userId: user.id,
      action: 'REGISTER_SUCCESS',
      resourceType: 'User',
      category: 'SECURITY',
    });

    const { NotificationService } = await import('@/lib/communications/service');
    await NotificationService.dispatch({
      recipient: user.email,
      channel: 'EMAIL',
      template: 'auth.welcome',
      payload: { name: user.name || 'User' },
      priority: 'NORMAL',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Something went wrong on our end. Please try again.' };
  }

  redirect('/dashboard');
}

export async function verifyMfaChallenge(formData: FormData) {
  const input = new FormData();
  const token = formData.get('token');
  if (typeof token === 'string') input.set('code', token);
  input.set('method', 'APP');
  return verifyUnifiedVerification(input);
}

export async function unlockScreen(formData: FormData) {
  const session = await verifySession();
  if (!session || !session.mfaVerified)
    return { error: 'Your session has expired. Please sign in again.' };
  if (!(await allowAuthAttempt('unlock:' + session.userId)))
    return { error: 'Too many attempts. Please try again later.' };

  const parsed = pinSchema.safeParse({
    pin: formData.get('pin'),
    turnstileToken: formData.get('turnstileToken') || undefined,
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message || 'Please enter your 6-digit PIN.' };

  if (
    parsed.data.turnstileToken ||
    process.env.TURNSTILE_SECRET_KEY ||
    process.env.NODE_ENV === 'production'
  ) {
    const isBotFree = await verifyTurnstileToken(parsed.data.turnstileToken || '');
    if (!isBotFree) return { error: 'Security check failed. Please refresh and try again.' };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.screenLockPin) return { error: 'No PIN is configured for this account.' };

  const isValid = await verifyPassword(parsed.data.pin, user.screenLockPin);
  if (!isValid) return { error: 'Incorrect PIN. Please try again.' };

  await setScreenLocked(false);

  redirect('/dashboard');
}

export async function forgotPassword(formData: FormData) {
  if (!(await allowAuthAttempt('forgotPassword')))
    return { error: 'Too many requests. Please try again later.' };
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: 'Invalid input' };

  const isBotFree = await verifyTurnstileToken(parsed.data.turnstileToken || '');
  if (!isBotFree) return { error: 'Security check failed.' };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (user) {
    // Generate token
    const token = crypto.randomUUID();
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: token,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      },
    });

    // Enqueue background email job
    const cookieStore = await cookies();
    const lang = cookieStore.get('app_language')?.value || 'EN';
    const { NotificationService } = await import('@/lib/communications/service');
    await NotificationService.sendPasswordReset(user.email, token, lang);
  }

  // Always return success to prevent email enumeration attacks
  return { success: true };
}

export async function resetPassword(formData: FormData) {
  if (!(await allowAuthAttempt('resetPassword')))
    return { error: 'Too many requests. Please try again later.' };
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || 'Invalid input' };

  // Verify Turnstile
  if (
    parsed.data.turnstileToken ||
    process.env.TURNSTILE_SECRET_KEY ||
    process.env.NODE_ENV === 'production'
  ) {
    const isBotFree = await verifyTurnstileToken(parsed.data.turnstileToken || '');
    if (!isBotFree) return { error: 'Security check failed. Please try again.' };
  }

  const tokenRecord = await prisma.verificationToken.findFirst({
    where: {
      token: parsed.data.token,
      type: 'PASSWORD_RESET',
      expiresAt: { gt: new Date() },
    },
  });

  if (!tokenRecord) {
    return { error: 'This reset link has expired or is invalid. Please request a new one.' };
  }

  const user = await prisma.user.findUnique({ where: { email: tokenRecord.identifier } });
  if (!user) return { error: 'User not found.' };

  const passwordHash = await hashPassword(parsed.data.password);

  const reset = await prisma.$transaction(async (tx) => {
    const consumed = await tx.verificationToken.deleteMany({
      where: { id: tokenRecord.id, expiresAt: { gt: new Date() } },
    });
    if (consumed.count !== 1) return false;
    await tx.user.update({ where: { id: user.id }, data: { passwordHash } });
    await tx.session.deleteMany({ where: { userId: user.id } });
    await tx.verificationToken.deleteMany({
      where: { identifier: user.email, type: 'PASSWORD_RESET' },
    });
    return true;
  });
  if (!reset) return { error: 'This reset link has expired or has already been used.' };

  await logAudit({
    userId: user.id,
    action: 'PASSWORD_RESET_SUCCESS',
    resourceType: 'User',
    category: 'SECURITY',
  });

  return { success: true };
}

export async function logout() {
  await destroySession();
  redirect('/login');
}

export async function socialLogin(
  _provider: 'google' | 'microsoft' | 'apple' | 'github' | 'facebook' | 'x'
) {
  return {
    success: false,
    error: 'Social sign-in is not configured. Please sign in with your email and password.',
  };
}

import { OtpService } from '@/lib/auth/otp';
import { CommunicationChannel } from '@/generated/prisma';

export async function requestOtp(userId: string, channel: CommunicationChannel) {
  const session = await verifySession();
  if (!session || session.userId !== userId || session.mfaVerified || session.screenLocked)
    return { error: 'Please sign in again to request a code.' };
  if (session.user.mfaEnabled) return { error: 'Use your configured authenticator app.' };
  if (!['EMAIL', 'SMS', 'WHATSAPP', 'TELEGRAM'].includes(channel))
    return { error: 'Unsupported verification channel.' };
  if (!(await allowAuthAttempt('otp-send:' + userId)))
    return { error: 'Too many requests. Please try again later.' };
  let user;
  try {
    user = await prisma.user.findUnique({ where: { id: userId } });
  } catch (_error) {
    return { error: 'Invalid User ID format' };
  }
  if (!user || user.status !== 'ACTIVE') return { error: 'Account unavailable' };
  if (channel === 'WHATSAPP' && !user.whatsappConsent)
    return { error: 'WhatsApp is not enabled for this account.' };

  let identifier = '';
  if (channel === 'EMAIL') identifier = user.email;
  if (channel === 'SMS' || channel === 'WHATSAPP') {
    if (!user.phone) return { error: 'Phone number not configured' };
    identifier = user.phone;
  }
  if (channel === 'TELEGRAM') {
    if (!user.telegramChatId) return { error: 'Telegram not linked' };
    identifier = user.telegramChatId;
  }

  // Generate OTP
  const { otp, otpId } = await OtpService.createOtp({
    userId: user.id,
    identifier,
    channel,
    purpose: 'LOGIN',
  });

  // Enqueue Job immediately
  const cookieStore = await cookies();
  const lang = cookieStore.get('app_language')?.value || 'EN';
  const { NotificationService } = await import('@/lib/communications/service');
  await NotificationService.dispatch({
    recipient: identifier,
    channel,
    template: 'auth.login_otp',
    payload: { otp, lang, locale: lang },
    priority: 'CRITICAL',
    idempotencyKey: `login_otp_${otpId}`,
  });

  return { success: true };
}

export async function verifyLoginOtp(
  userId: string,
  channel: CommunicationChannel,
  code: string,
  turnstileToken?: string
) {
  const session = await verifySession();
  if (!session || session.userId !== userId) return { error: 'Please sign in again.' };
  const formData = new FormData();
  formData.set('code', code);
  formData.set('method', channel);
  if (turnstileToken) formData.set('turnstileToken', turnstileToken);
  return verifyUnifiedVerification(formData);
}

export async function generateTelegramLinkingToken() {
  const session = await requireAuth();
  if (!session || !session.userId) return { error: 'Unauthorized' };

  const token = crypto.randomUUID();

  await prisma.telegramLinkingToken.create({
    data: {
      userId: session.userId,
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    },
  });

  return {
    token,
    url: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME || 'bot'}?start=${token}`,
  };
}

export async function verifyUnifiedVerification(formData: FormData) {
  const session = await verifySession();
  if (!session || session.mfaVerified || session.screenLocked)
    return { error: 'Please sign in again.' };
  if (!(await allowAuthAttempt('mfa:' + session.userId)))
    return { error: 'Too many attempts. Please try again later.' };
  const code = formData.get('code');
  const method = formData.get('method');
  if (typeof code !== 'string' || !/^\d{6}$/.test(code))
    return { error: 'Please enter a valid 6-digit code.' };
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.status !== 'ACTIVE')
    return { error: 'Account unavailable. Please sign in again.' };

  if (user.mfaEnabled) {
    if (method !== 'APP' || !user.mfaSecret || !(await verifyMfaToken(code, user.mfaSecret))) {
      return { error: 'Incorrect authenticator code. Please check your app and try again.' };
    }
  } else {
    let identifier: string | null = null;
    if (method === 'EMAIL') identifier = user.email;
    if (method === 'SMS') identifier = user.phone;
    if (method === 'WHATSAPP' && user.whatsappConsent) identifier = user.phone;
    if (method === 'TELEGRAM') identifier = user.telegramChatId;
    if (!identifier) return { error: 'This verification method is not configured.' };
    const result = await OtpService.verifyOtp(identifier, 'LOGIN', code, user.id);
    if (!result.valid) return { error: result.error || 'Invalid or expired code.' };
  }
  await createSession(user.id, true);
  await logAudit({
    userId: user.id,
    action: user.mfaEnabled ? 'MFA_LOGIN_SUCCESS' : 'OTP_LOGIN_SUCCESS',
    resourceType: 'User',
    category: 'SECURITY',
  });
  redirect('/dashboard');
}

export async function resendUnifiedVerification(
  userIdParam: string | undefined,
  channel: CommunicationChannel
) {
  const session = await verifySession();
  if (!session || (userIdParam && session.userId !== userIdParam))
    return { error: 'Please sign in again.' };
  return requestOtp(session.userId, channel);
}

export async function lockScreen() {
  const session = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { screenLockPin: true },
  });
  if (!user?.screenLockPin) {
    await destroySession();
    return { redirect: '/login' };
  }
  await setScreenLocked(true);
  return { redirect: '/screen-lock' };
}
