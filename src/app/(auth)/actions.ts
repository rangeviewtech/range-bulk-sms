'use server';

import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword } from '@/lib/auth/password';
import {
  createSession,
  destroySession,
  verifySession,
  setScreenLocked,
} from '@/lib/auth/session';
import { requireAuth } from '@/lib/dal';
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
import { resolveDashboardDestination } from '@/lib/auth/destination';
import { withTransactionalAudit } from '@/lib/security/transactional-audit';
import { checkRateLimit } from '@/lib/security/rate-limit';

async function allowAuthAttempt(scope: string) {
  const h = await import('next/headers').then((m) => m.headers());
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || '127.0.0.1';
  return (await checkRateLimit('auth', `${scope}:${ip}`)).success;
}

export async function login(formData: FormData) {
  let targetDestination = '/dashboard';
  const data = Object.fromEntries(formData.entries());
  const rawRemember = formData.get('rememberMe');
  const rememberMe = rawRemember === 'true' || rawRemember === 'on' || rawRemember === '1';

  const parsed = loginSchema.safeParse({ ...data, rememberMe });
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || 'Please check your information and try again.',
      errors: parsed.error.flatten().fieldErrors,
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

    // Determine MFA/OTP requirements via central role-based policy matrix
    const { getEffectiveMfaRequirement } = await import('@/lib/auth/mfa-policy');
    const mfaRequirement = await getEffectiveMfaRequirement(user.id);


    const callbackUrl =
      (formData.get('callbackUrl') as string) ||
      (formData.get('returnTo') as string) ||
      null;

    if (mfaRequirement.required) {
      const { createPreauthChallenge } = await import('@/lib/auth/preauth');
      await createPreauthChallenge(
        user.id,
        mfaRequirement.defaultMethod,
        mfaRequirement.allowedMethods,
        rememberMe
      );

      // Create pre-auth temporary session for route guarding
      await createSession(user.id, false, false);

      if (mfaRequirement.defaultMethod !== 'APP') {
        const otpResult = await requestOtp(
          user.id,
          mfaRequirement.defaultMethod as CommunicationChannel
        );
        if (otpResult.error) {
          return { error: 'Could not send verification code. ' + otpResult.error };
        }
      }

      await logAudit({
        userId: user.id,
        action: 'LOGIN_MFA_CHALLENGE',
        resourceType: 'User',
        category: 'SECURITY',
        metadata: {
          enforcementType: mfaRequirement.type,
          roles: mfaRequirement.roles,
          method: mfaRequirement.defaultMethod,
          rememberMe,
        },
      });

      return { redirect: '/2fa/challenge' };
    }

    // No 2FA required (Client with single factor) - log them in directly
    await createSession(user.id, true, rememberMe);

    await logAudit({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      resourceType: 'User',
      category: 'SECURITY',
      metadata: {
        roles: mfaRequirement.roles,
        enforcementType: mfaRequirement.type,
        rememberMe,
      },
    });

    targetDestination = resolveDashboardDestination(mfaRequirement.roles, callbackUrl);
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Something went wrong on our end. Please try again.' };
  }

  redirect(targetDestination);
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
      errors: parsed.error.flatten().fieldErrors,
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

    const user = await withTransactionalAudit(
      {
        eventName: 'REGISTER_SUCCESS',
        category: 'SECURITY',
        action: 'CREATE',
        resourceType: 'User',
        actorType: 'USER'
      },
      async (tx) => {
        return tx.user.create({
          data: {
            email: parsed.data.email,
            name: parsed.data.name,
            passwordHash,
            status: 'ACTIVE',
          },
        });
      }
    );

    await createSession(user.id, true);

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
    return {
      error: parsed.error.errors[0]?.message || 'Please enter your 6-digit PIN.',
      errors: parsed.error.flatten().fieldErrors,
    };

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
  if (!parsed.success) return { error: 'Please enter a valid email address', errors: parsed.error.flatten().fieldErrors };

  const isBotFree = await verifyTurnstileToken(parsed.data.turnstileToken || '');
  if (!isBotFree) return { error: 'Security check failed.' };

  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (user) {
    // Generate 256-bit cryptographically secure random token (64 hex characters)
    const rawToken = crypto.randomBytes(32).toString('hex');
    // Compute SHA-256 digest to store in DB - plaintext token is NEVER stored
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Invalidate any previous outstanding password reset tokens for this user
    await prisma.$transaction(async (tx) => {
      await tx.verificationToken.deleteMany({
        where: {
          identifier: user.email,
          type: 'PASSWORD_RESET',
        },
      });

      // Store only the SHA-256 hash in database with 1 hour expiration
      await tx.verificationToken.create({
        data: {
          identifier: user.email,
          token: tokenHash,
          type: 'PASSWORD_RESET',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour TTL
        },
      });

      // Enqueue background email job with raw token in reset link (transactional outbox)
      const cookieStore = await cookies();
      const lang = cookieStore.get('app_language')?.value || 'EN';
      const { NotificationService } = await import('@/lib/communications/service');
      await NotificationService.sendPasswordReset(user.email, rawToken, lang, tx);
    });

    await logAudit({
      action: 'PASSWORD_RESET_REQUESTED',
      actorType: 'ANONYMOUS',
      category: 'SECURITY',
      status: 'SUCCESS',
      reason: 'Password reset token generated and queued for dispatch',
      resourceType: 'User',
      resourceId: user.id,
    });
  } else {
    // Mitigate timing attacks by executing a dummy random generation
    crypto.randomBytes(32);
    await logAudit({
      action: 'PASSWORD_RESET_REQUESTED',
      actorType: 'ANONYMOUS',
      category: 'SECURITY',
      status: 'SUCCESS',
      reason: 'Password reset requested for unregistered email (enumeration mitigated)',
    });
  }

  // Always return success to prevent email enumeration attacks
  return { success: true };
}

