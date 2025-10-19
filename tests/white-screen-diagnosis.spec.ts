import { test, expect, Page, ConsoleMessage } from '@playwright/test';

interface ErrorLog {
  type: string;
  text: string;
  timestamp: Date;
  url?: string;
}

interface TestResults {
  url: string;
  status: 'success' | 'white-screen' | 'error';
  errors: ErrorLog[];
  hasContent: boolean;
  screenshots: string[];
  networkFailures: string[];
}

test.describe('White Screen Diagnosis', () => {
  let errorLogs: ErrorLog[] = [];
  let networkFailures: string[] = [];
  
  test.beforeEach(async ({ page }) => {
    // Clear previous logs
    errorLogs = [];
    networkFailures = [];
    
    // Listen for console messages
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        errorLogs.push({
          type: msg.type(),
          text: msg.text(),
          timestamp: new Date(),
          url: msg.location()?.url
        });
        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });
    
    // Listen for page errors
    page.on('pageerror', (error) => {
      errorLogs.push({
        type: 'page-error',
        text: error.message,
        timestamp: new Date()
      });
      console.log(`[PAGE ERROR] ${error.message}`);
    });
    
    // Listen for network failures
    page.on('response', (response) => {
      if (!response.ok()) {
        const failure = `${response.status()} ${response.url()}`;
        networkFailures.push(failure);
        console.log(`[NETWORK FAILURE] ${failure}`);
      }
    });
    
    // Listen for request failures
    page.on('requestfailed', (request) => {
      const failure = `Failed to load: ${request.url()} - ${request.failure()?.errorText}`;
      networkFailures.push(failure);
      console.log(`[REQUEST FAILED] ${failure}`);
    });
  });
  
  async function diagnosePage(page: Page, url: string, testName: string): Promise<TestResults> {
    console.log(`\n=== Testing ${testName} ===`);
    console.log(`URL: ${url}`);
    
    const result: TestResults = {
      url,
      status: 'success',
      errors: [],
      hasContent: false,
      screenshots: [],
      networkFailures: [],
    };
    
    try {
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Wait a bit for any dynamic content
      await page.waitForTimeout(2000);
      
      // Take initial screenshot
      const initialScreenshot = `screenshots/${testName}-initial.png`;
      await page.screenshot({ path: initialScreenshot, fullPage: true });
      result.screenshots.push(initialScreenshot);
      console.log(`Screenshot saved: ${initialScreenshot}`);
      
      // Check if page has meaningful content
      const bodyText = await page.textContent('body');
      result.hasContent = bodyText !== null && bodyText.trim().length > 0;
      
      // Check for white screen indicators
      const body = await page.locator('body');
      const backgroundColor = await body.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.backgroundColor;
      });
      
      const hasVisibleContent = await page.locator('body *:visible').count() > 0;
      
      if (!hasVisibleContent || (!bodyText || bodyText.trim().length < 50)) {
        result.status = 'white-screen';
        console.log('❌ White screen detected - no visible content');
      } else {
        result.status = 'success';
        console.log('✅ Page loaded successfully with content');
      }
      
      console.log(`Content length: ${bodyText?.length || 0} characters`);
      console.log(`Background color: ${backgroundColor}`);
      console.log(`Visible elements count: ${await page.locator('body *:visible').count()}`);
      
    } catch (error) {
      result.status = 'error';
      errorLogs.push({
        type: 'navigation-error',
        text: error.message,
        timestamp: new Date()
      });
      console.log(`❌ Navigation error: ${error.message}`);
      
      // Still try to take a screenshot of the error state
      try {
        const errorScreenshot = `screenshots/${testName}-error.png`;
        await page.screenshot({ path: errorScreenshot, fullPage: true });
        result.screenshots.push(errorScreenshot);
      } catch (screenshotError) {
        console.log(`Could not take error screenshot: ${screenshotError.message}`);
      }
    }
    
    // Copy current errors to result
    result.errors = [...errorLogs];
    result.networkFailures = [...networkFailures];
    
    return result;
  }

  async function testPageRefresh(page: Page, url: string, testName: string) {
    console.log(`\n=== Testing ${testName} - Page Refresh Behavior ===`);
    
    // First, navigate normally
    console.log('1. Initial navigation...');
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const beforeRefreshScreenshot = `screenshots/${testName}-before-refresh.png`;
    await page.screenshot({ path: beforeRefreshScreenshot, fullPage: true });
    
    // Check if page loaded properly initially
    const initialBodyText = await page.textContent('body');
    const initialHasContent = initialBodyText !== null && initialBodyText.trim().length > 50;
    
    console.log(`Initial load: ${initialHasContent ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Initial content length: ${initialBodyText?.length || 0}`);
    
    // Clear error logs before refresh
    errorLogs = [];
    networkFailures = [];
    
    // Now refresh the page
    console.log('2. Refreshing page...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Give time for any async loading
    
    const afterRefreshScreenshot = `screenshots/${testName}-after-refresh.png`;
    await page.screenshot({ path: afterRefreshScreenshot, fullPage: true });
    
    // Check if page still has content after refresh
    const refreshBodyText = await page.textContent('body');
    const refreshHasContent = refreshBodyText !== null && refreshBodyText.trim().length > 50;
    
    console.log(`After refresh: ${refreshHasContent ? 'SUCCESS' : 'WHITE SCREEN'}`);
    console.log(`After refresh content length: ${refreshBodyText?.length || 0}`);
    
    // Compare before and after
    if (initialHasContent && !refreshHasContent) {
      console.log('🚨 CRITICAL: Page works initially but shows white screen after refresh!');
    } else if (!initialHasContent && !refreshHasContent) {
      console.log('🚨 CRITICAL: Page shows white screen both initially and after refresh!');
    } else if (initialHasContent && refreshHasContent) {
      console.log('✅ Page works both initially and after refresh');
    } else {
      console.log('🤔 Unexpected state: Page failed initially but works after refresh');
    }
    
    return {
      initialSuccess: initialHasContent,
      refreshSuccess: refreshHasContent,
      beforeScreenshot: beforeRefreshScreenshot,
      afterScreenshot: afterRefreshScreenshot,
      errors: [...errorLogs],
      networkFailures: [...networkFailures]
    };
  }

  test('diagnose landing page', async ({ page }) => {
    const result = await diagnosePage(page, '/', 'landing-page');
    
    // Log all findings
    console.log('\n=== LANDING PAGE DIAGNOSIS SUMMARY ===');
    console.log(`Status: ${result.status}`);
    console.log(`Has Content: ${result.hasContent}`);
    console.log(`Errors: ${result.errors.length}`);
    console.log(`Network Failures: ${result.networkFailures.length}`);
    
    if (result.errors.length > 0) {
      console.log('\nERRORS DETECTED:');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.text}`);
      });
    }
    
    if (result.networkFailures.length > 0) {
      console.log('\nNETWORK FAILURES:');
      result.networkFailures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure}`);
      });
    }
    
    // The test passes if we get any result - we're diagnosing, not asserting success
    expect(result).toBeDefined();
  });

  test('diagnose dashboard page', async ({ page }) => {
    const result = await diagnosePage(page, '/workspace', 'dashboard-page');
    
    console.log('\n=== DASHBOARD PAGE DIAGNOSIS SUMMARY ===');
    console.log(`Status: ${result.status}`);
    console.log(`Has Content: ${result.hasContent}`);
    console.log(`Errors: ${result.errors.length}`);
    console.log(`Network Failures: ${result.networkFailures.length}`);
    
    if (result.errors.length > 0) {
      console.log('\nERRORS DETECTED:');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.text}`);
      });
    }
    
    expect(result).toBeDefined();
  });

  test('diagnose dashboard page refresh behavior', async ({ page }) => {
    const result = await testPageRefresh(page, '/workspace', 'dashboard-refresh');
    
    console.log('\n=== DASHBOARD REFRESH DIAGNOSIS SUMMARY ===');
    console.log(`Initial Load Success: ${result.initialSuccess}`);
    console.log(`Refresh Success: ${result.refreshSuccess}`);
    console.log(`Errors: ${result.errors.length}`);
    console.log(`Network Failures: ${result.networkFailures.length}`);
    
    if (result.errors.length > 0) {
      console.log('\nERRORS DURING REFRESH:');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.text}`);
      });
    }
    
    if (result.networkFailures.length > 0) {
      console.log('\nNETWORK FAILURES DURING REFRESH:');
      result.networkFailures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure}`);
      });
    }
    
    expect(result).toBeDefined();
  });

  test('diagnose moods/new page', async ({ page }) => {
    const result = await diagnosePage(page, '/moods/new', 'moods-new-page');
    
    console.log('\n=== MOODS/NEW PAGE DIAGNOSIS SUMMARY ===');
    console.log(`Status: ${result.status}`);
    console.log(`Has Content: ${result.hasContent}`);
    console.log(`Errors: ${result.errors.length}`);
    console.log(`Network Failures: ${result.networkFailures.length}`);
    
    expect(result).toBeDefined();
  });

  test('diagnose moods/new page refresh behavior', async ({ page }) => {
    const result = await testPageRefresh(page, '/moods/new', 'moods-new-refresh');
    
    console.log('\n=== MOODS/NEW REFRESH DIAGNOSIS SUMMARY ===');
    console.log(`Initial Load Success: ${result.initialSuccess}`);
    console.log(`Refresh Success: ${result.refreshSuccess}`);
    console.log(`Errors: ${result.errors.length}`);
    
    expect(result).toBeDefined();
  });

  test('test authentication redirect flow', async ({ page }) => {
    console.log('\n=== TESTING AUTHENTICATION REDIRECT FLOW ===');
    
    // Try to access protected page directly
    console.log('1. Accessing protected /workspace page without authentication...');
    await page.goto('/workspace');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`Current URL after redirect attempt: ${currentUrl}`);
    
    // Check if redirected to login
    if (currentUrl.includes('/login')) {
      console.log('✅ Correctly redirected to login page');
    } else if (currentUrl.includes('/workspace')) {
      console.log('🤔 Stayed on dashboard - might be already authenticated or auth check failed');
    } else {
      console.log(`🚨 Unexpected redirect to: ${currentUrl}`);
    }
    
    // Take screenshot of final state
    await page.screenshot({ path: 'screenshots/auth-redirect-flow.png', fullPage: true });
    
    const bodyText = await page.textContent('body');
    const hasContent = bodyText !== null && bodyText.trim().length > 50;
    
    console.log(`Page has content: ${hasContent}`);
    console.log(`Content preview: ${bodyText?.substring(0, 100)}...`);
    
    if (errorLogs.length > 0) {
      console.log('\nERRORS DURING AUTH FLOW:');
      errorLogs.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.text}`);
      });
    }
    
    expect(currentUrl).toBeDefined();
  });
});