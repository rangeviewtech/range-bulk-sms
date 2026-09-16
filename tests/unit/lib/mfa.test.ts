// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { TOTP, ScureBase32Plugin, NobleCryptoPlugin } from 'otplib';
import { generateMfaSecret, verifyMfaToken } from '@/lib/auth/mfa';

describe('MFA verification', () => {
  it('returns true only for a valid token, and false for an invalid result object', async () => {
    const totp = new TOTP({ base32: new ScureBase32Plugin(), crypto: new NobleCryptoPlugin() });
    const secret = generateMfaSecret();
    const valid = await totp.generate({ secret });
    expect(await verifyMfaToken(valid, secret)).toBe(true);
    const invalid = ((Number(valid) + 1) % 1_000_000).toString().padStart(6, '0');
    expect(await verifyMfaToken(invalid, secret)).toBe(false);
  });
  it.each(['', 'abcdef', '12345', '1234567'])('rejects malformed code %s', async (code) => {
    expect(await verifyMfaToken(code, generateMfaSecret())).toBe(false);
  });
});
