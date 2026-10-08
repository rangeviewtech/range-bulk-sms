import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { RateLimiter } from '@/lib/security/rate-limiter';

export interface ApiKeyVerificationResult {
  isValid: boolean;
  apiKeyId?: string;
  clientId?: string;
  userId?: string;
  appName?: string;
  environment?: string;
  scopes?: string[];
  quotaExceeded?: boolean;
  quotaLimit?: number | null;
  quotaUsed?: number;
  quotaPeriod?: string | null;
  quotaResetAt?: Date | null;
  alertThreshold?: number | null;
  rateLimit?: number;
  rateLimitWindow?: number;
}

export interface ApiKeyContext {
  clientId?: string;
  userId?: string;
  apiKeyId?: string;
  appName?: string;
  environment?: string;
  scopes?: string[];
  quotaLimit?: number | null;
  quotaUsed?: number;
  quotaPeriod?: string | null;
  quotaResetAt?: Date | null;
  rateLimit?: number;
  rateLimitWindow?: number;
}

export function generateApiKey(): { key: string; keyPrefix: string; secret: string; keyHash: string } {
  const prefix = crypto.randomBytes(6).toString('hex'); // 12 chars
  const secret = crypto.randomBytes(16).toString('hex'); // 32 chars
  const key = `rsms_${prefix}_${secret}`;
  
  const hash = crypto.createHash('sha256').update(secret).digest('hex');
  
  return { key, keyPrefix: prefix, secret, keyHash: hash };
}

