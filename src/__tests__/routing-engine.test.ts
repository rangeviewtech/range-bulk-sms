import { describe, it, expect, vi } from 'vitest';
import { RoutingEngine } from '@/lib/sms/routing-engine';

// Mock the dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    smsProvider: {
      findMany: vi.fn().mockResolvedValue([
        { id: '1', name: 'Twilio', createdAt: new Date('2026-01-01') },
        { id: '2', name: 'InfoBip', createdAt: new Date('2026-01-02') }
      ])
    }
  }
}));

describe('RoutingEngine', () => {
  it('should resolve a route and return a provider adapter', async () => {
    const route = await RoutingEngine.resolveRoute('+1234567890');
    
    // In our mock, the first returned provider is Twilio based on findMany.
    // The routing engine just grabs providers[0].
    expect(route).toBeDefined();
    expect(route?.providerId).toBe('1');
    expect(route?.adapter.providerName).toBe('Twilio');
  });
});
