// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cleanupExpiredTokens } from '@/lib/cron/cleanup-tokens';
import { GET as cleanupRoute } from '@/app/api/cron/cleanup/route';
import { prismaMock } from '../prismaMock';

vi.mock('@/lib/logger', () => ({
  logger: {
    audit: vi.fn().mockResolvedValue(true),
    error: vi.fn().mockResolvedValue(true),
    info: vi.fn().mockResolvedValue(true),
  },
}));

describe('Automatic Token Cleanup & Maintenance Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-cron-secret-123';
  });

  describe('cleanupExpiredTokens', () => {
    it('purges expired tokens in batches while preserving active tokens', async () => {
      // Mock findMany returning 2 expired verification tokens
      prismaMock.verificationToken.findMany.mockResolvedValue([
        { id: 'exp-1' } as never,
        { id: 'exp-2' } as never,
      ]);
      prismaMock.verificationToken.deleteMany.mockResolvedValue({ count: 2 });

      // Mock findMany returning 1 expired OTP record
      prismaMock.otpRecord.findMany.mockResolvedValue([{ id: 'exp-otp-1' } as never]);
      prismaMock.otpRecord.deleteMany.mockResolvedValue({ count: 1 });

      // Mock findMany returning 0 expired telegram tokens
      prismaMock.telegramLinkingToken.findMany.mockResolvedValue([]);
      prismaMock.telegramLinkingToken.deleteMany.mockResolvedValue({ count: 0 });

      const result = await cleanupExpiredTokens(100);

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(3);
      expect(result.details.verificationTokens).toBe(2);
      expect(result.details.otpRecords).toBe(1);
      expect(result.details.telegramTokens).toBe(0);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);

      // Verify queries filtered strictly by expiresAt < now
      expect(prismaMock.verificationToken.findMany).toHaveBeenCalledWith({
        where: { expiresAt: { lt: expect.any(Date) } },
        select: { id: true },
        take: 100,
      });

      expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['exp-1', 'exp-2'] } },
      });
    });
  });

  describe('/api/cron/cleanup API Endpoint', () => {
    it('rejects requests without authorization header with 401', async () => {
      const req = new Request('http://localhost:3000/api/cron/cleanup');
      const res = await cleanupRoute(req);
      expect(res.status).toBe(401);
    });

    it('rejects requests with invalid bearer token with 401', async () => {
      const req = new Request('http://localhost:3000/api/cron/cleanup', {
        headers: { Authorization: 'Bearer wrong-secret' },
      });
      const res = await cleanupRoute(req);
      expect(res.status).toBe(401);
    });

    it('executes cleanup and returns metrics when valid CRON_SECRET is provided', async () => {
      prismaMock.verificationToken.findMany.mockResolvedValue([]);
      prismaMock.otpRecord.findMany.mockResolvedValue([]);
      prismaMock.telegramLinkingToken.findMany.mockResolvedValue([]);

      const req = new Request('http://localhost:3000/api/cron/cleanup', {
        headers: { Authorization: 'Bearer test-cron-secret-123' },
      });

      const res = await cleanupRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json).toHaveProperty('deletedCount');
      expect(json).toHaveProperty('durationMs');
    });
  });
});
