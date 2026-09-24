import { test, expect } from '@playwright/test';

test.describe('Developer Ecosystem E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
      localStorage.setItem('pwa-prompt-dismissed', 'true');
    });
  });

  test('enforces session protection on developer api-keys and webhooks routes', async ({ page }) => {
    await page.goto('/developer/api-keys');
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdeveloper%2Fapi-keys/);

    await page.goto('/developer/webhooks');
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdeveloper%2Fwebhooks/);
  });

  test('public developer API documentation loads and is reachable', async ({ page }) => {
    await page.goto('/api/docs');
    await expect(page).toHaveURL(/\/api\/docs/);
    await expect(page).toHaveTitle(/Range Bulk SMS/i);
  });

  test('public health check endpoint responds with 200 OK', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
  });
});
