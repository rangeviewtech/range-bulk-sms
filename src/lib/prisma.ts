import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { logger } from './logger';

const connectionString = process.env.DATABASE_URL;

const createPrismaClient = () => {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const baseClient = new PrismaClient({ adapter });

  return baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const startTime = Date.now();
          try {
            const result = await query(args);
            const durationMs = Date.now() - startTime;
            
            // Log mutations automatically
            if (['create', 'update', 'delete', 'upsert', 'createMany', 'updateMany', 'deleteMany'].includes(operation)) {
              if (model !== 'AuditLog' && model !== 'Job' && model !== 'Session' && model !== 'CronExecution' && model !== 'WebhookDelivery' && model !== 'GatewayLog') { 
                const actionMapping: Record<string, string> = {
                  create: 'CREATE',
                  createMany: 'CREATE',
                  update: 'UPDATE',
                  updateMany: 'UPDATE',
                  upsert: 'UPDATE',
                  delete: 'DELETE',
                  deleteMany: 'DELETE'
                };
                
                // Fire and forget logging for general CRUD
                // Note: For critical operations, developers should still use `withTransactionalAudit` directly
                Promise.resolve().then(async () => {
                   try {
                     const action = actionMapping[operation] || operation.toUpperCase();
                     
                     // We skip actual AuditLog inserts if we don't have actor info in this context,
                     // but we still emit to structured stdout for observability.
                     // The structured logger handles redaction.
                     const argsData = (args as { data?: unknown })?.data;
                     logger.audit({
                        eventName: `db.${model.toLowerCase()}.${operation}`,
                        category: 'CRUD',
                        severity: 'INFO',
                        outcome: 'SUCCESS',
                        resourceType: model,
                        action,
                        durationMs,
                        description: `Executed ${operation} on ${model}`,
                        changedFields: argsData && typeof argsData === 'object' ? Object.keys(argsData) : undefined,
                     });
                   } catch (_e) {
                     // safe degradation
                   }
                });
              }
            }
            return result;
          } catch (error: unknown) {
            const durationMs = Date.now() - startTime;
            if (model !== 'AuditLog' && model !== 'GatewayLog' && model !== 'CronExecution') {
               const errCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'PRISMA_ERROR';
               logger.audit({
                  eventName: `db.${model.toLowerCase()}.${operation}`,
                  category: 'DATABASE',
                  severity: 'ERROR',
                  outcome: 'FAILURE',
                  resourceType: model,
                  action: operation.toUpperCase(),
                  durationMs,
                  reasonCode: errCode,
                  description: `Failed to execute ${operation} on ${model}`,
                });
            }
            throw error;
          }
        },
      },
    },
  });
};

export type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;
export type PrismaTransactionClient = Parameters<Parameters<ExtendedPrismaClient['$transaction']>[0]>[0];

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '../generated/prisma/client';
