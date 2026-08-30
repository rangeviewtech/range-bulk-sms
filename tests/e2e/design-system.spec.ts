import { test, expect } from '@playwright/test'

test.describe('Design System', () => {
  test('navigates and renders design system sections', async ({ page }) => {
    // Navigate to design system page
    await page.goto('/design-system')

    // Check page loads
    await expect(page).toHaveTitle(/Design System/i)
    await expect(page.getByRole('heading', { level: 1, name: /design system/i })).toBeVisible()

    // Assuming there are navigation links to these sections
    const colorsLink = page.getByRole('link', { name: /colors/i })
    if (await colorsLink.isVisible()) {
      await colorsLink.click()
      await expect(page.getByRole('heading', { name: /colors/i })).toBeVisible()
    }

    const typographyLink = page.getByRole('link', { name: /typography/i })
    if (await typographyLink.isVisible()) {
      await typographyLink.click()
      await expect(page.getByRole('heading', { name: /typography/i })).toBeVisible()
    }

    const componentsLink = page.getByRole('link', { name: /components/i })
    if (await componentsLink.isVisible()) {
      await componentsLink.click()
      await expect(page.getByRole('heading', { name: /components/i })).toBeVisible()
    }
  })
})
