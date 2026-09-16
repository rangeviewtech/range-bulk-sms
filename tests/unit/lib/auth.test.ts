/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '@/lib/auth/session';

describe('Auth Session', () => {
  it('encrypts and decrypts a payload successfully', async () => {
    const payload = { userId: '12345', role: 'admin' };

    const token = await encrypt(payload);
    expect(typeof token).toBe('string');

    const decrypted = await decrypt(token);
    expect(decrypted).not.toBeNull();
    expect(decrypted?.userId).toBe('12345');
    expect(decrypted?.role).toBe('admin');
  });

  it('returns null for an invalid token', async () => {
    const decrypted = await decrypt('invalid.token.here');
    expect(decrypted).toBeNull();
  });
});
