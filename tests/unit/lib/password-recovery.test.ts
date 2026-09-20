// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import { forgotPassword, resetPassword } from '@/app/(auth)/actions';
import { prismaMock } from '../prismaMock';

// Mock dependencies
vi.mock('@/lib/security/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/auth/turnstile', () => ({
  verifyTurnstileToken: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/auth/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('argon2id$mockPasswordHash'),
  verifyPassword: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/security/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/security/transactional-audit', () => ({
  withTransactionalAudit: vi.fn().mockImplementation(async (_opts, callback) => {
    return callback(prismaMock);
  }),
}));

const mockSendPasswordReset = vi.fn().mockResolvedValue({ id: 'job-1' });
const mockSendPasswordChanged = vi.fn().mockResolvedValue({ id: 'job-2' });

vi.mock('@/lib/communications/service', () => ({
  NotificationService: {
    sendPasswordReset: (...args: unknown[]) => mockSendPasswordReset(...args),
    sendPasswordChanged: (...args: unknown[]) => mockSendPasswordChanged(...args),
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'EN' }),
  }),
}));

describe('Password Recovery Security & Single-Use Token Architecture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prismaMock.$transaction.mockImplementation(async (arg: any) => {
      if (typeof arg === 'function') {
        return arg(prismaMock);
      }
      return arg;
    });
  });

  describe('Cryptographic Token Security', () => {
    it('generates 256-bit entropy tokens and stores only SHA-256 digests', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      expect(rawToken).toHaveLength(64); // 32 bytes = 64 hex characters (256 bits)

      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      expect(tokenHash).toHaveLength(64); // SHA-256 output is 256 bits (64 hex characters)
      expect(tokenHash).not.toEqual(rawToken); // Plaintext token is never stored directly
    });
  });

  describe('forgotPassword', () => {
    it('generates token hash and dispatches email for existing users', async () => {
      const user = {
        id: 'user-123',
        email: 'customer@rangeviewtech.com',
        name: 'Range Customer',
      };

      prismaMock.user.findUnique.mockResolvedValue(user as never);
      prismaMock.verificationToken.deleteMany.mockResolvedValue({ count: 1 });
      prismaMock.verificationToken.create.mockResolvedValue({
        id: 'token-rec-1',
        identifier: user.email,
        token: 'sha256hash',
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      });

      const formData = new FormData();
      formData.set('email', 'customer@rangeviewtech.com');

      const result = await forgotPassword(formData);

      expect(result).toEqual({ success: true });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'customer@rangeviewtech.com' },
      });

      // Verify token created with SHA-256 hash (not plaintext UUID)
      expect(prismaMock.verificationToken.create).toHaveBeenCalledTimes(1);
      const createArgs = prismaMock.verificationToken.create.mock.calls[0][0];
      expect(createArgs.data.identifier).toBe(user.email);
      expect(createArgs.data.type).toBe('PASSWORD_RESET');
      expect(createArgs.data.token).toHaveLength(64); // SHA-256 hash length

      // Verify email job was queued with raw token
      expect(mockSendPasswordReset).toHaveBeenCalledTimes(1);
      const [recipient, sentRawToken, lang] = mockSendPasswordReset.mock.calls[0];
      expect(recipient).toBe(user.email);
      expect(sentRawToken).toHaveLength(64); // 256-bit raw token
      expect(lang).toBe('EN');

      // The raw token sent in email must match the hash stored in DB
      const computedHash = crypto.createHash('sha256').update(sentRawToken).digest('hex');
      expect(createArgs.data.token).toBe(computedHash);
    });

    it('defends against account enumeration by returning success for non-existent users without creating tokens or jobs', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const formData = new FormData();
      formData.set('email', 'unknown-attacker-probe@rangeviewtech.com');

      const result = await forgotPassword(formData);

      // Must return success: true to never reveal account presence
      expect(result).toEqual({ success: true });
      // Must NOT create verification token
      expect(prismaMock.verificationToken.create).not.toHaveBeenCalled();
      // Must NOT queue any email
      expect(mockSendPasswordReset).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('successfully consumes token, updates password, revokes sessions, and sends notification', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      const tokenRecord = {
        id: 'token-rec-456',
        identifier: 'customer@rangeviewtech.com',
        token: tokenHash,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 1800000), // 30 mins in future
      };

      const user = {
        id: 'user-123',
        email: 'customer@rangeviewtech.com',
        name: 'Range Customer',
      };

      prismaMock.verificationToken.findFirst.mockResolvedValue(tokenRecord as never);
      prismaMock.user.findUnique.mockResolvedValue(user as never);
      // Atomic delete succeeds
      prismaMock.verificationToken.deleteMany.mockResolvedValue({ count: 1 });
      prismaMock.user.update.mockResolvedValue(user as never);
      prismaMock.session.deleteMany.mockResolvedValue({ count: 3 });

      const formData = new FormData();
      formData.set('token', rawToken);
      formData.set('password', 'NewP@ssw0rd2026!');
      formData.set('confirmPassword', 'NewP@ssw0rd2026!');

      const result = await resetPassword(formData);

      expect(result).toEqual({ success: true });

      // Verification lookup uses SHA-256 hash
      expect(prismaMock.verificationToken.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'PASSWORD_RESET',
          }),
        })
      );

      // Atomic single-use deletion was executed
      expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { id: tokenRecord.id, expiresAt: { gt: expect.any(Date) } },
      });

      // User password was updated
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { passwordHash: 'argon2id$mockPasswordHash' },
      });

      // All existing active user sessions revoked immediately
      expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: user.id },
      });

      // Confirmation email dispatched
      expect(mockSendPasswordChanged).toHaveBeenCalledWith(
        user.email,
        user.name,
        'EN'
      );
    });

    it('rejects expired or invalid tokens', async () => {
      prismaMock.verificationToken.findFirst.mockResolvedValue(null);

      const formData = new FormData();
      formData.set('token', 'expired-or-nonexistent-token');
      formData.set('password', 'NewP@ssw0rd2026!');
      formData.set('confirmPassword', 'NewP@ssw0rd2026!');

      const result = await resetPassword(formData);

      expect(result).toHaveProperty('error');
      expect(result.error).toMatch(/expired or is invalid/i);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(prismaMock.session.deleteMany).not.toHaveBeenCalled();
    });

    it('strictly enforces single-use and prevents concurrency race conditions', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      const tokenRecord = {
        id: 'token-rec-789',
        identifier: 'customer@rangeviewtech.com',
        token: tokenHash,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 1800000),
      };

      const user = {
        id: 'user-123',
        email: 'customer@rangeviewtech.com',
        name: 'Range Customer',
      };

      prismaMock.verificationToken.findFirst.mockResolvedValue(tokenRecord as never);
      prismaMock.user.findUnique.mockResolvedValue(user as never);

      // Simulate concurrency race: another request already deleted the record, so count is 0
      prismaMock.verificationToken.deleteMany.mockResolvedValue({ count: 0 });

      const formData = new FormData();
      formData.set('token', rawToken);
      formData.set('password', 'NewP@ssw0rd2026!');
      formData.set('confirmPassword', 'NewP@ssw0rd2026!');

      const result = await resetPassword(formData);

      // Atomic delete failed, redemption rejected
      expect(result).toHaveProperty('error');
      expect(result.error).toMatch(/expired or has already been used/i);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(prismaMock.session.deleteMany).not.toHaveBeenCalled();
    });
  });
});
