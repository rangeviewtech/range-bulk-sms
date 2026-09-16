import { test, expect } from '@playwright/test';

test('unconfigured social login does not authenticate', async ({ page, context }) => {
  await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'rejected'); localStorage.setItem('pwa-prompt-dismissed', 'true'); });
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign in with Google', exact: true }).click();
  await expect(page.getByText('Social sign-in is not configured. Please sign in with your email and password.')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  expect((await context.cookies()).some(cookie => cookie.name === 'session')).toBe(false);
});

test('protects APIs and accepts public health checks', async ({ request }) => {
  expect((await request.get('/api/health')).status()).toBe(200);
  expect((await request.get('/api/notifications')).status()).toBe(401);
  expect((await request.get('/api/cron/process-jobs')).status()).toBe(401);
  expect((await request.post('/api/webhooks/telegram', { data: {} })).status()).toBe(401);
});
