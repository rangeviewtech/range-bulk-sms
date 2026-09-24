/**
 * Attempts to retrieve the request ID from the current request context.
 * If running outside of a web request (e.g. background job, client, or non-dynamic route), 
 * it gracefully falls back to generating a temporary one.
 */
export async function getRequestId(): Promise<string> {
  if (typeof window !== 'undefined') {
    return `client_${Math.random().toString(36).substring(2, 9)}`;
  }
  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const requestId = headersList.get('x-request-id');
    if (requestId) return requestId;
  } catch (_error) {
    // Outside request context
  }

  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `sys_${crypto.randomUUID()}`;
    }
  } catch {
    // fallback
  }

  return `sys_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
}
