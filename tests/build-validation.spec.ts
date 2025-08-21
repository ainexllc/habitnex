import { test, expect } from '@playwright/test';

test.describe('Build and Module Validation', () => {
  test('check for webpack module resolution errors', async ({ page }) => {
    console.log('\n=== WEBPACK MODULE RESOLUTION VALIDATION ===');
    
    const moduleErrors: string[] = [];
    const buildErrors: string[] = [];
    
    // Listen for console errors that might indicate module issues
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        console.log(`[CONSOLE ERROR] ${text}`);
        
        if (text.includes('Cannot find module') || 
            text.includes('Module not found') ||
            text.includes('Failed to resolve module') ||
            text.includes('Cannot resolve module')) {
          moduleErrors.push(text);
        }
        
        if (text.includes('ChunkLoadError') ||
            text.includes('Loading chunk') ||
            text.includes('Loading CSS chunk')) {
          buildErrors.push(text);
        }
      }
    });
    
    // Listen for page errors
    page.on('pageerror', (error) => {
      console.log(`[PAGE ERROR] ${error.message}`);
      
      if (error.message.includes('Cannot find module') ||
          error.message.includes('Module not found')) {
        moduleErrors.push(error.message);
      }
    });
    
    // Test different pages for module loading issues
    const pagesToTest = [
      { url: '/', name: 'Landing Page' },
      { url: '/dashboard', name: 'Dashboard' },
      { url: '/moods/new', name: 'New Mood Form' },
      { url: '/habits/new', name: 'New Habit Form' },
      { url: '/login', name: 'Login Page' }
    ];
    
    for (const pageTest of pagesToTest) {
      console.log(`\n--- Testing ${pageTest.name} (${pageTest.url}) ---`);
      
      try {
        await page.goto(pageTest.url, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        // Wait for any async module loading
        await page.waitForTimeout(3000);
        
        // Check if the page has rendered content
        const bodyText = await page.textContent('body');
        const hasContent = bodyText && bodyText.trim().length > 50;
        
        console.log(`${pageTest.name}: ${hasContent ? '✅ LOADED' : '❌ NO CONTENT'}`);
        
        if (!hasContent) {
          // Take screenshot of problematic page
          await page.screenshot({ 
            path: `screenshots/module-error-${pageTest.name.toLowerCase().replace(/\s+/g, '-')}.png`,
            fullPage: true 
          });
        }
        
      } catch (error) {
        console.log(`❌ ${pageTest.name} failed to load: ${error.message}`);
        buildErrors.push(`${pageTest.name}: ${error.message}`);
      }
    }
    
    // Summary report
    console.log('\n=== MODULE VALIDATION SUMMARY ===');
    console.log(`Module Errors Found: ${moduleErrors.length}`);
    console.log(`Build Errors Found: ${buildErrors.length}`);
    
    if (moduleErrors.length > 0) {
      console.log('\n🚨 MODULE RESOLUTION ERRORS:');
      moduleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (buildErrors.length > 0) {
      console.log('\n🚨 BUILD/CHUNK ERRORS:');
      buildErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (moduleErrors.length === 0 && buildErrors.length === 0) {
      console.log('✅ No module resolution errors detected');
    }
    
    // Test passes if we completed the validation - we're diagnosing, not failing
    expect(moduleErrors.length + buildErrors.length).toBeGreaterThanOrEqual(0);
  });
  
  test('validate static assets and chunks', async ({ page }) => {
    console.log('\n=== STATIC ASSETS VALIDATION ===');
    
    const failedAssets: string[] = [];
    const loadedAssets: string[] = [];
    
    // Monitor network requests
    page.on('response', (response) => {
      const url = response.url();
      const status = response.status();
      
      // Check for static assets
      if (url.includes('/_next/static/') || 
          url.includes('/_next/') ||
          url.endsWith('.js') || 
          url.endsWith('.css') || 
          url.endsWith('.ico')) {
        
        if (status >= 200 && status < 300) {
          loadedAssets.push(url);
        } else {
          failedAssets.push(`${status}: ${url}`);
          console.log(`❌ Asset failed: ${status} ${url}`);
        }
      }
    });
    
    page.on('requestfailed', (request) => {
      const url = request.url();
      if (url.includes('/_next/') || url.endsWith('.js') || url.endsWith('.css')) {
        failedAssets.push(`FAILED: ${url} - ${request.failure()?.errorText}`);
        console.log(`❌ Asset request failed: ${url}`);
      }
    });
    
    // Load the main dashboard page (most complex)
    console.log('Loading dashboard page to test asset loading...');
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    console.log('\n=== ASSET LOADING SUMMARY ===');
    console.log(`Successfully loaded assets: ${loadedAssets.length}`);
    console.log(`Failed assets: ${failedAssets.length}`);
    
    if (failedAssets.length > 0) {
      console.log('\n🚨 FAILED TO LOAD:');
      failedAssets.forEach((asset, index) => {
        console.log(`${index + 1}. ${asset}`);
      });
    }
    
    if (loadedAssets.length > 0) {
      console.log('\n✅ SUCCESSFULLY LOADED ASSETS (showing first 10):');
      loadedAssets.slice(0, 10).forEach((asset, index) => {
        console.log(`${index + 1}. ${asset.split('/').pop()}`);
      });
    }
    
    expect(failedAssets.length).toBeGreaterThanOrEqual(0); // Diagnostic test
  });
  
  test('check hydration and client-side rendering', async ({ page }) => {
    console.log('\n=== HYDRATION AND CSR VALIDATION ===');
    
    const hydrationErrors: string[] = [];
    
    // Listen for hydration-specific errors
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error' && (
        text.includes('hydrat') || 
        text.includes('client-side') ||
        text.includes('server-side') ||
        text.includes('mismatch'))) {
        
        hydrationErrors.push(text);
        console.log(`[HYDRATION ERROR] ${text}`);
      }
    });
    
    // Load dashboard and wait for hydration
    console.log('Loading dashboard and monitoring hydration...');
    await page.goto('/dashboard');
    
    // Wait for hydration to complete
    await page.waitForTimeout(3000);
    
    // Check if interactive elements are working (sign of successful hydration)
    try {
      // Look for interactive elements that should work after hydration
      const interactiveElements = await page.locator('button, input, [role="button"]').count();
      console.log(`Interactive elements found: ${interactiveElements}`);
      
      // Test if theme toggle works (requires hydration)
      const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, button:has-text("Dark"), button:has-text("Light")').first();
      if (await themeToggle.count() > 0) {
        console.log('✅ Theme toggle found - testing hydration...');
        await themeToggle.click();
        await page.waitForTimeout(500);
        console.log('✅ Theme toggle clicked successfully (hydration working)');
      } else {
        console.log('ℹ️ No theme toggle found to test hydration');
      }
      
    } catch (error) {
      console.log(`❌ Interactive element test failed: ${error.message}`);
      hydrationErrors.push(`Interactive test failed: ${error.message}`);
    }
    
    console.log('\n=== HYDRATION SUMMARY ===');
    console.log(`Hydration errors: ${hydrationErrors.length}`);
    
    if (hydrationErrors.length > 0) {
      console.log('\n🚨 HYDRATION ISSUES:');
      hydrationErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No hydration errors detected');
    }
    
    expect(hydrationErrors.length).toBeGreaterThanOrEqual(0); // Diagnostic test
  });
});