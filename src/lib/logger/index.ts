import pino from 'pino';
import { redactSensitiveData } from './redact';
import { getRequestId } from './context';
import { prisma } from '../prisma';

export type LogSeverity = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'SECURITY' | 'CRITICAL';
export type LogCategory = 'APPLICATION' | 'SECURITY' | 'AUTHENTICATION' | 'AUTHORIZATION' | 'CRUD' | 'ADMIN' | 'DATABASE' | 'EMAIL' | 'CRON' | 'SYSTEM' | 'PERFORMANCE' | 'FORENSIC' | 'COMMUNICATION';
export type LogOutcome = 'SUCCESS' | 'FAILURE' | 'DENIED' | 'UNKNOWN';

export interface ForensicEvent {
  eventName: string;
  category: LogCategory;
  severity: LogSeverity;
  outcome: LogOutcome;
  requestId?: string;
  
  // Actor info
  actorType?: 'USER' | 'ADMIN' | 'SYSTEM' | 'WORKER' | 'SERVICE' | 'ANONYMOUS';
  actorId?: string;
  actorRole?: string;
  tenantId?: string;
  
  // Resource info
  resourceType?: string;
  resourceId?: string;
  
  // Action info
  action?: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | string;
  
  // Trace / Request Context
  traceId?: string;
  interactionId?: string;
  jobId?: string;
  transactionId?: string;
  
  sourceIp?: string;
  userAgent?: string;
  route?: string;
  httpMethod?: string;
  httpStatus?: number;
  
  // Outcome & Changes
  reasonCode?: string;
  changedFields?: string[];
  previousVersion?: unknown;
  newVersion?: unknown;
  
  // System context
  durationMs?: number;
  description?: string;
  
  // Additional unstructured data
  metadata?: Record<string, unknown>;
}

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

class Logger {
  private formatLog(severity: LogSeverity, message: string, metadata?: Record<string, unknown> | unknown) {
    const redactedMeta = metadata && typeof metadata === 'object' ? redactSensitiveData(metadata) as object : {};
    return {
      severity,
      message,
      ...redactedMeta
    };
  }

  // Console / App Logging
  trace(message: string, metadata?: Record<string, unknown> | unknown) { pinoLogger.trace(this.formatLog('TRACE', message, metadata)); }
  debug(message: string, metadata?: Record<string, unknown> | unknown) { pinoLogger.debug(this.formatLog('DEBUG', message, metadata)); }
  info(message: string, metadata?: Record<string, unknown> | unknown) { pinoLogger.info(this.formatLog('INFO', message, metadata)); }
  warn(message: string, metadata?: Record<string, unknown> | unknown) { pinoLogger.warn(this.formatLog('WARN', message, metadata)); }
  error(message: string, metadata?: Record<string, unknown> | unknown) { pinoLogger.error(this.formatLog('ERROR', message, metadata)); }
  fatal(message: string, metadata?: Record<string, unknown> | unknown) { pinoLogger.fatal(this.formatLog('FATAL', message, metadata)); }
  
  // Backwards compatibility for existing code
  security(message: string, data?: Record<string, unknown> | unknown) { pinoLogger.info(this.formatLog('SECURITY', message, { metadata: data, category: 'SECURITY', outcome: 'SUCCESS' })); }

  /**
   * Authoritative Forensic Audit Record
   * This logs to Pino and attempts to durably save to the DB.
   */
  async audit(event: ForensicEvent) {
    const requestId = await getRequestId();
    
    const redacted = redactSensitiveData(event) as ForensicEvent;

    // Log to stdout
    pinoLogger.info({
      isAudit: true,
      requestId,
      ...redacted
    }, event.description || event.eventName);

    // Save to DB
    try {
      // Create hash chain for tamper resistance (simplified for now, ideally needs a robust lock/queue or trigger)
      // Since this is asynchronous, we do a best-effort chaining using the latest log.
      const lastLog = await prisma.auditLog.findFirst({
        orderBy: { recordedAt: 'desc' },
        select: { hash: true }
      });
      
      const previousHash = lastLog?.hash || 'GENESIS';
      
      // Calculate current hash
      const crypto = await import('crypto');
      const payloadString = JSON.stringify({
        eventName: redacted.eventName,
        actorId: redacted.actorId,
        timestamp: new Date().toISOString(),
        previousHash
      });
      const hash = crypto.createHash('sha256').update(payloadString).digest('hex');

      await prisma.auditLog.create({
        data: {
          timestamp: new Date(),
          eventName: redacted.eventName,
          category: redacted.category,
          severity: redacted.severity,
          outcome: redacted.outcome,
          
          actorType: redacted.actorType || 'SYSTEM',
          actorId: redacted.actorId,
          actorRole: redacted.actorRole,
          tenantId: redacted.tenantId,
          
          resourceType: redacted.resourceType,
          resourceId: redacted.resourceId,
          action: redacted.action,
          
          requestId,
          traceId: redacted.traceId,
          interactionId: redacted.interactionId,
          jobId: redacted.jobId,
          transactionId: redacted.transactionId,
          
          sourceIp: redacted.sourceIp,
          userAgent: redacted.userAgent,
          route: redacted.route,
          httpMethod: redacted.httpMethod,
          httpStatus: redacted.httpStatus,
          
          reasonCode: redacted.reasonCode,
          changedFields: redacted.changedFields ? JSON.stringify(redacted.changedFields) : null,
          previousVersion: redacted.previousVersion ? JSON.stringify(redacted.previousVersion) : null,
          newVersion: redacted.newVersion ? JSON.stringify(redacted.newVersion) : null,
          
          durationMs: redacted.durationMs,
          description: redacted.description,
          
          previousHash,
          hash
        }
      });
    } catch (dbErr) {
      // Fail-closed policy for high-risk operations where authoritative audit is mandatory should be implemented at the caller level.
      // Here we record the failure to persist the audit log.
      pinoLogger.error({
        msg: 'FAILED TO PERSIST AUDIT LOG TO DB',
        error: dbErr,
        originalEvent: redacted
      });
    }
  }
}

export const logger = new Logger();

