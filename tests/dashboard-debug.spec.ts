import { test, expect } from '@playwright/test';

test.describe('Dashboard Debug Tests', () => {
  test('debug dashboard authentication and data loading', async ({ page }) => {
    console.log('🔍 Debugging dashboard authentication and data loading...');
    
    // Set up console error tracking
    const consoleErrors = [];
    const networkErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('🔴 Console error:', msg.text());
      } else if (msg.type() === 'log') {
        console.log('📋 Console log:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      consoleErrors.push(`Page error: ${error.message}`);
      console.log('🔴 Page error:', error.message);
    });
    
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push(`${response.status()} ${response.url()}`);
        console.log('🔴 Network error:', response.status(), response.url());
      }
    });
    
    // Navigate to dashboard
    console.log('📍 Navigating to dashboard...');
    await page.goto('http://localhost:3001/workspace?tab=overview');
    await page.waitForLoadState('domcontentloaded');
    
    console.log('✅ Page URL:', page.url());
    
    // Wait longer to see if authentication redirects happen
    console.log('⏳ Waiting for authentication and data loading...');
    await page.waitForTimeout(10000); // Wait 10 seconds
    
    console.log('📍 Final URL after wait:', page.url());
    
    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/workspace-overview-debug.png', fullPage: true });
    
    // Check if we're on login page (authentication required)
    if (page.url().includes('/login')) {
      console.log('❌ Redirected to login - authentication required');
      
      // Check what's on the login page
      const loginText = await page.locator('body').textContent();
      console.log('📄 Login page content preview:', loginText.substring(0, 200));
      
      return;
    }
    
    // Check for loading states
    const loadingSpinner = await page.locator('.animate-spin').isVisible().catch(() => false);
    console.log('⏳ Loading spinner visible:', loadingSpinner);
    
    // Check for dashboard content
    const dashboardTitle = await page.locator('h1:has-text("Dashboard")').isVisible().catch(() => false);
    console.log('📊 Dashboard title visible:', dashboardTitle);
    
    // Check for habits section
    const habitsSection = await page.locator('text=Today\'s Focus').isVisible().catch(() => false);
    console.log('📋 Habits section visible:', habitsSection);
    
    // Check for empty state vs habits
    const emptyState = await page.locator('text=Welcome to HabitNex!').isVisible().catch(() => false);
    const habitCards = await page.locator('[data-testid="habit-card"], .habit-card, [class*="habit"]').count();
    
    console.log('🆕 Empty state visible:', emptyState);
    console.log('📋 Habit cards found:', habitCards);
    
    // Check for edit buttons specifically
    const editButtons = await page.locator('button:has(svg), button[title*="edit"], button[aria-label*="edit"]').count();
    console.log('✏️ Edit buttons found:', editButtons);
    
    // Check body content to see what's actually rendered
    const bodyText = await page.locator('body').textContent();
    const hasContent = bodyText.length > 100;
    
    console.log('📄 Body content length:', bodyText.length);
    console.log('📄 Has meaningful content:', hasContent);
    
    if (!hasContent) {
      console.log('❌ Dashboard appears to be blank/white screen');
      console.log('📄 Body content:', bodyText.substring(0, 500));
    }
    
    // Check for any React error boundaries or hydration issues
    const errorBoundary = await page.locator('text=Something went wrong').isVisible().catch(() => false);
    const hydrationError = bodyText.includes('Hydration');
    
    console.log('🚨 Error boundary visible:', errorBoundary);
    console.log('💧 Hydration error detected:', hydrationError);
    
    // Check specific dashboard elements
    const headerVisible = await page.locator('header, [role="banner"], nav').isVisible().catch(() => false);
    const mainVisible = await page.locator('main').isVisible().catch(() => false);
    
    console.log('🎯 Header visible:', headerVisible);
    console.log('🎯 Main content visible:', mainVisible);
    
    // Log all errors found
    if (consoleErrors.length > 0) {
      console.log('🔴 All console errors:', consoleErrors);
    }
    
    if (networkErrors.length > 0) {
      console.log('🔴 All network errors:', networkErrors);
    }
    
    if (consoleErrors.length === 0 && networkErrors.length === 0 && !hasContent) {
      console.log('🔍 No errors detected but page is blank - potential React rendering issue');
    }
    
    console.log('🏁 Dashboard debug test completed');
  });
});