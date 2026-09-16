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
export async function verifyGatewayToken(token: string): Promise<{ isValid: boolean; gatewayId?: string }> {
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
    gatewayId: tokenRecord.gatewayId
  };
}

/**
 * Middleware wrapper for device endpoints.
 */
export async function withDeviceAuth(
  req: NextRequest,
  handler: (req: NextRequest, context: { gatewayId: string }) => Promise<Response>
): Promise<Response> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized: Missing or invalid token format' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const verification = await verifyGatewayToken(token);

  if (!verification.isValid || !verification.gatewayId) {
    return Response.json({ error: 'Unauthorized: Invalid or expired Gateway Token' }, { status: 401 });
  }

  return handler(req, { gatewayId: verification.gatewayId });
}