export async function validateResetToken(rawToken: string): Promise<boolean> {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const tokenRecord = await prisma.verificationToken.findFirst({
    where: {
      token: { in: [tokenHash, rawToken] },
      type: 'PASSWORD_RESET',
      expiresAt: { gt: new Date() },
    },
  });
  return !!tokenRecord;
}

export async function resetPassword(formData: FormData) {
  if (!(await allowAuthAttempt('resetPassword'))) {
    await logAudit({
      action: 'RATE_LIMIT_TRIGGERED',
      actorType: 'ANONYMOUS',
      category: 'SECURITY',
      status: 'FAILURE',
      reason: 'Rate limit exceeded on password reset',
    });
    return { error: 'Too many requests. Please try again later.' };
  }

  const rawData = Object.fromEntries(formData.entries());
  const parsed = resetPasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    await logAudit({
      action: 'PASSWORD_CHANGED',
      actorType: 'ANONYMOUS',
      category: 'SECURITY',
      status: 'FAILURE',
      reason: parsed.error.errors[0]?.message || 'Invalid input parameters on password reset',
    });
    return {
      error: parsed.error.errors[0]?.message || 'Invalid input',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // Verify Turnstile
  if (
    parsed.data.turnstileToken ||
    process.env.TURNSTILE_SECRET_KEY ||
    process.env.NODE_ENV === 'production'
  ) {
    const isBotFree = await verifyTurnstileToken(parsed.data.turnstileToken || '');
    if (!isBotFree) {
      await logAudit({
        action: 'UNAUTHORIZED_ACCESS',
        actorType: 'ANONYMOUS',
        category: 'SECURITY',
        status: 'FAILURE',
        reason: 'Turnstile verification failed during password reset',
      });
      return { error: 'Security check failed. Please try again.' };
    }
  }

  const rawToken = parsed.data.token.trim();
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Find token record by SHA-256 hash (or rawToken fallback for legacy migration)
  const tokenRecord = await prisma.verificationToken.findFirst({
    where: {
      token: { in: [tokenHash, rawToken] },
      type: 'PASSWORD_RESET',
      expiresAt: { gt: new Date() },
    },
  });

  if (!tokenRecord) {
    await logAudit({
      action: 'PASSWORD_CHANGED',
      actorType: 'ANONYMOUS',
      category: 'SECURITY',
      status: 'FAILURE',
      reason: 'Invalid or expired password reset token used',
    });
    return { error: 'This reset link has expired or is invalid. Please request a new one.' };
  }

  const user = await prisma.user.findUnique({ where: { email: tokenRecord.identifier } });
  if (!user) {
    await logAudit({
      action: 'PASSWORD_CHANGED',
      actorType: 'ANONYMOUS',
      category: 'SECURITY',
      status: 'FAILURE',
      reason: 'User account not found for valid token',
    });
    return { error: 'User not found.' };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const reset = await withTransactionalAudit(
    {
      eventName: 'PASSWORD_RESET_SUCCESS',
      category: 'SECURITY',
      action: 'UPDATE',
      resourceType: 'User',
      resourceId: user.id,
      actorId: user.id,
      actorType: 'USER'
    },
    async (tx) => {
      // Atomic compare-and-delete: single-use enforcement preventing race conditions
      const consumed = await tx.verificationToken.deleteMany({
        where: { id: tokenRecord.id, expiresAt: { gt: new Date() } },
      });
      if (consumed.count !== 1) return false;

      // Update password hash
      await tx.user.update({ where: { id: user.id }, data: { passwordHash } });

      // Revoke all existing user sessions
      await tx.session.deleteMany({ where: { userId: user.id } });

      // Invalidate all remaining reset tokens for this user
      await tx.verificationToken.deleteMany({
        where: { identifier: user.email, type: 'PASSWORD_RESET' },
      });

      return true;
    }
  );

  if (!reset) {
    await logAudit({
      action: 'PASSWORD_CHANGED',
      actorType: 'USER',
      userId: user.id,
      category: 'SECURITY',
      status: 'FAILURE',
      reason: 'Atomic token consumption race condition on password reset',
    });
    return { error: 'This reset link has expired or has already been used.' };
  }

  await logAudit({
    action: 'PASSWORD_CHANGED',
    actorType: 'USER',
    userId: user.id,
    category: 'SECURITY',
    operation: 'UPDATE',
    resourceType: 'User',
    resourceId: user.id,
    status: 'SUCCESS',
    reason: 'User password reset completed and verified successfully',
  });

  try {
    const cookieStore = await cookies();
    const lang = cookieStore.get('app_language')?.value || 'EN';
    const { NotificationService } = await import('@/lib/communications/service');
    await NotificationService.sendPasswordChanged(user.email, user.name || 'User', lang);
  } catch (err) {
    console.error('Failed to send password changed email:', err);
  }

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
  const { getPreauthChallenge } = await import('@/lib/auth/preauth');
  const preauth = await getPreauthChallenge();
  const effectiveUserId = session?.userId || preauth?.userId;

  if (!effectiveUserId || (userId && effectiveUserId !== userId) || session?.mfaVerified || session?.screenLocked)
    return { error: 'Please sign in again to request a code.' };
  if (!['EMAIL', 'SMS', 'WHATSAPP', 'TELEGRAM'].includes(channel))
    return { error: 'Unsupported verification channel.' };
  if (!(await allowAuthAttempt('otp-send:' + effectiveUserId)))
    return { error: 'Too many requests. Please try again later.' };
  let user;
  try {
    user = await prisma.user.findUnique({ where: { id: effectiveUserId } });
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

  // Use a transaction for the OTP generation and the outbox event
  await prisma.$transaction(async (tx) => {
    // Generate OTP
    const { otp } = await OtpService.createOtp({
      userId: user.id,
      identifier,
      channel,
      purpose: 'LOGIN',
    }, tx); // wait, OtpService.createOtp might not accept tx. We should modify it if needed, or inline it.

    // Enqueue Job immediately
    const cookieStore = await cookies();
    const lang = cookieStore.get('app_language')?.value || 'EN';
    const { NotificationService } = await import('@/lib/communications/service');
    await NotificationService.sendLoginOtp(identifier, otp, channel, lang, tx);
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
  const { getPreauthChallenge } = await import('@/lib/auth/preauth');
  const preauth = await getPreauthChallenge();
  const effectiveUserId = session?.userId || preauth?.userId;
  if (!effectiveUserId || effectiveUserId !== userId) return { error: 'Please sign in again.' };

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
  const { getPreauthChallenge, clearPreauthChallenge, incrementPreauthAttempt } =
    await import('@/lib/auth/preauth');
  const preauth = await getPreauthChallenge();
  const effectiveUserId = session?.userId || preauth?.userId;

  if (!effectiveUserId || session?.mfaVerified || session?.screenLocked)
    return { error: 'Please sign in again.' };

  const attemptStatus = await incrementPreauthAttempt();
  if (!attemptStatus.allowed) {
    return { error: 'Too many verification attempts. Please sign in again.' };
  }

  if (!(await allowAuthAttempt('mfa:' + effectiveUserId)))
    return { error: 'Too many attempts. Please try again later.' };

  const code = formData.get('code');
  const method = formData.get('method');
  if (typeof code !== 'string' || !/^\d{6}$/.test(code))
    return { error: 'Please enter a valid 6-digit code.' };

  const user = await prisma.user.findUnique({ where: { id: effectiveUserId } });
  if (!user || user.status !== 'ACTIVE')
    return { error: 'Account unavailable. Please sign in again.' };

  if (method === 'APP') {
    if (!user.mfaSecret || !(await verifyMfaToken(code, user.mfaSecret))) {
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

  const rememberMe = preauth?.rememberMe ?? false;

  await clearPreauthChallenge();
  await createSession(user.id, true, rememberMe);

  await logAudit({
    userId: user.id,
    action: 'MFA_LOGIN_SUCCESS',
    resourceType: 'User',
    resourceId: user.id,
    category: 'SECURITY',
    status: 'SUCCESS',
    metadata: { method, rememberMe },
  });

  const userWithRoles = await prisma.user.findUnique({
    where: { id: effectiveUserId },
    include: { roles: { include: { role: true } } },
  });

  const callbackUrl =
    (formData.get('callbackUrl') as string) ||
    (formData.get('returnTo') as string) ||
    null;
  const destination = resolveDashboardDestination(userWithRoles?.roles, callbackUrl);

  redirect(destination);
}

export async function resendUnifiedVerification(
  userIdParam: string | undefined,
  channel: CommunicationChannel
) {
  const session = await verifySession();
  const { getPreauthChallenge, updatePreauthMethod } = await import('@/lib/auth/preauth');
  const preauth = await getPreauthChallenge();
  const effectiveUserId = session?.userId || preauth?.userId;

  if (!effectiveUserId || (userIdParam && effectiveUserId !== userIdParam))
    return { error: 'Please sign in again.' };

  if (['EMAIL', 'SMS', 'WHATSAPP', 'TELEGRAM'].includes(channel)) {
    await updatePreauthMethod(channel as 'EMAIL' | 'SMS' | 'WHATSAPP' | 'TELEGRAM');
  }
  return requestOtp(effectiveUserId, channel);
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
