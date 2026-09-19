// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  evaluateDeviceRecognition,
  parseDeviceName,
  hashDeviceToken,
  revokeUserDevice,
  DEVICE_COOKIE_NAME,
} from '@/lib/auth/device';
import { NotificationService } from '@/lib/communications/service';
import type { UserDevice, User } from '@/generated/prisma';
import { prismaMock } from '../../unit/prismaMock';

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(
    new Headers({
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
      'x-forwarded-for': '197.239.4.5',
    })
  ),
  cookies: vi.fn().mockImplementation(() => Promise.resolve(mockCookieStore)),
}));

vi.mock('@/lib/communications/service', () => ({
  NotificationService: {
    dispatch: vi.fn().mockResolvedValue({ id: 'job-1' }),
  },
}));

vi.mock('@/lib/security/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
}));

describe('New-Device Detection Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.get.mockReturnValue(undefined);
  });

  it('correctly parses user-agent into friendly device names', () => {
    expect(
      parseDeviceName('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0')
    ).toBe('Chrome on Windows');
    expect(
      parseDeviceName('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1')
    ).toBe('Safari on iOS');
    expect(
      parseDeviceName('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Firefox/123.0')
    ).toBe('Firefox on macOS');
  });

  it('detects a new device when no cookie is present, persists record, sets cookie, and sends exactly one email alert', async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    prismaMock.userDevice.findFirst.mockResolvedValueOnce(null);
    prismaMock.userDevice.create.mockResolvedValueOnce({
      id: 'dev-1',
      userId: 'user-123',
      deviceHash: 'hash-abc',
      deviceName: 'Chrome on Windows',
      deviceInfo: 'Mozilla/5.0',
      ipAddress: '197.239.4.5',
      lastLoginAt: new Date(),
      createdAt: new Date(),
      revokedAt: null,
    } as unknown as UserDevice);

    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'user-123',
      email: 'user@example.com',
      name: 'Test User',
    } as unknown as User);

    const result = await evaluateDeviceRecognition('user-123');

    expect(result.isNewDevice).toBe(true);
    expect(prismaMock.userDevice.create).toHaveBeenCalledTimes(1);
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      DEVICE_COOKIE_NAME,
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        maxAge: 90 * 24 * 60 * 60,
      })
    );
    expect(NotificationService.dispatch).toHaveBeenCalledTimes(1);
    expect(NotificationService.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: 'user@example.com',
        template: 'auth.new_device',
        priority: 'HIGH',
      })
    );
  });

  it('recognizes an existing active device, refreshes sliding TTL, and sends zero notification emails', async () => {
    const rawToken = 'a'.repeat(64);
    const expectedHash = hashDeviceToken(rawToken);

    mockCookieStore.get.mockReturnValue({ value: rawToken });

    prismaMock.userDevice.findFirst.mockResolvedValueOnce({
      id: 'existing-dev-1',
      userId: 'user-123',
      deviceHash: expectedHash,
      deviceName: 'Chrome on Windows',
      revokedAt: null,
    } as unknown as UserDevice);

    prismaMock.userDevice.update.mockResolvedValueOnce({
      id: 'existing-dev-1',
      lastLoginAt: new Date(),
    } as unknown as UserDevice);

    const result = await evaluateDeviceRecognition('user-123');

    expect(result.isNewDevice).toBe(false);
    expect(result.deviceId).toBe('existing-dev-1');
    expect(prismaMock.userDevice.update).toHaveBeenCalledTimes(1);
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      DEVICE_COOKIE_NAME,
      rawToken,
      expect.objectContaining({
        httpOnly: true,
        maxAge: 90 * 24 * 60 * 60,
      })
    );
    expect(NotificationService.dispatch).not.toHaveBeenCalled();
  });

  it('treats a revoked device as unrecognized and issues a new credential and alert', async () => {
    const revokedToken = 'b'.repeat(64);
    mockCookieStore.get.mockReturnValue({ value: revokedToken });

    // Returns null because query filters for revokedAt: null
    prismaMock.userDevice.findFirst.mockResolvedValueOnce(null);
    prismaMock.userDevice.create.mockResolvedValueOnce({
      id: 'new-dev-after-revoke',
      userId: 'user-123',
      deviceHash: 'new-hash',
    } as unknown as UserDevice);

    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'user-123',
      email: 'user@example.com',
    } as unknown as User);

    const result = await evaluateDeviceRecognition('user-123');

    expect(result.isNewDevice).toBe(true);
    expect(prismaMock.userDevice.create).toHaveBeenCalledTimes(1);
    expect(NotificationService.dispatch).toHaveBeenCalledTimes(1);
  });

  it('revokes a recognized device by updating revokedAt timestamp', async () => {
    prismaMock.userDevice.findFirst.mockResolvedValueOnce({
      id: 'dev-to-revoke',
      userId: 'user-123',
      deviceName: 'Old Laptop',
    } as unknown as UserDevice);

    prismaMock.userDevice.update.mockResolvedValueOnce({
      id: 'dev-to-revoke',
      revokedAt: new Date(),
    } as unknown as UserDevice);

    const revoked = await revokeUserDevice('user-123', 'dev-to-revoke');
    expect(revoked).not.toBeNull();
    expect(prismaMock.userDevice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'dev-to-revoke' },
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      })
    );
  });
});
