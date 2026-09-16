import { headers } from 'next/headers';
import { randomUUID } from 'crypto';

/**
 * Attempts to retrieve the request ID from the current request context.
 * If running outside of a web request (e.g. background job, or non-dynamic route), 
 * it gracefully falls back to generating a temporary one.
 */
export async function getRequestId(): Promise<string> {
  try {
    const headersList = await headers();
    const requestId = headersList.get('x-request-id');
    return requestId || `sys_${randomUUID()}`;
  } catch (_error) {
    // We are likely outside a Next.js request context (e.g., cron job or static render).
    return `sys_${randomUUID()}`;
  }
}
