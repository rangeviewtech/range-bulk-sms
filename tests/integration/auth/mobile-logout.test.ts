/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/auth/logout/route';

const { prismaSessionUpdateMany, decryptToken, logAudit } = vi.hoisted(() => ({
  prismaSessionUpdateMany: vi.fn(),
  decryptToken: vi.fn(),
  logAudit: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: { session: { updateMany: prismaSessionUpdateMany } },
}));
vi.mock('@/lib/auth/session', () => ({ decrypt: decryptToken }));
vi.mock('@/lib/security/audit', () => ({ logAudit }));

describe('Mobile session logout API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires a bearer session token', async () => {
    const response = await POST(new NextRequest('http://localhost/api/v1/auth/logout', { method: 'POST' }));

    expect(response.status).toBe(401);
    expect(prismaSessionUpdateMany).not.toHaveBeenCalled();
  });

  it('revokes the signed-in mobile session and records the action', async () => {
    decryptToken.mockResolvedValue({ sessionId: 'session-1', userId: 'user-1' });
    prismaSessionUpdateMany.mockResolvedValue({ count: 1 });
    logAudit.mockResolvedValue(undefined);

    const response = await POST(new NextRequest('http://localhost/api/v1/auth/logout', {
      method: 'POST',
      headers: { authorization: 'Bearer session-token' },
    }));

    expect(response.status).toBe(200);
    expect(prismaSessionUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'session-1', userId: 'user-1', revokedAt: null },
      data: expect.objectContaining({ revocationReason: 'MOBILE_LOGOUT' }),
    }));
    expect(logAudit).toHaveBeenCalled();
  });

  it('treats an already-revoked session as a successful logout', async () => {
    decryptToken.mockResolvedValue({ sessionId: 'session-1', userId: 'user-1' });
    prismaSessionUpdateMany.mockResolvedValue({ count: 0 });

    const response = await POST(new NextRequest('http://localhost/api/v1/auth/logout', {
      method: 'POST',
      headers: { authorization: 'Bearer session-token' },
    }));

    expect(response.status).toBe(200);
    expect(logAudit).not.toHaveBeenCalled();
  });
});
