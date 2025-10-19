import { test, expect } from '@playwright/test';
import { setTheme, verifyThemeConsistency, checkColorContrast, testInteractiveElements } from './helpers/theme-helpers';

test.describe('Quick Theme Consistency Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test credentials
    await page.goto('/login');
    await page.fill('input[type="email"]', 'dinohorn9@gmail.com');
    await page.fill('input[type="password"]', 'dinohorn');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/workspace', { timeout: 10000 });
  });

  test('theme toggle works correctly', async ({ page }) => {
    // Test light theme
    await setTheme(page, 'light');
    await verifyThemeConsistency(page, 'light');
    
    // Test dark theme
    await setTheme(page, 'dark');
    await verifyThemeConsistency(page, 'dark');
    
    // Toggle back to light
    await setTheme(page, 'light');
    await verifyThemeConsistency(page, 'light');
  });

  test('theme persists across page navigation', async ({ page }) => {
    // Set dark theme
    await setTheme(page, 'dark');
    
    // Navigate to different pages
    await page.goto('/workspace?tab=overview');
    await verifyThemeConsistency(page, 'dark');
    
    await page.goto('/habits');
    await verifyThemeConsistency(page, 'dark');
    
    await page.goto('/moods');
    await verifyThemeConsistency(page, 'dark');
    
    // Go back to dashboard
    await page.goto('/workspace');
    await verifyThemeConsistency(page, 'dark');
  });

  test('family dashboard theme consistency', async ({ page }) => {
    await page.goto('/workspace?tab=overview');
    
    // Test in light mode
    await setTheme(page, 'light');
    await verifyThemeConsistency(page, 'light');
    
    // Check navigation bar styling
    const navBar = page.locator('.bg-white.dark\\:bg-gray-800').first();
    if (await navBar.isVisible()) {
      await checkColorContrast(navBar, 4.5);
    }
    
    // Test in dark mode
    await setTheme(page, 'dark');
    await verifyThemeConsistency(page, 'dark');
    
    // Verify member zones have correct theme
    const memberZones = page.locator('[class*="FamilyMemberZone"]');
    const zoneCount = await memberZones.count();
    if (zoneCount > 0) {
      await checkColorContrast(memberZones.first(), 4.5);
    }
  });

  test('buttons and interactive elements', async ({ page }) => {
    await page.goto('/workspace?tab=overview');
    
    // Test light theme
    await setTheme(page, 'light');
    await testInteractiveElements(page, 'light');
    
    // Test dark theme
    await setTheme(page, 'dark');
    await testInteractiveElements(page, 'dark');
  });

  test('modal theme consistency', async ({ page }) => {
    await page.goto('/workspace?tab=overview');
    
    // Test Add Member modal in both themes
    const addMemberButton = page.locator('button:has-text("Add Member")').first();
    
    if (await addMemberButton.isVisible()) {
      // Light theme
      await setTheme(page, 'light');
      await addMemberButton.click();
      
      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();
      await checkColorContrast(modal, 4.5);
      
      // Close modal
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
      
      // Dark theme
      await setTheme(page, 'dark');
      await addMemberButton.click();
      await expect(modal).toBeVisible();
      await checkColorContrast(modal, 4.5);
      
      // Close modal
      await page.keyboard.press('Escape');
    }
  });

  test('form elements maintain contrast', async ({ page }) => {
    await page.goto('/habits/new');
    
    // Test form in light theme
    await setTheme(page, 'light');
    
    const inputs = page.locator('input, textarea, select');
    const inputCount = Math.min(await inputs.count(), 5);
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        await checkColorContrast(input, 4.5);
      }
    }
    
    // Test form in dark theme
    await setTheme(page, 'dark');
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        await checkColorContrast(input, 4.5);
      }
    }
  });

  test('theme syncs with Firebase', async ({ page, context }) => {
    // Set theme to dark
    await setTheme(page, 'dark');
    await verifyThemeConsistency(page, 'dark');
    
    // Open new page in same context (simulating new tab)
    const newPage = await context.newPage();
    await newPage.goto('/workspace');
    
    // Theme should persist in new tab
    await verifyThemeConsistency(newPage, 'dark');
    
    await newPage.close();
  });

  test('screenshots for visual comparison', async ({ page }) => {
    const pages = [
      { url: '/workspace', name: 'dashboard' },
      { url: '/workspace?tab=overview', name: 'family-dashboard' },
      { url: '/habits', name: 'habits' },
      { url: '/moods', name: 'moods' }
    ];
    
    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      
      // Light theme screenshot
      await setTheme(page, 'light');
      await page.screenshot({
        path: `tests/screenshots/light-${pageInfo.name}.png`,
        fullPage: true
      });
      
      // Dark theme screenshot
      await setTheme(page, 'dark');
      await page.screenshot({
        path: `tests/screenshots/dark-${pageInfo.name}.png`,
        fullPage: true
      });
    }
  });
});