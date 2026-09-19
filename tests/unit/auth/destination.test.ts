// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  resolveDashboardDestination,
  isSafeReturnUrl,
  getDefaultRoleDashboard,
  extractRoleNames,
} from '@/lib/auth/destination';

describe('Role-Aware Destination & Return-To URL Validation', () => {
  describe('isSafeReturnUrl', () => {
    it('accepts safe, internal relative URLs', () => {
      expect(isSafeReturnUrl('/dashboard')).toBe(true);
      expect(isSafeReturnUrl('/settings/security')).toBe(true);
      expect(isSafeReturnUrl('/wallet/deposit?amount=500')).toBe(true);
      expect(isSafeReturnUrl('/admin/users#details')).toBe(true);
    });

    it('rejects open redirects starting with double slash', () => {
      expect(isSafeReturnUrl('//evil.com')).toBe(false);
      expect(isSafeReturnUrl('//google.com/test')).toBe(false);
    });

    it('rejects external absolute URLs with protocol schemes', () => {
      expect(isSafeReturnUrl('https://evil.com')).toBe(false);
      expect(isSafeReturnUrl('http://attacker.com/dashboard')).toBe(false);
      expect(isSafeReturnUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeReturnUrl('data:text/html,<h1>XSS</h1>')).toBe(false);
    });

    it('rejects backslashes and null bytes', () => {
      expect(isSafeReturnUrl('/\\evil.com')).toBe(false);
      expect(isSafeReturnUrl('/settings\\subpath')).toBe(false);
      expect(isSafeReturnUrl('/path\0null')).toBe(false);
    });

    it('rejects guest-only and auth flow URLs to prevent loops', () => {
      expect(isSafeReturnUrl('/login')).toBe(false);
      expect(isSafeReturnUrl('/login?callbackUrl=/dashboard')).toBe(false);
      expect(isSafeReturnUrl('/register')).toBe(false);
      expect(isSafeReturnUrl('/forgot-password')).toBe(false);
      expect(isSafeReturnUrl('/reset-password')).toBe(false);
      expect(isSafeReturnUrl('/2fa/challenge')).toBe(false);
      expect(isSafeReturnUrl('/screen-lock')).toBe(false);
    });

    it('rejects null, undefined, empty, or non-relative inputs', () => {
      expect(isSafeReturnUrl(null)).toBe(false);
      expect(isSafeReturnUrl(undefined)).toBe(false);
      expect(isSafeReturnUrl('')).toBe(false);
      expect(isSafeReturnUrl('dashboard')).toBe(false);
    });
  });

  describe('extractRoleNames', () => {
    it('handles Prisma UserRole[] objects', () => {
      const prismaRoles = [
        { role: { name: 'ADMIN' } },
        { role: { name: 'CLIENT' } },
      ];
      expect(extractRoleNames(prismaRoles)).toEqual(['ADMIN', 'CLIENT']);
    });

    it('handles plain string arrays and single strings', () => {
      expect(extractRoleNames(['agent', 'client'])).toEqual(['AGENT', 'CLIENT']);
      expect(extractRoleNames('admin')).toEqual(['ADMIN']);
    });

    it('handles null, undefined, or empty arrays', () => {
      expect(extractRoleNames(null)).toEqual([]);
      expect(extractRoleNames(undefined)).toEqual([]);
      expect(extractRoleNames([])).toEqual([]);
    });
  });

  describe('getDefaultRoleDashboard', () => {
    it('routes ADMIN users to /admin/system', () => {
      expect(getDefaultRoleDashboard([{ role: { name: 'ADMIN' } }])).toBe('/admin/system');
      expect(getDefaultRoleDashboard(['ADMIN', 'CLIENT'])).toBe('/admin/system');
    });

    it('routes AGENT users to /agent/dashboard', () => {
      expect(getDefaultRoleDashboard([{ role: { name: 'AGENT' } }])).toBe('/agent/dashboard');
      expect(getDefaultRoleDashboard(['AGENT'])).toBe('/agent/dashboard');
    });

    it('routes CLIENT and standard users to /dashboard', () => {
      expect(getDefaultRoleDashboard([{ role: { name: 'CLIENT' } }])).toBe('/dashboard');
      expect(getDefaultRoleDashboard([{ role: { name: 'USER' } }])).toBe('/dashboard');
      expect(getDefaultRoleDashboard([])).toBe('/dashboard');
      expect(getDefaultRoleDashboard(null)).toBe('/dashboard');
    });
  });

  describe('resolveDashboardDestination', () => {
    it('prioritizes safe returnTo URLs over default dashboards', () => {
      const destination = resolveDashboardDestination(
        [{ role: { name: 'ADMIN' } }],
        '/wallet/transactions'
      );
      expect(destination).toBe('/wallet/transactions');
    });

    it('falls back to role default when returnTo is unsafe or invalid', () => {
      expect(
        resolveDashboardDestination([{ role: { name: 'ADMIN' } }], '//evil.com')
      ).toBe('/admin/system');

      expect(
        resolveDashboardDestination([{ role: { name: 'AGENT' } }], 'https://malicious.site')
      ).toBe('/agent/dashboard');

      expect(
        resolveDashboardDestination([{ role: { name: 'CLIENT' } }], '/login')
      ).toBe('/dashboard');
    });
  });
});