export function hashApiKey(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

/**
 * Calculates the next quota rollover timestamp given a period.
 * Supports: DAILY, WEEKLY, MONTHLY, TOTAL, UNLIMITED.
 */
export function calculateNextQuotaReset(
  period: string | null | undefined,
  fromDate: Date = new Date()
): Date | null {
  if (!period || period.toUpperCase() === 'TOTAL' || period.toUpperCase() === 'UNLIMITED') {
    return null;
  }

  const date = new Date(fromDate);
  switch (period.toUpperCase()) {
    case 'DAILY':
      date.setUTCDate(date.getUTCDate() + 1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    case 'WEEKLY':
      date.setUTCDate(date.getUTCDate() + 7);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    case 'MONTHLY':
      date.setUTCMonth(date.getUTCMonth() + 1);
      date.setUTCDate(1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    default:
      return null;
  }
}

export async function verifyApiKey(
  key: string,
  clientIp?: string
): Promise<ApiKeyVerificationResult> {
  if (!key.startsWith('rsms_')) return { isValid: false };
  
  const parts = key.split('_');
  if (parts.length !== 3) return { isValid: false };
  
  const prefix = parts[1];
  const secret = parts[2];
  
  // Try to find the API key in the database using the plaintext prefix
  const apiKeyRecord = await prisma.apiKey.findFirst({
    where: { 
      keyPrefix: prefix, 
      status: 'ACTIVE',
      revokedAt: null,
      user: { is: { status: 'ACTIVE' } },
    }
  });
  
  if (!apiKeyRecord) return { isValid: false };

  // Check expiration if set
  if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
    return { isValid: false };
  }

  // Check IP whitelist if configured
  if (clientIp && apiKeyRecord.ipWhitelist && apiKeyRecord.ipWhitelist.length > 0) {
    const isAllowed = apiKeyRecord.ipWhitelist.includes(clientIp);
    if (!isAllowed) {
      return { isValid: false };
    }
  }
  
  // Verify secret hash matches using constant-time comparison
  const hash = hashApiKey(secret);
  const actualBuffer = Buffer.from(hash);
  const expectedBuffer = Buffer.from(apiKeyRecord.keyHash);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return { isValid: false };
  }

  const now = new Date();
  let quotaUsed = apiKeyRecord.quotaUsed ?? 0;
  let quotaResetAt = apiKeyRecord.quotaResetAt;
  let quotaLimit = apiKeyRecord.quotaLimit;

  if (quotaLimit !== null && quotaLimit !== undefined && quotaResetAt && now >= quotaResetAt) {
    const nextResetAt = calculateNextQuotaReset(apiKeyRecord.quotaPeriod, now);
    const reset = await prisma.apiKey.updateMany({
      where: {
        id: apiKeyRecord.id,
        status: 'ACTIVE',
        revokedAt: null,
        quotaResetAt,
        user: { is: { status: 'ACTIVE' } },
      },
      data: { quotaUsed: 0, quotaResetAt: nextResetAt },
    });

    if (reset.count === 1) {
      quotaUsed = 0;
      quotaResetAt = nextResetAt;
    } else {
      // Another request may have rolled the window over first. Read its new
      // state so this request cannot reset a counter that has already accrued.
      const latest = await prisma.apiKey.findFirst({
        where: {
          id: apiKeyRecord.id,
          status: 'ACTIVE',
          revokedAt: null,
          user: { is: { status: 'ACTIVE' } },
        },
      });
      if (!latest || (latest.expiresAt && latest.expiresAt <= now)) return { isValid: false };
      quotaUsed = latest.quotaUsed ?? 0;
      quotaResetAt = latest.quotaResetAt;
    }
  }

  const quotaExceeded = (used: number, record: typeof apiKeyRecord): ApiKeyVerificationResult => ({
    isValid: false,
    quotaExceeded: true,
    apiKeyId: record.id,
    appName: record.appName,
    environment: record.environment,
    clientId: record.clientId || undefined,
    userId: record.userId || undefined,
    scopes: (record.scopes as string[]) || [],
    quotaLimit: record.quotaLimit,
    quotaUsed: used,
    quotaPeriod: record.quotaPeriod,
    quotaResetAt: record.quotaResetAt,
    alertThreshold: record.alertThreshold,
    rateLimit: record.rateLimit,
    rateLimitWindow: record.rateLimitWindow,
  });

  if (quotaLimit !== null && quotaLimit !== undefined && quotaUsed >= quotaLimit) {
    return quotaExceeded(quotaUsed, { ...apiKeyRecord, quotaResetAt });
  }

  // Reserve a request atomically. The conditional update prevents concurrent
  // requests from each passing a stale read and exceeding the configured cap.
  let reserved = false;
  for (let attempt = 0; attempt < 3 && !reserved; attempt += 1) {
    const updateWhere = {
      id: apiKeyRecord.id,
      status: 'ACTIVE' as const,
      revokedAt: null,
      user: { is: { status: 'ACTIVE' as const } },
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      ...(quotaLimit !== null && quotaLimit !== undefined
        ? { quotaLimit, quotaUsed: { lt: quotaLimit }, quotaResetAt }
        : {}),
    };
    const reservation = await prisma.apiKey.updateMany({
      where: updateWhere,
      data: { lastUsedAt: new Date(), quotaUsed: { increment: 1 } },
    });

    if (reservation.count === 1) {
      reserved = true;
      quotaUsed += 1;
      break;
    }

    const latest = await prisma.apiKey.findFirst({
      where: {
        id: apiKeyRecord.id,
        status: 'ACTIVE',
        revokedAt: null,
        user: { is: { status: 'ACTIVE' } },
      },
    });
    if (!latest || (latest.expiresAt && latest.expiresAt <= new Date())) return { isValid: false };

    const latestUsed = latest.quotaUsed ?? 0;
    if (latest.quotaLimit !== null && latest.quotaLimit !== undefined && latestUsed >= latest.quotaLimit) {
      return quotaExceeded(latestUsed, latest);
    }

    // Refresh the expected window and count before retrying a conditional
    // reservation that lost a race with another request or rollover.
    quotaUsed = latestUsed;
    quotaResetAt = latest.quotaResetAt;
    quotaLimit = latest.quotaLimit;
  }

  if (!reserved) {
    // Fail closed on unexpected concurrent state changes; no request is
    // authorized without a successful quota reservation.
    return { isValid: false };
  }

  if (quotaLimit !== null && quotaLimit !== undefined && quotaUsed > quotaLimit) {
    return quotaExceeded(quotaUsed, apiKeyRecord);
  }

  return {
    isValid: true,
    apiKeyId: apiKeyRecord.id,
    appName: apiKeyRecord.appName,
    environment: apiKeyRecord.environment,
    clientId: apiKeyRecord.clientId || undefined,
    userId: apiKeyRecord.userId || undefined,
    scopes: (apiKeyRecord.scopes as string[]) || [],
    quotaLimit: apiKeyRecord.quotaLimit,
    quotaUsed,
    quotaPeriod: apiKeyRecord.quotaPeriod,
    quotaResetAt,
    alertThreshold: apiKeyRecord.alertThreshold,
    rateLimit: apiKeyRecord.rateLimit,
    rateLimitWindow: apiKeyRecord.rateLimitWindow,
  };
}

/**
 * Manually increment quota consumption by a specific count (e.g., for bulk SMS batches)
 */
export async function incrementApiKeyQuota(apiKeyId: string, count: number = 1): Promise<void> {
  if (count <= 0) return;
  try {
    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: {
        quotaUsed: { increment: count },
        lastUsedAt: new Date(),
      },
    });
  } catch (err) {
    console.error('Failed to increment API key quota:', err);
  }
}

