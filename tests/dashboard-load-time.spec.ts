import { test, expect } from '@playwright/test';

test.describe('Dashboard Load Time Analysis', () => {
  test('measure precise dashboard performance metrics', async ({ page }) => {
    console.log('\n🚀 Starting detailed performance analysis...');

    // Start timing
    const overallStart = performance.now();

    // Step 1: Login page load
    console.log('📍 Loading login page...');
    const loginStart = performance.now();
    await page.goto('http://localhost:3001/login', { waitUntil: 'load' });
    const loginEnd = performance.now();
    console.log(`✅ Login page: ${Math.round(loginEnd - loginStart)}ms`);

    // Wait a bit for full page readiness
    await page.waitForTimeout(1000);

    // Check if email field is present
    const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    await expect(emailField).toBeVisible({ timeout: 5000 });

    // Step 2: Authentication
    console.log('📍 Performing authentication...');
    const authStart = performance.now();
    
    await emailField.fill('dinohorn9@gmail.com');
    
    const passwordField = page.locator('input[type="password"], input[name="password"]');
    await passwordField.fill('dinohorn');

    const submitButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    
    // Start navigation wait before clicking
    const navigationPromise = page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await submitButton.click();
    await navigationPromise;
    
    const authEnd = performance.now();
    console.log(`✅ Authentication + redirect: ${Math.round(authEnd - authStart)}ms`);

    // Step 3: Dashboard loading phases
    console.log('📍 Measuring dashboard loading phases...');
    const dashboardStart = performance.now();

    // Wait for main content
    await page.waitForSelector('main', { timeout: 10000 });
    const mainLoadTime = performance.now();
    console.log(`✅ Main element: ${Math.round(mainLoadTime - dashboardStart)}ms`);

    // Wait for Dashboard heading
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 10000 });
    const headingLoadTime = performance.now();
    console.log(`✅ Dashboard heading: ${Math.round(headingLoadTime - dashboardStart)}ms`);

    // Wait for all network activity to settle
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    const networkIdleTime = performance.now();
    console.log(`✅ Network idle: ${Math.round(networkIdleTime - dashboardStart)}ms`);

    // Final timing
    const dashboardEnd = performance.now();
    const overallEnd = performance.now();

    console.log('\n📊 FINAL PERFORMANCE METRICS:');
    console.log('================================');
    console.log(`🔍 Login page load: ${Math.round(loginEnd - loginStart)}ms`);
    console.log(`🔐 Authentication flow: ${Math.round(authEnd - authStart)}ms`);
    console.log(`📄 Dashboard load: ${Math.round(dashboardEnd - dashboardStart)}ms`);
    console.log('--------------------------------');
    console.log(`⏱️  Total time: ${Math.round(overallEnd - overallStart)}ms`);
    console.log('================================');

    // Performance assessment
    const totalDashboardTime = Math.round(dashboardEnd - dashboardStart);
    if (totalDashboardTime > 3000) {
      console.log('🔴 SLOW: Dashboard taking >3 seconds');
    } else if (totalDashboardTime > 1500) {
      console.log('🟡 MODERATE: Dashboard taking 1.5-3 seconds');
    } else {
      console.log('🟢 FAST: Dashboard loading in <1.5 seconds');
    }

    // Take final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/dashboard-final.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved to tests/screenshots/dashboard-final.png\n');
  });

  test('measure individual component load times', async ({ page }) => {
    console.log('\n🔍 Testing individual component performance...');

    // Skip authentication, go directly to dashboard if possible
    // For now, authenticate quickly
    await page.goto('http://localhost:3001/login');
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 5000 });
    
    await page.fill('input[type="email"], input[name="email"]', 'dinohorn9@gmail.com');
    await page.fill('input[type="password"], input[name="password"]', 'dinohorn');
    await page.click('button[type="submit"], button:has-text("Sign In")');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Now measure individual elements
    console.log('📍 Measuring individual component load times...');

    const componentTimings = [];

    // Test habit section load
    const habitStart = performance.now();
    try {
      await page.waitForSelector('[data-testid="habits-section"], .habits, section:has-text("habit")', { timeout: 5000 });
      const habitEnd = performance.now();
      componentTimings.push({ component: 'Habits Section', time: Math.round(habitEnd - habitStart) });
    } catch (e) {
      componentTimings.push({ component: 'Habits Section', time: 'Not found' });
    }

    // Test mood section load
    const moodStart = performance.now();
    try {
      await page.waitForSelector('[data-testid="mood-bar"], .mood, section:has-text("mood")', { timeout: 5000 });
      const moodEnd = performance.now();
      componentTimings.push({ component: 'Mood Section', time: Math.round(moodEnd - moodStart) });
    } catch (e) {
      componentTimings.push({ component: 'Mood Section', time: 'Not found' });
    }

    // Test any cards or grid layout
    const cardStart = performance.now();
    try {
      await page.waitForSelector('.grid, .card, [class*="grid"]', { timeout: 5000 });
      const cardEnd = performance.now();
      componentTimings.push({ component: 'Cards/Grid', time: Math.round(cardEnd - cardStart) });
    } catch (e) {
      componentTimings.push({ component: 'Cards/Grid', time: 'Not found' });
    }

    console.log('\n📊 COMPONENT LOAD TIMES:');
    console.log('========================');
    componentTimings.forEach(({ component, time }) => {
      console.log(`${component}: ${time}${typeof time === 'number' ? 'ms' : ''}`);
    });
    console.log('========================\n');
  });
});