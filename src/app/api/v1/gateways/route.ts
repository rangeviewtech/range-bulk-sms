import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { GatewayType } from '@/generated/prisma/client';

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

    return NextResponse.json({ success: true, gateways });
  } catch (error: unknown) {
    console.error('List Gateways Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const session = await verifySession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type, maxThroughput } = await req.json();

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    // Validate type
    if (!Object.values(GatewayType).includes(type as GatewayType)) {
      return NextResponse.json({ error: 'Invalid gateway type' }, { status: 400 });
    }

    const gateway = await prisma.gateway.create({
      data: {
        name,
        type: type as GatewayType,
        userId: session.user.id,
        status: 'PENDING_PAIRING',
        maxThroughput: maxThroughput ? parseInt(maxThroughput) : undefined,
      }
    });

    return NextResponse.json({ success: true, gateway });
  } catch (error: unknown) {
    console.error('Create Gateway Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};


