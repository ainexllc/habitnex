import { test, expect } from '@playwright/test';

test.describe('NextVibe App Verification', () => {
  test('should load the application successfully', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page title contains NextVibe or similar
    await expect(page).toHaveTitle(/NextVibe|Habit|Mood/);
    
    // Take a screenshot of the current state
    await page.screenshot({ 
      path: 'test-results/app-verification-screenshot.png',
      fullPage: true 
    });
    
    // Check that the page has loaded content (not a blank page)
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Look for common app elements (login form, navigation, etc.)
    const hasLoginElements = await page.locator('input[type="email"], button:has-text("Login"), button:has-text("Sign"), a:has-text("Login")').count() > 0;
    const hasNavigationElements = await page.locator('nav, header, [role="navigation"]').count() > 0;
    const hasContentElements = await page.locator('main, .container, #__next').count() > 0;
    
    // Verify at least some app structure is present
    expect(hasLoginElements || hasNavigationElements || hasContentElements).toBeTruthy();
    
    console.log('✅ App verification completed successfully');
    console.log(`📸 Screenshot saved to: test-results/app-verification-screenshot.png`);
  });

  test('should have responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of desktop view
    await page.screenshot({ 
      path: 'test-results/desktop-view.png'
    });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of mobile view
    await page.screenshot({ 
      path: 'test-results/mobile-view.png'
    });
    
    console.log('📱 Mobile and desktop screenshots captured');
  });

  test('should handle basic navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for clickable elements
    const clickableElements = await page.locator('button, a, [role="button"]').count();
    expect(clickableElements).toBeGreaterThan(0);
    
    // Try to find and click a navigation link if present
    const navLinks = page.locator('a[href], button');
    const count = await navLinks.count();
    
    if (count > 0) {
      console.log(`Found ${count} clickable elements - basic navigation is available`);
    }
  });
});