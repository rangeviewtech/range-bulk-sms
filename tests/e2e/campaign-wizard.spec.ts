import { test, expect } from '@playwright/test';

test.describe('Campaign Creation & Wizard Flows E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
      localStorage.setItem('pwa-prompt-dismissed', 'true');
    });
  });

  test('enforces route protection when visiting campaign builder unauthenticated', async ({ page }) => {
    await page.goto('/sms/campaigns/new');
    // Should be intercepted by edge proxy and redirected to login with callbackUrl
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fsms%2Fcampaigns%2Fnew/);
  });

  test('enforces route protection on campaigns list and delivery reports', async ({ page }) => {
    await page.goto('/sms/campaigns');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/sms/delivery-reports');
    await expect(page).toHaveURL(/\/login/);
  });

  test('displays marketing campaign tiers and features on public landing page', async ({ page }) => {
    await page.goto('/');

    // Check features section exists and is populated
    await expect(page.getByRole('heading', { name: /enterprise bulk sms platform/i })).toBeVisible();
    await expect(page.getByText('Targeted Campaigns')).toBeVisible();
    await expect(page.getByText('Instant Bulk Messaging')).toBeVisible();

    // Check pricing plans
    await expect(page.getByText('Starter')).toBeVisible();
    await expect(page.getByText('Business')).toBeVisible();
    await expect(page.getByText('Enterprise')).toBeVisible();
  });
});
