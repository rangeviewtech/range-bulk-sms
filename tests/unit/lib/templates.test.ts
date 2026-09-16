// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { NotificationTemplateService } from '@/lib/notifications/templates';
import { prismaMock } from '../prismaMock';
describe('Notification templates', () => {
  it('escapes untrusted values in HTML messages', async () => {
    prismaMock.notificationTemplate.findFirst.mockResolvedValue(null);
    const rendered = await NotificationTemplateService.resolveTemplate('auth.welcome', 'EMAIL', {
      name: '<script>alert(1)</script>',
    });
    expect(rendered.body).not.toContain('<script>');
    expect(rendered.body).toContain('&lt;script&gt;');
  });
  it('builds a usable reset URL', async () => {
    prismaMock.notificationTemplate.findFirst.mockResolvedValue(null);
    expect(
      (
        await NotificationTemplateService.resolveTemplate('auth.password_reset', 'EMAIL', {
          token: 'test-token',
        })
      ).body
    ).toContain('/reset-password?token=test-token');
  });
  it('does not leak arbitrary payloads through missing templates', async () => {
    prismaMock.notificationTemplate.findFirst.mockResolvedValue(null);
    await expect(
      NotificationTemplateService.resolveTemplate('unknown', 'EMAIL', { password: 'private' })
    ).rejects.toThrow('not configured');
  });
});
