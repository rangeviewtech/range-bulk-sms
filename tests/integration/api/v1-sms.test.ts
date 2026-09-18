/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as sendV1 } from '@/app/api/v1/sms/send/route';
import { POST as bulkV1 } from '@/app/api/v1/sms/bulk/route';
import { NextRequest } from 'next/server';
import { prismaMock } from '../../unit/prismaMock';

vi.mock('@/lib/api-keys/service', () => ({
  withApiKey: vi.fn().mockImplementation(async (req: NextRequest, _scope: string, handler) => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer valid-token')) {
      return Response.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 });
    }
    return handler(req, { userId: 'v1-user-123' });
  }),
}));

vi.mock('@/lib/wallet/service', () => ({
  WalletService: {
    getOrCreateWallet: vi.fn().mockResolvedValue({ id: 'wallet-v1' }),
    deduct: vi.fn().mockResolvedValue({
      success: true,
      walletId: 'wallet-v1',
      balanceBefore: 500,
      balanceAfter: 480,
      transactionRef: 'TX_V1_100',
    }),
  },
}));

vi.mock('@/lib/jobs/db', () => ({
  enqueueJob: vi.fn().mockResolvedValue({ id: 'v1-job-1' }),
}));

describe('v1 Public SMS API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/sms/send', () => {
    it('rejects unauthenticated requests', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/sms/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          recipients: ['+256700000001'],
          message: 'Test Public API',
        }),
      });

      const res = await sendV1(req);
      expect(res.status).toBe(401);
    });

    it('processes authenticated message and returns real message ID', async () => {
      prismaMock.message.findUnique.mockResolvedValue(null);
      prismaMock.senderId.findFirst.mockResolvedValue({
        id: 'RANGE_SMS',
        status: 'APPROVED',
        userId: 'v1-user-123',
      } as never);
      prismaMock.message.create.mockResolvedValue({
        id: 'v1-msg-real-999',
        userId: 'v1-user-123',
        status: 'QUEUED',
      } as never);
      prismaMock.messageRecipient.createMany.mockResolvedValue({ count: 1 });
      prismaMock.messageRecipient.findMany.mockResolvedValue([
        { id: 'rec-v1-1', messageId: 'v1-msg-real-999', phone: '+256700000001' },
      ] as never);

      const req = new NextRequest('http://localhost:3000/api/v1/sms/send', {
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          senderId: 'RANGE_SMS',
          recipients: ['+256700000001'],
          message: 'Production API Dispatch',
        }),
      });

      const res = await sendV1(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.messageId).toBe('v1-msg-real-999');
      expect(json.status).toBe('QUEUED');
    });
  });

  describe('POST /api/v1/sms/bulk', () => {
    it('processes bulk payload and returns real batch response', async () => {
      prismaMock.message.create.mockResolvedValue({
        id: 'bulk-msg-1',
        userId: 'v1-user-123',
        status: 'QUEUED',
      } as never);
      prismaMock.messageRecipient.createMany.mockResolvedValue({ count: 2 });
      prismaMock.messageRecipient.findMany.mockResolvedValue([
        { id: 'rec-b-1', messageId: 'bulk-msg-1', phone: '+256700000001' },
        { id: 'rec-b-2', messageId: 'bulk-msg-1', phone: '+256700000002' },
      ] as never);

      const req = new NextRequest('http://localhost:3000/api/v1/sms/bulk', {
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              recipients: ['+256700000001', '+256700000002'],
              message: 'Bulk Campaign 1',
            },
          ],
        }),
      });

      const res = await bulkV1(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBe(1);
      expect(json.totalRecipients).toBe(2);
      expect(json.status).toBe('QUEUED');
    });
  });
});
