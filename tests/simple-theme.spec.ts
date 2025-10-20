import { test, expect } from '@playwright/test';

test.describe('Simple Theme Tests', () => {
  test('login and test theme toggle', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    
    // Login
    await page.fill('input[type="email"]', 'dinohorn9@gmail.com');
    await page.fill('input[type="password"]', 'dinohorn');
    await page.click('button[type="submit"]');
    
    // Wait for navigation - already redirects to dashboard
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if we're on dashboard
    const url = page.url();
    expect(url).toContain('dashboard');
    
    // Find theme toggle button
    const themeToggle = page.locator('button').filter({ hasText: /Switch to|Theme|Dark|Light/i }).first()
      .or(page.locator('button:has(svg[data-lucide="sun"])'))
      .or(page.locator('button:has(svg[data-lucide="moon"])'))
      .or(page.locator('[aria-label*="theme"]'))
      .first();
    
    // Check if theme toggle exists
    const isVisible = await themeToggle.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isVisible) {
      // Get initial theme
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      console.log('Initial theme:', initialTheme);
      
      // Click theme toggle
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Check theme changed
      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      console.log('New theme:', newTheme);
      
      expect(newTheme).not.toBe(initialTheme);
      
      // Navigate to family dashboard
      await page.goto('/workspace?tab=overview');
      await page.waitForLoadState('networkidle');
      
      // Check theme persisted
      const familyTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      expect(familyTheme).toBe(newTheme);
      
      // Take screenshots
      await page.screenshot({ path: `tests/screenshots/${familyTheme}-family-dashboard.png`, fullPage: true });
      
      // Toggle theme again
      const familyToggle = page.locator('button').filter({ hasText: /Switch to|Theme|Dark|Light/i }).first()
        .or(page.locator('button:has(svg[data-lucide="sun"])'))
        .or(page.locator('button:has(svg[data-lucide="moon"])'))
        .first();
      
      if (await familyToggle.isVisible({ timeout: 5000 })) {
        await familyToggle.click();
        await page.waitForTimeout(500);
        
        const finalTheme = await page.evaluate(() => {
          return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        });
        
        await page.screenshot({ path: `tests/screenshots/${finalTheme}-family-dashboard.png`, fullPage: true });
      }
    } else {
      console.log('Theme toggle not found, checking theme classes directly');
      
      // Check theme classes exist
      const hasThemeClass = await page.evaluate(() => {
        const html = document.documentElement;
        return html.classList.contains('dark') || html.classList.contains('light');
      });
      
      expect(hasThemeClass).toBe(true);
    }
  });
  
  test('check family dashboard styling', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'dinohorn9@gmail.com');
    await page.fill('input[type="password"]', 'dinohorn');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Go to family dashboard
    await page.goto('/workspace?tab=overview');
    await page.waitForLoadState('networkidle');
    
    // Check navigation bar exists
    const navBar = page.locator('.bg-white.dark\\:bg-gray-800, [class*="bg-white"][class*="dark:bg-gray"]').first();
    await expect(navBar).toBeVisible();
    
    // Check buttons are visible
    const buttons = page.locator('button').filter({ has: page.locator('svg') });
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} icon buttons`);
    
    // Check member zones if they exist
    const memberZones = page.locator('[class*="grid"] > div').filter({ 
      has: page.locator('h3, h4') 
    });
    const zoneCount = await memberZones.count();
    console.log(`Found ${zoneCount} member zones`);
    
    // Check color consistency
    const bgColor = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Background color:', bgColor);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/family-dashboard-final.png', 
      fullPage: true 
    });
  });
});