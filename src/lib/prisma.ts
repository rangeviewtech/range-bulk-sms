import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { logger } from './logger';

const connectionString = process.env.DATABASE_URL;
const readConnectionString = process.env.DATABASE_REPLICA_URL || process.env.DATABASE_READ_URL || connectionString;

const createPrismaClient = (connUrl = connectionString, isReplica = false) => {
  const isDedicatedReplica = isReplica && readConnectionString !== connectionString;
  const poolMax = isDedicatedReplica
    ? parseInt(process.env.DB_READ_POOL_MAX || '25', 10)
    : parseInt(process.env.DB_POOL_MAX || '20', 10);

  const pool = new Pool({
    connectionString: connUrl,
    max: poolMax,
    min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONN_TIMEOUT_MS || '5000', 10),
  });

  pool.on('error', (err) => {
    logger.error(`Unexpected error on idle database client (${isReplica ? 'REPLICA' : 'PRIMARY'})`, {
      error: err.message,
    });
  });

  const adapter = new PrismaPg(pool);
  const baseClient = new PrismaClient({ adapter });

  const slowThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD_MS || '500', 10);

  return baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const startTime = Date.now();
          try {
            const result = await query(args);
            const durationMs = Date.now() - startTime;

            // Slow query observability detection
            if (durationMs > slowThreshold) {
              logger.warn('Slow database query detected', {
                model,
                operation,
                durationMs,
                thresholdMs: slowThreshold,
                clientRole: isReplica ? 'REPLICA' : 'PRIMARY',
              });
            }

            // Log mutations automatically (only applicable on primary)
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
                Promise.resolve().then(async () => {
                   try {
                     const action = actionMapping[operation] || operation.toUpperCase();
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
  prismaRead: ExtendedPrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient(connectionString, false);

// Read Replica Client: routes to replica pool if configured, else reuses primary pool
export const prismaRead =
  globalForPrisma.prismaRead ??
  (readConnectionString && readConnectionString !== connectionString
    ? createPrismaClient(readConnectionString, true)
    : prisma);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaRead = prismaRead;
}

export * from '../generated/prisma/client';
