import { prisma } from '@/lib/prisma';
import { ApiKey, User } from '@/generated/prisma';
import crypto from 'crypto';

export async function validateApiKey(headerToken: string | null): Promise<{ apiKey: ApiKey; user: User } | null> {
  if (!headerToken || !headerToken.startsWith('Bearer ')) {
    return null;
  }

  const token = headerToken.substring(7).trim(); // Remove "Bearer "
  
  if (!token) {
    return null;
  }

  // Tokens are expected to have a format like `rg_live_abcdef123456...`
  // We hash the full token to look it up in the db, but we can also use the prefix to quickly reject.
  const hash = crypto.createHash('sha256').update(token).digest('hex');

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    include: { user: true }
  });

  if (!apiKey || apiKey.status !== 'ACTIVE' || (apiKey.expiresAt && apiKey.expiresAt < new Date())) {
    return null;
  }

  // Update last used asynchronously
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() }
  }).catch(console.error);

  return { apiKey, user: apiKey.user };
}
