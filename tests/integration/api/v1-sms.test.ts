/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as sendV1 } from '@/app/api/v1/sms/send/route';
import { POST as bulkV1 } from '@/app/api/v1/sms/bulk/route';
import { POST as scheduleV1 } from '@/app/api/v1/sms/schedule/route';
import { NextRequest } from 'next/server';
import { prismaMock } from '../../unit/prismaMock';
import { WalletService } from '@/lib/wallet/service';
import { enqueueJob, enqueueScheduledSmsOccurrence } from '@/lib/jobs/db';

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
  enqueueScheduledSmsOccurrence: vi.fn().mockResolvedValue({ id: 'scheduled-v1-job-1' }),
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

    it('accepts the sender UUID selected by the mobile app and queues the message', async () => {
      const senderUuid = '550e8400-e29b-41d4-a716-446655440000';
      prismaMock.message.findUnique.mockResolvedValue(null);
      prismaMock.senderId.findFirst.mockResolvedValue({
        id: senderUuid,
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
          senderId: senderUuid,
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
      expect(json.recipientCount).toBe(1);
      expect(json.totalUnits).toBe(1);
      expect(prismaMock.$transaction).toHaveBeenCalledOnce();
      expect(WalletService.deduct).toHaveBeenCalledWith(
        'wallet-v1',
        expect.anything(),
        expect.objectContaining({ tx: prismaMock }),
      );
      expect(enqueueJob).toHaveBeenCalledWith(expect.objectContaining({ tx: prismaMock }));
      expect(prismaMock.message.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ senderIdId: senderUuid }),
      }));
    });

    it('rejects reuse of a message key for different content without charging again', async () => {
      prismaMock.message.findUnique.mockResolvedValue({
        id: 'existing-message',
        userId: 'v1-user-123',
        message: 'Original message',
        senderIdId: 'RANGE_SMS',
        senderId: { senderId: 'RANGE_SMS' },
        gatewayId: null,
        recipientCount: 1,
        totalUnits: 1,
        status: 'QUEUED',
        recipients: [{ phone: '+256700000001' }],
      } as never);

      const req = new NextRequest('http://localhost:3000/api/v1/sms/send', {
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          senderId: 'RANGE_SMS',
          recipients: ['+256700000001'],
          message: 'Changed message',
          idempotencyKey: 'same-request-key',
        }),
      });

      const res = await sendV1(req);
      expect(res.status).toBe(409);
      expect(WalletService.deduct).not.toHaveBeenCalled();
    });

    it('rejects unsupported cloud or SMPP gateway selection before charging', async () => {
      prismaMock.gateway.findUnique.mockResolvedValue({
        id: 'unsupported-provider-gateway',
        userId: 'v1-user-123',
        type: 'SMPP',
        status: 'ONLINE',
        name: 'Provider route',
        devices: [],
      } as never);

      const req = new NextRequest('http://localhost:3000/api/v1/sms/send', {
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          gatewayId: 'unsupported-provider-gateway',
          senderId: 'RANGE_SMS',
          recipients: ['+256700000001'],
          message: 'Do not silently route through a different provider',
        }),
      });

      const res = await sendV1(req);
      expect(res.status).toBe(400);
      expect(prismaMock.message.create).not.toHaveBeenCalled();
    });

    it('rejects invalid recipients before reserving wallet funds', async () => {
      prismaMock.senderId.findFirst.mockResolvedValue({
        id: 'RANGE_SMS',
        senderId: 'RANGE_SMS',
        status: 'APPROVED',
        userId: 'v1-user-123',
      } as never);

      const req = new NextRequest('http://localhost:3000/api/v1/sms/send', {
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          senderId: 'RANGE_SMS',
          recipients: ['not-a-phone-number'],
          message: 'Do not charge for invalid destinations',
        }),
      });

      const res = await sendV1(req);
      expect(res.status).toBe(400);
      expect(WalletService.deduct).not.toHaveBeenCalled();
      expect(prismaMock.message.create).not.toHaveBeenCalled();
    });

    it('does not expose internal exception details when sending fails', async () => {
      prismaMock.senderId.findFirst.mockRejectedValueOnce(new Error('database credential details'));
      const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const req = new NextRequest('http://localhost:3000/api/v1/sms/send', {
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          senderId: 'RANGE_SMS',
          recipients: ['+256700000001'],
          message: 'Do not reveal internal errors',
        }),
      });

      const res = await sendV1(req);
      const json = await res.json();
      logSpy.mockRestore();

      expect(res.status).toBe(500);
      expect(json.error).toBe('Unable to send messages right now. Please try again.');
      expect(JSON.stringify(json)).not.toContain('database credential details');
    });
  });

  describe('POST /api/v1/sms/schedule', () => {
    const senderUuid = '550e8400-e29b-41d4-a716-446655440000';
    const makeRequest = () => new NextRequest('http://localhost:3000/api/v1/sms/schedule', {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token', 'content-type': 'application/json' },
      body: JSON.stringify({
        senderId: senderUuid,
        recipients: ['+256700000001'],
        message: 'Scheduled reminder',
        scheduledAt: '2030-01-01T09:00:00.000Z',
      }),
    });

    it('rejects a sender outside the approved owner scope before billing', async () => {
      prismaMock.senderId.findFirst.mockResolvedValue(null);
      const res = await scheduleV1(makeRequest());
      expect(res.status).toBe(400);
      expect(prismaMock.senderId.findFirst).toHaveBeenCalledWith({
        where: {
          status: 'APPROVED',
          AND: [
            { OR: [{ id: senderUuid }, { senderId: senderUuid }] },
            { OR: [{ userId: 'v1-user-123' }] },
          ],
        },
        select: { id: true },
      });
      expect(WalletService.deduct).not.toHaveBeenCalled();
      expect(prismaMock.scheduledMessage.create).not.toHaveBeenCalled();
    });

    it('resolves the sender and persists the schedule in the billing transaction', async () => {
      prismaMock.senderId.findFirst.mockResolvedValue({ id: senderUuid } as never);
      prismaMock.scheduledMessage.create.mockResolvedValue({
        id: 'schedule-1', scheduledAt: new Date('2030-01-01T09:00:00.000Z'),
      } as never);
      const res = await scheduleV1(makeRequest());
      expect(res.status).toBe(200);
      expect(prismaMock.$transaction).toHaveBeenCalledOnce();
      expect(WalletService.deduct).toHaveBeenCalledWith('wallet-v1', expect.anything(),
        expect.objectContaining({ tx: prismaMock }));
      expect(prismaMock.scheduledMessage.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ senderIdId: senderUuid, userId: 'v1-user-123' }),
      });
      expect(enqueueScheduledSmsOccurrence).toHaveBeenCalledWith(expect.objectContaining({
        scheduledMessageId: 'schedule-1',
        scheduledAt: new Date('2030-01-01T09:00:00.000Z'),
      }));
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
