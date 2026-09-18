/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyApiKey } from '@/lib/api-keys/service';
import { prismaMock } from '../prismaMock';
import crypto from 'crypto';

describe('API Key Security Hardening (verifyApiKey)', () => {
  const testSecret = '0123456789abcdef0123456789abcdef';
  const testPrefix = 'a1b2c3d4e5f6';
  const validKey = `rsms_${testPrefix}_${testSecret}`;
  const validHash = crypto.createHash('sha256').update(testSecret).digest('hex');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects keys that do not start with rsms_ or have invalid segment format', async () => {
    const res1 = await verifyApiKey('invalid_key');
    expect(res1.isValid).toBe(false);

    const res2 = await verifyApiKey('rsms_onlyonepart');
    expect(res2.isValid).toBe(false);
  });

  it('rejects revoked API keys even if status is active', async () => {
    prismaMock.apiKey.findFirst.mockResolvedValueOnce(null); // findFirst filters revokedAt: null

    const res = await verifyApiKey(validKey);
    expect(res.isValid).toBe(false);
    expect(prismaMock.apiKey.findFirst).toHaveBeenCalledWith({
      where: expect.objectContaining({
        keyPrefix: testPrefix,
        status: 'ACTIVE',
        revokedAt: null,
      }),
    });
  });

  it('rejects expired API keys', async () => {
    prismaMock.apiKey.findFirst.mockResolvedValueOnce({
      id: 'key-1',
      keyPrefix: testPrefix,
      keyHash: validHash,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() - 60_000), // Expired 1 minute ago
      revokedAt: null,
      ipWhitelist: [],
      scopes: ['sms.send'],
      clientId: 'client-1',
      userId: 'user-1',
    } as never);

    const res = await verifyApiKey(validKey);
    expect(res.isValid).toBe(false);
  });

  it('rejects requests from IP addresses not in ipWhitelist', async () => {
    prismaMock.apiKey.findFirst.mockResolvedValueOnce({
      id: 'key-1',
      keyPrefix: testPrefix,
      keyHash: validHash,
      status: 'ACTIVE',
      expiresAt: null,
      revokedAt: null,
      ipWhitelist: ['197.239.1.5'],
      scopes: ['sms.send'],
      clientId: 'client-1',
      userId: 'user-1',
    } as never);

    const res = await verifyApiKey(validKey, '102.134.45.10');
    expect(res.isValid).toBe(false);
  });

  it('accepts valid API key when IP is whitelisted or whitelist is empty', async () => {
    prismaMock.apiKey.findFirst.mockResolvedValueOnce({
      id: 'key-1',
      keyPrefix: testPrefix,
      keyHash: validHash,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 86400_000),
      revokedAt: null,
      ipWhitelist: ['197.239.1.5'],
      scopes: ['sms.send', 'balance.read'],
      clientId: 'client-1',
      userId: 'user-1',
    } as never);

    prismaMock.apiKey.update.mockResolvedValueOnce({} as never);

    const res = await verifyApiKey(validKey, '197.239.1.5');
    expect(res.isValid).toBe(true);
    expect(res.clientId).toBe('client-1');
    expect(res.userId).toBe('user-1');
    expect(res.scopes).toEqual(['sms.send', 'balance.read']);
  });
});
