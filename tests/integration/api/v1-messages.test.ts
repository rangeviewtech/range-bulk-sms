/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getHistory } from '@/app/api/v1/messages/route';
import { prismaMock } from '../../unit/prismaMock';

vi.mock('@/lib/auth/session', () => ({
  verifyAuthenticatedSession: vi.fn().mockResolvedValue({ userId: 'mobile-user-123' }),
}));

describe('GET /api/v1/messages', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns only the authenticated account message history with bounded pagination', async () => {
    prismaMock.message.findMany.mockResolvedValue([
      {
        id: 'message-1',
        message: 'Delivery update',
        status: 'PARTIAL',
        recipientCount: 2,
        totalUnits: 2,
        createdAt: new Date('2026-10-08T10:00:00.000Z'),
        senderId: { senderId: 'RANGE' },
      },
    ] as never);
    prismaMock.message.count.mockResolvedValue(1);

    const req = new NextRequest('http://localhost:3000/api/v1/messages?page=1&limit=20');
    const response = await getHistory(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data[0]).toEqual({
      id: 'message-1',
      message: 'Delivery update',
      status: 'PARTIAL',
      recipientCount: 2,
      totalUnits: 2,
      createdAt: '2026-10-08T10:00:00.000Z',
      senderId: 'RANGE',
    });
    expect(prismaMock.message.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 'mobile-user-123' },
      skip: 0,
      take: 20,
    }));
  });

  it('rejects a page size beyond the cap', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/messages?limit=101');
    const response = await getHistory(req);

    expect(response.status).toBe(400);
    expect(prismaMock.message.findMany).not.toHaveBeenCalled();
  });
});
