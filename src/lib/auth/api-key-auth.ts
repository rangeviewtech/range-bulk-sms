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

  // Tokens are expected to have a format like `rg_live_abcdef123456...` or `rsms_prefix_secret`
  // We hash the full token or secret to look it up in the db
  const hash = crypto.createHash('sha256').update(token).digest('hex');

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    include: { user: true }
  });

  if (!apiKey || apiKey.status !== 'ACTIVE' || (apiKey.expiresAt && apiKey.expiresAt < new Date())) {
    return null;
  }

  // Check quota limit if set
  if (apiKey.quotaLimit !== null && apiKey.quotaLimit !== undefined) {
    if (apiKey.quotaResetAt && new Date() >= apiKey.quotaResetAt) {
      // Quota cycle reset
      prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { quotaUsed: 0 }
      }).catch(() => {});
    } else if (apiKey.quotaUsed >= apiKey.quotaLimit) {
      return null;
    }
  }

  // Update last used and quota counter asynchronously
  const updateData: { lastUsedAt: Date; quotaUsed?: { increment: number } } = {
    lastUsedAt: new Date(),
  };
  if (apiKey.quotaLimit !== null && apiKey.quotaLimit !== undefined) {
    updateData.quotaUsed = { increment: 1 };
  }

  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: updateData,
  }).catch(() => {});

  return { apiKey, user: apiKey.user };
}
