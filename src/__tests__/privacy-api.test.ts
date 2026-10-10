// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  verifyAuthenticatedSession: vi.fn(),
  hasPermission: vi.fn(),
  transaction: vi.fn(),
  auditCreate: vi.fn(),
  contactUpdateMany: vi.fn(),
  auditFindMany: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  verifyAuthenticatedSession: mocks.verifyAuthenticatedSession,
}));

vi.mock('@/lib/auth/authorization', () => ({
  hasPermission: mocks.hasPermission,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: mocks.transaction,
    auditLog: { findMany: mocks.auditFindMany },
  },
}));

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/user/privacy/route';

const activeSession = {
  userId: 'user-1',
  user: { email: 'owner@example.com' },
  mfaVerified: true,
  screenLocked: false,
};

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/user/privacy', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('privacy request API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyAuthenticatedSession.mockResolvedValue(activeSession);
    mocks.hasPermission.mockResolvedValue(false);
    mocks.auditCreate.mockResolvedValue({ id: 'audit-1' });
    mocks.contactUpdateMany.mockResolvedValue({ count: 0 });
    mocks.auditFindMany.mockResolvedValue([]);
    mocks.transaction.mockImplementation(async (callback) =>
      callback({
        auditLog: { create: mocks.auditCreate },
        contact: { updateMany: mocks.contactUpdateMany },
      })
    );
  });

  it('requires a complete signed-in session to submit a privacy request', async () => {
    mocks.verifyAuthenticatedSession.mockResolvedValue(null);

    const response = await POST(makeRequest({ requestType: 'EXPORT_DATA', reason: 'Please export my data' }));

    expect(response.status).toBe(401);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('rejects a request for an email other than the signed-in account', async () => {
    const response = await POST(makeRequest({
      requestType: 'REVOKE_ALL_CONSENT',
      reason: 'Please stop messages',
      contactEmail: 'other@example.com',
    }));

    expect(response.status).toBe(403);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('records consent revocation and updates only the signed-in user contacts atomically', async () => {
    const response = await POST(makeRequest({
      requestType: 'REVOKE_ALL_CONSENT',
      reason: 'Please stop messages',
      contactEmail: 'OWNER@example.com',
    }));

    expect(response.status).toBe(200);
    expect(mocks.transaction).toHaveBeenCalledOnce();
    expect(mocks.auditCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ actorId: 'user-1', resourceId: 'owner@example.com' }),
    }));
    expect(mocks.contactUpdateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: { optedOut: true, consentGiven: false },
    });
  });

  it('requires a fully authenticated session to read privacy requests', async () => {
    mocks.verifyAuthenticatedSession.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mocks.auditFindMany).not.toHaveBeenCalled();
  });
});
