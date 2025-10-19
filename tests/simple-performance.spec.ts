import { test } from '@playwright/test';

test.describe('Simple Dashboard Performance Test', () => {
  test('measure page load performance', async ({ page }) => {
    console.log('\n🚀 Dashboard Performance Test Starting...\n');

    // Enable performance tracking
    await page.addInitScript(() => {
      window.addEventListener('load', () => {
        console.log('📊 Window load event fired');
      });
    });

    const overallStart = Date.now();

    // Step 1: Load login page
    console.log('📍 1. Loading login page...');
    const loginStart = Date.now();
    
    try {
      await page.goto('http://localhost:3001/login', { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      const loginTime = Date.now() - loginStart;
      console.log(`   ✅ Login page loaded: ${loginTime}ms`);
    } catch (error) {
      console.log(`   ❌ Login page failed: ${error.message}`);
      return;
    }

    // Step 2: Try authentication
    console.log('\n📍 2. Attempting authentication...');
    const authStart = Date.now();
    
    try {
      // Wait for page to be interactive
      await page.waitForLoadState('domcontentloaded');
      
      // Try multiple selectors for email field
      const emailSelector = 'input[type="email"], input[name="email"], input:first-of-type';
      await page.waitForSelector(emailSelector, { timeout: 5000 });
      await page.fill(emailSelector, 'dinohorn9@gmail.com');
      
      // Password field
      const passwordSelector = 'input[type="password"], input[name="password"], input:nth-of-type(2)';
      await page.fill(passwordSelector, 'dinohorn');
      
      // Submit button
      const submitSelector = 'button[type="submit"], button:last-of-type, form button';
      
      // Start waiting for navigation
      const dashboardNavigationStart = Date.now();
      const navigationPromise = page.waitForURL(/workspace/, { timeout: 20000 });
      
      await page.click(submitSelector);
      await navigationPromise;
      
      const authTime = Date.now() - authStart;
      console.log(`   ✅ Authentication completed: ${authTime}ms`);
      
      // Step 3: Measure dashboard loading
      console.log('\n📍 3. Analyzing dashboard loading...');
      const dashboardMeasureStart = Date.now();
      
      // Wait for basic structure
      await page.waitForSelector('main, body', { timeout: 10000 });
      const structureTime = Date.now() - dashboardMeasureStart;
      console.log(`   ✅ Basic structure: ${structureTime}ms`);
      
      // Wait for content to load
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      const networkTime = Date.now() - dashboardMeasureStart;
      console.log(`   ✅ Network idle: ${networkTime}ms`);
      
      // Get performance metrics from browser
      const perfMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
          loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
          domInteractive: Math.round(navigation.domInteractive - navigation.fetchStart),
          firstContentfulPaint: Math.round(navigation.responseEnd - navigation.fetchStart)
        };
      });
      
      console.log('\n📊 BROWSER PERFORMANCE METRICS:');
      console.log('================================');
      console.log(`🎯 DOM Content Loaded: ${perfMetrics.domContentLoaded}ms`);
      console.log(`🎯 DOM Interactive: ${perfMetrics.domInteractive}ms`);
      console.log(`🎯 First Contentful Paint: ${perfMetrics.firstContentfulPaint}ms`);
      console.log(`🎯 Load Complete: ${perfMetrics.loadComplete}ms`);
      
      const totalTime = Date.now() - overallStart;
      console.log('--------------------------------');
      console.log(`⏱️  Total test time: ${totalTime}ms`);
      console.log('================================');

      // Performance assessment
      if (networkTime > 3000) {
        console.log('\n🔴 PERFORMANCE ISSUE DETECTED:');
        console.log('   Dashboard is taking >3 seconds to become interactive');
        
        if (authTime > 1500) {
          console.log('   - Authentication is slow (>1.5s)');
        }
        if (structureTime > 1000) {
          console.log('   - Basic page structure is slow (>1s)');
        }
        if (networkTime - structureTime > 2000) {
          console.log('   - Data loading is very slow (>2s after structure)');
        }
      } else if (networkTime > 1500) {
        console.log('\n🟡 MODERATE PERFORMANCE:');
        console.log('   Dashboard loads in 1.5-3 seconds (acceptable but could be faster)');
      } else {
        console.log('\n🟢 GOOD PERFORMANCE:');
        console.log('   Dashboard loads quickly (<1.5s)');
      }
      
    } catch (error) {
      console.log(`\n❌ Authentication failed: ${error.message}`);
      console.log('This could explain slow dashboard performance - authentication issues');
    }

    console.log('\n');
  });
});