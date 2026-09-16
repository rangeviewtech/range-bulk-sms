import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';

const secretKey = process.env.AUTH_SECRET;
if (!secretKey || secretKey.length < 32) {
  throw new Error('AUTH_SECRET must contain at least 32 characters.');
}
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function decrypt(input: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as Record<string, unknown>;
  } catch (_e) {
    return null;
  }
}

export async function createSession(userId: string, mfaVerified: boolean = true) {
  const expiresAt = new Date(Date.now() + (mfaVerified ? 7 * 24 * 60 : 10) * 60 * 1000);

  const headersList = await import('next/headers').then((m) => m.headers());
  const userAgent = (headersList.get('user-agent') || 'Unknown Device').substring(0, 250);
  const ipAddress = (
    headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
    headersList.get('x-real-ip') ||
    '127.0.0.1'
  ).substring(0, 45);

  const currentCookie = (await cookies()).get('session')?.value;
  const currentPayload = currentCookie ? await decrypt(currentCookie) : null;
  const currentId =
    typeof currentPayload?.sessionId === 'string' ? currentPayload.sessionId : undefined;
  const { detectNewDevice } = await import('@/lib/auth/device');
  if (mfaVerified)
    await detectNewDevice(userId, userAgent, ipAddress, currentId).catch(console.error);

  // Rotate only this browser's session, including the temporary MFA session.
  await destroySession();

  const session = await prisma.session.create({
    data: {
      userId,
      token: crypto.randomUUID(),
      expiresAt,
      deviceInfo: userAgent.substring(0, 250),
      ipAddress: ipAddress.substring(0, 45),
    },
  });

  const encryptedSessionData = await encrypt({
    sessionId: session.id,
    userId: session.userId,
    mfaVerified,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set('session', encryptedSessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const sessionData = cookie ? await decrypt(cookie).catch(() => null) : null;

  if (!sessionData || typeof sessionData.sessionId !== 'string') {
    return null;
  }

  // Also verify against the database
  const session = await prisma.session.findUnique({
    where: { id: sessionData.sessionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
          mfaEnabled: true,
          roles: {
            include: {
              role: true
            }
          }
        },
      },
    },
  });

  if (
    !session ||
    session.expiresAt <= new Date() ||
    session.user.status !== 'ACTIVE' ||
    sessionData.userId !== session.userId
  ) {
    return null;
  }

  // Check screen lock from cookie
  const screenLocked =
    sessionData.screenLocked === true || cookieStore.get('screen_locked')?.value === 'true';

  return {
    isAuth: true,
    userId: session.userId,
    user: session.user,
    mfaVerified: sessionData.mfaVerified === true,
    screenLocked,
  };
}

export async function requireAuth() {
  const session = await verifySession();
  if (!session) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }
  if (!session.mfaVerified)
    throw new AppError('Complete two-factor verification.', 403, 'MFA_REQUIRED');
  if (session.screenLocked) throw new AppError('Unlock your session.', 403, 'SCREEN_LOCKED');
  return session;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  if (cookie) {
    const sessionData = await decrypt(cookie).catch(() => null);
    if (sessionData && typeof sessionData.sessionId === 'string') {
      await prisma.session.deleteMany({ where: { id: sessionData.sessionId } });
    }
  }
  cookieStore.delete('session');
  cookieStore.delete('screen_locked');
}

export async function setScreenLocked(locked: boolean) {
  const store = await cookies();
  const value = store.get('session')?.value;
  const payload = value ? await decrypt(value) : null;
  if (!payload || typeof payload.expiresAt !== 'string')
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  store.set('session', await encrypt({ ...payload, screenLocked: locked }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(payload.expiresAt),
  });
  store.delete('screen_locked');
}
