import { prisma as db } from '@/lib/prisma';
import { CommunicationChannel } from '@/generated/prisma';
import crypto from 'crypto';

export interface GenerateOtpOptions {
  userId?: string;
  identifier: string;
  channel: CommunicationChannel;
  purpose: string;
  length?: number;
  ttlSeconds?: number;
}

export const OtpService = {
  /**
   * Generates a random numeric OTP and stores its hash securely.
   */
  async createOtp(opts: GenerateOtpOptions) {
    // 1. Invalidate any existing active OTPs for this exact purpose and identifier
    await db.otpRecord.updateMany({
      where: {
        identifier: opts.identifier,
        purpose: opts.purpose,
        invalidated: false,
        expiresAt: { gt: new Date() },
      },
      data: { invalidated: true },
    });

    // 2. Generate secure code
    const length = opts.length || parseInt(process.env.OTP_LENGTH || '6', 10);
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length); // crypto.randomInt is exclusive on max
    const otp = crypto.randomInt(min, max).toString();

    // Hash before saving
    const codeHash = crypto.createHash('sha256').update(otp).digest('hex');

    const ttlSeconds = opts.ttlSeconds || parseInt(process.env.OTP_TTL_SECONDS || '300', 10);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const record = await db.otpRecord.create({
      data: {
        userId: opts.userId,
        identifier: opts.identifier,
        channel: opts.channel,
        purpose: opts.purpose,
        codeHash,
        expiresAt,
        maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10),
      },
    });

    return { otpId: record.id, otp };
  },

  /**
   * Verifies an OTP, enforcing max attempts and expiration.
   */
  async verifyOtp(identifier: string, purpose: string, providedCode: string, userId?: string) {
    const record = await db.otpRecord.findFirst({
      where: {
        identifier,
        purpose,
        ...(userId ? { userId } : {}),
        invalidated: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) return { valid: false, error: 'No active OTP found' };
    if (record.expiresAt <= new Date()) return { valid: false, error: 'OTP expired' };
    if (record.attempts >= record.maxAttempts) {
      await db.otpRecord.update({ where: { id: record.id }, data: { invalidated: true } });
      return { valid: false, error: 'Maximum attempts exceeded' };
    }

    const providedHash = crypto.createHash('sha256').update(providedCode).digest('hex');

    if (
      providedHash.length !== record.codeHash.length ||
      !crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(record.codeHash))
    ) {
      await db.otpRecord.updateMany({
        where: { id: record.id, invalidated: false, attempts: { lt: record.maxAttempts } },
        data: { attempts: { increment: 1 } },
      });
      return { valid: false, error: 'Invalid code' };
    }

    // Success - invalidate it
    const consumed = await db.otpRecord.updateMany({
      where: {
        id: record.id,
        invalidated: false,
        attempts: { lt: record.maxAttempts },
        expiresAt: { gt: new Date() },
      },
      data: { invalidated: true },
    });
    if (consumed.count !== 1) return { valid: false, error: 'Invalid or expired code' };

    return { valid: true };
  },
};
