import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { VerificationMethod } from './mfa-policy';

const secretKey = process.env.AUTH_SECRET;
if (!secretKey || secretKey.length < 32) {
  throw new Error('AUTH_SECRET must contain at least 32 characters.');
}
const key = new TextEncoder().encode(secretKey);

export const PREAUTH_COOKIE_NAME = 'range_preauth';
const PREAUTH_TTL_SECONDS = 5 * 60; // 5 minutes

export interface PreauthPayload {
  userId: string;
  selectedMethod: VerificationMethod;
  allowedMethods: VerificationMethod[];
  attempts: number;
  purpose: 'MFA_CHALLENGE';
  expiresAt: string;
  rememberMe?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getCookieStore(): Promise<any> {
  try {
    const c = cookies();
    return c instanceof Promise ? await c : c;
  } catch {
    return null;
  }
}

export async function createPreauthChallenge(
  userId: string,
  selectedMethod: VerificationMethod,
  allowedMethods: VerificationMethod[],
  rememberMe: boolean = false
): Promise<string> {
  const expiresAt = new Date(Date.now() + PREAUTH_TTL_SECONDS * 1000).toISOString();

  const payload: PreauthPayload = {
    userId,
    selectedMethod,
    allowedMethods,
    attempts: 0,
    purpose: 'MFA_CHALLENGE',
    expiresAt,
    rememberMe,
  };

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${PREAUTH_TTL_SECONDS}s`)
    .sign(key);

  const cookieStore = await getCookieStore();
  cookieStore?.set?.(PREAUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: PREAUTH_TTL_SECONDS,
  });

  return token;
}

export async function getPreauthChallenge(): Promise<PreauthPayload | null> {
  const cookieStore = await getCookieStore();
  const token = cookieStore?.get?.(PREAUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    const preauth = payload as unknown as PreauthPayload;
    if (preauth.purpose !== 'MFA_CHALLENGE' || !preauth.userId) {
      return null;
    }

    if (new Date(preauth.expiresAt).getTime() <= Date.now()) {
      await clearPreauthChallenge();
      return null;
    }

    return preauth;
  } catch (_err) {
    return null;
  }
}

export async function updatePreauthMethod(newMethod: VerificationMethod): Promise<boolean> {
  const current = await getPreauthChallenge();
  if (!current) return false;

  if (!current.allowedMethods.includes(newMethod)) {
    return false;
  }

  const updatedPayload: PreauthPayload = {
    ...current,
    selectedMethod: newMethod,
  };

  const remainingSeconds = Math.max(
    30,
    Math.floor((new Date(current.expiresAt).getTime() - Date.now()) / 1000)
  );

  const token = await new SignJWT({ ...updatedPayload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${remainingSeconds}s`)
    .sign(key);

  const cookieStore = await getCookieStore();
  cookieStore?.set?.(PREAUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: remainingSeconds,
  });

  return true;
}

export async function incrementPreauthAttempt(): Promise<{ allowed: boolean; attempts: number }> {
  const current = await getPreauthChallenge();
  if (!current) return { allowed: false, attempts: 5 };

  const attempts = current.attempts + 1;
  const maxAttempts = parseInt(process.env.MFA_MAX_ATTEMPTS || '5', 10);

  if (attempts >= maxAttempts) {
    await clearPreauthChallenge();
    return { allowed: false, attempts };
  }

  const remainingSeconds = Math.max(
    30,
    Math.floor((new Date(current.expiresAt).getTime() - Date.now()) / 1000)
  );

  const updatedPayload: PreauthPayload = {
    ...current,
    attempts,
  };

  const token = await new SignJWT({ ...updatedPayload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${remainingSeconds}s`)
    .sign(key);

  const cookieStore = await getCookieStore();
  cookieStore?.set?.(PREAUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: remainingSeconds,
  });

  return { allowed: true, attempts };
}

export async function clearPreauthChallenge(): Promise<void> {
  const cookieStore = await getCookieStore();
  cookieStore?.delete?.(PREAUTH_COOKIE_NAME);
}
