import { test, expect } from '@playwright/test';

/**
 * Critical Issues Diagnostic Test
 * Focus on identifying the white screen issue and core functionality
 */

test.describe('Critical Issues Diagnostic', () => {
  
  test('White Screen Investigation', async ({ page }) => {
    // Track console errors and warnings
    const consoleMessages: { type: string, message: string }[] = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        message: msg.text()
      });
    });

    // Track network failures
    const networkFailures: string[] = [];
    page.on('response', response => {
      if (!response.ok()) {
        networkFailures.push(`${response.status()} - ${response.url()}`);
      }
    });

    try {
      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      // Take screenshot for analysis
      await page.screenshot({ 
        path: 'test-results/white-screen-analysis.png', 
        fullPage: true 
      });

      // Check if any content is present
      const bodyContent = await page.textContent('body');
      const hasVisibleContent = bodyContent && bodyContent.trim().length > 0;
      
      // Check for React error boundaries or error messages
      const errorElements = await page.locator('.error, [data-testid="error"], .error-boundary').count();
      
      // Check if JavaScript loaded
      const scriptsLoaded = await page.locator('script[src]').count();
      
      // Check document title
      const title = await page.title();
      
      console.log('Diagnostic Results:');
      console.log('- Title:', title);
      console.log('- Has visible content:', hasVisibleContent);
      console.log('- Error elements found:', errorElements);
      console.log('- Scripts loaded:', scriptsLoaded);
      console.log('- Console errors:', consoleMessages.filter(m => m.type === 'error').length);
      console.log('- Network failures:', networkFailures.length);
      
      // Log critical console messages
      consoleMessages
        .filter(m => m.type === 'error')
        .forEach(msg => console.log('Console Error:', msg.message));
        
      networkFailures.forEach(failure => console.log('Network Failure:', failure));
      
    } catch (error) {
      console.log('Navigation failed:', error);
      await page.screenshot({ path: 'test-results/navigation-failure.png' });
    }
  });

  test('Basic HTML Structure Check', async ({ page }) => {
    await page.goto('/');
    
    // Check for basic HTML elements
    const html = await page.locator('html').count();
    const head = await page.locator('head').count();
    const body = await page.locator('body').count();
    const rootDiv = await page.locator('#__next, #root, [data-reactroot]').count();
    
    console.log('HTML Structure:');
    console.log('- HTML element:', html > 0);
    console.log('- HEAD element:', head > 0);
    console.log('- BODY element:', body > 0);
    console.log('- React root:', rootDiv > 0);
    
    expect(html).toBeGreaterThan(0);
    expect(body).toBeGreaterThan(0);
  });

  test('Development Server Health Check', async ({ page }) => {
    // Check if the dev server is responding
    try {
      const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
      const status = response?.status() || 0;
      
      console.log('Server Response:', status);
      expect(status).toBe(200);
      
      // Check response headers
      const contentType = response?.headers()['content-type'] || '';
      console.log('Content-Type:', contentType);
      
      expect(contentType).toContain('text/html');
      
    } catch (error) {
      console.log('Server connection failed:', error);
      throw error;
    }
  });
});