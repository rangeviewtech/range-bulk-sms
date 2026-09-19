import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface SecurityAlert {
  type: string;
  severity: 'WARNING' | 'CRITICAL';
  description: string;
  count: number;
  actorId?: string | null;
  sourceIp?: string | null;
}

export async function checkSecurityAnomalies(timeWindowMinutes = 15): Promise<SecurityAlert[]> {
  const windowStart = new Date(Date.now() - timeWindowMinutes * 60000);
  const alerts: SecurityAlert[] = [];

  // 1. High volume of failed authentications (Brute force indication)
  const failedLogins = await prisma.auditLog.groupBy({
    by: ['sourceIp'],
    where: {
      eventName: 'LOGIN_FAILED',
      recordedAt: { gte: windowStart },
      sourceIp: { not: null }
    },
    _count: {
      id: true
    }
  });

  failedLogins.forEach((log) => {
    if (log._count.id > 10) {
      alerts.push({
        type: 'BRUTE_FORCE_ATTEMPT',
        severity: 'CRITICAL',
        description: `High number of failed logins (${log._count.id}) from IP ${log.sourceIp}`,
        count: log._count.id,
        sourceIp: log.sourceIp
      });
    }
  });

  // 2. High rate of password resets (Account takeover attempt)
  const pwResets = await prisma.auditLog.groupBy({
    by: ['actorId'],
    where: {
      eventName: { in: ['PASSWORD_RESET_SUCCESS', 'PASSWORD_RESET_REQUESTED'] },
      recordedAt: { gte: windowStart },
      actorId: { not: null }
    },
    _count: {
      id: true
    }
  });

  pwResets.forEach((log) => {
    if (log._count.id > 3) {
      alerts.push({
        type: 'ACCOUNT_TAKEOVER_RISK',
        severity: 'WARNING',
        description: `Multiple password resets (${log._count.id}) for user ${log.actorId}`,
        count: log._count.id,
        actorId: log.actorId
      });
    }
  });

  // 3. Database operation anomalies (Mass deletion)
  const massDeletes = await prisma.auditLog.groupBy({
    by: ['actorId'],
    where: {
      action: 'DELETE',
      category: 'CRUD',
      recordedAt: { gte: windowStart },
      actorId: { not: null }
    },
    _count: {
      id: true
    }
  });

  massDeletes.forEach((log) => {
    if (log._count.id > 50) {
      alerts.push({
        type: 'MASS_DELETION_DETECTED',
        severity: 'CRITICAL',
        description: `High volume of delete operations (${log._count.id}) by user ${log.actorId}`,
        count: log._count.id,
        actorId: log.actorId
      });
    }
  });

  // Log anomalies via the structured logger for SIEM integration
  alerts.forEach((alert: SecurityAlert) => {
    logger.audit({
      eventName: 'SECURITY_ANOMALY_DETECTED',
      category: 'SECURITY',
      severity: alert.severity === 'CRITICAL' ? 'CRITICAL' : 'WARN',
      outcome: 'SUCCESS',
      description: alert.description,
      actorId: alert.actorId,
      sourceIp: alert.sourceIp,
      metadata: { count: alert.count, type: alert.type }
    });
  });

  return alerts;
}
