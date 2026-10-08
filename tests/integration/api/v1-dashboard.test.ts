/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getDashboardStats } from '@/app/api/v1/dashboard/stats/route';
import { prismaMock } from '../../unit/prismaMock';

vi.mock('@/lib/api-keys/service', () => ({
  withApiKey: vi.fn().mockImplementation(async (req: NextRequest, _scope: string, handler) => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer valid-token')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, { userId: 'dashboard-user-123' });
  }),
}));

vi.mock('@/lib/wallet/service', () => ({
  WalletService: {
    getOrCreateWallet: vi.fn().mockResolvedValue({ id: 'dashboard-wallet' }),
    getBalance: vi.fn().mockResolvedValue({ balance: 1200, smsCredits: 100, currency: 'UGX' }),
  },
}));

describe('GET /api/v1/dashboard/stats', () => {
  beforeEach(() => vi.clearAllMocks());

  it('limits gateway totals and online counts to the authenticated account', async () => {
    prismaMock.message.count.mockResolvedValue(0);
    prismaMock.gateway.count.mockResolvedValue(0);
    prismaMock.message.findMany.mockResolvedValue([] as never);

    const req = new NextRequest('http://localhost:3000/api/v1/dashboard/stats', {
      headers: { authorization: 'Bearer valid-token' },
    });
    const response = await getDashboardStats(req);

    expect(response.status).toBe(200);
    expect(prismaMock.gateway.count).toHaveBeenNthCalledWith(1, {
      where: { userId: 'dashboard-user-123', status: 'ONLINE' },
    });
    expect(prismaMock.gateway.count).toHaveBeenNthCalledWith(2, {
      where: { userId: 'dashboard-user-123' },
    });
  });
});
