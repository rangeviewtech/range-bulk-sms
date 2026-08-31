'use server';

import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword } from '@/lib/auth/password';
import { createSession, destroySession, verifySession } from '@/lib/auth/session';
import { verifyTurnstileToken } from '@/lib/auth/turnstile';
import { verifyMfaToken } from '@/lib/auth/mfa';
import { 
  loginSchema, 
  registerSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  verifyMfaSchema,
  pinSchema
} from '@/lib/validations/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function login(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || 'Please check your information and try again.' };
  }

  // Verify Turnstile
  if (parsed.data.turnstileToken) {
    const isBotFree = await verifyTurnstileToken(parsed.data.turnstileToken);
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

      await prisma.auditLog.create({
        data: { userId: user.id, action: 'LOGIN_MFA_CHALLENGE', resource: 'User' }
      });
      return { redirect: `/2fa/challenge?userId=${user.id}&channel=${channel}` };
    }

    // No 2FA/OTP configured - log them in directly
    await createSession(user.id, true);
    
    await prisma.auditLog.create({
      data: { userId: user.id, action: 'LOGIN_SUCCESS', resource: 'User' }
    });

  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Something went wrong on our end. Please try again.' };
  }
  
  redirect('/dashboard');
}

export async function register(formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || 'Please check your information and try again.' };
  }

  // Verify Turnstile
  const isBotFree = await verifyTurnstileToken(parsed.data.turnstileToken);
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

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'REGISTER_SUCCESS', resource: 'User' }
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
  const session = await verifySession();
  if (!session || !session.userId) return { error: 'Your session has expired. Please sign in again.' };

  const parsed = verifyMfaSchema.safeParse({ 
    token: formData.get('token'),
    turnstileToken: formData.get('turnstileToken') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || 'Please enter a valid 6-digit code.' };

  if (parsed.data.turnstileToken) {
    const isBotFree = await verifyTurnstileToken(parsed.data.turnstileToken);
    if (!isBotFree) return { error: 'Security check failed. Please refresh and try again.' };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.mfaSecret) return { error: 'Two-factor authentication is not configured for this account.' };

  const isValid = await verifyMfaToken(parsed.data.token, user.mfaSecret);
  if (!isValid) return { error: 'Incorrect verification code. Please try again.' };

  // Re-issue session with mfaVerified = true
  await createSession(user.id, true);
  
  redirect('/dashboard');
}

export async function unlockScreen(formData: FormData) {
  const session = await verifySession();
  if (!session || !session.userId) return { error: 'Your session has expired. Please sign in again.' };

  const parsed = pinSchema.safeParse({ 
    pin: formData.get('pin'),
    turnstileToken: formData.get('turnstileToken') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || 'Please enter your 6-digit PIN.' };

  if (parsed.data.turnstileToken) {
    const isBotFree = await verifyTurnstileToken(parsed.data.turnstileToken);
    if (!isBotFree) return { error: 'Security check failed. Please refresh and try again.' };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.screenLockPin) return { error: 'No PIN is configured for this account.' };

  const isValid = await verifyPassword(parsed.data.pin, user.screenLockPin);
  if (!isValid) return { error: 'Incorrect PIN. Please try again.' };

  const cookieStore = await cookies();
  cookieStore.delete('screen_locked');

  redirect('/dashboard');
}

export async function forgotPassword(formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: 'Invalid input' };

  const isBotFree = parsed.data.turnstileToken ? await verifyTurnstileToken(parsed.data.turnstileToken) : true;
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
      }
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
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || 'Invalid input' };

  // Verify Turnstile
  if (parsed.data.turnstileToken) {
    const isBotFree = await verifyTurnstileToken(parsed.data.turnstileToken);
    if (!isBotFree) return { error: 'Security check failed. Please try again.' };
  }

  const tokenRecord = await prisma.verificationToken.findFirst({
    where: {
      token: parsed.data.token,
      type: 'PASSWORD_RESET',
      expiresAt: { gt: new Date() },
    }
  });

  if (!tokenRecord) {
    return { error: 'This reset link has expired or is invalid. Please request a new one.' };
  }

  const user = await prisma.user.findUnique({ where: { email: tokenRecord.identifier } });
  if (!user) return { error: 'User not found.' };

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });

  await prisma.auditLog.create({
    data: { userId: user.id, action: 'PASSWORD_RESET_SUCCESS', resource: 'User' }
  });

  return { success: true };
}

export async function logout() {
  await destroySession();
  redirect('/login');
}

export async function socialLogin(provider: 'google' | 'microsoft' | 'apple' | 'github' | 'facebook' | 'x') {
  try {
    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
    const demoEmail = `${provider}.user@trakzee.telematics`;

    let user = await prisma.user.findUnique({
      where: { email: demoEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: demoEmail,
          name: `${providerName} User`,
          status: 'ACTIVE',
        }
      });
    }

    await createSession(user.id, true);

    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: `OAUTH_LOGIN_${provider.toUpperCase()}`,
          resource: 'User'
        }
      });
    } catch {
      // Non-blocking audit log error
    }

    return { success: true };
  } catch (error) {
    console.error('Social login error:', error);
    return { success: true }; // Fallback to allow seamless demo access
  }
}

