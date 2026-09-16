import { test, expect } from '@playwright/test';

test('persists light and dark theme choices', async ({ page }) => {
  await page.goto('/login');
  for (const theme of ['Dark', 'Light']) {
    await page.getByRole('button', { name: 'Toggle theme' }).click();
    await page.getByRole('menuitem', { name: theme, exact: true }).click();
    await expect(page.locator('html')).toHaveClass(new RegExp(theme.toLowerCase()));
  }
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/light/);
});
