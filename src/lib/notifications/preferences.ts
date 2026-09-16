import { prisma } from '@/lib/prisma';
import { CommunicationChannel } from '@/generated/prisma';

export const NotificationPreferencesService = {
  /**
   * Evaluates the allowed channels for a user given a specific notification category.
   * If the user hasn't explicitly set preferences, defaults are applied.
   */
  async getAllowedChannels(
    userId: string,
    category: string,
    requestedChannels: CommunicationChannel[]
  ): Promise<CommunicationChannel[]> {
    const prefs = await prisma.notificationPreference.findUnique({
      where: {
        userId_category: {
          userId,
          category,
        },
      },
    });

    let allowed: CommunicationChannel[] = requestedChannels.filter(
      (c) => c === 'EMAIL' || c === 'IN_APP'
    );

    if (prefs) {
      // Intersect requested with what they allowed
      allowed = requestedChannels.filter((c) => prefs.channels.includes(c));
    }

    // Force EMAIL for SECURITY if nothing is allowed
    if (category === 'SECURITY' && allowed.length === 0) {
      return ['EMAIL'];
    }

    return allowed;
  },

  async getUserPreferences(userId: string) {
    return prisma.notificationPreference.findMany({
      where: { userId },
    });
  },

  async updatePreference(userId: string, category: string, channels: CommunicationChannel[]) {
    return prisma.notificationPreference.upsert({
      where: {
        userId_category: { userId, category },
      },
      update: { channels },
      create: { userId, category, channels },
    });
  },
};
