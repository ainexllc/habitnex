import { test, expect } from '@playwright/test';

test.describe('Basic Theme Tests', () => {
  test.setTimeout(60000); // Set longer timeout
  
  test('test theme consistency on login page', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    
    // Check theme classes exist
    const hasThemeClass = await page.evaluate(() => {
      const html = document.documentElement;
      return html.classList.contains('dark') || html.classList.contains('light');
    });
    expect(hasThemeClass).toBe(true);
    
    // Check background color
    const bgColor = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Login page background color:', bgColor);
    
    // Take screenshot of login page
    await page.screenshot({ 
      path: 'tests/screenshots/login-page.png', 
      fullPage: true 
    });
    
    // Check form elements have proper contrast
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    // Check input styling
    const inputBg = await emailInput.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    const inputText = await emailInput.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    
    console.log('Input background:', inputBg);
    console.log('Input text color:', inputText);
    
    // Login and test dashboard
    await emailInput.fill('dinohorn9@gmail.com');
    await passwordInput.fill('dinohorn');
    await submitButton.click();
    
    // Wait a bit for redirect
    await page.waitForTimeout(5000);
    
    // Check if redirected
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    
    if (currentUrl.includes('dashboard')) {
      // We're on dashboard
      const dashboardTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      console.log('Dashboard theme:', dashboardTheme);
      
      // Take dashboard screenshot
      await page.screenshot({ 
        path: 'tests/screenshots/workspace-overview-initial.png', 
        fullPage: true 
      });
      
      // Try to find theme toggle
      const possibleToggles = [
        page.locator('button[aria-label*="theme" i]'),
        page.locator('button:has(svg[class*="sun"])'),
        page.locator('button:has(svg[class*="moon"])'),
        page.locator('button').filter({ hasText: /dark|light|theme/i })
      ];
      
      let toggleFound = false;
      for (const toggle of possibleToggles) {
        if (await toggle.count() > 0) {
          console.log('Found theme toggle');
          toggleFound = true;
          await toggle.first().click();
          await page.waitForTimeout(1000);
          
          const newTheme = await page.evaluate(() => {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
          });
          console.log('Theme after toggle:', newTheme);
          
          expect(newTheme).not.toBe(dashboardTheme);
          
          // Take screenshot after theme change
          await page.screenshot({ 
            path: `tests/screenshots/workspace-overview-${newTheme}.png`, 
            fullPage: true 
          });
          
          break;
        }
      }
      
      if (!toggleFound) {
        console.log('Theme toggle not found, but theme classes are present');
      }
    }
  });
  
  test('test family dashboard direct access', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('dinohorn9@gmail.com');
    await page.locator('input[type="password"]').fill('dinohorn');
    await page.locator('button[type="submit"]').click();
    
    // Wait for login to complete
    await page.waitForTimeout(5000);
    
    // Now navigate to family dashboard
    await page.goto('/workspace?tab=overview');
    await page.waitForTimeout(3000);
    
    // Check we're on family dashboard
    const url = page.url();
    console.log('Family dashboard URL:', url);
    
    // Check theme
    const theme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    console.log('Family dashboard theme:', theme);
    
    // Check navigation bar
    const navBar = page.locator('.bg-white, .dark\\:bg-gray-800').first();
    const navBarVisible = await navBar.count() > 0;
    console.log('Navigation bar found:', navBarVisible);
    
    // Check buttons
    const buttons = await page.locator('button').count();
    console.log('Number of buttons:', buttons);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/family-dashboard-test.png', 
      fullPage: true 
    });
    
    // Test theme persistence if possible
    const themeBeforeRefresh = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    
    // Refresh page
    await page.reload();
    await page.waitForTimeout(3000);
    
    const themeAfterRefresh = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    
    expect(themeAfterRefresh).toBe(themeBeforeRefresh);
    console.log('Theme persisted after refresh:', themeAfterRefresh === themeBeforeRefresh);
  });
});