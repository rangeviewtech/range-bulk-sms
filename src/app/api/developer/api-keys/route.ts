import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/session';
import { generateApiKey, calculateNextQuotaReset } from '@/lib/api-keys/service';
import { createApiKeySchema } from '@/lib/validations/api-keys';
import { AppError } from '@/lib/errors';
import { Prisma } from '@/generated/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);

    const appFilter = searchParams.get('app');
    const envFilter = searchParams.get('environment');
    const statusFilter = searchParams.get('status');
    const quotaFilter = searchParams.get('quota');
    const query = searchParams.get('q');

    const where: Prisma.ApiKeyWhereInput = {
      userId: session.userId,
    };

    if (appFilter && appFilter !== 'all') {
      where.appName = { equals: appFilter, mode: 'insensitive' };
    }

    if (envFilter && envFilter !== 'all') {
      where.environment = envFilter;
    }

    if (statusFilter && statusFilter !== 'all') {
      where.status = statusFilter as Prisma.EnumApiKeyStatusFilter['equals'];
    }

    if (quotaFilter === 'unlimited') {
      where.quotaLimit = null;
    } else if (quotaFilter === 'capped') {
      where.quotaLimit = { not: null };
    }

    if (query && query.trim()) {
      where.OR = [
        { name: { contains: query.trim(), mode: 'insensitive' } },
        { appName: { contains: query.trim(), mode: 'insensitive' } },
        { keyPrefix: { contains: query.trim(), mode: 'insensitive' } },
      ];
    }

    const apiKeys = await prisma.apiKey.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch distinct user apps for filter tabs and grouping
    const allUserKeys = await prisma.apiKey.findMany({
      where: { userId: session.userId },
      select: {
        appName: true,
        environment: true,
        status: true,
        quotaUsed: true,
        quotaLimit: true,
      },
    });

    const distinctApps = Array.from(new Set(allUserKeys.map((k) => k.appName).filter(Boolean)));
    const totalActive = allUserKeys.filter((k) => k.status === 'ACTIVE').length;
    const totalQuotaUsed = allUserKeys.reduce((acc, k) => acc + (k.quotaUsed || 0), 0);
    const uncappedKeys = allUserKeys.filter((k) => k.quotaLimit === null).length;
    const cappedKeys = allUserKeys.filter((k) => k.quotaLimit !== null).length;

    return NextResponse.json({
      success: true,
      data: apiKeys,
      meta: {
        apps: distinctApps,
        totalKeys: allUserKeys.length,
        activeKeys: totalActive,
        totalQuotaUsed,
        uncappedKeys,
        cappedKeys,
      },
    });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json().catch(() => ({}));

    const parsed = createApiKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      name,
      appName,
      environment,
      scopes,
      rateLimit,
      rateLimitWindow,
      quotaLimit,
      quotaPeriod,
      alertThreshold,
      ipWhitelist,
      expiresInDays,
      expiresAt: directExpiresAt,
    } = parsed.data;

    // Check if user explicitly set a quota limit or chose no quota (unlimited)
    const hasQuota = typeof quotaLimit === 'number' && quotaLimit > 0;
    const resolvedQuotaPeriod = hasQuota ? (quotaPeriod ?? 'MONTHLY') : 'UNLIMITED';
    const quotaResetAt = hasQuota ? calculateNextQuotaReset(resolvedQuotaPeriod) : null;

    // Generate cryptographic key and prefix
    const generated = generateApiKey();

    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) 
      : directExpiresAt 
        ? new Date(directExpiresAt) 
        : null;

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.userId,
        name,
        appName: appName || 'Default App',
        environment: environment || 'production',
        keyPrefix: generated.keyPrefix,
        keyHash: generated.keyHash,
        scopes,
        rateLimit: rateLimit ?? 100,
        rateLimitWindow: rateLimitWindow ?? 60,
        quotaLimit: hasQuota ? quotaLimit : null,
        quotaPeriod: resolvedQuotaPeriod,
        quotaUsed: 0,
        quotaResetAt,
        alertThreshold: hasQuota ? (alertThreshold ?? 80) : null,
        ipWhitelist: ipWhitelist || [],
        expiresAt,
        status: 'ACTIVE',
      },
    });

    // Return the full plaintext key ONCE to the user
    return NextResponse.json(
      {
        success: true,
        key: generated.key, // Full plaintext key (e.g., rsms_prefix_secret)
        data: {
          id: apiKey.id,
          name: apiKey.name,
          appName: apiKey.appName,
          environment: apiKey.environment,
          keyPrefix: apiKey.keyPrefix,
          scopes: apiKey.scopes,
          rateLimit: apiKey.rateLimit,
          quotaLimit: apiKey.quotaLimit,
          quotaPeriod: apiKey.quotaPeriod,
          quotaUsed: apiKey.quotaUsed,
          quotaResetAt: apiKey.quotaResetAt,
          status: apiKey.status,
          createdAt: apiKey.createdAt,
          expiresAt: apiKey.expiresAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
