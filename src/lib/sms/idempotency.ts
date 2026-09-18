import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { redisLock } from '@/lib/redis';

export function generateMessageId(): string {

  return `msg_${uuidv4()}`;
}

export function generateIdempotencyKey(userId: string, phone: string, message: string, timestamp?: number): string {
  const time = timestamp || Date.now();
  const hourTimestamp = Math.floor(time / (1000 * 60 * 60)); // Truncate to the current hour
  const payload = `${userId}:${phone}:${message}:${hourTimestamp}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

export function generateCampaignId(): string {
  return `camp_${uuidv4()}`;
}

export function generateTransactionReference(): string {
  const timestamp = Date.now();
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 hex characters
  return `TXN-${timestamp}-${randomChars}`;
}


/**
 * Acquires a distributed lock on a message idempotency key to prevent double dispatch.
 */
export async function acquireMessageLock(idempotencyKey: string, ttlSeconds: number = 60) {
  return redisLock.acquire(`sms:${idempotencyKey}`, ttlSeconds);
}

/**
 * Releases the distributed lock on a message idempotency key.
 */
export async function releaseMessageLock(idempotencyKey: string, token: string) {
  return redisLock.release(`sms:${idempotencyKey}`, token);
}

