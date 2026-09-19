import { headers } from 'next/headers';
import { logger, LogCategory, LogOutcome, ForensicEvent } from '@/lib/logger';
import { getRequestId } from '@/lib/logger/context';

export type AuditAction = 
  | 'LOGIN_SUCCESS' 
  | 'LOGIN_FAILED' 
  | 'LOGOUT'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET_SUCCESS'
  | 'PASSWORD_RESET_REQUESTED'
  | 'SESSION_REVOKED'
  | 'SESSION_CREATED'
  | 'SESSION_IDLE_EXPIRED'
  | 'SESSION_EXPIRED'
  | 'SESSION_HEARTBEAT'
  | 'SESSION_CLEANUP'
  | 'ROLE_CHANGED'
  | 'ADMIN_ACTION'
  | 'NEW_DEVICE_LOGIN'
  | 'NEW_DEVICE_DETECTED'
  | 'DEVICE_RECOGNIZED'
  | 'DEVICE_REVOKED'
  | 'SESSION_ROTATED'
  | 'MFA_CHALLENGE_ISSUED'
  | 'MFA_METHOD_SWITCHED'
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
  actorType?: 'USER' | 'ADMIN' | 'SYSTEM' | 'WORKER' | 'SERVICE' | 'ANONYMOUS';
  category?: LogCategory;
  operation?: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  resourceType?: string;
  resourceId?: string;
  status?: LogOutcome;
  durationMs?: number;
  changes?: string[];
  previousVersion?: unknown;
  newVersion?: unknown;
  metadata?: Record<string, unknown>;
  errorCode?: string;
  reason?: string;
}

export async function logAudit(params: AuditParams) {
  try {
    const headersList = await headers().catch(() => null);
    const ipAddress = headersList ? (headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1') : 'system';
    const userAgent = headersList ? headersList.get('user-agent') : null;
    const httpMethod = headersList ? headersList.get('x-invoke-method') : null;
    
    const requestId = await getRequestId();

    const event: ForensicEvent = {
      eventName: params.action,
      category: params.category || 'SECURITY',
      severity: params.status === 'FAILURE' ? 'ERROR' : 'INFO',
      outcome: params.status || 'SUCCESS',
      
      actorType: params.actorType || 'USER',
      actorId: params.userId,
      
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      action: params.operation,
      
      sourceIp: ipAddress.substring(0, 45),
      userAgent: userAgent || undefined,
      httpMethod: httpMethod || undefined,
      
      durationMs: params.durationMs,
      reasonCode: params.errorCode || params.reason,
      changedFields: params.changes,
      previousVersion: params.previousVersion,
      newVersion: params.newVersion,
      
      metadata: params.metadata,
      requestId
    };

    await logger.audit(event);
  } catch (error) {
    logger.error('Failed to structure audit log', { error });
  }
}

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
