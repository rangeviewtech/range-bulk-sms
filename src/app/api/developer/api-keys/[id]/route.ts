import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/session';
import { updateApiKeySchema } from '@/lib/validations/api-keys';
import { calculateNextQuotaReset } from '@/lib/api-keys/service';
import { AppError } from '@/lib/errors';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        appName: true,
        environment: true,
        keyPrefix: true,
        status: true,
        scopes: true,
        rateLimit: true,
        rateLimitWindow: true,
        quotaLimit: true,
        quotaPeriod: true,
        quotaUsed: true,
        quotaResetAt: true,
        alertThreshold: true,
        ipWhitelist: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
        revokedAt: true,
        userId: true,
      },
    });

    if (!apiKey || apiKey.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'API key not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: apiKey });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const existing = await prisma.apiKey.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'API key not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = updateApiKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};

    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.appName !== undefined) data.appName = parsed.data.appName;
    if (parsed.data.environment !== undefined) data.environment = parsed.data.environment;
    if (parsed.data.alertThreshold !== undefined) data.alertThreshold = parsed.data.alertThreshold;
    if (parsed.data.rateLimit !== undefined) data.rateLimit = parsed.data.rateLimit;
    if (parsed.data.rateLimitWindow !== undefined) data.rateLimitWindow = parsed.data.rateLimitWindow;
    if (parsed.data.ipWhitelist !== undefined) data.ipWhitelist = parsed.data.ipWhitelist;

    if (parsed.data.quotaLimit !== undefined) {
      if (parsed.data.quotaLimit === null || parsed.data.quotaLimit <= 0) {
        data.quotaLimit = null;
        data.quotaPeriod = 'UNLIMITED';
        data.quotaResetAt = null;
        data.alertThreshold = null;
      } else {
        data.quotaLimit = parsed.data.quotaLimit;
        const period = parsed.data.quotaPeriod || existing.quotaPeriod || 'MONTHLY';
        data.quotaPeriod = period;
        data.quotaResetAt = calculateNextQuotaReset(period);
        if (parsed.data.alertThreshold !== undefined) {
          data.alertThreshold = parsed.data.alertThreshold;
        }
      }
    } else if (parsed.data.quotaPeriod !== undefined) {
      data.quotaPeriod = parsed.data.quotaPeriod;
      data.quotaResetAt = calculateNextQuotaReset(parsed.data.quotaPeriod);
    }

    if (parsed.data.status !== undefined) {
      data.status = parsed.data.status;
      if (parsed.data.status === 'REVOKED') {
        data.revokedAt = new Date();
      }
    }

    const updated = await prisma.apiKey.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        appName: true,
        environment: true,
        keyPrefix: true,
        status: true,
        scopes: true,
        rateLimit: true,
        quotaLimit: true,
        quotaPeriod: true,
        quotaUsed: true,
        quotaResetAt: true,
        alertThreshold: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const existing = await prisma.apiKey.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'API key not found' }, { status: 404 });
    }

    const updated = await prisma.apiKey.update({
      where: { id },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: { id: updated.id, status: updated.status } });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
