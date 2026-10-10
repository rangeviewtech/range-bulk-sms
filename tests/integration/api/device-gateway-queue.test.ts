/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { prismaMock } from '../../unit/prismaMock';
import { GET } from '@/app/api/v1/device/gateways/queue/route';

vi.mock('@/lib/gateways/device-auth', () => ({
  withDeviceAuth: async (req: Request, handler: (request: Request, context: unknown) => unknown) =>
    handler(req, { gatewayId: 'gateway-1', gatewaySecret: 'secret', isE2EE: false }),
  sendGatewayResponse: (payload: unknown) => Response.json(payload),
}));

describe('GET /api/v1/device/gateways/queue', () => {
  it('returns the configured per-minute limit even when no messages are queued', async () => {
    prismaMock.gateway.findUnique.mockResolvedValue({
      status: 'ONLINE',
      batchSize: 10,
      maxThroughput: 3,
    } as never);
    prismaMock.$queryRaw.mockResolvedValue([]);

    const response = await GET(new NextRequest('https://example.test/api/v1/device/gateways/queue'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ success: true, messages: [], maxThroughput: 3 });
  });
});
