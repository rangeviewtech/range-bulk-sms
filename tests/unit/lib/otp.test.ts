import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OtpService } from '@/lib/auth/otp';
import { prismaMock } from '../prismaMock';

describe('OtpService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an OTP and invalidates existing ones', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prismaMock.otpRecord.updateMany.mockResolvedValue({ count: 1 } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prismaMock.otpRecord.create.mockResolvedValue({ id: 'otp-1' } as any);

    const result = await OtpService.createOtp({
      identifier: 'user@example.com',
      channel: 'EMAIL',
      purpose: 'LOGIN',
    });

    expect(prismaMock.otpRecord.updateMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.otpRecord.create).toHaveBeenCalledTimes(1);
    expect(result.otp).toHaveLength(6);
    expect(result.otpId).toBe('otp-1');
  });
});
