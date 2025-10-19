import { test } from '@playwright/test';

test.describe('Sign Out Functionality Test', () => {
  test('diagnose sign out behavior', async ({ page }) => {
    console.log('\n🔍 SIGN OUT FUNCTIONALITY TEST\n');

    // Track console messages for auth-related logs
    const consoleLogs: Array<{type: string, message: string, timestamp: number}> = [];
    const startTime = Date.now();

    page.on('console', msg => {
      const relativeTime = Date.now() - startTime;
      const message = msg.text();
      consoleLogs.push({
        type: msg.type(),
        message,
        timestamp: relativeTime
      });
      
      // Real-time logging of auth-related activities
      if (message.includes('auth') || 
          message.includes('sign') || 
          message.includes('logout') ||
          message.includes('user') ||
          message.includes('signOut') ||
          message.toLowerCase().includes('error')) {
        console.log(`   [${relativeTime}ms] ${msg.type().toUpperCase()}: ${message}`);
      }
    });

    try {
      // Navigate to homepage first to see current state
      console.log('📍 Step 1: Loading homepage...');
      await page.goto('http://localhost:3000/', { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      // Check current authentication state
      const currentUrl = page.url();
      console.log(`   ✅ Current URL: ${currentUrl}`);
      
      // Take screenshot to see current state
      await page.screenshot({ 
        path: 'tests/screenshots/homepage-state.png',
        fullPage: true 
      });
      console.log('   📷 Homepage screenshot saved');
      
      // Look for sign out button or authentication indicators
      console.log('\n📍 Step 2: Checking authentication state...');
      
      // Check if we're on login page or dashboard
      if (currentUrl.includes('login')) {
        console.log('   📝 Currently on login page - user is signed out');
        
        // Try to navigate to dashboard to see what happens
        await page.goto('http://localhost:3000/workspace', { 
          waitUntil: 'domcontentloaded',
          timeout: 5000 
        });
        
        const redirectedUrl = page.url();
        console.log(`   ➡️  Attempted dashboard, redirected to: ${redirectedUrl}`);
        
      } else if (currentUrl.includes('dashboard')) {
        console.log('   ✅ Currently on dashboard - user is signed in');
        
        // Look for sign out button
        console.log('\n📍 Step 3: Looking for sign out functionality...');
        
        // Take screenshot of dashboard
        await page.screenshot({ 
          path: 'tests/screenshots/workspace-state.png',
          fullPage: true 
        });
        console.log('   📷 Dashboard screenshot saved');
        
        // Look for common sign out elements
        const signOutSelectors = [
          'button:has-text("Sign Out")',
          'button:has-text("Logout")',
          'button:has-text("Log Out")',
          '[data-testid="signout"]',
          '[data-testid="logout"]',
          'nav button:last-child',
          'header button:last-child'
        ];
        
        let signOutButton = null;
        for (const selector of signOutSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 1000 });
            signOutButton = selector;
            console.log(`   ✅ Found sign out button: ${selector}`);
            break;
          } catch (e) {
            // Continue to next selector
          }
        }
        
        if (signOutButton) {
          console.log('\n📍 Step 4: Testing sign out...');
          
          // Click sign out button
          const clickStart = Date.now();
          await page.click(signOutButton);
          console.log('   🔄 Clicked sign out button...');
          
          // Wait for redirect or state change
          try {
            await page.waitForURL(/login|$/, { timeout: 5000 });
            const clickTime = Date.now() - clickStart;
            const finalUrl = page.url();
            console.log(`   ✅ Sign out completed in ${clickTime}ms`);
            console.log(`   ➡️  Final URL: ${finalUrl}`);
            
            // Take final screenshot
            await page.screenshot({ 
              path: 'tests/screenshots/after-signout.png',
              fullPage: true 
            });
            console.log('   📷 After sign-out screenshot saved');
            
          } catch (e) {
            console.log(`   ⚠️  No redirect detected after sign out attempt`);
            console.log(`   📍 Current URL: ${page.url()}`);
            
            // Take screenshot to see what happened
            await page.screenshot({ 
              path: 'tests/screenshots/signout-failed.png',
              fullPage: true 
            });
            console.log('   📷 Sign-out failure screenshot saved');
          }
          
        } else {
          console.log('   ❌ No sign out button found on dashboard');
          console.log('   Available buttons/links on page:');
          
          // List all buttons and links
          const buttons = await page.$$eval('button', buttons => 
            buttons.map(btn => ({
              text: btn.textContent?.trim() || '',
              class: btn.className || '',
              id: btn.id || ''
            }))
          );
          
          const links = await page.$$eval('a', links => 
            links.map(link => ({
              text: link.textContent?.trim() || '',
              href: link.href || '',
              class: link.className || ''
            }))
          );
          
          console.log('   📝 Buttons found:');
          buttons.slice(0, 10).forEach((btn, i) => {
            console.log(`      ${i + 1}. "${btn.text}" (class: ${btn.class})`);
          });
          
          console.log('   📝 Links found:');
          links.slice(0, 10).forEach((link, i) => {
            console.log(`      ${i + 1}. "${link.text}" -> ${link.href}`);
          });
        }
        
      } else {
        console.log(`   ⚠️  Unknown state - URL: ${currentUrl}`);
      }
      
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
      
      // Emergency screenshot
      try {
        await page.screenshot({ 
          path: 'tests/screenshots/error-state.png',
          fullPage: true 
        });
        console.log('   📷 Error state screenshot saved');
      } catch (e) {
        // Screenshot failed too
      }
    }

    // Analyze console logs
    console.log('\n📊 CONSOLE ANALYSIS:');
    console.log('====================');
    
    const authLogs = consoleLogs.filter(log => 
      log.message.toLowerCase().includes('auth') ||
      log.message.toLowerCase().includes('sign') ||
      log.message.toLowerCase().includes('user') ||
      log.message.toLowerCase().includes('error')
    );

    if (authLogs.length > 0) {
      console.log(`📊 Auth-related log entries: ${authLogs.length}`);
      authLogs.slice(0, 10).forEach(log => {
        console.log(`   [${log.timestamp}ms] ${log.type}: ${log.message}`);
      });
      if (authLogs.length > 10) {
        console.log(`   ... (${authLogs.length - 10} more entries)`);
      }
    } else {
      console.log('📊 No auth-related console activity detected');
    }

    console.log('====================\n');
  });
});