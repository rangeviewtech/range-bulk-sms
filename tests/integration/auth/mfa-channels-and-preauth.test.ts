// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createPreauthChallenge,
  getPreauthChallenge,
  updatePreauthMethod,
  incrementPreauthAttempt,
  PREAUTH_COOKIE_NAME,
} from '@/lib/auth/preauth';

const mockCookieStore = new Map<string, { value: string; options?: Record<string, unknown> }>();

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockImplementation(() =>
    Promise.resolve({
      get: (name: string) => mockCookieStore.get(name),
      set: (name: string, value: string, options: Record<string, unknown>) =>
        mockCookieStore.set(name, { value, options }),
      delete: (name: string) => mockCookieStore.delete(name),
    })
  ),
}));

describe('Pre-Auth Challenge State Machine', () => {
  beforeEach(() => {
    mockCookieStore.clear();
  });

  it('issues an encrypted, signed pre-auth challenge token in an HttpOnly cookie', async () => {
    const token = await createPreauthChallenge('user-mfa-1', 'EMAIL', ['EMAIL', 'TELEGRAM']);

    expect(token).toBeDefined();
    expect(mockCookieStore.has(PREAUTH_COOKIE_NAME)).toBe(true);

    const saved = mockCookieStore.get(PREAUTH_COOKIE_NAME);
    expect(saved?.options.httpOnly).toBe(true);
    expect(saved?.options.sameSite).toBe('lax');
    expect(saved?.options.maxAge).toBe(300); // 5 minutes TTL
  });

  it('verifies and decodes valid pre-auth challenge payload', async () => {
    await createPreauthChallenge('user-mfa-2', 'APP', ['APP', 'SMS']);
    const challenge = await getPreauthChallenge();

    expect(challenge).not.toBeNull();
    expect(challenge?.userId).toBe('user-mfa-2');
    expect(challenge?.selectedMethod).toBe('APP');
    expect(challenge?.allowedMethods).toEqual(['APP', 'SMS']);
    expect(challenge?.attempts).toBe(0);
    expect(challenge?.purpose).toBe('MFA_CHALLENGE');
  });

  it('allows safe method switching among allowed channels without invalidating challenge', async () => {
    await createPreauthChallenge('user-mfa-3', 'EMAIL', ['EMAIL', 'WHATSAPP', 'TELEGRAM']);

    const switched = await updatePreauthMethod('WHATSAPP');
    expect(switched).toBe(true);

    const updated = await getPreauthChallenge();
    expect(updated?.selectedMethod).toBe('WHATSAPP');

    // Attempting to switch to an unallowed method returns false
    const invalidSwitch = await updatePreauthMethod('APP');
    expect(invalidSwitch).toBe(false);
  });

  it('tracks verification attempts and invalidates challenge when max attempts are reached', async () => {
    await createPreauthChallenge('user-mfa-4', 'EMAIL', ['EMAIL']);

    // Attempts 1 to 4 should be allowed
    const a1 = await incrementPreauthAttempt();
    expect(a1.allowed).toBe(true);
    expect(a1.attempts).toBe(1);

    const a2 = await incrementPreauthAttempt();
    expect(a2.allowed).toBe(true);
    expect(a2.attempts).toBe(2);

    await incrementPreauthAttempt(); // 3
    await incrementPreauthAttempt(); // 4

    // 5th attempt reaches max limit and invalidates challenge
    const a5 = await incrementPreauthAttempt();
    expect(a5.allowed).toBe(false);
    expect(mockCookieStore.has(PREAUTH_COOKIE_NAME)).toBe(false);

    // Subsequent retrieval is null
    const after = await getPreauthChallenge();
    expect(after).toBeNull();
  });
});
