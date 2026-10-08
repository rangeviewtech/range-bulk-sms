import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const sessionMocks = vi.hoisted(() => ({
  decrypt: vi.fn(),
  verifyRequestSessionToken: vi.fn(),
  hasPermission: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  decrypt: sessionMocks.decrypt,
  verifyRequestSessionToken: sessionMocks.verifyRequestSessionToken,
}));
vi.mock('@/lib/auth/authorization', () => ({ hasPermission: sessionMocks.hasPermission }));

import { withApiKey } from '@/lib/api-keys/service';

describe('withApiKey user-session authorization', () => {
  const request = () => new NextRequest('https://api.example.test/api/v1/sms/send', {
    method: 'POST',
    headers: { Authorization: 'Bearer signed-session-token' },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    sessionMocks.decrypt.mockResolvedValue({ sessionId: 'session-1', userId: 'user-1' });
    sessionMocks.verifyRequestSessionToken.mockResolvedValue({ userId: 'user-1' });
    sessionMocks.hasPermission.mockResolvedValue(true);
  });

  it('rejects a session that has not completed MFA', async () => {
    sessionMocks.verifyRequestSessionToken.mockResolvedValue({ userId: '', error: 'mfa_required' });
    const handler = vi.fn();

    const response = await withApiKey(request(), 'sms.send', handler);

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ code: 'MFA_REQUIRED' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('rejects a locked session', async () => {
    sessionMocks.verifyRequestSessionToken.mockResolvedValue({ userId: '', error: 'screen_locked' });
    const handler = vi.fn();

    const response = await withApiKey(request(), 'sms.send', handler);

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ code: 'SCREEN_LOCKED' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('enforces the corresponding server permission for the requested API scope', async () => {
    sessionMocks.hasPermission.mockResolvedValue(false);
    const handler = vi.fn();

    const response = await withApiKey(request(), 'sms.send', handler);

    expect(sessionMocks.hasPermission).toHaveBeenCalledWith('user-1', 'sms.send');
    expect(response.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });

  it('runs the handler only after a valid session and its role permission pass', async () => {
    const handler = vi.fn().mockResolvedValue(new Response('ok'));

    const response = await withApiKey(request(), 'sms.send', handler);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledWith(expect.any(NextRequest), expect.objectContaining({
      userId: 'user-1',
      scopes: ['sms.send'],
    }));
  });

  it('requires API key scopes for self-service profile and dashboard endpoints', async () => {
    const handler = vi.fn().mockResolvedValue(new Response('ok'));

    await withApiKey(request(), 'profile.read', handler);

    expect(sessionMocks.hasPermission).not.toHaveBeenCalled();
    expect(handler).toHaveBeenCalledWith(expect.any(NextRequest), expect.objectContaining({
      scopes: ['profile.read'],
    }));
  });
});
