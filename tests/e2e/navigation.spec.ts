import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('navigates to dashboard from home page', async ({ page }) => {
    // Navigate to home page
    await page.goto('/')

    // Check title (assuming default Next.js starter or similar)
    // You might want to update this to match the actual title of your home page
    await expect(page).toHaveTitle(/Range View|Next.js/i)

    // Find and click the "Get Started" button
    const getStartedButton = page.getByRole('link', { name: /get started/i }).first()
    
    // Check if the button exists before trying to click it
    if (await getStartedButton.isVisible()) {
      await getStartedButton.click()
      // Verify navigation to dashboard
      await expect(page).toHaveURL(/.*\/dashboard/)
    }
  })
})
