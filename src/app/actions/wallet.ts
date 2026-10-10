'use server';

import { getAuthUser } from '@/lib/dal';
import { prisma } from '@/lib/prisma';

export async function getAvailableAuthMethods() {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Refetch user to get the latest MFA settings (since session might be stale)
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      passwordHash: true,
      mfaEnabled: true,
      screenLockPin: true,
      telegramChatId: true,
    }
  });

  if (!dbUser) {
    throw new Error('User not found');
  }

  const methods = [];

  // If password exists, they can use it
  if (dbUser.passwordHash) {
    methods.push({ id: 'password', label: 'Password' });
  }

  // If MFA is enabled, they can use OTP
  if (dbUser.mfaEnabled) {
    methods.push({ id: 'otp', label: 'Authenticator App' });
  }

  // If a screen lock PIN is set
  if (dbUser.screenLockPin) {
    methods.push({ id: 'pin', label: 'Security PIN' });
  }

  // If Telegram is linked, they can use a code sent via Telegram
  if (dbUser.telegramChatId) {
    methods.push({ id: 'telegram', label: 'Telegram Code' });
  }

  // Fallback if somehow they have nothing (OAuth users without password)
  if (methods.length === 0) {
    methods.push({ id: 'password', label: 'Account Login' });
  }

  return methods;
}

export async function verifyWalletUnmask(method: string, code: string) {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      passwordHash: true,
      mfaSecret: true,
      screenLockPin: true,
      telegramChatId: true,
    }
  });

  if (!dbUser) {
    return { success: false, error: 'User not found' };
  }

  if (!code || code.length < 4) {
    return { success: false, error: 'Invalid code or password' };
  }

  try {
    if (method === 'password') {
      const { verifyPassword } = await import('@/lib/auth/password');
      if (!dbUser.passwordHash) return { success: false, error: 'Password not set' };
      const isValid = await verifyPassword(code, dbUser.passwordHash);
      if (!isValid) return { success: false, error: 'Incorrect password' };
    } else if (method === 'pin') {
      const { verifyPassword } = await import('@/lib/auth/password');
      if (!dbUser.screenLockPin) return { success: false, error: 'PIN not set' };
      const isValid = await verifyPassword(code, dbUser.screenLockPin);
      if (!isValid) return { success: false, error: 'Incorrect PIN' };
    } else if (method === 'otp') {
      const { verifyMfaToken } = await import('@/lib/auth/mfa');
      if (!dbUser.mfaSecret) return { success: false, error: 'MFA not configured' };
      const isValid = await verifyMfaToken(code, dbUser.mfaSecret);
      if (!isValid) return { success: false, error: 'Incorrect authenticator code' };
    } else if (method === 'telegram') {
      const { OtpService } = await import('@/lib/auth/otp');
      if (!dbUser.telegramChatId) return { success: false, error: 'Telegram not linked' };
      const result = await OtpService.verifyOtp(dbUser.telegramChatId, 'WALLET_UNMASK', code, user.id);
      if (!result.valid) return { success: false, error: result.error || 'Invalid or expired code' };
    } else {
      return { success: false, error: 'Unknown verification method' };
    }
  } catch (error) {
    console.error('Wallet unmask verification error:', error);
    return { success: false, error: 'Verification failed' };
  }

  return { success: true };
}
