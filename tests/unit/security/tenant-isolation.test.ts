/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { generateApiKey, hashApiKey, verifyApiKey } from '@/lib/api-keys/service';
import { prismaMock } from '../prismaMock';

describe('Security: API Keys and Tenant Verification', () => {
  it('generates well-formed API keys with prefixes', () => {
    const keyData = generateApiKey();
    expect(keyData.key.startsWith('rsms_')).toBe(true);
    expect(keyData.keyPrefix).toBeDefined();
    expect(keyData.secret).toBeDefined();
    expect(keyData.keyHash).toBe(hashApiKey(keyData.secret));
  });

  it('rejects malformed API keys', async () => {
    const result = await verifyApiKey('invalid-format-key');
    expect(result.isValid).toBe(false);
  });

  it('verifies valid API keys using constant-time hash comparison', async () => {
    const keyData = generateApiKey();
    prismaMock.apiKey.findFirst.mockResolvedValue({
      id: 'key-1',
      keyPrefix: keyData.keyPrefix,
      keyHash: keyData.keyHash,
      status: 'ACTIVE',
      userId: 'user-xyz',
      clientId: null,
      scopes: ['sms.send'],
    } as never);

    const result = await verifyApiKey(keyData.key);
    expect(result.isValid).toBe(true);
    expect(result.userId).toBe('user-xyz');
    expect(result.scopes).toContain('sms.send');
  });

  it('rejects API keys with mismatched secrets', async () => {
    const keyData = generateApiKey();
    const wrongKey = `rsms_${keyData.keyPrefix}_${crypto.randomBytes(16).toString('hex')}`;

    prismaMock.apiKey.findFirst.mockResolvedValue({
      id: 'key-1',
      keyPrefix: keyData.keyPrefix,
      keyHash: keyData.keyHash,
      status: 'ACTIVE',
      userId: 'user-xyz',
      clientId: null,
      scopes: ['sms.send'],
    } as never);

    const result = await verifyApiKey(wrongKey);
    expect(result.isValid).toBe(false);
  });
});
