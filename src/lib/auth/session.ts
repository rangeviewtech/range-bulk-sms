import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { logAudit } from '@/lib/security/audit';

function getSecretKey(): Uint8Array {
  const secretKey = process.env.AUTH_SECRET;
  if (!secretKey || secretKey.length < 32) {
    throw new Error('AUTH_SECRET must contain at least 32 characters.');
  }
  return new TextEncoder().encode(secretKey);
}

// ============================================================================
// SESSION CONSTANTS & TIMING POLICY
// ============================================================================
export const REMEMBER_ME_DURATION_DAYS = 30;
export const REMEMBER_ME_DURATION_MS = REMEMBER_ME_DURATION_DAYS * 24 * 60 * 60 * 1000; // 30 days
export const SESSION_BOUNDED_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours absolute max for non-remembered
export const IDLE_TIMEOUT_MINUTES = 15;
export const IDLE_TIMEOUT_MS = IDLE_TIMEOUT_MINUTES * 60 * 1000; // 15 minutes idle expiration
export const PREAUTH_MFA_DURATION_MS = 10 * 60 * 1000; // 10 minutes pre-auth temporary session
export const ACTIVITY_THROTTLE_MS = 45 * 1000; // 45 seconds DB write throttling

export interface SessionJwtPayload {
  sessionId: string;
  userId: string;
  mfaVerified: boolean;
  rememberMe: boolean;
  roles?: string[];
  expiresAt: string;
  idleExpiresAt: string | null;
  screenLocked?: boolean;
}

export async function encrypt(payload: Record<string, unknown>, expiration?: string) {
  const jwt = new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt();

  if (expiration) {
    jwt.setExpirationTime(expiration);
  } else {
    jwt.setExpirationTime('35d'); // Generous JWT envelope, strict expiration checked in payload
  }

  return await jwt.sign(getSecretKey());
}

export async function decrypt(input: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(input, getSecretKey(), {
      algorithms: ['HS256'],
    });
    return payload as Record<string, unknown>;
  } catch (_e) {
    return null;
  }
}

/**
 * Creates a new authoritative database session and sets an encrypted, HttpOnly session cookie.
 * 
 * - If rememberMe is true:
 *   - Absolute expiration: 30 days from now
 *   - Idle timeout: null (persistent)
 *   - Cookie: maxAge of 30 days
 * - If rememberMe is false:
 *   - Absolute expiration: 24 hours from now
 *   - Idle timeout: 15 minutes from now
 *   - Cookie: session-scoped or bounded
 */
export async function createSession(
  userId: string,
  mfaVerified: boolean = true,
  rememberMe: boolean = false
) {
  const now = Date.now();
  const isRemembered = mfaVerified ? Boolean(rememberMe) : false;

  let expiresAt: Date;
  let idleExpiresAt: Date | null = null;

  if (!mfaVerified) {
    // Temporary pre-auth session for 2FA challenge
    expiresAt = new Date(now + PREAUTH_MFA_DURATION_MS);
    idleExpiresAt = null;
  } else if (isRemembered) {
    // Persistent 30-day session
    expiresAt = new Date(now + REMEMBER_ME_DURATION_MS);
    idleExpiresAt = null;
  } else {
    // Standard non-remembered session: 24h absolute, 15m idle timeout
    expiresAt = new Date(now + SESSION_BOUNDED_DURATION_MS);
    idleExpiresAt = new Date(now + IDLE_TIMEOUT_MS);
  }

  const headersList = await import('next/headers').then((m) => m.headers()).catch(() => null);
  const userAgent = (headersList?.get('user-agent') || 'Unknown Device').substring(0, 250);
  const ipAddress = (
    headersList?.get('x-forwarded-for')?.split(',')[0].trim() ||
    headersList?.get('x-real-ip') ||
    '127.0.0.1'
  ).substring(0, 45);

  const { evaluateDeviceRecognition } = await import('@/lib/auth/device');
  if (mfaVerified) {
    await evaluateDeviceRecognition(userId, userAgent, ipAddress).catch((err) => {
      console.error('Failed to evaluate device recognition:', err);
    });
  }

  // Destroy previous session for this browser client (rotation)
  await destroySession();

  const session = await prisma.session.create({
    data: {
      userId,
      token: crypto.randomUUID(),
      expiresAt,
      lastActivityAt: new Date(now),
      idleExpiresAt,
      rememberMe: isRemembered,
      mfaVerified,
      deviceInfo: userAgent,
      ipAddress,
    },
  });

  // Fetch user roles for edge-level routing
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  }).catch(() => []);
  const roles = userRoles.map((ur) => ur.role.name);

  const payload: SessionJwtPayload = {
    sessionId: session.id,
    userId: session.userId,
    mfaVerified,
    rememberMe: isRemembered,
    roles,
    expiresAt: expiresAt.toISOString(),
    idleExpiresAt: idleExpiresAt ? idleExpiresAt.toISOString() : null,
  };

  const encryptedSessionData = await encrypt(payload as unknown as Record<string, unknown>);

  const cookieStore = await cookies();
  cookieStore.set('session', encryptedSessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    ...(isRemembered ? { maxAge: Math.floor(REMEMBER_ME_DURATION_MS / 1000) } : {}),
    sameSite: 'lax',
    path: '/',
  });

  if (mfaVerified) {
    await logAudit({
      userId,
      action: 'SESSION_CREATED',
      resourceType: 'Session',
      resourceId: session.id,
      category: 'SECURITY',
      metadata: {
        rememberMe: isRemembered,
        expiresAt: expiresAt.toISOString(),
        idleExpiresAt: idleExpiresAt ? idleExpiresAt.toISOString() : null,
      },
    }).catch(() => {});
  }

  return {
    sessionId: session.id,
    expiresAt,
    idleExpiresAt,
    rememberMe: isRemembered,
  };
}

