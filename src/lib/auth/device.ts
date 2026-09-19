import crypto from 'crypto';
import { cookies, headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/communications/service';
import { logAudit } from '@/lib/security/audit';

export const DEVICE_COOKIE_NAME = 'range_device_token';
const DEVICE_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days

export function parseDeviceName(userAgent: string): string {
  if (!userAgent || userAgent === 'Unknown Device') return 'Unknown Browser';

  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  if (/edg/i.test(userAgent)) browser = 'Edge';
  else if (/opr|opera/i.test(userAgent)) browser = 'Opera';
  else if (/chrome|crios/i.test(userAgent)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox';
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';

  if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';
  else if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(userAgent)) os = 'macOS';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/linux/i.test(userAgent)) os = 'Linux';

  return `${browser} on ${os}`;
}

export function hashDeviceToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Evaluates device recognition upon final successful authentication.
 *
 * Checks the incoming `range_device_token` cookie.
 * - If recognized and active: updates lastLoginAt and refreshes cookie. No alert sent.
 * - If missing, unknown, or revoked: registers the device, sets cookie,
 *   and dispatches exactly ONE new device alert email via NotificationService.
 */
export async function evaluateDeviceRecognition(
  userId: string,
  providedUserAgent?: string,
  providedIp?: string
): Promise<{ isNewDevice: boolean; deviceId: string }> {
  const headersList = await headers().catch(() => null);
  const userAgent =
    providedUserAgent ||
    headersList?.get('user-agent') ||
    'Unknown Device';
  const ipAddress =
    providedIp ||
    (headersList?.get('x-forwarded-for')?.split(',')[0].trim() ||
      headersList?.get('x-real-ip') ||
      '127.0.0.1');

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(DEVICE_COOKIE_NAME)?.value;

  if (rawToken && rawToken.length >= 32) {
    const deviceHash = hashDeviceToken(rawToken);

    // Look for active, unrevoked device
    const existingDevice = await prisma.userDevice.findFirst({
      where: {
        userId,
        deviceHash,
        revokedAt: null,
      },
    });

    if (existingDevice) {
      // Recognized device: update login time and IP
      await prisma.userDevice.update({
        where: { id: existingDevice.id },
        data: {
          lastLoginAt: new Date(),
          ipAddress: ipAddress.substring(0, 45),
        },
      });

      // Refresh sliding 90-day cookie
      cookieStore.set(DEVICE_COOKIE_NAME, rawToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: DEVICE_TTL_SECONDS,
      });

      await logAudit({
        userId,
        action: 'DEVICE_RECOGNIZED',
        resourceType: 'UserDevice',
        resourceId: existingDevice.id,
        category: 'SECURITY',
        metadata: {
          deviceName: existingDevice.deviceName,
          ipAddress,
        },
      });

      return { isNewDevice: false, deviceId: existingDevice.id };
    }
  }

  // New or unrecognized device
  const newRawToken = crypto.randomBytes(32).toString('hex');
  const newDeviceHash = hashDeviceToken(newRawToken);
  const deviceName = parseDeviceName(userAgent);

  const device = await prisma.userDevice.create({
    data: {
      userId,
      deviceHash: newDeviceHash,
      deviceName,
      deviceInfo: userAgent.substring(0, 250),
      ipAddress: ipAddress.substring(0, 45),
      lastLoginAt: new Date(),
    },
  });

  // Issue revocable HttpOnly cookie
  cookieStore.set(DEVICE_COOKIE_NAME, newRawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: DEVICE_TTL_SECONDS,
  });

  await logAudit({
    userId,
    action: 'NEW_DEVICE_DETECTED',
    resourceType: 'UserDevice',
    resourceId: device.id,
    category: 'SECURITY',
    metadata: {
      deviceName,
      ipAddress,
    },
  });

  // Dispatch exactly ONE alert email via Nodemailer queue with idempotency
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.email) {
    const idempotencyKey = `new_device_${userId}_${device.id}`;
    await NotificationService.dispatch({
      recipient: user.email,
      channel: 'EMAIL',
      template: 'auth.new_device',
      payload: {
        deviceName,
        userAgent,
        ipAddress,
        time: new Date().toUTCString(),
        name: user.name || 'Valued User',
      },
      priority: 'HIGH',
      idempotencyKey,
    }).catch((err) => {
      console.error('Failed to dispatch new device email notification:', err);
    });
  }

  return { isNewDevice: true, deviceId: device.id };
}

/**
 * Revokes a recognized device by ID for a user.
 */
export async function revokeUserDevice(userId: string, deviceId: string) {
  const device = await prisma.userDevice.findFirst({
    where: { id: deviceId, userId },
  });

  if (!device) return null;

  const updated = await prisma.userDevice.update({
    where: { id: deviceId },
    data: { revokedAt: new Date() },
  });

  await logAudit({
    userId,
    action: 'DEVICE_REVOKED',
    resourceType: 'UserDevice',
    resourceId: deviceId,
    category: 'SECURITY',
    metadata: {
      deviceName: device.deviceName,
    },
  });

  return updated;
}

/**
 * Revokes all recognized devices for a user except optionally the current one.
 */
export async function revokeAllOtherDevices(userId: string, currentDeviceId?: string) {
  const result = await prisma.userDevice.updateMany({
    where: {
      userId,
      revokedAt: null,
      ...(currentDeviceId ? { id: { not: currentDeviceId } } : {}),
    },
    data: { revokedAt: new Date() },
  });

  await logAudit({
    userId,
    action: 'DEVICE_REVOKED',
    resourceType: 'UserDevice',
    category: 'SECURITY',
    metadata: {
      revokedCount: result.count,
    },
  });

  return result;
}
