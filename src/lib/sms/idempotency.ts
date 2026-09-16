import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

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
