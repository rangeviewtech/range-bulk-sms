// @vitest-environment node
import crypto from 'node:crypto';
import { describe, it, expect } from 'vitest';
import { OtpService } from '@/lib/auth/otp';
import { prismaMock } from '../prismaMock';
const record = {
  id: 'otp',
  userId: 'user',
  identifier: 'user@example.com',
  purpose: 'LOGIN',
  channel: 'EMAIL' as const,
  codeHash: crypto.createHash('sha256').update('123456').digest('hex'),
  attempts: 0,
  maxAttempts: 5,
  invalidated: false,
  expiresAt: new Date(Date.now() + 60_000),
  createdAt: new Date(),
};

describe('OTP consumption', () => {
  it('rejects a code already consumed by a concurrent verifier', async () => {
    prismaMock.otpRecord.findFirst.mockResolvedValue(record);
    prismaMock.otpRecord.updateMany.mockResolvedValue({ count: 0 });
    expect(await OtpService.verifyOtp(record.identifier, 'LOGIN', '123456', 'user')).toMatchObject({
      valid: false,
    });
  });
  it('consumes only a live code with attempts remaining', async () => {
    prismaMock.otpRecord.findFirst.mockResolvedValue(record);
    prismaMock.otpRecord.updateMany.mockResolvedValue({ count: 1 });
    expect(await OtpService.verifyOtp(record.identifier, 'LOGIN', '123456', 'user')).toEqual({
      valid: true,
    });
    expect(prismaMock.otpRecord.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          invalidated: false,
          attempts: { lt: 5 },
          expiresAt: { gt: expect.any(Date) },
        }),
      })
    );
  });
  it('increments failed attempts atomically', async () => {
    prismaMock.otpRecord.findFirst.mockResolvedValue(record);
    prismaMock.otpRecord.updateMany.mockResolvedValue({ count: 1 });
    await OtpService.verifyOtp(record.identifier, 'LOGIN', '999999', 'user');
    expect(prismaMock.otpRecord.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { attempts: { increment: 1 } } })
    );
  });
});
