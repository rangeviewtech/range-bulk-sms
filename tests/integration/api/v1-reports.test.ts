/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getSummary } from '@/app/api/v1/reports/summary/route';
import { prismaMock } from '../../unit/prismaMock';

vi.mock('@/lib/api-keys/service', () => ({
  withApiKey: vi.fn().mockImplementation(async (req: NextRequest, _scope: string, handler) => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer valid-token')) {
      return Response.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 });
    }
    return handler(req, { userId: 'report-user-123' });
  }),
}));

describe('GET /api/v1/reports/summary', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns account-scoped recipient outcomes for the selected period', async () => {
    prismaMock.messageRecipient.count.mockResolvedValue(4);
    prismaMock.messageRecipient.groupBy.mockResolvedValue([
      { status: 'DELIVERED', _count: { _all: 2 } },
      { status: 'FAILED', _count: { _all: 1 } },
      { status: 'QUEUED', _count: { _all: 1 } },
    ] as never);
    prismaMock.message.count.mockResolvedValue(1);

    const req = new NextRequest('http://localhost:3000/api/v1/reports/summary?period=7D', {
      headers: { authorization: 'Bearer valid-token' },
    });
    const response = await getSummary(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.summary).toEqual({
      broadcasts: 1,
      recipients: 4,
      delivered: 2,
      failed: 1,
      inProgress: 1,
      deliveryRate: 66.7,
    });
    expect(prismaMock.messageRecipient.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          message: expect.objectContaining({ userId: 'report-user-123' }),
        }),
      })
    );
  });

  it('rejects an unsupported reporting period', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/reports/summary?period=90D', {
      headers: { authorization: 'Bearer valid-token' },
    });
    const response = await getSummary(req);

    expect(response.status).toBe(400);
    expect(prismaMock.messageRecipient.count).not.toHaveBeenCalled();
  });
});
