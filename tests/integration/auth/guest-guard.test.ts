// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';
import { encrypt } from '@/lib/auth/session';

describe('Edge Route Guards & Intelligent Redirects (proxy.ts)', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'a'.repeat(32);
  });

  describe('Guest Route Guarding (/login, /register, /forgot-password)', () => {
    it('allows unauthenticated visitors to view the login page', async () => {
      const req = new NextRequest('http://localhost:3000/login');
      const res = await proxy(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('location')).toBeNull();
    });

    it('redirects authenticated ADMIN away from /login to /admin/system', async () => {
      const token = await encrypt({
        sessionId: 'admin-sess',
        userId: 'admin-1',
        mfaVerified: true,
        rememberMe: true,
        roles: ['ADMIN'],
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        idleExpiresAt: null,
      });

      const req = new NextRequest('http://localhost:3000/login', {
        headers: { Cookie: `session=${token}` },
      });

      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/admin/system');
    });

    it('redirects authenticated AGENT away from /login to /agent/dashboard', async () => {
      const token = await encrypt({
        sessionId: 'agent-sess',
        userId: 'agent-1',
        mfaVerified: true,
        rememberMe: true,
        roles: ['AGENT'],
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        idleExpiresAt: null,
      });

      const req = new NextRequest('http://localhost:3000/login', {
        headers: { Cookie: `session=${token}` },
      });

      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/agent/dashboard');
    });

    it('redirects authenticated CLIENT away from /login to /dashboard', async () => {
      const token = await encrypt({
        sessionId: 'client-sess',
        userId: 'client-1',
        mfaVerified: true,
        rememberMe: true,
        roles: ['CLIENT'],
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        idleExpiresAt: null,
      });

      const req = new NextRequest('http://localhost:3000/login', {
        headers: { Cookie: `session=${token}` },
      });

      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
    });

    it('redirects authenticated user away from /register to dashboard', async () => {
      const token = await encrypt({
        sessionId: 'sess-1',
        userId: 'user-1',
        mfaVerified: true,
        rememberMe: true,
        roles: ['CLIENT'],
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        idleExpiresAt: null,
      });

      const req = new NextRequest('http://localhost:3000/register', {
        headers: { Cookie: `session=${token}` },
      });

      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
    });

    it('honors safe callbackUrl on guest redirect', async () => {
      const token = await encrypt({
        sessionId: 'sess-1',
        userId: 'user-1',
        mfaVerified: true,
        rememberMe: true,
        roles: ['CLIENT'],
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        idleExpiresAt: null,
      });

      const req = new NextRequest('http://localhost:3000/login?callbackUrl=/wallet/transactions', {
        headers: { Cookie: `session=${token}` },
      });

      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/wallet/transactions');
    });

    it('defends against open redirect in callbackUrl and falls back to default dashboard', async () => {
      const token = await encrypt({
        sessionId: 'sess-1',
        userId: 'user-1',
        mfaVerified: true,
        rememberMe: true,
        roles: ['CLIENT'],
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        idleExpiresAt: null,
      });

      const req = new NextRequest('http://localhost:3000/login?callbackUrl=//evil.com/hack', {
        headers: { Cookie: `session=${token}` },
      });

      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
    });
  });

  describe('MFA Challenge Guarding', () => {
    it('redirects users with pending MFA away from /login to /2fa/challenge', async () => {
      const token = await encrypt({
        sessionId: 'preauth-sess',
        userId: 'user-1',
        mfaVerified: false,
        rememberMe: false,
        expiresAt: new Date(Date.now() + 600000).toISOString(),
        idleExpiresAt: null,
      });

      const req = new NextRequest('http://localhost:3000/login', {
        headers: { Cookie: `session=${token}` },
      });

      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/2fa/challenge');
    });

    it('redirects fully verified users away from /2fa/challenge to their dashboard', async () => {
      const token = await encrypt({
        sessionId: 'full-sess',
        userId: 'user-1',
        mfaVerified: true,
        rememberMe: true,
        roles: ['ADMIN'],
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        idleExpiresAt: null,
      });

      const req = new NextRequest('http://localhost:3000/2fa/challenge', {
        headers: { Cookie: `session=${token}` },
      });

      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/admin/system');
    });

    it('redirects unauthenticated users trying to access /2fa/challenge to /login', async () => {
      const req = new NextRequest('http://localhost:3000/2fa/challenge');
      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/login');
    });
  });

  describe('15-Minute Inactivity Idle Expiration Enforcement', () => {
    it('redirects to /login?expired=1 and deletes session cookie when idle timeout has elapsed', async () => {
      const pastIdle = new Date(Date.now() - 5000).toISOString(); // 5 seconds in the past

      const token = await encrypt({
        sessionId: 'idle-expired-sess',
        userId: 'user-1',
        mfaVerified: true,
        rememberMe: false, // Remember me is OFF
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        idleExpiresAt: pastIdle,
      });

      const req = new NextRequest('http://localhost:3000/dashboard', {
        headers: { Cookie: `session=${token}` },
      });

      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/login?expired=1');

      // Cookie should be deleted on response
      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toBeDefined();
      expect(setCookie).toContain('session=;');
    });

    it('allows non-remembered session to proceed when within the 15-minute idle window', async () => {
      const futureIdle = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes in the future

      const token = await encrypt({
        sessionId: 'active-sess',
        userId: 'user-1',
        mfaVerified: true,
        rememberMe: false,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        idleExpiresAt: futureIdle,
      });

      const req = new NextRequest('http://localhost:3000/dashboard', {
        headers: { Cookie: `session=${token}` },
      });

      const res = await proxy(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('location')).toBeNull();
    });
  });
});
