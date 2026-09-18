/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as createUserRoute } from '@/app/api/admin/users/route';
import { prismaMock } from '../../unit/prismaMock';


vi.mock('@/lib/auth/session', () => ({
  verifySession: vi.fn(),
}));

vi.mock('@/lib/auth/authorization', () => ({
  hasPermission: vi.fn(),
}));

vi.mock('@/lib/security/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
}));

import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

describe('Admin Users Route Hardening (/api/admin/users POST)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthorized users with 403 Forbidden', async () => {
    vi.mocked(verifySession).mockResolvedValueOnce({
      userId: 'user-regular',
      sessionId: 'sess-1',
    } as never);
    vi.mocked(hasPermission).mockResolvedValueOnce(false);

    const req = new Request('http://localhost:3000/api/admin/users', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Jane Doe', email: 'jane@example.com' }),
    });

    const res = await createUserRoute(req);
    expect(res.status).toBe(403);
  });

  it('rejects invalid email with 400 Bad Request', async () => {
    vi.mocked(verifySession).mockResolvedValueOnce({
      userId: 'admin-1',
      sessionId: 'sess-1',
    } as never);
    vi.mocked(hasPermission).mockResolvedValueOnce(true);

    const req = new Request('http://localhost:3000/api/admin/users', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Jane Doe', email: 'not-an-email' }),
    });

    const res = await createUserRoute(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Invalid user creation payload');
  });

  it('generates a secure temporary password when password is not supplied', async () => {
    vi.mocked(verifySession).mockResolvedValueOnce({
      userId: 'admin-1',
      sessionId: 'sess-1',
    } as never);
    vi.mocked(hasPermission).mockResolvedValueOnce(true);

    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.role.findFirst.mockResolvedValueOnce({ id: 'role-client', name: 'CLIENT' } as never);
    prismaMock.user.create.mockResolvedValueOnce({
      id: 'new-user-1',
      name: 'Client User',
      email: 'client@example.com',
      phone: null,
      status: 'ACTIVE',
      createdAt: new Date(),
      roles: [{ role: { name: 'CLIENT' } }],
    } as never);

    const req = new Request('http://localhost:3000/api/admin/users', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Client User', email: 'client@example.com', roleName: 'CLIENT' }),
    });

    const res = await createUserRoute(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.temporaryPassword).toBeDefined();
    expect(json.temporaryPassword).toMatch(/^Tmp_[A-Za-z0-9_-]+!9$/);
  });
});