/**
 * Reset an API key's quota usage back to 0
 */
export async function resetApiKeyQuota(apiKeyId: string): Promise<{ success: boolean; nextResetAt: Date | null }> {
  const existing = await prisma.apiKey.findUnique({
    where: { id: apiKeyId },
  });
  if (!existing) {
    throw new Error('API key not found');
  }

  const nextReset = calculateNextQuotaReset(existing.quotaPeriod, new Date());
  await prisma.apiKey.update({
    where: { id: apiKeyId },
    data: {
      quotaUsed: 0,
      quotaResetAt: nextReset,
    },
  });

  return { success: true, nextResetAt: nextReset };
}

import { decrypt, verifyRequestSessionToken } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

const SESSION_SCOPE_PERMISSIONS: Record<string, string | null> = {
  'profile.read': null,
  'dashboard.read': null,
  'reports.read': 'reports.view',
  'sms.send': 'sms.send',
  'sms.status': 'sms.view',
  'sms.schedule': 'sms.schedule',
  'balance.read': 'wallet.view',
  'contacts.read': 'contacts.view',
  'contacts.write': 'contacts.manage',
  'campaigns.read': 'campaigns.manage',
  'campaigns.write': 'campaigns.create',
  'sender_ids.read': 'sender_ids.view',
  'delivery_reports.read': 'sms.view',
  'webhooks.manage': 'webhooks.manage',
};

async function runRateLimitedHandler(
  req: NextRequest,
  context: ApiKeyContext,
  handler: (req: NextRequest, context: ApiKeyContext) => Promise<Response>
): Promise<Response> {
  const limit = context.rateLimit ?? 100;
  const windowSec = context.rateLimitWindow ?? 60;
  const rateLimitResult = await RateLimiter.check(
    `api:${context.apiKeyId ?? `user:${context.userId ?? 'authenticated'}`}`,
    limit,
    windowSec
  );

  if (!rateLimitResult.allowed) {
    return Response.json(
      { error: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000))),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetTime / 1000)),
        },
      }
    );
  }

  return handler(req, context);
}