/**
 * Verifies the current session against both the signed JWT cookie and the authoritative database record.
 * Automatically enforces:
 * 1. Absolute expiration
 * 2. 15-minute idle timeout (for non-remembered sessions)
 * 3. Session revocation checks
 * 4. Active user status
 */
export async function verifySession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const sessionData = cookie ? await decrypt(cookie).catch(() => null) : null;

  if (!sessionData || typeof sessionData.sessionId !== 'string') {
    return null;
  }

  const now = new Date();

  // Authoritative DB verification
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
              role: true,
            },
          },
        },
      },
    },
  });

  if (!session || session.user.status !== 'ACTIVE' || sessionData.userId !== session.userId) {
    return null;
  }

  // Check if session has been revoked
  if (Boolean(session.revokedAt)) {
    await destroySession();
    return null;
  }

  // Check absolute expiration
  if (session.expiresAt <= now) {
    try {
      await prisma.session.update({
        where: { id: session.id },
        data: {
          revokedAt: now,
          revocationReason: 'ABSOLUTE_EXPIRATION',
        },
      });
    } catch (_e) {}

    await logAudit({
      userId: session.userId,
      action: 'SESSION_EXPIRED',
      resourceType: 'Session',
      resourceId: session.id,
      category: 'SECURITY',
      metadata: { reason: 'ABSOLUTE_EXPIRATION' },
    }).catch(() => {});

    await destroySession();
    return null;
  }

  // Check idle expiration for non-remembered sessions
  if (!session.rememberMe && session.idleExpiresAt && session.idleExpiresAt <= now) {
    try {
      await prisma.session.update({
        where: { id: session.id },
        data: {
          revokedAt: now,
          revocationReason: 'IDLE_TIMEOUT',
        },
      });
    } catch (_e) {}

    await logAudit({
      userId: session.userId,
      action: 'SESSION_IDLE_EXPIRED',
      resourceType: 'Session',
      resourceId: session.id,
      category: 'SECURITY',
      metadata: {
        idleExpiresAt: session.idleExpiresAt.toISOString(),
        lastActivityAt: session.lastActivityAt.toISOString(),
      },
    }).catch(() => {});

    await destroySession();
    return null;
  }

  const screenLocked =
    sessionData.screenLocked === true || cookieStore.get('screen_locked')?.value === 'true';

  return {
    isAuth: true,
    sessionId: session.id,
    userId: session.userId,
    user: session.user,
    mfaVerified: session.mfaVerified || sessionData.mfaVerified === true,
    rememberMe: session.rememberMe,
    expiresAt: session.expiresAt,
    idleExpiresAt: session.idleExpiresAt,
    lastActivityAt: session.lastActivityAt,
    screenLocked,
  };
}

/**
 * Records user activity to extend the 15-minute idle timeout for non-remembered sessions.
 * Throttled to prevent database contention on high-frequency UI events.
 * 
 * Never extends past the absolute session expiration (expiresAt).
 * Remember Me sessions are persistent and do not require idle activity updates.
 */
