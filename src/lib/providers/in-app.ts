import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const InAppProvider = {
  async send(userId: string, category: string, title: string, body: string, actionUrl?: string) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          category,
          title,
          body,
          actionUrl,
        },
      });
      return { success: true, messageId: notification.id };
    } catch (err: unknown) {
      logger.error('In-App Notification Error', {
        error: err instanceof Error ? (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err)) : 'Provider error',
      });
      throw err;
    }
  },
};
