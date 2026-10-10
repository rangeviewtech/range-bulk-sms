import { NextRequest, NextResponse } from 'next/server';
import { prisma, Prisma } from '@/lib/prisma';
import { generateGatewayToken } from '@/lib/gateways/device-auth';
import { checkRateLimit } from '@/lib/security/rate-limit';

class PairingAlreadyClaimedError extends Error {}

function optionalText(value: unknown, maxLength: number): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim().slice(0, maxLength)
    : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const rateLimit = await checkRateLimit('auth', `gateway-register:${ip}`);
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many pairing attempts. Please try again later.' }, { status: 429 });
    }

    const payload: unknown = await req.json().catch(() => null);
    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
    const pairingCode = typeof body.pairingCode === 'string' ? body.pairingCode.trim() : '';
    if (!/^\d{6}$/.test(pairingCode)) {
      return NextResponse.json({ error: 'A valid six-digit pairing code is required' }, { status: 400 });
    }

    const hardwareModel = optionalText(body.hardwareModel, 100);
    const appVersion = optionalText(body.appVersion, 50);
    const osVersion = optionalText(body.osVersion, 50);
    const fcmToken = optionalText(body.fcmToken, 4096);

    // Query the indexed status plus JSON pairing code instead of loading every
    // pending gateway into application memory.
    const matchedGateway = await prisma.gateway.findFirst({
      where: {
        status: 'PENDING_PAIRING',
        config: { path: ['pairingCode'], equals: pairingCode },
      },
      select: { id: true, config: true },
    });

    if (!matchedGateway) {
      return NextResponse.json({ error: 'Invalid or expired pairing code' }, { status: 404 });
    }

    const config = matchedGateway.config && typeof matchedGateway.config === 'object' && !Array.isArray(matchedGateway.config)
      ? matchedGateway.config as Record<string, unknown>
      : {};
    const expiresAt = typeof config.pairingExpiresAt === 'string' ? Date.parse(config.pairingExpiresAt) : Number.NaN;
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return NextResponse.json({ error: 'Invalid or expired pairing code' }, { status: 404 });
    }

    const { token, hash } = generateGatewayToken();
    const updatedConfig: Record<string, unknown> = { ...config };
    delete updatedConfig.pairingCode;
    delete updatedConfig.pairingExpiresAt;

    await prisma.$transaction(async (tx) => {
      // Claim only the still-pending gateway with this exact code. Concurrent
      // registrations and a replaced code cannot both issue device tokens.
      const claimed = await tx.gateway.updateMany({
        where: {
          id: matchedGateway.id,
          status: 'PENDING_PAIRING',
          config: { equals: matchedGateway.config },
        },
        data: {
          status: 'ONLINE',
          config: updatedConfig as Prisma.InputJsonValue,
        },
      });
      if (claimed.count !== 1) throw new PairingAlreadyClaimedError();

      await tx.gatewayDevice.create({
        data: {
          gatewayId: matchedGateway.id,
          hardwareModel: hardwareModel ?? 'Unknown',
          appVersion: appVersion ?? '1.0.0',
          osVersion: osVersion ?? 'Unknown',
          fcmToken: fcmToken ?? null,
          lastHeartbeatAt: new Date(),
        },
      });

      await tx.gatewayToken.create({
        data: {
          gatewayId: matchedGateway.id,
          tokenHash: hash,
          name: `${hardwareModel ?? 'Device'} Token`,
        },
      });

      await tx.gatewayLog.create({
        data: {
          gatewayId: matchedGateway.id,
          event: 'DEVICE_PAIRED',
          message: `Device paired successfully: ${hardwareModel ?? 'Unknown'}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      gatewayId: matchedGateway.id,
      token,
      message: 'Gateway paired successfully',
    });
  } catch (error: unknown) {
    if (error instanceof PairingAlreadyClaimedError) {
      return NextResponse.json({ error: 'Invalid or expired pairing code' }, { status: 404 });
    }
    console.error('Gateway Register Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
