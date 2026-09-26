import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateApiKey,
  calculateNextQuotaReset,
  verifyApiKey,
  withApiKey,
  incrementApiKeyQuota,
  resetApiKeyQuota,
} from '@/lib/api-keys/service';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { createApiKeySchema, updateApiKeySchema } from '@/lib/validations/api-keys';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    apiKey: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
      create: vi.fn(),
    },
  },
}));

interface MockApiKeyDelegate {
  findFirst: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
}

const mockApiKey = prisma.apiKey as unknown as MockApiKeyDelegate;

describe('API Keys - Multi-App & Quota Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Key Generation & Hashing', () => {
    it('should generate properly formatted keys with rsms_ prefix and 12-char hex identifier', () => {
      const { key, keyPrefix, secret, keyHash } = generateApiKey();

      expect(key.startsWith('rsms_')).toBe(true);
      expect(keyPrefix.length).toBe(12);
      expect(secret.length).toBe(32);
      expect(key).toBe(`rsms_${keyPrefix}_${secret}`);

      const computedHash = crypto.createHash('sha256').update(secret).digest('hex');
      expect(keyHash).toBe(computedHash);
    });
  });

  describe('calculateNextQuotaReset', () => {
    it('should calculate next day 00:00 UTC for DAILY quota', () => {
      const base = new Date('2026-09-25T14:30:00Z');
      const reset = calculateNextQuotaReset('DAILY', base);

      expect(reset).not.toBeNull();
      expect(reset?.toISOString()).toBe('2026-09-26T00:00:00.000Z');
    });

    it('should calculate 7 days forward 00:00 UTC for WEEKLY quota', () => {
      const base = new Date('2026-09-25T14:30:00Z');
      const reset = calculateNextQuotaReset('WEEKLY', base);

      expect(reset).not.toBeNull();
      expect(reset?.toISOString()).toBe('2026-10-02T00:00:00.000Z');
    });

    it('should calculate 1st of next month 00:00 UTC for MONTHLY quota', () => {
      const base = new Date('2026-09-25T14:30:00Z');
      const reset = calculateNextQuotaReset('MONTHLY', base);

      expect(reset).not.toBeNull();
      expect(reset?.toISOString()).toBe('2026-10-01T00:00:00.000Z');
    });

    it('should return null for TOTAL or UNLIMITED quota', () => {
      expect(calculateNextQuotaReset('TOTAL')).toBeNull();
      expect(calculateNextQuotaReset('UNLIMITED')).toBeNull();
      expect(calculateNextQuotaReset(null)).toBeNull();
    });
  });

  describe('verifyApiKey with Multi-App & Quotas', () => {
    it('should authenticate a key assigned to a specific App with remaining quota', async () => {
      const prefix = 'abcd1234ef56';
      const secret = '1234567890abcdef1234567890abcdef';
      const rawKey = `rsms_${prefix}_${secret}`;
      const hash = crypto.createHash('sha256').update(secret).digest('hex');

      mockApiKey.findFirst.mockResolvedValueOnce({
        id: 'key-app-1',
        name: 'Mobile App Key',
        appName: 'iOS Mobile App',
        environment: 'production',
        keyPrefix: prefix,
        keyHash: hash,
        status: 'ACTIVE',
        scopes: ['sms.send', 'sms.status'],
        quotaLimit: 5000,
        quotaUsed: 120,
        quotaPeriod: 'WEEKLY',
        quotaResetAt: new Date(Date.now() + 86400000),
        alertThreshold: 80,
      });

      const result = await verifyApiKey(rawKey);

      expect(result.isValid).toBe(true);
      expect(result.appName).toBe('iOS Mobile App');
      expect(result.environment).toBe('production');
      expect(result.quotaLimit).toBe(5000);
      expect(result.quotaUsed).toBe(121);
      expect(result.quotaExceeded).toBeUndefined();
    });

    it('should return quotaExceeded when quotaUsed reaches or exceeds quotaLimit', async () => {
      const prefix = 'shop1234ef56';
      const secret = '9876543210abcdef9876543210abcdef';
      const rawKey = `rsms_${prefix}_${secret}`;
      const hash = crypto.createHash('sha256').update(secret).digest('hex');

      const resetDate = new Date(Date.now() + 86400000);
      mockApiKey.findFirst.mockResolvedValueOnce({
        id: 'key-shop-1',
        name: 'Shopify Store Key',
        appName: 'Shopify Store',
        environment: 'production',
        keyPrefix: prefix,
        keyHash: hash,
        status: 'ACTIVE',
        scopes: ['sms.send'],
        quotaLimit: 1000,
        quotaUsed: 1000, // Exhausted
        quotaPeriod: 'MONTHLY',
        quotaResetAt: resetDate,
      });

      const result = await verifyApiKey(rawKey);

      expect(result.isValid).toBe(false);
      expect(result.quotaExceeded).toBe(true);
      expect(result.appName).toBe('Shopify Store');
      expect(result.quotaLimit).toBe(1000);
      expect(result.quotaUsed).toBe(1000);
      expect(result.quotaPeriod).toBe('MONTHLY');
      expect(result.quotaResetAt).toBe(resetDate);
    });

    it('should automatically reset quota when quotaResetAt has passed', async () => {
      const prefix = 'erp12345ef56';
      const secret = 'aabbccddeeff00112233445566778899';
      const rawKey = `rsms_${prefix}_${secret}`;
      const hash = crypto.createHash('sha256').update(secret).digest('hex');

      // Expired reset timestamp: yesterday
      const pastResetDate = new Date(Date.now() - 86400000);

      mockApiKey.findFirst.mockResolvedValueOnce({
        id: 'key-erp-1',
        name: 'ERP Backend Key',
        appName: 'Internal ERP',
        environment: 'production',
        keyPrefix: prefix,
        keyHash: hash,
        status: 'ACTIVE',
        scopes: ['sms.send', 'balance.read'],
        quotaLimit: 2000,
        quotaUsed: 2000, // Was previously full
        quotaPeriod: 'DAILY',
        quotaResetAt: pastResetDate,
      });

      const result = await verifyApiKey(rawKey);

      // Quota reset occurred, so key is now valid again with usage reset
      expect(result.isValid).toBe(true);
      expect(result.quotaExceeded).toBeUndefined();
      expect(result.appName).toBe('Internal ERP');
      expect(result.quotaLimit).toBe(2000);
      expect(result.quotaUsed).toBe(1); // 0 reset + 1 new request
      expect(mockApiKey.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'key-erp-1' },
          data: expect.objectContaining({
            quotaUsed: 0,
          }),
        })
      );
    });
  });

  describe('withApiKey Middleware & RFC 9457 Error Response', () => {
    it('should return RFC 9457 429 response when quota is exceeded', async () => {
      const prefix = 'pos12345ef56';
      const secret = '11223344556677889900aabbccddeeff';
      const rawKey = `rsms_${prefix}_${secret}`;
      const hash = crypto.createHash('sha256').update(secret).digest('hex');

      const resetDate = new Date('2026-10-01T00:00:00.000Z');
      mockApiKey.findFirst.mockResolvedValueOnce({
        id: 'key-pos-1',
        name: 'POS Terminal Key',
        appName: 'Retail POS',
        environment: 'production',
        keyPrefix: prefix,
        keyHash: hash,
        status: 'ACTIVE',
        scopes: ['sms.send'],
        quotaLimit: 500,
        quotaUsed: 500,
        quotaPeriod: 'MONTHLY',
        quotaResetAt: resetDate,
      });

      const req = new NextRequest('http://localhost:3000/api/v1/sms/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${rawKey}`,
        },
      });

      const handler = vi.fn();
      const response = await withApiKey(req, 'sms.send', handler);

      expect(handler).not.toHaveBeenCalled();
      expect(response.status).toBe(429);

      const body = await response.json();
      expect(body.type).toBe('https://api.range.ug/errors/quota-exceeded');
      expect(body.code).toBe('QUOTA_EXCEEDED');
      expect(body.appName).toBe('Retail POS');
      expect(body.quotaLimit).toBe(500);
      expect(body.quotaUsed).toBe(500);
      expect(body.quotaPeriod).toBe('MONTHLY');
      expect(response.headers.get('X-RateLimit-Quota-Remaining')).toBe('0');
    });

    it('should successfully pass app and quota context to route handler on valid key', async () => {
      const prefix = 'valid123ef56';
      const secret = 'feedbeefcafe1234567890abcdef1234';
      const rawKey = `rsms_${prefix}_${secret}`;
      const hash = crypto.createHash('sha256').update(secret).digest('hex');

      mockApiKey.findFirst.mockResolvedValueOnce({
        id: 'key-crm-1',
        name: 'HubSpot Sync',
        appName: 'CRM Integration',
        environment: 'sandbox',
        keyPrefix: prefix,
        keyHash: hash,
        status: 'ACTIVE',
        scopes: ['contacts.read', 'sms.send'],
        quotaLimit: 10000,
        quotaUsed: 350,
        quotaPeriod: 'WEEKLY',
      });

      const req = new NextRequest('http://localhost:3000/api/v1/contacts', {
        headers: {
          Authorization: `Bearer ${rawKey}`,
        },
      });

      const handler = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
      const response = await withApiKey(req, 'contacts.read', handler);

      expect(handler).toHaveBeenCalledWith(
        expect.any(NextRequest),
        expect.objectContaining({
          apiKeyId: 'key-crm-1',
          appName: 'CRM Integration',
          environment: 'sandbox',
          quotaLimit: 10000,
          quotaUsed: 351,
        })
      );
      expect(response.status).toBe(200);
    });
  });

  describe('Quota Utility Functions', () => {
    it('should increment quota by specified count', async () => {
      await incrementApiKeyQuota('key-123', 25);

      expect(mockApiKey.update).toHaveBeenCalledWith({
        where: { id: 'key-123' },
        data: {
          quotaUsed: { increment: 25 },
          lastUsedAt: expect.any(Date),
        },
      });
    });

    it('should reset quota usage to 0 and calculate next reset time', async () => {
      mockApiKey.findUnique.mockResolvedValueOnce({
        id: 'key-reset-1',
        quotaPeriod: 'WEEKLY',
      });

      const result = await resetApiKeyQuota('key-reset-1');

      expect(result.success).toBe(true);
      expect(result.nextResetAt).not.toBeNull();
      expect(mockApiKey.update).toHaveBeenCalledWith({
        where: { id: 'key-reset-1' },
        data: {
          quotaUsed: 0,
          quotaResetAt: expect.any(Date),
        },
      });
    });

    it('should reset quota for uncapped keys with null nextResetAt', async () => {
      mockApiKey.findUnique.mockResolvedValueOnce({
        id: 'key-reset-uncapped',
        quotaPeriod: 'UNLIMITED',
      });

      const result = await resetApiKeyQuota('key-reset-uncapped');

      expect(result.success).toBe(true);
      expect(result.nextResetAt).toBeNull();
      expect(mockApiKey.update).toHaveBeenCalledWith({
        where: { id: 'key-reset-uncapped' },
        data: {
          quotaUsed: 0,
          quotaResetAt: null,
        },
      });
    });
  });

  describe('Optional Quotas & Uncapped (Unlimited) Keys', () => {
    it('should validate create schema when quotaLimit is null (No Quota / Unlimited)', () => {
      const input = {
        name: 'Backend Microservice',
        appName: 'Billing Service',
        environment: 'production' as const,
        scopes: ['sms.send'] as ('sms.send')[],
        quotaLimit: null,
        quotaPeriod: 'UNLIMITED' as const,
      };

      const result = createApiKeySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quotaLimit).toBeNull();
        expect(result.data.quotaPeriod).toBe('UNLIMITED');
      }
    });

    it('should validate update schema to remove quota by setting quotaLimit to null', () => {
      const input = {
        quotaLimit: null,
        quotaPeriod: 'UNLIMITED' as const,
      };

      const result = updateApiKeySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quotaLimit).toBeNull();
      }
    });

    it('should allow unlimited requests when key has no quota limit (quotaLimit === null)', async () => {
      const prefix = 'uncapped1234';
      const secret = '11112222333344445555666677778888';
      const rawKey = `rsms_${prefix}_${secret}`;
      const hash = crypto.createHash('sha256').update(secret).digest('hex');

      mockApiKey.findFirst.mockResolvedValueOnce({
        id: 'key-uncapped-1',
        name: 'High Volume Producer',
        appName: 'Streaming Engine',
        environment: 'production',
        keyPrefix: prefix,
        keyHash: hash,
        status: 'ACTIVE',
        scopes: ['sms.send'],
        quotaLimit: null, // Unlimited / No Quota
        quotaUsed: 999999, // Very large usage count
        quotaPeriod: 'UNLIMITED',
        quotaResetAt: null,
        alertThreshold: null,
      });

      const result = await verifyApiKey(rawKey);

      expect(result.isValid).toBe(true);
      expect(result.quotaExceeded).toBeUndefined();
      expect(result.quotaLimit).toBeNull();
      expect(result.quotaUsed).toBe(1000000); // Incremented accurately
      expect(result.quotaPeriod).toBe('UNLIMITED');
      expect(result.quotaResetAt).toBeNull();
    });

    it('should bypass quota 429 checks in withApiKey for uncapped keys', async () => {
      const prefix = 'payg12345678';
      const secret = 'aabbcc112233aabbcc112233aabbcc11';
      const rawKey = `rsms_${prefix}_${secret}`;
      const hash = crypto.createHash('sha256').update(secret).digest('hex');

      mockApiKey.findFirst.mockResolvedValueOnce({
        id: 'key-payg-1',
        name: 'Pay As You Go Key',
        appName: 'Core API Server',
        environment: 'production',
        keyPrefix: prefix,
        keyHash: hash,
        status: 'ACTIVE',
        scopes: ['sms.send', 'balance.read'],
        quotaLimit: null,
        quotaUsed: 500000,
        quotaPeriod: 'UNLIMITED',
        quotaResetAt: null,
      });

      const req = new NextRequest('http://localhost:3000/api/v1/sms/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${rawKey}`,
        },
      });

      const handler = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'queued' })));
      const response = await withApiKey(req, 'sms.send', handler);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('queued');
    });
  });
});
