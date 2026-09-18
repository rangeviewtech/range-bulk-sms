import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withDeviceAuth } from '@/lib/gateways/device-auth';

export const POST = async (req: NextRequest) => {
  return withDeviceAuth(req, async (req, { gatewayId }) => {
    try {
      const { batteryLevel, isCharging, signalStrength, networkOperator } = await req.json();

      // Ensure device record exists
      const device = await prisma.gatewayDevice.findFirst({
        where: { gatewayId }
      });

      if (device) {
        await prisma.gatewayDevice.update({
          where: { id: device.id },
          data: {
            batteryLevel,
            isCharging,
            signalStrength,
            networkOperator,
            lastHeartbeatAt: new Date(),
            ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || undefined
          }
        });
      } else {
        await prisma.gatewayDevice.create({
          data: {
            gatewayId,
            batteryLevel,
            isCharging,
            signalStrength,
            networkOperator,
            lastHeartbeatAt: new Date(),
          }
        });
      }

      // Also mark gateway as ONLINE if it was offline
      await prisma.gateway.update({
        where: { id: gatewayId },
        data: { status: 'ONLINE' }
      });

      return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
    } catch (error: unknown) {
      console.error('Gateway Heartbeat Error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
};

