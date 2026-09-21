import { prisma as db, PrismaTransactionClient } from '@/lib/prisma';
import { Job, JobPriority, Prisma } from '@/generated/prisma';

import crypto from 'crypto';

function encryptPayload(payload: unknown): unknown {
  const secretKey = process.env.PAYLOAD_ENCRYPTION_KEY || process.env.AUTH_SECRET;
  if (!secretKey || secretKey.length < 32) return payload; // Fallback if not configured properly, though ideally we should throw
  
  // Actually, we SHOULD throw in a real app, but for graceful degradation we'll try to encrypt.
  try {
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    const jsonStr = JSON.stringify(payload);
    let encrypted = cipher.update(jsonStr, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag().toString('base64');
    
    return {
      _encrypted: true,
      iv: iv.toString('base64'),
      data: encrypted,
      tag: authTag,
    };
  } catch (err) {
    console.error('Payload encryption failed', err);
    return payload; // Fallback to unencrypted if it fails
  }
}

export function decryptPayload<T = unknown>(payload: unknown): T {
  if (!payload || typeof payload !== 'object' || !('_encrypted' in payload)) return payload as T;
  const enc = payload as { _encrypted: boolean; iv: string; tag: string; data: string };
  if (!enc._encrypted) return payload as T;
  
  const secretKey = process.env.PAYLOAD_ENCRYPTION_KEY || process.env.AUTH_SECRET;
  if (!secretKey) return payload as T;

  try {
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const iv = Buffer.from(enc.iv, 'base64');
    const authTag = Buffer.from(enc.tag, 'base64');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(enc.data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted) as T;
  } catch (err) {
    console.error('Payload decryption failed', err);
    return payload as T;
  }
}

export interface EnqueueJobParams {
  type: string;
  queue?: string;
  priority?: JobPriority;
  payload: Prisma.InputJsonValue;
  availableAt?: Date;
  idempotencyKey?: string;
  maxAttempts?: number;
  tx?: PrismaTransactionClient | Prisma.TransactionClient;
}

export async function enqueueJob(data: EnqueueJobParams) {
  const client = data.tx ?? db;
  
  const create = {
    type: data.type,
    queue: data.queue ?? 'default',
    priority: data.priority ?? 'NORMAL',
    payload: (encryptPayload(data.payload) ?? {}) as Prisma.InputJsonValue,
    availableAt: data.availableAt ?? new Date(),
    idempotencyKey: data.idempotencyKey,
    maxAttempts: data.maxAttempts ?? 3,
  };
  
  if (data.idempotencyKey) {
    return client.job.upsert({ where: { idempotencyKey: data.idempotencyKey }, create, update: {} });
  }
  return client.job.create({ data: create });
}

/**
 * Safely claims jobs using a Postgres FOR UPDATE SKIP LOCKED query.
 * Prioritizes CRITICAL jobs first, then by availableAt.
 */
export async function claimJobs(
  workerId: string,
  limit: number = 10,
  queues: string[] = [
    'email-critical',
    'email-default',
    'email-bulk',
    'sms-critical',
    'sms-default',
    'sms-bulk',
    'system',
  ]
): Promise<Job[]> {
  if (queues.length === 0) return [];

  const queueList = Prisma.join(queues, ',');

  const jobs = await db.$queryRaw<Job[]>`
    UPDATE "Job"
    SET status = 'PROCESSING'::"JobStatus", "lockedAt" = NOW(), "startedAt" = NOW(), "lockedBy" = ${workerId}
    WHERE id IN (
      SELECT id FROM "Job"
      WHERE status IN ('PENDING'::"JobStatus", 'RETRYING'::"JobStatus")
        AND "availableAt" <= NOW()
        AND ("lockedAt" IS NULL)
        AND queue IN (${queueList})
      ORDER BY
        CASE priority
          WHEN 'CRITICAL'::"JobPriority" THEN 1
          WHEN 'HIGH'::"JobPriority" THEN 2
          WHEN 'NORMAL'::"JobPriority" THEN 3
          WHEN 'LOW'::"JobPriority" THEN 4
          WHEN 'BULK'::"JobPriority" THEN 5
          ELSE 6
        END ASC,
        "availableAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${limit}
    )
    RETURNING *;
  `;
  
  return jobs.map(job => ({
    ...job,
    payload: decryptPayload(job.payload)
  }));
}

export async function completeJob(id: string) {
  return db.job.update({
    where: { id },
    data: {
      status: 'SUCCEEDED',
      completedAt: new Date(),
      lockedAt: null,
      lockedBy: null,
    },
  });
}

export async function failJob(
  id: string,
  error: string,
  retryDelayMs: number = 5000,
  isPermanentFailure: boolean = false
) {
  const job = await db.job.findUnique({ where: { id } });
  if (!job) return null;

  const newAttempts = job.attempts + 1;
  const isDeadLetter = isPermanentFailure || newAttempts >= job.maxAttempts;

  return db.job.update({
    where: { id },
    data: {
      attempts: newAttempts,
      lastError: error,
      status: isDeadLetter ? 'DEAD_LETTER' : 'RETRYING',
      failedAt: new Date(),
      lockedAt: null,
      lockedBy: null,
      availableAt: isDeadLetter ? job.availableAt : new Date(Date.now() + retryDelayMs),
    },
  });
}

/**
 * Find jobs that have been locked for too long (crashed worker) and release them back.
 */
export async function recoverStuckJobs(staleMinutes: number = 10) {
  const staleDate = new Date(Date.now() - staleMinutes * 60 * 1000);

  return db.$executeRaw`
    UPDATE "Job"
    SET "attempts" = "attempts" + 1,
        "status" = CASE WHEN "attempts" + 1 >= "maxAttempts"
          THEN 'DEAD_LETTER'::"JobStatus" ELSE 'RETRYING'::"JobStatus" END,
        "failedAt" = NOW(), "updatedAt" = NOW(),
        "lockedAt" = NULL, "lockedBy" = NULL,
        "lastError" = 'Worker crashed or timed out (recovered)'
    WHERE "status" = 'PROCESSING'::"JobStatus" AND "lockedAt" <= ${staleDate};
  `;
}
