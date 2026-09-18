/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import { POST as paymentWebhook } from '@/app/api/webhooks/payment/route';
import { POST as deliveryWebhook } from '@/app/api/webhooks/sms/delivery/route';
import { NextRequest } from 'next/server';
import { prismaMock } from '../../unit/prismaMock';

vi.mock('@/lib/wallet/service', () => ({
  WalletService: {
    getOrCreateWallet: vi.fn().mockResolvedValue({ id: 'wallet-deposit-1' }),
    deposit: vi.fn().mockResolvedValue({
      success: true,
      walletId: 'wallet-deposit-1',
      balanceBefore: 0,
      balanceAfter: 50000,
      transactionRef: 'DEP_REF_100',
    }),
  },
}));

vi.mock('@/lib/security/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
}));

describe('Inbound Webhooks (Payment & Delivery Receipts)', () => {
  const paymentSecret = 'secret-pay-key-123';
  const deliverySecret = 'secret-dlr-key-456';

  beforeEach(() => {
    vi.stubEnv('PAYMENT_WEBHOOK_SECRET', paymentSecret);
    vi.stubEnv('SMS_DELIVERY_WEBHOOK_SECRET', deliverySecret);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Payment Webhook (/api/webhooks/payment)', () => {
    it('rejects requests when PAYMENT_WEBHOOK_SECRET is unconfigured (fail-closed)', async () => {

      vi.stubEnv('PAYMENT_WEBHOOK_SECRET', '');

      const req = new NextRequest('http://localhost:3000/api/webhooks/payment', {
        method: 'POST',
        headers: {
          'x-webhook-signature': 'any-signature',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ event: 'payment.success', reference: 'REF_999', amount: 50000 }),
      });

      const res = await paymentWebhook(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toContain('unconfigured');
    });

    it('rejects requests with missing or invalid HMAC signatures', async () => {

      const payload = JSON.stringify({
        event: 'payment.success',
        reference: 'REF_999',
        amount: 50000,
      });

      const req = new NextRequest('http://localhost:3000/api/webhooks/payment', {
        method: 'POST',
        headers: {
          'x-webhook-signature': 'invalid-signature',
          'content-type': 'application/json',
        },
        body: payload,
      });

      const res = await paymentWebhook(req);
      expect(res.status).toBe(401);
    });

    it('processes successful payment with valid HMAC signature', async () => {
      const payload = JSON.stringify({
        event: 'payment.success',
        reference: 'REF_SUCCESS_1',
        amount: 50000,
        userId: 'user-payer-1',
        paymentMethod: 'MOBILE_MONEY',
      });

      const signature = crypto
        .createHmac('sha256', paymentSecret)
        .update(payload)
        .digest('hex');

      const req = new NextRequest('http://localhost:3000/api/webhooks/payment', {
        method: 'POST',
        headers: {
          'x-webhook-signature': signature,
          'content-type': 'application/json',
        },
        body: payload,
      });

      const res = await paymentWebhook(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.reference).toBe('REF_SUCCESS_1');
    });
  });

  describe('SMS Delivery Webhook (/api/webhooks/sms/delivery)', () => {
    it('rejects requests when SMS_DELIVERY_WEBHOOK_SECRET is unconfigured (fail-closed)', async () => {
      vi.stubEnv('SMS_DELIVERY_WEBHOOK_SECRET', '');

      const req = new NextRequest('http://localhost:3000/api/webhooks/sms/delivery', {
        method: 'POST',
        headers: {
          'x-delivery-secret': 'any-secret',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ status: 'DELIVERED' }),
      });

      const res = await deliveryWebhook(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toContain('unconfigured');
    });

    it('rejects requests with invalid secret token', async () => {

      const req = new NextRequest('http://localhost:3000/api/webhooks/sms/delivery', {
        method: 'POST',
        headers: {
          'x-delivery-secret': 'wrong-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ status: 'DELIVERED' }),
      });

      const res = await deliveryWebhook(req);
      expect(res.status).toBe(401);
    });

    it('updates recipient status on valid delivery receipt', async () => {
      prismaMock.messageRecipient.findFirst.mockResolvedValue({
        id: 'rec-dlr-1',
        messageId: 'msg-parent-1',
        phone: '+256700000001',
        status: 'PENDING',
        providerMsgId: 'prov-msg-1',
      } as never);

      prismaMock.messageRecipient.update.mockResolvedValue({
        id: 'rec-dlr-1',
        status: 'DELIVERED',
      } as never);

      prismaMock.messageRecipient.count.mockResolvedValue(0); // 0 remaining pending
      prismaMock.message.update.mockResolvedValue({
        id: 'msg-parent-1',
        status: 'DELIVERED',
      } as never);

      const req = new NextRequest('http://localhost:3000/api/webhooks/sms/delivery', {
        method: 'POST',
        headers: {
          'x-delivery-secret': deliverySecret,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: 'rec-dlr-1',
          status: 'DELIVERED',
        }),
      });

      const res = await deliveryWebhook(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.status).toBe('DELIVERED');
    });
  });
});
