import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { decryptGatewayPayload, encryptGatewayPayload } from './encryption';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  let body: unknown = null;
  let isE2EE = req.headers.get('x-e2ee') === 'true';
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      const rawBody = await req.json().catch(() => ({}));
      if (rawBody.e2ee) {
        body = decryptGatewayPayload(rawBody.e2ee, verification.gatewaySecret);
        isE2EE = true;
      } else {
        // Enforce strict E2EE encryption policy to ensure WhatsApp and SMS messages are secure
        return Response.json({ error: 'Bad Request: Strict E2EE encryption is required' }, { status: 400 });
      }
    } catch (_e) {
      return Response.json({ error: 'Bad Request: Failed to parse or decrypt E2EE payload' }, { status: 400 });
    }
  } else {
    // For GET/HEAD, require the X-E2EE header
    if (!isE2EE) {
      return Response.json({ error: 'Bad Request: Strict E2EE encryption header required' }, { status: 400 });
    }
  }

  const response = await handler(req, { gatewayId: verification.gatewayId, gatewaySecret: verification.gatewaySecret, body, isE2EE: true });
  
  return response;
}

export function sendGatewayResponse(data: unknown, gatewaySecret?: string, useE2EE = true) {
  if (gatewaySecret) {
    return Response.json({ e2ee: encryptGatewayPayload(data, gatewaySecret) });
  }
  return Response.json(data);
}

