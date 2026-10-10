/** @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({ session: { findUnique: vi.fn() } }));
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

import { encrypt, verifyRequestSessionToken } from '@/lib/auth/session';

describe('verifyRequestSessionToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_SECRET = 'a'.repeat(64);
  });

  async function token() {
    return encrypt({ sessionId: 'session-1', userId: 'user-1', mfaVerified: true });
  }

  function activeSession(overrides: Record<string, unknown> = {}) {
    return {
      id: 'session-1',
      userId: 'user-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      idleExpiresAt: null,
      rememberMe: true,
      mfaVerified: true,
      user: { status: 'ACTIVE' },
      ...overrides,
    };
  }

  it('accepts a valid, active, MFA-verified session', async () => {
    prismaMock.session.findUnique.mockResolvedValue(activeSession());

    await expect(verifyRequestSessionToken(await token(), undefined)).resolves.toEqual({ userId: 'user-1' });
  });

  it('rejects a session token whose user id does not match its database session', async () => {
    prismaMock.session.findUnique.mockResolvedValue(activeSession({ userId: 'different-user' }));

    await expect(verifyRequestSessionToken(await token(), undefined)).resolves.toMatchObject({ error: 'unauthorized' });
  });

  it('rejects revoked, expired, idle-expired, or inactive-user sessions', async () => {
    const signedToken = await token();
    const invalidSessions = [
      activeSession({ revokedAt: new Date() }),
      activeSession({ expiresAt: new Date(Date.now() - 1) }),
      activeSession({ rememberMe: false, idleExpiresAt: new Date(Date.now() - 1) }),
      activeSession({ user: { status: 'SUSPENDED' } }),
    ];

    for (const session of invalidSessions) {
      prismaMock.session.findUnique.mockResolvedValueOnce(session);
      await expect(verifyRequestSessionToken(signedToken, undefined)).resolves.toMatchObject({ error: 'unauthorized' });
    }
  });

  it('rejects incomplete MFA and both token and cookie screen locks', async () => {
    const signedToken = await token();
    prismaMock.session.findUnique.mockResolvedValueOnce(activeSession({ mfaVerified: false }));
    await expect(verifyRequestSessionToken(signedToken, undefined)).resolves.toMatchObject({ error: 'mfa_required' });

    prismaMock.session.findUnique.mockResolvedValueOnce(activeSession());
    await expect(verifyRequestSessionToken(await encrypt({
      sessionId: 'session-1', userId: 'user-1', screenLocked: true,
    }), undefined)).resolves.toMatchObject({ error: 'screen_locked' });

    prismaMock.session.findUnique.mockResolvedValueOnce(activeSession());
    await expect(verifyRequestSessionToken(signedToken, 'true')).resolves.toMatchObject({ error: 'screen_locked' });
  });
});
