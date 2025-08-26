import { test } from '@playwright/test';

test.describe('Sign Out Permission Error Fix Test', () => {
  test('verify sign out works without Firestore permission errors', async ({ page }) => {
    console.log('\n🔐 SIGN OUT PERMISSION ERROR FIX TEST\n');

    const permissionErrors: string[] = [];
    const authErrors: string[] = [];

    // Capture console errors specifically related to permissions
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        if (text.includes('permission-denied') || text.includes('insufficient permissions')) {
          permissionErrors.push(text);
          console.log(`❌ [PERMISSION ERROR] ${text.substring(0, 200)}...`);
        } else if (text.includes('auth') || text.includes('Auth') || text.includes('sign')) {
          authErrors.push(text);
          console.log(`⚠️  [AUTH ERROR] ${text.substring(0, 200)}...`);
        }
      }
    });

    try {
      console.log('📍 Step 1: Loading homepage...');
      await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });
      
      console.log('📍 Step 2: Navigating to login...');
      await page.goto('http://localhost:3001/login', { waitUntil: 'domcontentloaded' });
      
      // Wait for login form
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      console.log('📍 Step 3: Signing in...');
      await page.fill('input[type="email"]', 'dinohorn9@gmail.com');
      await page.fill('input[type="password"]', 'dinohorn');
      
      // Submit and wait for dashboard
      const navigationPromise = page.waitForURL(/dashboard/, { timeout: 20000 });
      await page.click('button[type="submit"]');
      await navigationPromise;
      
      console.log('   ✅ Successfully signed in and reached dashboard');
      
      // Wait for dashboard to fully load
      await page.waitForTimeout(3000);
      
      // Take screenshot of dashboard
      await page.screenshot({ 
        path: 'tests/screenshots/before-signout-test.png',
        fullPage: true 
      });
      
      console.log('📍 Step 4: Testing sign out...');
      
      // Reset error arrays
      permissionErrors.length = 0;
      authErrors.length = 0;
      
      // Look for sign out button
      const signOutSelectors = [
        'header button:has([data-lucide="log-out"])',
        'header button:last-child'
      ];
      
      let signOutButton = null;
      for (const selector of signOutSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          signOutButton = selector;
          console.log(`   ✅ Found sign out button: ${selector}`);
          break;
        } catch (e) {
          // Continue
        }
      }
      
      if (signOutButton) {
        console.log('   🔄 Clicking sign out...');
        
        // Click sign out and wait for redirect
        await page.click(signOutButton);
        
        // Give time for any permission errors to occur
        await page.waitForTimeout(2000);
        
        // Wait for redirect
        await page.waitForURL(/login|^http:\/\/localhost:3001\/$/, { timeout: 10000 });
        
        const finalUrl = page.url();
        console.log(`   ✅ Successfully signed out, redirected to: ${finalUrl}`);
        
        // Take final screenshot
        await page.screenshot({ 
          path: 'tests/screenshots/after-signout-test.png',
          fullPage: true 
        });
        
        // Wait a bit more to catch any delayed permission errors
        await page.waitForTimeout(3000);
        
      } else {
        console.log('   ❌ Sign out button not found');
      }
      
    } catch (error) {
      console.log(`❌ Test error: ${error.message}`);
    }

    // Analyze results
    console.log('\n📊 SIGN OUT ERROR ANALYSIS:');
    console.log('============================');
    console.log(`Permission errors: ${permissionErrors.length}`);
    console.log(`Auth-related errors: ${authErrors.length}`);
    
    if (permissionErrors.length === 0) {
      console.log('🎉 SUCCESS: No Firestore permission errors during sign out!');
      console.log('✅ The sign out permission error fix is working correctly');
    } else {
      console.log('❌ STILL FAILING: Permission errors detected:');
      permissionErrors.slice(0, 3).forEach((error, i) => {
        console.log(`   ${i + 1}. ${error.substring(0, 150)}...`);
      });
    }
    
    if (authErrors.length > 0) {
      console.log('⚠️  Other auth-related errors:');
      authErrors.slice(0, 3).forEach((error, i) => {
        console.log(`   ${i + 1}. ${error.substring(0, 150)}...`);
      });
    }
    
    console.log('============================\n');
  });
});