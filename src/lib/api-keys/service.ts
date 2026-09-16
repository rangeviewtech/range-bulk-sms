import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export function generateApiKey(): { key: string; prefix: string; secret: string; hash: string } {
  const prefix = crypto.randomBytes(6).toString('hex'); // 12 chars
  const secret = crypto.randomBytes(16).toString('hex'); // 32 chars
  const key = `rsms_${prefix}_${secret}`;
  
  const hash = crypto.createHash('sha256').update(secret).digest('hex');
  
  return { key, prefix, secret, hash };
}

export function hashApiKey(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

export async function verifyApiKey(key: string): Promise<{ isValid: boolean; clientId?: string; userId?: string; scopes?: string[] }> {
  if (!key.startsWith('rsms_')) return { isValid: false };
  
  const parts = key.split('_');
  if (parts.length !== 3) return { isValid: false };
  
  const prefix = parts[1];
  const secret = parts[2];
  
  // Try to find the API key in the database using the plaintext prefix
  const apiKeyRecord = await prisma.apiKey.findFirst({
    where: { prefix, isActive: true }
  });
  
  if (!apiKeyRecord) return { isValid: false };
  
  // Verify secret hash matches
  const hash = hashApiKey(secret);
  if (hash !== apiKeyRecord.hash) return { isValid: false };
  
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
  const verification = await verifyApiKey(token);

  if (!verification.isValid) {
    return Response.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 });
  }

  if (requiredScope && (!verification.scopes || !verification.scopes.includes(requiredScope))) {
    return Response.json({ error: `Forbidden: Missing required scope '${requiredScope}'` }, { status: 403 });
  }

  return handler(req, { clientId: verification.clientId, userId: verification.userId });
}
