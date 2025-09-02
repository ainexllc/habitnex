import { test, expect } from '@playwright/test';

test.describe('Theme Toggle Functionality', () => {
  test('should toggle theme on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Get initial theme
    const initialTheme = await page.evaluate(() => document.documentElement.className);
    console.log('Initial theme on homepage:', initialTheme || 'light');
    
    // Click theme toggle
    await page.click('button[aria-label*="Switch to"]');
    await page.waitForTimeout(500);
    
    // Check theme changed
    const newTheme = await page.evaluate(() => document.documentElement.className);
    console.log('Theme after toggle:', newTheme);
    expect(newTheme).not.toBe(initialTheme);
    
    // Toggle back
    await page.click('button[aria-label*="Switch to"]');
    await page.waitForTimeout(500);
    
    const finalTheme = await page.evaluate(() => document.documentElement.className);
    expect(finalTheme).toBe(initialTheme);
  });

  test('should toggle theme on login page', async ({ page }) => {
    await page.goto('/login');
    
    // Get initial theme
    const initialTheme = await page.evaluate(() => document.documentElement.className);
    console.log('Initial theme on login:', initialTheme || 'light');
    
    // Click theme toggle
    await page.click('button[aria-label*="Switch to"]');
    await page.waitForTimeout(500);
    
    // Check theme changed
    const newTheme = await page.evaluate(() => document.documentElement.className);
    console.log('Theme after toggle:', newTheme);
    expect(newTheme).not.toBe(initialTheme);
  });

  test('should toggle theme on signup page', async ({ page }) => {
    await page.goto('/signup');
    
    // Get initial theme
    const initialTheme = await page.evaluate(() => document.documentElement.className);
    console.log('Initial theme on signup:', initialTheme || 'light');
    
    // Click theme toggle
    await page.click('button[aria-label*="Switch to"]');
    await page.waitForTimeout(500);
    
    // Check theme changed
    const newTheme = await page.evaluate(() => document.documentElement.className);
    console.log('Theme after toggle:', newTheme);
    expect(newTheme).not.toBe(initialTheme);
  });

  test('should persist theme across page navigation', async ({ page }) => {
    await page.goto('/');
    
    // Set to dark mode
    const initialTheme = await page.evaluate(() => document.documentElement.className);
    if (!initialTheme.includes('dark')) {
      await page.click('button[aria-label*="Switch to"]');
      await page.waitForTimeout(500);
    }
    
    // Verify dark mode is set
    const darkTheme = await page.evaluate(() => document.documentElement.className);
    expect(darkTheme).toContain('dark');
    
    // Navigate to login page
    await page.goto('/login');
    const loginTheme = await page.evaluate(() => document.documentElement.className);
    expect(loginTheme).toContain('dark');
    
    // Navigate to signup page
    await page.goto('/signup');
    const signupTheme = await page.evaluate(() => document.documentElement.className);
    expect(signupTheme).toContain('dark');
    
    // Check localStorage
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe('dark');
  });

  test('should have visible theme toggle button on all pages', async ({ page }) => {
    // Test homepage
    await page.goto('/');
    const homepageToggle = await page.locator('button[aria-label*="Switch to"]');
    await expect(homepageToggle).toBeVisible();
    
    // Test login page
    await page.goto('/login');
    const loginToggle = await page.locator('button[aria-label*="Switch to"]');
    await expect(loginToggle).toBeVisible();
    
    // Test signup page
    await page.goto('/signup');
    const signupToggle = await page.locator('button[aria-label*="Switch to"]');
    await expect(signupToggle).toBeVisible();
  });
});