// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH } from '@/app/api/notifications/route';
import { requireAuth } from '@/lib/auth/session';
import { AppError } from '@/lib/errors';
import { prismaMock } from '../../unit/prismaMock';
vi.mock('@/lib/auth/session', () => ({ requireAuth: vi.fn() }));
beforeEach(() => {
  vi.mocked(requireAuth).mockResolvedValue({ userId: 'owner' } as never);
});
describe('Notification API', () => {
  it('rejects unauthorized access', async () => {
    vi.mocked(requireAuth).mockRejectedValue(new AppError('Unauthorized', 401));
    expect((await GET()).status).toBe(401);
    expect(prismaMock.notification.findMany).not.toHaveBeenCalled();
  });
  it('rejects malformed JSON and unknown actions', async () => {
    for (const body of [
      '{',
      JSON.stringify({ action: 'delete' }),
      JSON.stringify({ action: 'mark-read', id: {} }),
    ]) {
      expect(
        (await PATCH(new Request('http://localhost/api/notifications', { method: 'PATCH', body })))
          .status
      ).toBe(400);
    }
    expect(prismaMock.notification.updateMany).not.toHaveBeenCalled();
  });
  it('scopes writes to the authenticated owner', async () => {
    const id = 'd37a35ac-1469-4b18-9062-aecbd6aef158';
    expect(
      (
        await PATCH(
          new Request('http://localhost/api/notifications', {
            method: 'PATCH',
            body: JSON.stringify({ action: 'mark-read', id }),
          })
        )
      ).status
    ).toBe(200);
    expect(prismaMock.notification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'owner', id, readAt: null, archivedAt: null } })
    );
  });
  it('does not expose database error details', async () => {
    prismaMock.notification.findMany.mockRejectedValue(new Error('database credentials SECRET'));
    const response = await GET();
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('SECRET');
  });
});
