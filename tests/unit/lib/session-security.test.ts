// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { encrypt, requireAuth, verifySession } from '@/lib/auth/session';
import { prismaMock } from '../prismaMock';
import { cookies } from 'next/headers';
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

async function session(
  mfaVerified = true,
  screenLocked = false,
  status: 'ACTIVE' | 'SUSPENDED' = 'ACTIVE'
) {
  const jwt = await encrypt({ sessionId: 's1', userId: 'u1', mfaVerified, screenLocked });
  vi.mocked(cookies).mockResolvedValue({
    get: (key: string) => (key === 'session' ? { value: jwt } : undefined),
  } as Awaited<ReturnType<typeof cookies>>);
  prismaMock.session.findUnique.mockResolvedValue({
    id: 's1',
    userId: 'u1',
    token: 'random',
    expiresAt: new Date(Date.now() + 60_000),
    deviceInfo: null,
    ipAddress: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'u1',
      email: 'u@example.com',
      name: 'User',
      status,
      mfaEnabled: true,
      createdAt: new Date(),
    },
  } as never);
}

describe('Server session enforcement', () => {
  it('rejects incomplete MFA', async () => {
    await session(false);
    await expect(requireAuth()).rejects.toMatchObject({ code: 'MFA_REQUIRED' });
  });
  it('rejects a signed screen lock even without the legacy cookie', async () => {
    await session(true, true);
    await expect(requireAuth()).rejects.toMatchObject({ code: 'SCREEN_LOCKED' });
  });
  it('rejects a suspended account', async () => {
    await session(true, false, 'SUSPENDED');
    expect(await verifySession()).toBeNull();
  });
  it('allows a complete active session and queries only safe user fields', async () => {
    await session();
    expect(await requireAuth()).toMatchObject({ userId: 'u1' });
    const query = prismaMock.session.findUnique.mock.calls[0][0];
    expect(query?.include?.user).toEqual({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        mfaEnabled: true,
      },
    });
  });
});
