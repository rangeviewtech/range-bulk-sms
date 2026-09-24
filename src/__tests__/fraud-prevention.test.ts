import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FraudPrevention } from '@/lib/security/fraud-prevention';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    message: {
      count: vi.fn(),
    },
  },
}));

describe('FraudPrevention Domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkDestination', () => {
    it('blocks high-risk toll fraud premium rate prefixes', () => {
      const blockedPrefixes = ['+8812345678', '+8829876543', '+2119123456', '+2526123456', '+2693212345'];

      for (const phone of blockedPrefixes) {
        const result = FraudPrevention.checkDestination(phone);
        expect(result.isFraudulent).toBe(true);
        expect(result.reason).toContain('High risk premium destination blocked');
      }
    });

    it('allows standard East African and international destination numbers', () => {
      const validNumbers = ['+256772123456', '+256701987654', '+254712345678', '+14155552671', '+447911123456'];

      for (const phone of validNumbers) {
        const result = FraudPrevention.checkDestination(phone);
        expect(result.isFraudulent).toBe(false);
        expect(result.reason).toBeUndefined();
      }
    });
  });

  describe('checkVelocity (OTP Pumping Protection)', () => {
    it('returns isFraudulent: false when message count is below the threshold', async () => {
      vi.mocked(prisma.message.count).mockResolvedValue(3);

      const result = await FraudPrevention.checkVelocity('user-1', '+256772123456');
      expect(result.isFraudulent).toBe(false);
      expect(result.reason).toBeUndefined();
      expect(prisma.message.count).toHaveBeenCalledTimes(1);
    });

    it('detects and flags OTP pumping when message count exceeds threshold', async () => {
      vi.mocked(prisma.message.count).mockResolvedValue(5);

      const result = await FraudPrevention.checkVelocity('user-attacker', '+256772999888');
      expect(result.isFraudulent).toBe(true);
      expect(result.reason).toContain('OTP Pumping detected');
      expect(result.reason).toContain('+256772999888');
    });
  });
});
