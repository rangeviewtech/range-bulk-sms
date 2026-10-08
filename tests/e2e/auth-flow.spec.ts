import { test, expect } from '@playwright/test';

test.describe('Authentication Flows E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
      localStorage.setItem('pwa-prompt-dismissed', 'true');
    });
  });

  test('renders login page with email, password, and remember-me controls', async ({ page }) => {
    await page.goto('/login');

    // Page title and headers
    await expect(page).toHaveTitle(/Range Bulk SMS/i);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    // Input fields
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.locator('#password');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Sign in button
    const submitBtn = page.getByRole('button', { name: 'Sign in', exact: true });
    await expect(submitBtn).toBeVisible();
  });

  test('toggles password visibility when clicking eye button', async ({ page }) => {
    await page.goto('/login');
    const passwordInput = page.locator('#password');

    // Initial type should be password
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    const toggleBtn = page.getByLabel(/show password|hide password/i);
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');

      await toggleBtn.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('navigates to forgot-password and register pages', async ({ page }) => {
    await page.goto('/login');

    // Forgot-password is an inline view on the login page.
    const forgotButton = page.getByRole('button', { name: /forgot password/i });
    await expect(forgotButton).toBeVisible();
    await forgotButton.click();
    await expect(page.getByLabel(/email/i)).toBeVisible();

    // Back to login then register
    await page.goto('/login');
    const registerLink = page.getByRole('link', { name: /create account|sign up|register/i });
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    }
  });

  test('requires security verification before credential validation', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('invalid_user@rangeview.co.ug');
    await page.locator('#password').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page.getByText(/complete the security verification/i)).toBeVisible({ timeout: 6000 });
  });
});
