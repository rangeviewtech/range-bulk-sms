import { NextRequest, NextResponse } from 'next/server';
import { prisma, Prisma } from '@/lib/prisma';
import { generateGatewayToken } from '@/lib/gateways/device-auth';

export async function POST(req: NextRequest) {
  try {
    const { pairingCode, hardwareModel, appVersion, osVersion } = await req.json();

    if (!pairingCode) {
      return NextResponse.json({ error: 'Pairing code is required' }, { status: 400 });
    }

    // Find the gateway by pairing code (we store it temporarily in config during creation)
    const gateways = await prisma.gateway.findMany({
      where: { status: 'PENDING_PAIRING' }
    });

    let matchedGateway = null;
    for (const gw of gateways) {
      const config = gw.config as Record<string, unknown> | null;
      if (config && config.pairingCode === pairingCode) {
        matchedGateway = gw;
        break;
      }
    }

    if (!matchedGateway) {
      return NextResponse.json({ error: 'Invalid or expired pairing code' }, { status: 404 });
    }

    // Generate permanent token
    const { token, hash } = generateGatewayToken();

    // Remove the pairing code, set to ONLINE
    const updatedConfig: Record<string, unknown> = (matchedGateway.config && typeof matchedGateway.config === 'object' && !Array.isArray(matchedGateway.config))
      ? { ...(matchedGateway.config as Record<string, unknown>) }
      : {};
    delete updatedConfig.pairingCode;

    await prisma.$transaction(async (tx) => {
      // 1. Update gateway status
      await tx.gateway.update({
        where: { id: matchedGateway.id },
        data: {
          status: 'ONLINE',
          config: updatedConfig as Prisma.InputJsonValue
        }
      });

      // 2. Create device record
      await tx.gatewayDevice.create({
        data: {
          gatewayId: matchedGateway.id,
          hardwareModel: hardwareModel || 'Unknown',
          appVersion: appVersion || '1.0.0',
          osVersion: osVersion || 'Unknown',
          lastHeartbeatAt: new Date()
        }
      });

      // 3. Create token record
      await tx.gatewayToken.create({
        data: {
          gatewayId: matchedGateway.id,
          tokenHash: hash,
          name: `${hardwareModel || 'Device'} Token`
        }
      });
      
      // 4. Log pairing
      await tx.gatewayLog.create({
        data: {
          gatewayId: matchedGateway.id,
          event: 'DEVICE_PAIRED',
          message: `Device paired successfully: ${hardwareModel || 'Unknown'}`,
        }
      });
    });

    return NextResponse.json({
      success: true,
      gatewayId: matchedGateway.id,
      token, // Return raw token once
      message: 'Gateway paired successfully'
    });

  } catch (error: unknown) {
    console.error('Gateway Register Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

