import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from 'node:crypto';
import { prisma, Prisma } from '@/lib/prisma';
import { verifyAuthenticatedSession } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/security/rate-limit';

const PAIRING_TTL_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAuthenticatedSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: unknown = await req.json().catch(() => null);
    const gatewayId = payload && typeof payload === 'object' && 'gatewayId' in payload
      ? payload.gatewayId
      : null;
    if (typeof gatewayId !== 'string' || gatewayId.length === 0 || gatewayId.length > 128) {
      return NextResponse.json({ error: 'Gateway ID required' }, { status: 400 });
    }

    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const rateLimit = await checkRateLimit('auth', `gateway-pair:${session.user.id}:${ip}`);
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many pairing requests. Please try again later.' }, { status: 429 });
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
    const pairingCode = randomInt(100000, 1_000_000).toString();
    const pairingExpiresAt = new Date(Date.now() + PAIRING_TTL_MS).toISOString();

    const config: Record<string, unknown> = (gateway.config && typeof gateway.config === 'object' && !Array.isArray(gateway.config))
      ? { ...(gateway.config as Record<string, unknown>) }
      : {};
    config.pairingCode = pairingCode;
    config.pairingExpiresAt = pairingExpiresAt;

    await prisma.gateway.update({
      where: { id: gatewayId },
      data: { config: config as Prisma.InputJsonValue, status: 'PENDING_PAIRING' }
    });

    return NextResponse.json({ 
      success: true, 
      pairingCode, 
      expiresIn: 600,
      expiresAt: pairingExpiresAt,
      message: 'Enter this code in the Android App or ESP32 config portal.'
    });

  } catch (error: unknown) {
    console.error('Gateway Pair Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

