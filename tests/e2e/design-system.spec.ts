import { test, expect } from '@playwright/test';

test('renders the public design system and its sections', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/design-system');
  await expect(page.getByRole('heading', { level: 1, name: 'Design System' })).toBeVisible();
  for (const section of ['Colors', 'Typography', 'Components', 'Forms', 'Data Display', 'Feedback']) {
    await page.getByRole('link', { name: section, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: section, exact: true })).toBeVisible();
  }
  expect(errors).toEqual([]);
});
