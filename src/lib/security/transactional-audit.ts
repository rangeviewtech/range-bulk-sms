import { prisma } from '../prisma';
import { ForensicEvent, logger } from '../logger';
import crypto from 'crypto';
import { getRequestId } from '../logger/context';
import { redactSensitiveData } from '../logger/redact';

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Executes a database mutation and records a forensic audit event atomically.
 * This ensures that if the mutation fails, no misleading success audit log is recorded.
 * If the transaction succeeds, the audit log is saved atomically.
 * 
 * @param event The forensic event metadata
 * @param mutation Callback containing the transaction logic
 */
export async function withTransactionalAudit<T>(
  event: Omit<ForensicEvent, 'outcome' | 'severity'>,
  mutation: (tx: PrismaTx) => Promise<T>
): Promise<T> {
  const requestId = await getRequestId();
  const startTime = Date.now();
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Execute the actual mutation
      const data = await mutation(tx);
      
      // 2. Prepare the audit event
      const durationMs = Date.now() - startTime;
      const redacted = redactSensitiveData({
        ...event,
        outcome: 'SUCCESS',
        severity: 'INFO',
        durationMs,
        requestId
      }) as ForensicEvent;
      
      // 3. Atomically persist the audit log
      // Fetch the last hash to maintain the chain (best effort inside the tx)
      const lastLog = await tx.auditLog.findFirst({
        orderBy: { recordedAt: 'desc' },
        select: { hash: true }
      });
      
      const previousHash = lastLog?.hash || 'GENESIS';
      
      const payloadString = JSON.stringify({
        eventName: redacted.eventName,
        actorId: redacted.actorId,
        timestamp: new Date().toISOString(),
        previousHash
      });
      const hash = crypto.createHash('sha256').update(payloadString).digest('hex');

      await tx.auditLog.create({
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
          
          requestId: redacted.requestId,
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
      
      return data;
    });
    
    // Log to stdout outside the transaction to prevent blocking
    logger.info(`[${event.eventName}] SUCCESS`, { ...event, durationMs: Date.now() - startTime });
    
    return result;
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    const errMessage = error instanceof Error ? error.message : String(error);
    const errCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'TRANSACTION_FAILED';
    
    // If the transaction fails, we log it via the out-of-band logger
    // which handles its own fail-safe DB insertion
    await logger.audit({
      ...event,
      severity: 'ERROR',
      outcome: 'FAILURE',
      durationMs,
      requestId,
      reasonCode: errCode,
      description: `Transaction failed: ${errMessage}`
    });
    
    throw error;
  }
}
