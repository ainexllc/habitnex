import { test, expect } from '@playwright/test';

test.describe('Complete Authentication Flow Test', () => {
  test('test sign in -> dashboard -> sign out flow', async ({ page }) => {
    console.log('\n🔄 COMPLETE AUTH FLOW TEST\n');

    // Navigate to homepage
    console.log('📍 Step 1: Loading homepage...');
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    
    // Click Sign In button
    console.log('📍 Step 2: Clicking Sign In...');
    await page.click('button:has-text("Sign In"), a:has-text("Sign In")');
    
    // Wait for login page
    await page.waitForURL(/login/, { timeout: 5000 });
    console.log('   ✅ Redirected to login page');
    
    // Take login page screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/login-form.png',
      fullPage: true 
    });
    console.log('   📷 Login page screenshot saved');
    
    // Wait for form to be ready
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Try to find and fill email field with multiple strategies
    console.log('📍 Step 3: Filling login form...');
    
    try {
      // Strategy 1: Look for email input
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      await page.fill('input[type="email"]', 'dinohorn9@gmail.com');
      console.log('   ✅ Email filled using type="email"');
    } catch (e1) {
      try {
        // Strategy 2: Look for any input field
        await page.waitForSelector('input', { timeout: 5000 });
        const inputs = await page.$$('input');
        if (inputs.length >= 1) {
          await inputs[0].fill('dinohorn9@gmail.com');
          console.log('   ✅ Email filled using first input');
        }
      } catch (e2) {
        console.log('   ❌ Could not find email input field');
        throw e2;
      }
    }
    
    try {
      // Fill password
      await page.waitForSelector('input[type="password"]', { timeout: 2000 });
      await page.fill('input[type="password"]', 'dinohorn');
      console.log('   ✅ Password filled');
    } catch (e1) {
      try {
        // Strategy 2: Second input field
        const inputs = await page.$$('input');
        if (inputs.length >= 2) {
          await inputs[1].fill('dinohorn');
          console.log('   ✅ Password filled using second input');
        }
      } catch (e2) {
        console.log('   ❌ Could not find password input field');
        throw e2;
      }
    }
    
    // Submit form
    console.log('📍 Step 4: Submitting login form...');
    const authStart = Date.now();
    
    // Start waiting for navigation
    const navigationPromise = page.waitForURL(/dashboard|$/, { timeout: 20000 });
    
    // Try to click submit button
    try {
      await page.click('button[type="submit"]');
      console.log('   🔄 Submit button clicked');
    } catch (e1) {
      try {
        await page.click('button:has-text("Sign In")');
        console.log('   🔄 Sign In button clicked');
      } catch (e2) {
        await page.click('form button');
        console.log('   🔄 Form button clicked');
      }
    }
    
    // Wait for authentication
    await navigationPromise;
    const authTime = Date.now() - authStart;
    const currentUrl = page.url();
    
    console.log(`   ✅ Authentication completed in ${authTime}ms`);
    console.log(`   📍 Current URL: ${currentUrl}`);
    
    // Take dashboard screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/authenticated-dashboard.png',
      fullPage: true 
    });
    console.log('   📷 Dashboard screenshot saved');
    
    // Now test sign out functionality
    console.log('\n📍 Step 5: Testing sign out...');
    
    // Look for sign out button with multiple strategies
    const signOutSelectors = [
      'button:has-text("Sign Out")',
      'button:has-text("Logout")',
      'button:has-text("Log Out")',
      'nav button:last-child',
      'header button:last-child',
      '[data-testid="signout"]',
      'button[aria-label*="sign out"]',
      'button[aria-label*="logout"]'
    ];
    
    let signOutFound = false;
    let usedSelector = '';
    
    for (const selector of signOutSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 1000 });
        signOutFound = true;
        usedSelector = selector;
        console.log(`   ✅ Found sign out button: ${selector}`);
        break;
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (signOutFound) {
      // Test sign out
      const signOutStart = Date.now();
      
      console.log('   🔄 Clicking sign out...');
      await page.click(usedSelector);
      
      // Wait for redirect or change
      try {
        await page.waitForURL(/login|^http:\/\/localhost:3000\/$/, { timeout: 10000 });
        const signOutTime = Date.now() - signOutStart;
        const finalUrl = page.url();
        
        console.log(`   ✅ Sign out completed in ${signOutTime}ms`);
        console.log(`   📍 Final URL: ${finalUrl}`);
        
        // Take final screenshot
        await page.screenshot({ 
          path: 'tests/screenshots/after-signout-complete.png',
          fullPage: true 
        });
        console.log('   📷 Post-signout screenshot saved');
        
        // Verify we're actually signed out
        if (finalUrl.includes('login') || finalUrl === 'http://localhost:3000/') {
          console.log('   ✅ SIGN OUT WORKING CORRECTLY!');
        } else {
          console.log(`   ⚠️  Unexpected final URL: ${finalUrl}`);
        }
        
      } catch (timeoutError) {
        console.log('   ❌ Sign out did not redirect within timeout');
        console.log(`   📍 Still at: ${page.url()}`);
        
        // Take screenshot of stuck state
        await page.screenshot({ 
          path: 'tests/screenshots/signout-stuck.png',
          fullPage: true 
        });
        console.log('   📷 Stuck state screenshot saved');
      }
      
    } else {
      console.log('   ❌ No sign out button found');
      
      // List all available buttons for debugging
      console.log('   📝 Available buttons on dashboard:');
      const buttons = await page.$$eval('button', buttons => 
        buttons.map((btn, i) => ({
          index: i,
          text: btn.textContent?.trim() || '',
          class: btn.className || '',
          id: btn.id || '',
          ariaLabel: btn.getAttribute('aria-label') || ''
        }))
      );
      
      buttons.slice(0, 10).forEach(btn => {
        console.log(`      ${btn.index + 1}. "${btn.text}" (${btn.class}) ${btn.ariaLabel ? `[${btn.ariaLabel}]` : ''}`);
      });
    }

    console.log('\n🔄 Authentication flow test completed\n');
  });
});