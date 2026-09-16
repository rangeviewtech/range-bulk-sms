import { test, expect } from '@playwright/test';

test('requires sign-in when navigating from home to the dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Trakzee/i);
  await page.getByRole('link', { name: /get started/i }).click();
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
});

for (const route of ['/tracking', '/reports', '/charts', '/notifications', '/settings/security', '/admin/communications/logs']) {
  test('protects ' + route, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
  });
}
