import { test } from '@playwright/test';

test.describe('Dark Mode Visual Tests', () => {
  test('capture dark mode screenshots', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'dinohorn9@gmail.com');
    await page.fill('input[type="password"]', 'dinohorn');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForTimeout(5000);
    
    // Set dark mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    await page.waitForTimeout(1000);
    
    // Dashboard screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/updated-dark-dashboard.png', 
      fullPage: true 
    });
    
    // Family dashboard
    await page.goto('/?tab=overview');
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: 'tests/screenshots/updated-dark-family.png', 
      fullPage: true 
    });
    
    // Switch to light mode for comparison
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'tests/screenshots/updated-light-family.png', 
      fullPage: true 
    });
    
    // Check habits page
    await page.goto('/habits');
    await page.waitForTimeout(2000);
    
    // Dark mode again
    await page.evaluate(() => {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'tests/screenshots/updated-dark-habits.png', 
      fullPage: true 
    });
  });
});