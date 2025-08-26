import { test } from '@playwright/test';

test.describe('Authentication Timing Analysis', () => {
  test('measure auth performance with personal family optimization', async ({ page }) => {
    console.log('\n🔍 AUTHENTICATION TIMING TEST\n');
    console.log('Testing impact of checkForPersonalFamily optimization\n');

    // Track console messages for family-related logs
    const consoleLogs: Array<{type: string, message: string, timestamp: number}> = [];
    const startTime = Date.now();

    page.on('console', msg => {
      const relativeTime = Date.now() - startTime;
      const message = msg.text();
      
      // Log all console messages for analysis
      consoleLogs.push({
        type: msg.type(),
        message,
        timestamp: relativeTime
      });
      
      // Real-time logging of family-related activities
      if (message.includes('families') || 
          message.includes('personal family') || 
          message.includes('ensurePersonalFamily') ||
          message.includes('checkForPersonalFamily') ||
          message.includes('Found') ||
          message.includes('🔍')) {
        console.log(`   [${relativeTime}ms] ${msg.type().toUpperCase()}: ${message}`);
      }
    });

    // Navigate to login
    console.log('📍 Step 1: Loading login page...');
    const loginStart = Date.now();
    
    try {
      await page.goto('http://localhost:3001/login', { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      const loginTime = Date.now() - loginStart;
      console.log(`   ✅ Login page DOM ready: ${loginTime}ms`);
      
      // Wait a moment for the page to fully render
      await page.waitForTimeout(1000);
      
      // Take a screenshot to see what's actually on the page
      await page.screenshot({ 
        path: 'tests/screenshots/login-page.png',
        fullPage: true 
      });
      console.log('   📷 Login page screenshot saved');
      
    } catch (error) {
      console.log(`   ❌ Failed to load login page: ${error.message}`);
      return;
    }

    // Manual login simulation - we'll track timing through console logs
    console.log('\n📍 Step 2: Monitoring authentication process...');
    console.log('   (Open http://localhost:3001/login manually and sign in)');
    console.log('   (This test will monitor console output for performance analysis)');
    
    // Wait for authentication-related console activity
    console.log('\n📊 MONITORING CONSOLE ACTIVITY...');
    console.log('=====================================');
    
    // Monitor for 30 seconds to catch any auth activity
    const monitorStart = Date.now();
    const monitorTimeout = 30000; // 30 seconds
    
    while (Date.now() - monitorStart < monitorTimeout) {
      await page.waitForTimeout(1000);
      
      // Check if any authentication activity has started
      const authLogs = consoleLogs.filter(log => 
        log.message.includes('ensurePersonalFamily') ||
        log.message.includes('personal family') ||
        log.message.includes('Found') ||
        log.message.includes('families')
      );
      
      if (authLogs.length > 0) {
        console.log(`\n🎯 Authentication activity detected after ${Date.now() - monitorStart}ms`);
        break;
      }
    }

    // Analyze all console logs for performance insights
    console.log('\n📈 CONSOLE LOG ANALYSIS:');
    console.log('========================');
    
    const familyLogs = consoleLogs.filter(log => 
      log.message.includes('families') || 
      log.message.includes('personal family') ||
      log.message.includes('Found') ||
      log.message.includes('checking') ||
      log.message.toLowerCase().includes('family')
    );

    if (familyLogs.length > 0) {
      console.log(`📊 Family-related log entries: ${familyLogs.length}`);
      familyLogs.forEach(log => {
        console.log(`   [${log.timestamp}ms] ${log.type}: ${log.message}`);
      });
    } else {
      console.log('📊 No family-related console activity detected');
      console.log('   This could mean:');
      console.log('   - No authentication occurred during monitoring');
      console.log('   - Console logging is disabled');
      console.log('   - The optimization eliminated verbose logging');
    }
    
    // Show all console logs for debugging
    if (consoleLogs.length > 0) {
      console.log('\n🔍 ALL CONSOLE ACTIVITY:');
      console.log('=========================');
      consoleLogs.slice(0, 20).forEach(log => { // Limit to first 20 entries
        console.log(`   [${log.timestamp}ms] ${log.type}: ${log.message}`);
      });
      if (consoleLogs.length > 20) {
        console.log(`   ... (${consoleLogs.length - 20} more entries)`);
      }
    }

    console.log('\n✅ Console monitoring complete');
    console.log('=====================================\n');
  });
});