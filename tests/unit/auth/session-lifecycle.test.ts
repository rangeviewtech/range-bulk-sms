// @vitest-environment node
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createSession,
  verifySession,
  recordSessionActivity,
  revokeSession,
  REMEMBER_ME_DURATION_MS,
  IDLE_TIMEOUT_MS,
  SESSION_BOUNDED_DURATION_MS,
} from '@/lib/auth/session';
import { prismaMock } from '../prismaMock';
import { cookies } from 'next/headers';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@/lib/auth/device', () => ({
  evaluateDeviceRecognition: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/security/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
}));

describe('Session Lifecycle & Expiration Policy', () => {
  let cookieStore: Map<string, any>;

  beforeEach(() => {
    vi.clearAllMocks();
    cookieStore = new Map();

    vi.mocked(cookies).mockResolvedValue({
      get: (key: string) => cookieStore.get(key),
      set: (key: string, value: any, options?: any) => {
        cookieStore.set(key, { value, ...options });
      },
      delete: (key: string) => {
        cookieStore.delete(key);
      },
    } as any);

    // Mock prisma userRole lookup
    prismaMock.userRole.findMany.mockResolvedValue([
      { role: { name: 'CLIENT' } } as any,
    ]);
  });

  describe('createSession', () => {
    it('creates a 30-day persistent session when Remember Me is selected', async () => {
      const now = Date.now();
      const mockCreatedSession = {
        id: 'sess-30d',
        userId: 'user-1',
        token: 'token-uuid',
        expiresAt: new Date(now + REMEMBER_ME_DURATION_MS),
        lastActivityAt: new Date(now),
        idleExpiresAt: null,
        rememberMe: true,
        mfaVerified: true,
        deviceInfo: 'Test Device',
        ipAddress: '127.0.0.1',
        createdAt: new Date(now),
        updatedAt: new Date(now),
        revokedAt: null,
        revocationReason: null,
      };

      prismaMock.session.create.mockResolvedValue(mockCreatedSession as any);

      const result = await createSession('user-1', true, true);

      expect(result.rememberMe).toBe(true);
      expect(result.idleExpiresAt).toBeNull();
      // Should expire approximately 30 days from now
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      expect(result.expiresAt.getTime() - now).toBeGreaterThanOrEqual(thirtyDaysMs - 5000);

      // Verify cookie options
      const cookie = cookieStore.get('session');
      expect(cookie).toBeDefined();
      expect(cookie.maxAge).toBe(30 * 24 * 60 * 60);
      expect(cookie.httpOnly).toBe(true);
      expect(cookie.sameSite).toBe('lax');
    });

    it('creates a 15-minute idle timeout session when Remember Me is NOT selected', async () => {
      const now = Date.now();
      const mockCreatedSession = {
        id: 'sess-idle',
        userId: 'user-1',
        token: 'token-uuid',
        expiresAt: new Date(now + SESSION_BOUNDED_DURATION_MS),
        lastActivityAt: new Date(now),
        idleExpiresAt: new Date(now + IDLE_TIMEOUT_MS),
        rememberMe: false,
        mfaVerified: true,
        deviceInfo: 'Test Device',
        ipAddress: '127.0.0.1',
        createdAt: new Date(now),
        updatedAt: new Date(now),
        revokedAt: null,
        revocationReason: null,
      };

      prismaMock.session.create.mockResolvedValue(mockCreatedSession as any);

      const result = await createSession('user-1', true, false);

      expect(result.rememberMe).toBe(false);
      expect(result.idleExpiresAt).toBeDefined();
      expect(result.idleExpiresAt!.getTime() - now).toBeGreaterThanOrEqual(IDLE_TIMEOUT_MS - 5000);
      expect(result.expiresAt.getTime() - now).toBeGreaterThanOrEqual(SESSION_BOUNDED_DURATION_MS - 5000);
    });

    it('creates a temporary 10-minute session when MFA is pending', async () => {
      const now = Date.now();
      const mockCreatedSession = {
        id: 'sess-preauth',
        userId: 'user-1',
        token: 'token-uuid',
        expiresAt: new Date(now + 10 * 60 * 1000),
        lastActivityAt: new Date(now),
        idleExpiresAt: null,
        rememberMe: false,
        mfaVerified: false,
        deviceInfo: 'Test Device',
        ipAddress: '127.0.0.1',
        createdAt: new Date(now),
        updatedAt: new Date(now),
        revokedAt: null,
        revocationReason: null,
      };

      prismaMock.session.create.mockResolvedValue(mockCreatedSession as any);

      const result = await createSession('user-1', false, false);
      expect(result.rememberMe).toBe(false);
      expect(result.idleExpiresAt).toBeNull();
      expect(result.expiresAt.getTime() - now).toBeLessThanOrEqual(10 * 60 * 1000 + 1000);
    });
  });

  describe('verifySession', () => {
    it('allows active persistent sessions even if lastActivityAt is older than 15m', async () => {
      const now = Date.now();
      const mockSession = {
        id: 'sess-persistent',
        userId: 'u1',
        rememberMe: true,
        mfaVerified: true,
        expiresAt: new Date(now + 20 * 24 * 60 * 60 * 1000), // 20 days remaining
        idleExpiresAt: null,
        lastActivityAt: new Date(now - 60 * 60 * 1000), // 1 hour ago
        revokedAt: null,
        revocationReason: null,
        user: {
          id: 'u1',
          name: 'Alice',
          email: 'alice@example.com',
          status: 'ACTIVE',
          createdAt: new Date(),
          mfaEnabled: true,
          roles: [{ role: { name: 'CLIENT' } }],
        },
      };

      prismaMock.session.create.mockResolvedValue(mockSession as any);
      await createSession('u1', true, true);

      prismaMock.session.findUnique.mockResolvedValue(mockSession as any);

      const verified = await verifySession();
      expect(verified).not.toBeNull();
      expect(verified?.isAuth).toBe(true);
      expect(verified?.rememberMe).toBe(true);
    });

    it('rejects and revokes non-remembered sessions when idle timeout has elapsed', async () => {
      const now = Date.now();
      const expiredIdle = new Date(now - 1000); // Expired 1 second ago

      const mockSession = {
        id: 'sess-idle-exp',
        userId: 'u1',
        rememberMe: false,
        mfaVerified: true,
        expiresAt: new Date(now + 20 * 60 * 60 * 1000),
        idleExpiresAt: expiredIdle,
        lastActivityAt: new Date(now - 16 * 60 * 1000),
        revokedAt: null,
        revocationReason: null,
        user: {
          id: 'u1',
          name: 'Bob',
          email: 'bob@example.com',
          status: 'ACTIVE',
          createdAt: new Date(),
          mfaEnabled: false,
          roles: [{ role: { name: 'CLIENT' } }],
        },
      };

      prismaMock.session.create.mockResolvedValue(mockSession as any);
      await createSession('u1', true, false);

      prismaMock.session.findUnique.mockResolvedValue(mockSession as any);
      prismaMock.session.update.mockResolvedValue({ ...mockSession, revokedAt: new Date() } as any);

      const verified = await verifySession();
      expect(verified).toBeNull();

      // Verify session was marked revoked in DB
      expect(prismaMock.session.update).toHaveBeenCalledWith({
        where: { id: 'sess-idle-exp' },
        data: expect.objectContaining({
          revocationReason: 'IDLE_TIMEOUT',
        }),
      });

      // Verify cookie was cleared
      expect(cookieStore.has('session')).toBe(false);
    });

    it('rejects sessions that have been explicitly revoked', async () => {
      const mockSession = {
        id: 'sess-revoked',
        userId: 'u1',
        rememberMe: true,
        mfaVerified: true,
        expiresAt: new Date(Date.now() + 100000),
        idleExpiresAt: null,
        lastActivityAt: new Date(),
        revokedAt: new Date(), // Revoked
        revocationReason: 'USER_LOGOUT',
        user: {
          id: 'u1',
          name: 'Carol',
          email: 'carol@example.com',
          status: 'ACTIVE',
          createdAt: new Date(),
          mfaEnabled: false,
          roles: [],
        },
      };

      prismaMock.session.create.mockResolvedValue(mockSession as any);
      await createSession('u1', true, true);

      prismaMock.session.findUnique.mockResolvedValue(mockSession as any);

      const verified = await verifySession();
      expect(verified).toBeNull();
    });
  });

  describe('recordSessionActivity', () => {
    it('extends idle timeout by 15 minutes for non-remembered sessions', async () => {
      const now = Date.now();
      const mockSession = {
        id: 'sess-active',
        userId: 'u1',
        rememberMe: false,
        expiresAt: new Date(now + 24 * 60 * 60 * 1000),
        idleExpiresAt: new Date(now + 5 * 60 * 1000),
        lastActivityAt: new Date(now - 60 * 1000), // 60s ago (> 45s throttle)
        revokedAt: null,
      };

      prismaMock.session.findUnique.mockResolvedValue(mockSession as any);
      prismaMock.session.update.mockResolvedValue(mockSession as any);

      const success = await recordSessionActivity('sess-active');
      expect(success).toBe(true);

      expect(prismaMock.session.update).toHaveBeenCalledWith({
        where: { id: 'sess-active' },
        data: expect.objectContaining({
          lastActivityAt: expect.any(Date),
          idleExpiresAt: expect.any(Date),
        }),
      });
    });

    it('skips database update when activity is within the 45s throttle window', async () => {
      const now = Date.now();
      const mockSession = {
        id: 'sess-throttled',
        userId: 'u1',
        rememberMe: false,
        expiresAt: new Date(now + 24 * 60 * 60 * 1000),
        idleExpiresAt: new Date(now + 14 * 60 * 1000),
        lastActivityAt: new Date(now - 10 * 1000), // Only 10s ago (< 45s throttle)
        revokedAt: null,
      };

      prismaMock.session.findUnique.mockResolvedValue(mockSession as any);

      const success = await recordSessionActivity('sess-throttled');
      expect(success).toBe(true);

      // Should NOT update DB
      expect(prismaMock.session.update).not.toHaveBeenCalled();
    });

    it('returns true immediately for 30-day persistent sessions without DB write', async () => {
      const mockSession = {
        id: 'sess-perm',
        userId: 'u1',
        rememberMe: true,
        expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        idleExpiresAt: null,
        lastActivityAt: new Date(),
        revokedAt: null,
      };

      prismaMock.session.findUnique.mockResolvedValue(mockSession as any);

      const success = await recordSessionActivity('sess-perm');
      expect(success).toBe(true);
      expect(prismaMock.session.update).not.toHaveBeenCalled();
    });
  });

  describe('revokeSession & destroySession', () => {
    it('marks session as revoked with specified reason', async () => {
      const mockSession = {
        id: 'sess-to-revoke',
        userId: 'u1',
        revokedAt: new Date(),
        revocationReason: 'PASSWORD_RESET',
      };
      prismaMock.session.update.mockResolvedValue(mockSession as any);

      const res = await revokeSession('sess-to-revoke', 'PASSWORD_RESET');
      expect(res.revocationReason).toBe('PASSWORD_RESET');
      expect(prismaMock.session.update).toHaveBeenCalledWith({
        where: { id: 'sess-to-revoke' },
        data: expect.objectContaining({
          revocationReason: 'PASSWORD_RESET',
        }),
      });
    });
  });
});
