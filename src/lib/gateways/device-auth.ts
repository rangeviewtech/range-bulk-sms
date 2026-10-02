import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * Generates a raw token and its SHA-256 hash for Gateway authentication.
 */
export function generateGatewayToken(): { token: string; hash: string } {
  const secret = crypto.randomBytes(24).toString('hex');
  const token = `gt_${secret}`;
  const hash = crypto.createHash('sha256').update(secret).digest('hex');
  return { token, hash };
}

/**
 * Validates a raw gateway token and returns the associated gatewayId.
 */
export async function verifyGatewayToken(token: string): Promise<{ isValid: boolean; gatewayId?: string; gatewaySecret?: string }> {
  if (!token || !token.startsWith('gt_')) return { isValid: false };
  
  const secret = token.replace('gt_', '');
  const hash = crypto.createHash('sha256').update(secret).digest('hex');
  
  const tokenRecord = await prisma.gatewayToken.findUnique({
    where: { tokenHash: hash },
    include: { gateway: true }
  });
  
  if (!tokenRecord) return { isValid: false };
  
  // Check if token is revoked or expired
  if (tokenRecord.revokedAt || (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date())) {
    return { isValid: false };
  }
  
  // Update lastUsedAt in background
  prisma.gatewayToken.update({
    where: { id: tokenRecord.id },
    data: { lastUsedAt: new Date() }
  }).catch(console.error);
  
  return {
    isValid: true,
    gatewayId: tokenRecord.gatewayId,
    gatewaySecret: secret
  };
}

/**
 * Middleware wrapper for device endpoints.
 */
export async function withDeviceAuth(
  req: NextRequest,
  handler: (req: NextRequest, context: { gatewayId: string; gatewaySecret: string; body?: any; isE2EE?: boolean }) => Promise<Response>
): Promise<Response> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized: Missing or invalid token format' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const verification = await verifyGatewayToken(token);

  if (!verification.isValid || !verification.gatewayId || !verification.gatewaySecret) {
    return Response.json({ error: 'Unauthorized: Invalid or expired Gateway Token' }, { status: 401 });
  }

  let body: any = null;
  let isE2EE = req.headers.get('x-e2ee') === 'true';
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      const rawBody = await req.json().catch(() => ({}));
      if (rawBody.e2ee) {
        // Late import to avoid circular dependencies if any
        const { decryptGatewayPayload } = require('./encryption');
        body = decryptGatewayPayload(rawBody.e2ee, verification.gatewaySecret);
        isE2EE = true;
      } else {
        body = rawBody;
      }
    } catch (e) {
      return Response.json({ error: 'Bad Request: Failed to parse or decrypt payload' }, { status: 400 });
    }
  }

  const response = await handler(req, { gatewayId: verification.gatewayId, gatewaySecret: verification.gatewaySecret, body, isE2EE });
  
  return response;
}

export function sendGatewayResponse(data: any, gatewaySecret?: string, useE2EE = false) {
  if (useE2EE && gatewaySecret) {
    const { encryptGatewayPayload } = require('./encryption');
    return Response.json({ e2ee: encryptGatewayPayload(data, gatewaySecret) });
  }
  return Response.json(data);
}

