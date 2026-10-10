/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { prismaMock } from '../../unit/prismaMock';
import { POST } from '@/app/api/v1/device/gateways/heartbeat/route';

vi.mock('@/lib/gateways/device-auth', () => ({
  withDeviceAuth: async (req: Request, handler: (request: Request, context: unknown) => unknown) =>
    handler(req, {
      gatewayId: 'gateway-1',
      gatewaySecret: 'secret',
      body: {},
      isE2EE: false,
    }),
  sendGatewayResponse: (payload: unknown) => Response.json(payload),
}));

describe('POST /api/v1/device/gateways/heartbeat', () => {
  it('does not return admin commands when the gateway is suspended', async () => {
    prismaMock.gateway.findUnique.mockResolvedValue({
      config: { adminActions: [{ type: 'RESET_SIM' }] },
      status: 'SUSPENDED',
    } as never);
    prismaMock.gatewayDevice.findFirst.mockResolvedValue(null);
    prismaMock.gateway.updateMany.mockResolvedValue({ count: 0 } as never);

    const response = await POST(new NextRequest('https://example.test/api/v1/device/gateways/heartbeat', {
      method: 'POST',
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.commands).toBeUndefined();
    expect(prismaMock.gateway.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'gateway-1', status: { not: 'SUSPENDED' } },
    }));
  });
});
