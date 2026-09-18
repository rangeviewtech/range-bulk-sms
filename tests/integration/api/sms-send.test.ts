/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/sms/send/route';
import { NextRequest } from 'next/server';
import { prismaMock } from '../../unit/prismaMock';

vi.mock('@/lib/auth/authorization', () => ({
  requirePermission: vi.fn().mockResolvedValue({
    userId: 'user-sender-1',
    user: { id: 'user-sender-1' },
  }),
}));

vi.mock('@/lib/wallet/service', () => ({
  WalletService: {
    getOrCreateWallet: vi.fn().mockResolvedValue({ id: 'wallet-1' }),
    deduct: vi.fn().mockResolvedValue({
      success: true,
      walletId: 'wallet-1',
      balanceBefore: 100,
      balanceAfter: 80,
      transactionRef: 'TX_123',
    }),
  },
}));

vi.mock('@/lib/jobs/db', () => ({
  enqueueJob: vi.fn().mockResolvedValue({ id: 'job-1' }),
}));

describe('SMS Outbound Dispatch Route (/api/sms/send)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unapproved or foreign sender IDs', async () => {
    prismaMock.message.findUnique.mockResolvedValue(null);
    prismaMock.senderId.findFirst.mockResolvedValue(null); // Not found or unapproved

    const req = new NextRequest('http://localhost:3000/api/sms/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        senderId: 'FOREIGN_ID',
        recipients: ['+256700000001'],
        message: 'Hello World',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Sender ID is invalid, unapproved');
  });

  it('deducts wallet and enqueues jobs on valid submission', async () => {
    prismaMock.message.findUnique.mockResolvedValue(null);
    prismaMock.senderId.findFirst.mockResolvedValue({
      id: 'APPROVED_ID',
      userId: 'user-sender-1',
      status: 'APPROVED',
    } as never);

    prismaMock.message.create.mockResolvedValue({
      id: 'msg-real-100',
      userId: 'user-sender-1',
      status: 'QUEUED',
    } as never);

    prismaMock.messageRecipient.createMany.mockResolvedValue({ count: 2 });
    prismaMock.messageRecipient.findMany.mockResolvedValue([
      { id: 'rec-1', messageId: 'msg-real-100', phone: '+256700000001' },
      { id: 'rec-2', messageId: 'msg-real-100', phone: '+256700000002' },
    ] as never);

    const req = new NextRequest('http://localhost:3000/api/sms/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        senderId: 'APPROVED_ID',
        recipients: ['+256700000001', '+256700000002'],
        message: 'Verified Broadcast',
        idempotencyKey: 'idem-test-key-1',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.messageId).toBe('msg-real-100');
    expect(json.status).toBe('QUEUED');
  });
});
