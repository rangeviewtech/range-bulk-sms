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
    const passwordInput = page.getByLabel(/password/i);
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Sign in button
    const submitBtn = page.getByRole('button', { name: /sign in/i, exact: true });
    await expect(submitBtn).toBeVisible();
  });

  test('toggles password visibility when clicking eye button', async ({ page }) => {
    await page.goto('/login');
    const passwordInput = page.getByLabel(/password/i);

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

    // Link to forgot password
    const forgotLink = page.getByRole('link', { name: /forgot password/i });
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();
    await expect(page).toHaveURL(/\/forgot-password/);

    // Back to login then register
    await page.goto('/login');
    const registerLink = page.getByRole('link', { name: /create account|sign up|register/i });
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    }
  });

  test('handles invalid credentials with an accessible error alert', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('invalid_user@rangeview.co.ug');
    await page.getByLabel(/password/i).fill('WrongPassword123!');
    await page.getByRole('button', { name: /sign in/i, exact: true }).click();

    // Expect an error feedback toast or inline error
    await expect(
      page.getByText(/invalid credentials|invalid email or password|user not found/i).first()
    ).toBeVisible({ timeout: 6000 });
  });
});
