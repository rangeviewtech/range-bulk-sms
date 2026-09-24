import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConsentService } from '@/lib/sms/consent-service';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contact: {
      findUnique: vi.fn()
    },
    consentLog: {
      findFirst: vi.fn(),
      create: vi.fn()
    }
  }
}));

describe('ConsentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkEligibility', () => {
    it('should allow transactional messages even if user opted out', async () => {
      // Mock contact exists
      // @ts-expect-error Mocking prisma method
      prisma.contact.findUnique.mockResolvedValue({ id: 'c-1', phone: '+123', optedOut: true });
      
      // Check for TRANSACTIONAL
      const result = await ConsentService.checkEligibility('c-1', 'TRANSACTIONAL');
      
      expect(result.eligible).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should block marketing messages if user explicitly opted out globally', async () => {
      // Mock contact opted out globally
      // @ts-expect-error Mocking prisma method
      prisma.contact.findUnique.mockResolvedValue({ id: 'c-1', phone: '+123', optedOut: true });
      
      const result = await ConsentService.checkEligibility('c-1', 'MARKETING');
      
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('Contact has opted out of marketing communications');
    });

    it('should allow marketing messages if consentGiven is true', async () => {
      // @ts-expect-error Mocking prisma method
      prisma.contact.findUnique.mockResolvedValue({ id: 'c-1', phone: '+123', optedOut: false, consentGiven: true });
      
      const result = await ConsentService.checkEligibility('c-1', 'MARKETING');
      
      expect(result.eligible).toBe(true);
    });
  });
});
