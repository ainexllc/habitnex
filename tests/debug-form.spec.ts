import { test, expect } from '@playwright/test';

test.describe('Debug Habit Form Issues', () => {
  test('debug navigation and form visibility', async ({ page }) => {
    console.log('Starting debug test...');
    
    // Navigate to the application
    await page.goto('/');
    console.log('Current URL after goto /:', page.url());
    
    // Take a screenshot to see what's displayed
    await page.screenshot({ path: 'debug-home.png', fullPage: true });
    
    // Check if we're redirected to login
    if (page.url().includes('/login')) {
      console.log('Redirected to login page');
      
      // Check what login elements are available
      const emailInput = await page.locator('input[type="email"]').count();
      const passwordInput = await page.locator('input[type="password"]').count();
      console.log('Email inputs found:', emailInput);
      console.log('Password inputs found:', passwordInput);
      
      // Try to navigate directly to habits/new
      await page.goto('/habits/new');
      console.log('URL after trying /habits/new:', page.url());
      
      if (page.url().includes('/login')) {
        console.log('Still redirected to login - authentication required');
        return;
      }
    }
    
    // Try to find the habits page
    await page.goto('/habits');
    console.log('URL after /habits:', page.url());
    await page.screenshot({ path: 'debug-habits.png', fullPage: true });
    
    // Look for Add Habit button with different selectors
    const addButtons = await page.locator('button, a').allTextContents();
    console.log('All button/link texts:', addButtons.filter(text => text.includes('Add') || text.includes('Create') || text.includes('New')));
    
    // Try to navigate to habits/new directly
    await page.goto('/habits/new');
    console.log('URL after /habits/new:', page.url());
    await page.screenshot({ path: 'debug-habits-new.png', fullPage: true });
    
    // Check if form is present
    const formCount = await page.locator('form').count();
    console.log('Forms found:', formCount);
    
    const nameInputs = await page.locator('input[name="name"]').count();
    console.log('Name inputs found:', nameInputs);
    
    const allInputs = await page.locator('input').count();
    console.log('All inputs found:', allInputs);
    
    // Check for error messages or loading states
    const errorTexts = await page.locator('[class*="error"], [class*="loading"]').allTextContents();
    console.log('Error/loading messages:', errorTexts);
  });
  
  test('check app structure and routes', async ({ page }) => {
    // Test different routes to understand the app structure
    const routes = ['/', '/login', '/signup', '/?tab=overview', '/habits', '/habits/new'];
    
    for (const route of routes) {
      try {
        await page.goto(route);
        await page.waitForLoadState('domcontentloaded');
        
        console.log(`Route ${route}:`);
        console.log(`  - Final URL: ${page.url()}`);
        console.log(`  - Page title: ${await page.title()}`);
        
        const hasForm = await page.locator('form').count() > 0;
        const hasAuth = page.url().includes('/login') || page.url().includes('/signup');
        
        console.log(`  - Has form: ${hasForm}`);
        console.log(`  - Requires auth: ${hasAuth}`);
        
        await page.screenshot({ path: `debug-route-${route.replace(/\//g, '-')}.png` });
        
      } catch (error) {
        console.log(`Route ${route} failed:`, error.message);
      }
    }
  });
});