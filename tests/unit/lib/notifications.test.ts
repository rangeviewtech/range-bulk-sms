import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationEngine } from '@/lib/notifications/engine';
import { prismaMock } from '../prismaMock';
import { NotificationPreferencesService } from '@/lib/notifications/preferences';
import { enqueueJob } from '@/lib/jobs/db';

vi.mock('@/lib/jobs/db', () => ({
  enqueueJob: vi.fn(),
}));

describe('NotificationEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('respects user preferences and queues appropriate jobs', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@test.com' } as any);

    // Mock user preferring only EMAIL and IN_APP
    vi.spyOn(NotificationPreferencesService, 'getAllowedChannels').mockResolvedValue([
      'EMAIL',
      'IN_APP',
    ]);

    await NotificationEngine.dispatch('user-1', 'SECURITY', 'login_alert', {
      time: 'now',
    });

    expect(NotificationPreferencesService.getAllowedChannels).toHaveBeenCalledWith(
      'user-1',
      'SECURITY',
      ['EMAIL', 'SMS', 'IN_APP', 'WHATSAPP', 'TELEGRAM']
    );

    // Should enqueue EMAIL and IN_APP
    expect(enqueueJob).toHaveBeenCalledTimes(2);
    expect(enqueueJob).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'send-email',
        payload: expect.objectContaining({
          recipient: 'test@test.com',
          template: 'login_alert',
        }),
      })
    );

    expect(enqueueJob).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'send-in-app',
        payload: expect.objectContaining({
          recipient: 'user-1',
          template: 'login_alert',
        }),
      })
    );
  });

  it('falls back to email when all security notification channels are disabled', async () => {
    vi.mocked(NotificationPreferencesService.getAllowedChannels).mockRestore();
    prismaMock.notificationPreference.findUnique.mockResolvedValue({
      id: 'pref-1',
      userId: 'user-1',
      category: 'SECURITY',
      channels: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(
      await NotificationPreferencesService.getAllowedChannels('user-1', 'SECURITY', [
        'EMAIL',
        'IN_APP',
      ])
    ).toEqual(['EMAIL']);
  });
});
