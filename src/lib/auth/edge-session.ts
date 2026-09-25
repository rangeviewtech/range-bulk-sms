import { jwtVerify } from 'jose';

export interface EdgeSessionPayload {
  sessionId: string;
  userId: string;
  mfaVerified: boolean;
  rememberMe: boolean;
  roles?: string[];
  expiresAt: string;
  idleExpiresAt: string | null;
  screenLocked?: boolean;
}

/**
 * Lightweight, Edge-runtime compatible session verifier.
 * Verifies JWT signature and expiry using the Web Crypto API via 'jose'.
 * Does not import Prisma or database drivers.
 */
export async function verifyEdgeSession(token?: string | null): Promise<EdgeSessionPayload | null> {
  if (!token) return null;
  const secretKey = process.env.AUTH_SECRET;
  if (!secretKey || secretKey.length < 32) return null;

  try {
    const key = new TextEncoder().encode(secretKey);
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    const session = payload as unknown as EdgeSessionPayload;
    if (!session || !session.sessionId || !session.userId || !session.expiresAt) {
      return null;
    }

    const expiresAtMs = new Date(session.expiresAt).getTime();
    if (Date.now() >= expiresAtMs) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
