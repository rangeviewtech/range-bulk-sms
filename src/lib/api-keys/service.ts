import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

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

export async function verifyApiKey(
  key: string,
  clientIp?: string
): Promise<{ isValid: boolean; clientId?: string; userId?: string; scopes?: string[] }> {
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

  // Update lastUsedAt in the background
  try {
    const updatePromise = prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() }
    });
    if (updatePromise && typeof updatePromise.catch === 'function') {
      updatePromise.catch(() => {});
    }
  } catch {
    // Ignore background update failures
  }

  
  return {
    isValid: true,
    clientId: apiKeyRecord.clientId || undefined,
    userId: apiKeyRecord.userId || undefined,
    scopes: (apiKeyRecord.scopes as string[]) || []
  };
}

export async function withApiKey(
  req: NextRequest, 
  requiredScope: string, 
  handler: (req: NextRequest, context: { clientId?: string; userId?: string }) => Promise<Response>
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
    return Response.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 });
  }

  if (requiredScope && (!verification.scopes || !verification.scopes.includes(requiredScope))) {
    return Response.json({ error: `Forbidden: Missing required scope '${requiredScope}'` }, { status: 403 });
  }

  return handler(req, { clientId: verification.clientId, userId: verification.userId });
}

