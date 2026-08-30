import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';

const secretKey = process.env.AUTH_SECRET;
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
  } catch (e) {
    return null;
  }
}

export async function createSession(userId: string, mfaVerified: boolean = true) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const session = await prisma.session.create({
    data: {
      userId,
      token: crypto.randomUUID(),
      expiresAt,
    },
  });

  const encryptedSessionData = await encrypt({ 
    sessionId: session.id,
    userId: session.userId,
    mfaVerified,
    expiresAt 
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
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  
  // Check screen lock from cookie
  const screenLocked = cookieStore.get('screen_locked')?.value === 'true';

  return { 
    isAuth: true, 
    userId: session.userId, 
    user: session.user,
    mfaVerified: sessionData.mfaVerified as boolean,
    screenLocked
  };
}

export async function requireAuth() {
  const session = await verifySession();
  if (!session) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }
  return session;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  if (cookie) {
    const sessionData = await decrypt(cookie).catch(() => null);
    if (sessionData && typeof sessionData.sessionId === 'string') {
      await prisma.session.delete({ where: { id: sessionData.sessionId } }).catch(() => {});
    }
  }
  cookieStore.delete('session');
}
