import 'server-only';
import { verifySession, requireAuth } from '@/lib/auth/session';

import { cache } from 'react';

/**
 * Data Access Layer (DAL) Boundary
 * 
 * This module is the central authority for server-side authentication and 
 * authorization checks. It guarantees that these functions can only be executed 
 * on the server, completely isolating the database from the client.
 */

export const getSession = cache(async () => {
  return await verifySession();
});

export const getAuthUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  // Use Prisma to fetch full user info if needed, but session.user already has it
  return session.user;
});

export const getRequiredSession = cache(async () => {
  return await requireAuth();
});

export const getRequiredAuthUser = cache(async () => {
  const session = await getRequiredSession();
  return session.user;
});

export { verifySession, requireAuth };
