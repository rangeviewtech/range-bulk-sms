// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  socialLogin,
  requestOtp,
  verifyUnifiedVerification,
  verifyLoginOtp,
} from '@/app/(auth)/actions';
import { verifySession, createSession } from '@/lib/auth/session';
import { prismaMock } from '../prismaMock';
vi.mock('@/lib/auth/session', () => ({
  verifySession: vi.fn(),
  createSession: vi.fn(),
  destroySession: vi.fn(),
  requireAuth: vi.fn(),
  setScreenLocked: vi.fn(),
}));
vi.mock('@/lib/security/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
}));
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(verifySession).mockResolvedValue(null);
});
describe('Authentication boundaries', () => {
  it('never creates a session or demo user for unconfigured OAuth', async () => {
    expect(await socialLogin('google')).toMatchObject({ success: false });
    expect(createSession).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });
  it('rejects an OTP request without a password-authenticated session', async () => {
    expect(await requestOtp('victim', 'EMAIL')).toHaveProperty('error');
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
  it('does not fall back to a user ID supplied in form data', async () => {
    const form = new FormData();
    form.set('userId', 'victim');
    form.set('method', 'APP');
    form.set('code', '123456');
    expect(await verifyUnifiedVerification(form)).toHaveProperty('error');
    expect(createSession).not.toHaveBeenCalled();
  });
  it('rejects the legacy OTP entry point without a matching session', async () => {
    expect(await verifyLoginOtp('victim', 'EMAIL', '123456')).toHaveProperty('error');
    expect(createSession).not.toHaveBeenCalled();
  });
});
