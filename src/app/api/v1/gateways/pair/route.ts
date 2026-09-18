import { NextRequest, NextResponse } from 'next/server';
import { prisma, Prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gatewayId } = await req.json();
    if (!gatewayId) {
      return NextResponse.json({ error: 'Gateway ID required' }, { status: 400 });
    }

    const gateway = await prisma.gateway.findUnique({
      where: { id: gatewayId, userId: session.user.id }
    });

    if (!gateway) {
      return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });
    }

    if (gateway.status === 'ONLINE') {
      return NextResponse.json({ error: 'Gateway is already paired and online' }, { status: 400 });
    }

    // Generate a short numeric code
    const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();

    const config: Record<string, unknown> = (gateway.config && typeof gateway.config === 'object' && !Array.isArray(gateway.config))
      ? { ...(gateway.config as Record<string, unknown>) }
      : {};
    config.pairingCode = pairingCode;

    await prisma.gateway.update({
      where: { id: gatewayId },
      data: { config: config as Prisma.InputJsonValue, status: 'PENDING_PAIRING' }
    });

    return NextResponse.json({ 
      success: true, 
      pairingCode, 
      expiresIn: '10 minutes',
      message: 'Enter this code in the Android App or ESP32 config portal.'
    });

  } catch (error: unknown) {
    console.error('Gateway Pair Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