export async function withApiKey(
  req: NextRequest, 
  requiredScope: string, 
  handler: (req: NextRequest, context: ApiKeyContext) => Promise<Response>
): Promise<Response> {
  const authHeader = req.headers.get('Authorization');
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '').trim();
  } else {
    const cookie = req.cookies.get('session')?.value;
    if (cookie) {
      token = cookie;
    }
  }

  if (!token) {
    return Response.json({ error: 'Unauthorized: Missing or invalid token format' }, { status: 401 });
  }

  // 1. Check if token is a user session (mobile bearer token or web cookie).
  // User sessions must use the same DB-authoritative MFA, expiry, idle-timeout,
  // lock, and role authorization rules as the web application.
  const sessionData = await decrypt(token);
  if (sessionData && typeof sessionData.sessionId === 'string' && typeof sessionData.userId === 'string') {
    const sessionResult = await verifyRequestSessionToken(
      token,
      req.cookies.get('screen_locked')?.value
    );
    if (!sessionResult?.userId) {
      const status = sessionResult?.error === 'mfa_required' || sessionResult?.error === 'screen_locked' ? 403 : 401;
      const code = sessionResult?.error === 'mfa_required'
        ? 'MFA_REQUIRED'
        : sessionResult?.error === 'screen_locked'
          ? 'SCREEN_LOCKED'
          : 'UNAUTHORIZED';
      return Response.json({ error: 'Unauthorized', code }, { status });
    }

    const permission = SESSION_SCOPE_PERMISSIONS[requiredScope];
    if (requiredScope && permission === undefined) {
      return Response.json({ error: 'Forbidden: Scope is not available to user sessions' }, { status: 403 });
    }
    if (permission && !(await hasPermission(sessionResult.userId, permission))) {
      return Response.json({ error: 'Forbidden: Insufficient permissions', code: 'FORBIDDEN' }, { status: 403 });
    }

    return runRateLimitedHandler(req, {
      userId: sessionResult.userId,
      appName: 'Mobile App / Web Session',
      environment: 'production',
      scopes: requiredScope ? [requiredScope] : [],
    }, handler);
  }

  // 2. Verify as Developer API Key
  const forwardedFor = req.headers.get('x-forwarded-for');
  const clientIp = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : req.headers.get('x-real-ip') || undefined;

  const verification = await verifyApiKey(token, clientIp);

  if (!verification.isValid) {
    if (verification.quotaExceeded) {
      return Response.json(
        {
          type: 'https://api.range.ug/errors/quota-exceeded',
          title: 'API Key Quota Exceeded',
          status: 429,
          detail: `Quota limit of ${verification.quotaLimit?.toLocaleString()} requests for the ${verification.quotaPeriod || 'billing'} period has been reached for app "${verification.appName}". Quota resets at ${verification.quotaResetAt?.toISOString() || 'next cycle'}.`,
          code: 'QUOTA_EXCEEDED',
          appName: verification.appName,
          environment: verification.environment,
          quotaLimit: verification.quotaLimit,
          quotaUsed: verification.quotaUsed,
          quotaPeriod: verification.quotaPeriod,
          quotaResetAt: verification.quotaResetAt?.toISOString(),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': verification.quotaResetAt 
              ? String(Math.max(1, Math.ceil((verification.quotaResetAt.getTime() - Date.now()) / 1000))) 
              : '3600',
            'X-RateLimit-Quota-Limit': String(verification.quotaLimit ?? 'unlimited'),
            'X-RateLimit-Quota-Remaining': '0',
            'X-RateLimit-Quota-Reset': verification.quotaResetAt?.toISOString() || '',
          }
        }
      );
    }
    return Response.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 });
  }

  if (requiredScope && (!verification.scopes || !verification.scopes.includes(requiredScope))) {
    return Response.json({ error: `Forbidden: Missing required scope '${requiredScope}'` }, { status: 403 });
  }

  return runRateLimitedHandler(req, {
    clientId: verification.clientId,
    userId: verification.userId,
    apiKeyId: verification.apiKeyId,
    appName: verification.appName,
    environment: verification.environment,
    scopes: verification.scopes,
    quotaLimit: verification.quotaLimit,
    quotaUsed: verification.quotaUsed,
    quotaPeriod: verification.quotaPeriod,
    quotaResetAt: verification.quotaResetAt,
    rateLimit: verification.rateLimit,
    rateLimitWindow: verification.rateLimitWindow,
  }, handler);
}
