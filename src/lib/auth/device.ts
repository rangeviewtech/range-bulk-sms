import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/communications/service';
import { logAudit } from '@/lib/security/audit';

export async function detectNewDevice(
  userId: string,
  userAgent: string,
  ipAddress: string,
  excludeSessionId?: string
) {
  // Find past sessions for this user
  const recentSessions = await prisma.session.findMany({
    where: { userId, ...(excludeSessionId ? { id: { not: excludeSessionId } } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // If this is their first session ever, it's technically a "new" device but expected
  if (recentSessions.length === 0) return;

  // Check if we have seen this specific UA before
  const isKnownDevice = recentSessions.some((session) => session.deviceInfo === userAgent);

  if (!isKnownDevice) {
    // Log the event
    await logAudit({
      userId,
      action: 'NEW_DEVICE_LOGIN',
      resourceType: 'Session',
      category: 'SECURITY',
      metadata: { userAgent },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email) {
      // Dispatch a notification alerting them of a new login
      await NotificationService.dispatch({
        recipient: user.email,
        channel: 'EMAIL',
        template: 'auth.new_device',
        payload: {
          userAgent,
          ipAddress,
          time: new Date().toUTCString(),
          name: user.name || 'User',
        },
        priority: 'HIGH',
      });
    }
  }
}
