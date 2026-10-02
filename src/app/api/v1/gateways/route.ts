import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';

export const GET = async (_req: NextRequest) => {
  try {
    const session = await verifySession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gateways = await prisma.gateway.findMany({
      where: { userId: session.user.id },
      include: {
        devices: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Compute online status based on last heartbeat (2 minutes threshold)
    const TWO_MINUTES = 2 * 60 * 1000;
    const gatewaysWithOnlineStatus = gateways.map((gw) => {
      let isOnline = false;
      if (gw.devices && gw.devices.length > 0) {
        const lastHeartbeat = gw.devices[0].lastHeartbeatAt;
        if (lastHeartbeat) {
          isOnline = (new Date().getTime() - new Date(lastHeartbeat).getTime()) < TWO_MINUTES;
        }
      }
      return {
        ...gw,
        isOnline
      };
    });

    return NextResponse.json({ success: true, gateways: gatewaysWithOnlineStatus });
  } catch (error: unknown) {
    console.error('List Gateways Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};

import { createGatewaySchema } from '@/lib/validations/gateway';

export const POST = async (req: NextRequest) => {
  try {
    const session = await verifySession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const raw = await req.json().catch(() => ({}));
    const parsed = createGatewaySchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors[0]?.message || 'Invalid gateway parameters',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, type, maxThroughput } = parsed.data;

    const gateway = await prisma.gateway.create({
      data: {
        name,
        type,
        userId: session.user.id,
        status: 'PENDING_PAIRING',
        maxThroughput: maxThroughput || undefined,
      }
    });

    return NextResponse.json({ success: true, gateway });
  } catch (error: unknown) {
    console.error('Create Gateway Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};



