import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

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

  let currentQuotaUsed = apiKeyRecord.quotaUsed ?? 0;
  let currentQuotaResetAt = apiKeyRecord.quotaResetAt;

  // Check Quota Rollover & Exhaustion
  if (apiKeyRecord.quotaLimit !== null && apiKeyRecord.quotaLimit !== undefined) {
    // If the reset period has passed, reset counter to 0 and advance window
    if (currentQuotaResetAt && new Date() >= currentQuotaResetAt) {
      currentQuotaResetAt = calculateNextQuotaReset(apiKeyRecord.quotaPeriod, new Date());
      currentQuotaUsed = 0;
      try {
        await prisma.apiKey.update({
          where: { id: apiKeyRecord.id },
          data: {
            quotaUsed: 0,
            quotaResetAt: currentQuotaResetAt,
          },
        });
      } catch {
        // Continue if background update fails
      }
    }

    // Check if quota limit is exhausted
    if (currentQuotaUsed >= apiKeyRecord.quotaLimit) {
      return {
        isValid: false,
        quotaExceeded: true,
        apiKeyId: apiKeyRecord.id,
        appName: apiKeyRecord.appName,
        environment: apiKeyRecord.environment,
        clientId: apiKeyRecord.clientId || undefined,
        userId: apiKeyRecord.userId || undefined,
        scopes: (apiKeyRecord.scopes as string[]) || [],
        quotaLimit: apiKeyRecord.quotaLimit,
        quotaUsed: currentQuotaUsed,
        quotaPeriod: apiKeyRecord.quotaPeriod,
        quotaResetAt: currentQuotaResetAt,
        alertThreshold: apiKeyRecord.alertThreshold,
      };
    }
  }

  // Atomically increment quotaUsed and update lastUsedAt in the background
  try {
    const updatePromise = prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: {
        lastUsedAt: new Date(),
        quotaUsed: { increment: 1 },
      }
    });
    if (updatePromise && typeof updatePromise.catch === 'function') {
      updatePromise.catch(() => {});
    }
  } catch {
    // Ignore background update failures
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
    quotaUsed: currentQuotaUsed + 1,
    quotaPeriod: apiKeyRecord.quotaPeriod,
    quotaResetAt: currentQuotaResetAt,
    alertThreshold: apiKeyRecord.alertThreshold,
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

export async function withApiKey(
  req: NextRequest, 
  requiredScope: string, 
  handler: (req: NextRequest, context: ApiKeyContext) => Promise<Response>
): Promise<Response> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized: Missing or invalid token format' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '').trim();
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

  return handler(req, {
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
  });
}
