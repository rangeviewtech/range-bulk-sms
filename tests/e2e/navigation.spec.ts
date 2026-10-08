import { test, expect } from '@playwright/test';

test('requires sign-in when navigating from home to the dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
});

for (const route of ['/sms/campaigns', '/reports/sms', '/wallet', '/notifications', '/settings/security', '/admin/communications/logs']) {
  test('protects ' + route, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
  });
}

