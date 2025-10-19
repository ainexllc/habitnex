import { test } from '@playwright/test';

test.describe('Authentication Performance Analysis', () => {
  test('detailed auth flow timing with console monitoring', async ({ page }) => {
    console.log('\n🔍 AUTH PERFORMANCE DEEP DIVE\n');

    // Track console messages to understand what's happening
    const consoleLogs: Array<{type: string, message: string, timestamp: number}> = [];
    const startTime = Date.now();

    page.on('console', msg => {
      const relativeTime = Date.now() - startTime;
      consoleLogs.push({
        type: msg.type(),
        message: msg.text(),
        timestamp: relativeTime
      });
    });

    // Navigate to login
    console.log('📍 Step 1: Loading login page...');
    const loginStart = Date.now();
    await page.goto('http://localhost:3001/login', { waitUntil: 'domcontentloaded' });
    const loginTime = Date.now() - loginStart;
    console.log(`   ✅ Login DOM ready: ${loginTime}ms`);

    // Wait for inputs to be ready
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 5000 });
    console.log('   ✅ Login form ready');

    // Perform authentication
    console.log('\n📍 Step 2: Authenticating...');
    console.log('   🔑 Filling credentials...');
    
    await page.fill('input[type="email"], input[name="email"]', 'dinohorn9@gmail.com');
    await page.fill('input[type="password"], input[name="password"]', 'dinohorn');
    
    console.log('   🔑 Submitting form...');
    const authSubmitTime = Date.now();
    
    // Click and start monitoring
    const navigationPromise = page.waitForURL(/workspace/, { timeout: 30000 });
    await page.click('button[type="submit"], button:has-text("Sign In")');
    
    console.log('   ⏳ Waiting for dashboard redirect...');
    await navigationPromise;
    
    const authCompleteTime = Date.now();
    const authDuration = authCompleteTime - authSubmitTime;
    console.log(`   ✅ Redirected to dashboard: ${authDuration}ms`);

    // Wait for dashboard to settle
    console.log('\n📍 Step 3: Dashboard settling...');
    const dashboardStart = Date.now();
    
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    const dashboardTime = Date.now() - dashboardStart;
    console.log(`   ✅ Dashboard network idle: ${dashboardTime}ms`);

    // Analyze console logs for performance insights
    console.log('\n📊 CONSOLE ANALYSIS DURING AUTH:');
    console.log('==================================');
    
    // Filter for relevant logs
    const authLogs = consoleLogs.filter(log => 
      log.message.includes('families') || 
      log.message.includes('profile') || 
      log.message.includes('ensurePersonalFamily') ||
      log.message.includes('checkForPersonalFamily') ||
      log.message.includes('migration') ||
      log.message.includes('Searching for families') ||
      log.message.includes('Active families in database') ||
      log.message.includes('User is member of')
    );

    authLogs.forEach(log => {
      console.log(`   [${log.timestamp}ms] ${log.type.toUpperCase()}: ${log.message}`);
    });

    // Look for performance red flags
    const familyQueries = consoleLogs.filter(log => 
      log.message.includes('Active families in database') || 
      log.message.includes('Checking') || 
      log.message.includes('families')
    );

    console.log('\n🔍 PERFORMANCE ANALYSIS:');
    console.log('========================');
    console.log(`📊 Total auth time: ${authDuration}ms`);
    console.log(`📊 Dashboard settle: ${dashboardTime}ms`);
    console.log(`📊 Family-related queries: ${familyQueries.length}`);
    
    if (authDuration > 10000) {
      console.log('\n🔴 CRITICAL: Auth taking >10 seconds!');
      console.log('   Likely causes:');
      console.log('   - Family migration queries');
      console.log('   - Personal family creation');
      console.log('   - Database permission issues');
    } else if (authDuration > 5000) {
      console.log('\n🟡 SLOW: Auth taking >5 seconds');
    } else {
      console.log('\n🟢 Auth performance acceptable');
    }

    // Check for specific bottlenecks
    const migrationLogs = consoleLogs.filter(log => log.message.includes('migration') || log.message.includes('personal family'));
    if (migrationLogs.length > 0) {
      console.log('\n📋 MIGRATION ACTIVITY DETECTED:');
      migrationLogs.forEach(log => {
        console.log(`   [${log.timestamp}ms] ${log.message}`);
      });
    }

    console.log('========================\n');
  });
});