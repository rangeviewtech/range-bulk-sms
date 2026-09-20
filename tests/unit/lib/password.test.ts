import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('Password Utilities', () => {
  it('hashes and verifies a password correctly', async () => {
    const password = 'SuperSecretPassword123!';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(typeof hash).toBe('string');

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  }, 15000);

  it('rejects an incorrect password', async () => {
    const password = 'SuperSecretPassword123!';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword('WrongPassword!', hash);
    expect(isValid).toBe(false);
  }, 15000);
});