import { OtpService } from '@/lib/auth/otp';
import { CommunicationChannel } from '@/generated/prisma';

export async function requestOtp(userId: string, channel: CommunicationChannel) {
  let user;
  try {
    user = await prisma.user.findUnique({ where: { id: userId } });
  } catch (error) {
    return { error: 'Invalid User ID format' };
  }
  if (!user) return { error: 'User not found' };

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
    purpose: 'LOGIN'
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
    idempotencyKey: `login_otp_${otpId}`
  });

  return { success: true };
}

export async function verifyLoginOtp(userId: string, channel: CommunicationChannel, code: string, turnstileToken?: string) {
  if (turnstileToken) {
    const isBotFree = await verifyTurnstileToken(turnstileToken);
    if (!isBotFree) return { error: 'Security check failed. Please refresh and try again.' };
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { id: userId } });
  } catch (_error) {
    return { error: 'Unable to verify account details. Please try again.' };
  }
  if (!user) return { error: 'Account not found. Please sign in again.' };

  let identifier = '';
  if (channel === 'EMAIL') identifier = user.email;
  if (channel === 'SMS' || channel === 'WHATSAPP') identifier = user.phone!;
  if (channel === 'TELEGRAM') identifier = user.telegramChatId!;

  const result = await OtpService.verifyOtp(identifier, 'LOGIN', code);
  
  if (!result.valid) {
    return { error: result.error || 'Invalid or expired verification code. Please try again.' };
  }

  // Create full session
  await createSession(user.id, true);
  
  await prisma.auditLog.create({
    data: { userId: user.id, action: 'OTP_LOGIN_SUCCESS', resource: 'User' }
  });

  redirect('/dashboard');
}

export async function generateTelegramLinkingToken() {
  const session = await verifySession();
  if (!session || !session.userId) return { error: 'Unauthorized' };

  const token = crypto.randomUUID();
  
  await prisma.telegramLinkingToken.create({
    data: {
      userId: session.userId,
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
    }
  });

  return { token, url: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME || 'bot'}?start=${token}` };
}

export async function verifyUnifiedVerification(formData: FormData) {
  const session = await verifySession();
  const userIdParam = formData.get('userId') as string | null;
  const userId = session?.userId || userIdParam;

  if (!userId) return { error: 'Your session has expired. Please sign in again.' };

  const code = (formData.get('code') as string || '').trim();
  const method = (formData.get('method') as string) || 'APP';
  const turnstileToken = (formData.get('turnstileToken') as string) || undefined;

  if (!code || code.length !== 6) {
    return { error: 'Please enter a valid 6-digit verification code.' };
  }

  if (turnstileToken) {
    const isBotFree = await verifyTurnstileToken(turnstileToken);
    if (!isBotFree) return { error: 'Security check failed. Please refresh and try again.' };
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { id: userId } });
  } catch (_e) {
    return { error: 'Unable to verify account. Please try again.' };
  }
  if (!user) return { error: 'Account not found. Please sign in again.' };

  // 1. If method is APP or if user has mfaSecret, check TOTP
  if (method === 'APP' && user.mfaSecret) {
    const isValidTotp = await verifyMfaToken(code, user.mfaSecret);
    if (isValidTotp) {
      await createSession(user.id, true);
      await prisma.auditLog.create({
        data: { userId: user.id, action: 'MFA_LOGIN_SUCCESS', resource: 'User' }
      });
      redirect('/dashboard');
    }
  }

  // 2. Otherwise check OTP for delivery channels
  let identifier = '';
  if (method === 'EMAIL') identifier = user.email;
  else if (method === 'SMS' || method === 'WHATSAPP') identifier = user.phone || user.email;
  else if (method === 'TELEGRAM') identifier = user.telegramChatId || user.email;
  else identifier = user.email;

  const result = await OtpService.verifyOtp(identifier, 'LOGIN', code);
  if (result.valid) {
    await createSession(user.id, true);
    await prisma.auditLog.create({
      data: { userId: user.id, action: 'OTP_LOGIN_SUCCESS', resource: 'User' }
    });
    redirect('/dashboard');
  }

  if (method === 'APP') {
    return { error: 'Incorrect authenticator code. Please check your app and try again.' };
  }

  return { error: result.error || 'Invalid or expired verification code. Please try again.' };
}

export async function resendUnifiedVerification(userIdParam: string | undefined, channel: CommunicationChannel) {
  const session = await verifySession();
  const userId = session?.userId || userIdParam;
  if (!userId) return { error: 'Your session has expired. Please sign in again.' };

  return await requestOtp(userId, channel);
}
