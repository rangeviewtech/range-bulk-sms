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

  // WARNING: This is a placeholder validation for UI demonstration purposes.
  // In a full implementation, you would hash `code` with bcrypt and compare against
  // dbUser.passwordHash or dbUser.screenLockPin, or verify the TOTP code for MFA.
  
  if (!code || code.length < 4) {
    return { success: false, error: 'Invalid code or password' };
  }

  // Simulate a successful check if the input is non-empty
  // (In production, replace with actual bcrypt.compare / TOTP verification)
  return { success: true };
}