export async function recordSessionActivity(sessionId: string): Promise<boolean> {
  if (!sessionId) return false;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      userId: true,
      rememberMe: true,
      expiresAt: true,
      idleExpiresAt: true,
      lastActivityAt: true,
      revokedAt: true,
      mfaVerified: true,
    },
  });

  if (!session || Boolean(session.revokedAt)) {
    return false;
  }

  // Persistent 30-day sessions don't need idle extension
  if (session.rememberMe) {
    return true;
  }

  const now = new Date();

  // If already expired, cannot extend
  if (session.expiresAt <= now) {
    return false;
  }

  if (session.idleExpiresAt && session.idleExpiresAt <= now) {
    await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: now, revocationReason: 'IDLE_TIMEOUT' },
    }).catch(() => {});
    return false;
  }

  // Throttling: If last activity was recorded less than ACTIVITY_THROTTLE_MS ago, skip DB write
  const elapsedSinceLastActivity = now.getTime() - session.lastActivityAt.getTime();
  if (elapsedSinceLastActivity < ACTIVITY_THROTTLE_MS) {
    return true;
  }

  // Calculate new idle expiration (15 minutes from now), capped at absolute session expiration
  const proposedIdle = new Date(now.getTime() + IDLE_TIMEOUT_MS);
  const cappedIdle = proposedIdle > session.expiresAt ? session.expiresAt : proposedIdle;

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      lastActivityAt: now,
      idleExpiresAt: cappedIdle,
    },
  });

  // Also update cookie payload so edge proxy has fresh idle timestamp without DB roundtrip
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get('session')?.value;
    if (cookie) {
      const payload = await decrypt(cookie);
      if (payload) {
        const updatedPayload = {
          ...payload,
          idleExpiresAt: cappedIdle.toISOString(),
        };
        const updatedEncrypted = await encrypt(updatedPayload);
        cookieStore.set('session', updatedEncrypted, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          expires: session.expiresAt,
          sameSite: 'lax',
          path: '/',
        });
      }
    }
  } catch (_cookieErr) {
    // If running in a context where cookies cannot be mutated, ignore
  }

  return true;
}

export async function requireAuth() {
  const session = await verifySession();
  if (!session) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }
  if (!session.mfaVerified) {
    throw new AppError('Complete two-factor verification.', 403, 'MFA_REQUIRED');
  }
  if (session.screenLocked) {
    throw new AppError('Unlock your session.', 403, 'SCREEN_LOCKED');
  }
  return session;
}

/**
 * Destroys the current browser session and revokes the database record.
 */
export async function destroySession() {
  const cookieStore = await cookies().catch(() => null);
  const cookie = cookieStore?.get?.('session')?.value;

  if (cookie) {
    const sessionData = await decrypt(cookie).catch(() => null);
    if (sessionData && typeof sessionData.sessionId === 'string') {
      const now = new Date();
      try {
        await prisma.session.updateMany({
          where: { id: sessionData.sessionId, revokedAt: null },
          data: {
            revokedAt: now,
            revocationReason: 'USER_LOGOUT',
          },
        });
      } catch (_e) {}

      if (typeof sessionData.userId === 'string') {
        await logAudit({
          userId: sessionData.userId,
          action: 'LOGOUT',
          resourceType: 'Session',
          resourceId: sessionData.sessionId,
          category: 'SECURITY',
        }).catch(() => {});
      }
    }
  }

  cookieStore?.delete?.('session');
  cookieStore?.delete?.('screen_locked');
}

/**
 * Revokes a specific session by ID.
 */
export async function revokeSession(sessionId: string, reason: string = 'ADMIN_REVOCATION') {
  const now = new Date();
  const session = await prisma.session.update({
    where: { id: sessionId },
    data: {
      revokedAt: now,
      revocationReason: reason,
    },
  });

  await logAudit({
    userId: session.userId,
    action: 'SESSION_REVOKED',
    resourceType: 'Session',
    resourceId: sessionId,
    category: 'SECURITY',
    metadata: { reason },
  }).catch(() => {});

  return session;
}

/**
 * Revokes all active sessions for a user (e.g. on password reset or account compromise).
 */
export async function revokeAllUserSessions(userId: string, reason: string = 'SECURITY_RESET') {
  const now = new Date();
  const result = await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: {
      revokedAt: now,
      revocationReason: reason,
    },
  });

  await logAudit({
    userId,
    action: 'SESSION_REVOKED',
    resourceType: 'User',
    resourceId: userId,
    category: 'SECURITY',
    metadata: { reason, count: result.count },
  }).catch(() => {});

  return result.count;
}

export async function setScreenLocked(locked: boolean) {
  const store = await cookies();
  const value = store.get('session')?.value;
  const payload = value ? await decrypt(value) : null;
  if (!payload || typeof payload.expiresAt !== 'string') {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }
  store.set('session', await encrypt({ ...payload, screenLocked: locked }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(payload.expiresAt),
  });
  store.delete('screen_locked');
}
