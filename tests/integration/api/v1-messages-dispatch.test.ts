/** @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as sendMessage } from '@/app/api/v1/messages/route';
import { prismaMock } from '../../unit/prismaMock';

const dispatchMocks = vi.hoisted(() => ({
  withApiKey: vi.fn(),
  reserveCredits: vi.fn(),
  rateLimitCheck: vi.fn(),
  checkDestination: vi.fn(),
  checkVelocity: vi.fn(),
  verifyCompliance: vi.fn(),
  enqueueJob: vi.fn(),
}));

vi.mock('@/lib/api-keys/service', () => ({ withApiKey: dispatchMocks.withApiKey }));
vi.mock('@/lib/billing/billing-service', () => ({
  BillingService: { reserveCredits: dispatchMocks.reserveCredits },
}));
vi.mock('@/lib/security/rate-limiter', () => ({
  RateLimiter: { check: dispatchMocks.rateLimitCheck },
}));
vi.mock('@/lib/security/fraud-prevention', () => ({
  FraudPrevention: {
    checkDestination: dispatchMocks.checkDestination,
    checkVelocity: dispatchMocks.checkVelocity,
  },
}));
vi.mock('@/lib/compliance/regulatory-engine', () => ({
  RegulatoryEngine: { verifyPreDispatchCompliance: dispatchMocks.verifyCompliance },
}));
vi.mock('@/lib/jobs/db', () => ({ enqueueJob: dispatchMocks.enqueueJob }));

describe('POST /api/v1/messages atomic dispatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dispatchMocks.withApiKey.mockImplementation(async (request, _scope, handler) =>
      handler(request, {
        userId: 'user-1',
        apiKeyId: 'key-1',
        rateLimit: 100,
        rateLimitWindow: 60,
      })
    );
    dispatchMocks.reserveCredits.mockResolvedValue({
      success: true,
      reservationId: 'reservation-1',
      heldUnits: 2,
    });
    dispatchMocks.rateLimitCheck.mockResolvedValue({ allowed: true, resetTime: 0 });
    dispatchMocks.checkDestination.mockReturnValue({ isFraudulent: false });
    dispatchMocks.checkVelocity.mockResolvedValue({ isFraudulent: false });
    dispatchMocks.verifyCompliance.mockResolvedValue({ allowed: true });
    dispatchMocks.enqueueJob.mockResolvedValue({ id: 'job-1' });
    prismaMock.$transaction.mockImplementation(async (callback: unknown) => {
      if (typeof callback !== 'function') throw new Error('Expected interactive transaction');
      return callback(prismaMock);
    });
    prismaMock.senderId.findFirst.mockResolvedValue({ id: 'sender-1' } as never);
    prismaMock.campaign.create.mockResolvedValue({ id: 'campaign-1' } as never);
    prismaMock.message.create.mockImplementation(async () => ({ id: 'message-1' }) as never);
  });

  it('reserves credits and persists every message and job in one transaction', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/messages', {
      method: 'POST',
      body: JSON.stringify({
        recipients: ['+256700000001', '+256700000002'],
        message: 'Hello',
        senderId: 'RANGE',
      }),
    });

    const response = await sendMessage(request);
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body).toMatchObject({ acceptedCount: 2, campaignId: 'campaign-1', reservedUnits: 2 });
    expect(prismaMock.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      { isolationLevel: 'Serializable' }
    );
    expect(dispatchMocks.reserveCredits).toHaveBeenCalledWith(
      'user-1', expect.stringMatching(/^api_batch_/), 2, expect.any(String), prismaMock
    );
    expect(prismaMock.campaign.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.message.create).toHaveBeenCalledTimes(2);
    expect(dispatchMocks.enqueueJob).toHaveBeenCalledTimes(2);
    expect(dispatchMocks.enqueueJob).toHaveBeenCalledWith(expect.objectContaining({
      tx: prismaMock,
      type: 'sms.dispatch',
      priority: 'HIGH',
    }));
  });

  it('does not create campaigns or messages when the credit reservation fails', async () => {
    dispatchMocks.reserveCredits.mockResolvedValue({
      success: false,
      reservationId: '',
      heldUnits: 0,
      error: 'Insufficient credits',
    });
    const request = new NextRequest('http://localhost:3000/api/v1/messages', {
      method: 'POST',
      body: JSON.stringify({ recipients: ['+256700000001'], message: 'Hello', senderId: 'RANGE' }),
    });

    const response = await sendMessage(request);

    expect(response.status).toBe(402);
    expect(prismaMock.campaign.create).not.toHaveBeenCalled();
    expect(prismaMock.message.create).not.toHaveBeenCalled();
    expect(dispatchMocks.enqueueJob).not.toHaveBeenCalled();
  });

  it('uses the shared Unicode segmentation rules to calculate reserved credits', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/messages', {
      method: 'POST',
      body: JSON.stringify({
        recipients: ['+256700000001', '+256700000002'],
        message: 'Ж'.repeat(71),
        senderId: 'RANGE',
      }),
    });

    const response = await sendMessage(request);

    expect(response.status).toBe(202);
    expect(dispatchMocks.reserveCredits).toHaveBeenCalledWith(
      'user-1', expect.stringMatching(/^api_batch_/), 4, expect.any(String), prismaMock
    );
    expect(prismaMock.message.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ segmentCount: 2, totalUnits: 2 }),
    }));
  });
});
