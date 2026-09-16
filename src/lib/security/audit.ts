import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';
import { getRequestId } from '@/lib/logger/context';

export type AuditAction = 
  | 'LOGIN_SUCCESS' 
  | 'LOGIN_FAILED' 
  | 'LOGOUT'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET_SUCCESS'
  | 'SESSION_REVOKED'
  | 'ROLE_CHANGED'
  | 'ADMIN_ACTION'
  | 'NEW_DEVICE_LOGIN'
  | 'REGISTER_SUCCESS'
  | 'OTP_LOGIN_SUCCESS'
  | 'MFA_LOGIN_SUCCESS'
  | 'OAUTH_LOGIN'
  | 'LOGIN_MFA_CHALLENGE'
  | 'RATE_LIMIT_TRIGGERED'
  | 'UNAUTHORIZED_ACCESS'
  | 'CRUD_CREATE'
  | 'CRUD_READ'
  | 'CRUD_UPDATE'
  | 'CRUD_DELETE';

export interface AuditParams {
  action: AuditAction;
  userId?: string;
  actorType?: string;
  category?: 'SECURITY' | 'APPLICATION' | 'AUDIT';
  operation?: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  resourceType?: string;
  resourceId?: string;
  status?: 'SUCCESS' | 'FAILURE';
  durationMs?: number;
  changes?: Record<string, unknown>; // For tracking before/after
  metadata?: Record<string, unknown>;
  errorCode?: string;
  reason?: string;
}

export async function logAudit(params: AuditParams) {
  try {
    const headersList = await headers().catch(() => null);
    const ipAddress = headersList ? (headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1') : 'system';
    const userAgent = headersList ? headersList.get('user-agent') : null;
    const httpMethod = headersList ? headersList.get('x-invoke-method') : null; // Next.js specific or general
    
    const requestId = await getRequestId();

    const data = {
      action: params.action,
      requestId,
      userId: params.userId,
      actorType: params.actorType || 'USER',
      category: params.category || 'SECURITY',
      operation: params.operation,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      status: params.status || 'SUCCESS',
      durationMs: params.durationMs,
      errorCode: params.errorCode,
      reason: params.reason,
      changes: params.changes || {},
      metadata: params.metadata || {},
      ipAddress: ipAddress.substring(0, 45),
      userAgent,
      httpMethod
    };

    // 1. Write to centralized logger
    logger.audit(`[${data.action}] ${data.resourceType ? data.resourceType + ':' + data.resourceId : ''}`, data);

    // 2. Fire-and-forget write to Prisma DB to avoid blocking the main request
    Promise.resolve().then(async () => {
      try {
        await prisma.auditLog.create({
          // @ts-expect-error - Ignore type errors if migration hasn't been run locally
          data
        });
      } catch (dbError) {
        logger.error('Failed to write audit log to database', { error: dbError });
      }
    });

  } catch (error) {
    // We swallow audit errors in production so they don't break user flows
    logger.error('Failed to structure audit log', { error });
  }
}

// Keep legacy logAudit signature support for existing code that hasn't been updated
export async function logAuditLegacy(
  action: AuditAction,
  userId?: string,
  resource?: string,
  metadata?: Record<string, unknown>
) {
  return logAudit({
    action,
    userId,
    resourceType: resource,
    metadata
  });
}
