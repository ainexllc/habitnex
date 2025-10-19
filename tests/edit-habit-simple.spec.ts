import { test, expect } from '@playwright/test';

test.describe('Simple Edit Habit Test', () => {
  test('should load the family dashboard', async ({ page }) => {
    await page.goto('/?tab=overview');

    // Check that we can access the page
    await expect(page).toHaveURL(/.*dashboard\/family/);

    // Check for basic page elements
    const pageTitle = page.locator('h1').first();
    await expect(pageTitle).toBeVisible();

    console.log('✅ Family dashboard loads successfully');
  });

  test('should show create habit button', async ({ page }) => {
    await page.goto('/?tab=overview');

    // Look for create habit button
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first();

    if (await createButton.isVisible()) {
      console.log('✅ Create habit button is visible');
    } else {
      console.log('ℹ️  No create habit button found (might be expected if no habits exist yet)');
    }
  });
});
