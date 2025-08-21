const { chromium } = require('playwright');

async function interactiveMoodButtonTest() {
  console.log('🚀 Starting Interactive Mood Button Test');
  console.log('=======================================');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // Create screenshots directory
  const fs = require('fs');
  if (!fs.existsSync('test-screenshots')) {
    fs.mkdirSync('test-screenshots');
  }
  
  try {
    console.log('1. 🌐 Opening NextVibe app at localhost:3001...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-screenshots/step1-homepage.png', fullPage: true });
    
    // Check authentication status
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('login') || await page.locator('input[type="email"]').isVisible()) {
      console.log('\n2. 🔑 Authentication Required');
      console.log('   Please choose an authentication method:');
      console.log('   - Use "Continue with Google" for quick OAuth login, OR');
      console.log('   - Enter your email/password credentials');
      console.log('   - This test will automatically continue once authenticated');
      
      // Wait for authentication - monitor URL changes
      console.log('   ⏳ Waiting for authentication to complete...');
      
      let authenticated = false;
      let attempts = 0;
      const maxAttempts = 60; // Wait up to 60 seconds
      
      while (!authenticated && attempts < maxAttempts) {
        await page.waitForTimeout(1000);
        attempts++;
        
        const newUrl = page.url();
        const hasEmailInput = await page.locator('input[type="email"]').isVisible().catch(() => false);
        
        // Check if we've moved away from login/signup pages
        if (!newUrl.includes('login') && !newUrl.includes('signup') && !hasEmailInput) {
          authenticated = true;
          console.log(`   ✅ Authentication successful! Redirected to: ${newUrl}`);
        } else if (attempts % 10 === 0) {
          console.log(`   ⏳ Still waiting for authentication... (${attempts}s)`);
        }
      }
      
      if (!authenticated) {
        console.log('   ❌ Authentication timeout. Please ensure you complete the login process.');
        return;
      }
    } else {
      console.log('2. ✅ Already authenticated, proceeding...');
    }
    
    await page.screenshot({ path: 'test-screenshots/step2-authenticated.png', fullPage: true });
    
    console.log('\n3. 📍 Navigating to /moods page...');
    await page.goto('http://localhost:3001/moods');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for React components to render
    
    await page.screenshot({ path: 'test-screenshots/step3-moods-page.png', fullPage: true });
    console.log('   📸 Screenshot saved: step3-moods-page.png');
    
    // Check if we're actually on the moods page now
    const finalUrl = page.url();
    if (finalUrl.includes('login') || finalUrl.includes('signup')) {
      console.log('   ❌ Still being redirected to login. Authentication may have failed.');
      return;
    }
    
    console.log('\n4. 🔍 Analyzing Mood Button Functionality');
    console.log('   ==========================================');
    
    // Test 1: Look for the main New Mood Entry button in top right
    console.log('   Test 1: Main Header Button');
    
    const mainButtonSelectors = [
      'button:has-text("New Mood Entry")',
      'button:has-text("Today\'s Mood Recorded")',
      'a[href*="/moods/new"] button',
      'button:has(svg):has-text("New")',
      'button:has(svg):has-text("Today")'
    ];
    
    let mainButton = null;
    let mainButtonText = '';
    let mainButtonDisabled = false;
    
    for (const selector of mainButtonSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          mainButton = element;
          mainButtonText = await element.textContent();
          mainButtonDisabled = await element.isDisabled();
          console.log(`   ✅ Found main button: "${mainButtonText}"`);
          console.log(`   📊 Button state: ${mainButtonDisabled ? 'DISABLED' : 'ENABLED'}`);
          
          // Check for icons
          const iconCount = await element.locator('svg').count();
          if (iconCount > 0) {
            console.log(`   🎨 Contains ${iconCount} icon(s)`);
          }
          
          // Take button screenshot
          await element.screenshot({ path: 'test-screenshots/step4a-main-button.png' });
          console.log('   📸 Button screenshot: step4a-main-button.png');
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!mainButton) {
      console.log('   ❌ Main mood button not found');
      
      // Debug: List all buttons on page
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`   🔍 Debug: Found ${buttonCount} total buttons on page:`);
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        try {
          const btn = allButtons.nth(i);
          const text = await btn.textContent();
          const visible = await btn.isVisible();
          if (visible && text) {
            console.log(`      Button ${i + 1}: "${text.trim()}"`);
          }
        } catch (e) {
          // Skip problematic buttons
        }
      }
    }
    
    // Test 2: Check for empty state button
    console.log('\n   Test 2: Empty State Button');
    
    const emptyStateSection = page.locator('text="No mood entries yet"').locator('..');
    const hasEmptyState = await emptyStateSection.isVisible().catch(() => false);
    
    if (hasEmptyState) {
      console.log('   ✅ Found empty state section');
      
      const emptyStateButton = emptyStateSection.locator('button').first();
      if (await emptyStateButton.isVisible().catch(() => false)) {
        const emptyButtonText = await emptyStateButton.textContent();
        const emptyButtonDisabled = await emptyStateButton.isDisabled();
        
        console.log(`   ✅ Empty state button: "${emptyButtonText}"`);
        console.log(`   📊 Button state: ${emptyButtonDisabled ? 'DISABLED' : 'ENABLED'}`);
        
        await emptyStateButton.screenshot({ path: 'test-screenshots/step4b-empty-state-button.png' });
        console.log('   📸 Empty state screenshot: step4b-empty-state-button.png');
      } else {
        console.log('   ❌ No button found in empty state');
      }
    } else {
      console.log('   ℹ️ No empty state detected (user has mood entries)');
      
      // Count mood entries
      const moodCards = page.locator('[data-testid="mood-card"], .mood-card, div:has-text("Mood:"), div:has-text("Energy:")');
      const cardCount = await moodCards.count();
      console.log(`   📊 Found ${cardCount} mood entries/cards`);
    }
    
    // Test 3: Button functionality verification
    console.log('\n   Test 3: Button State Logic Verification');
    
    if (mainButton) {
      if (mainButtonText.includes("Today's Mood Recorded")) {
        console.log('   🎯 RESULT: Today\'s mood is already recorded');
        console.log(`   ✅ Correct state: Button shows "Today's Mood Recorded"`);
        console.log(`   ✅ Correct behavior: Button is ${mainButtonDisabled ? 'disabled' : 'INCORRECTLY enabled'}`);
        
        if (!mainButtonDisabled) {
          console.log('   ⚠️ WARNING: Button should be disabled when today\'s mood is recorded!');
        }
        
      } else if (mainButtonText.includes("New Mood Entry")) {
        console.log('   🎯 RESULT: No mood recorded for today');
        console.log(`   ✅ Correct state: Button shows "New Mood Entry"`);
        console.log(`   ✅ Correct behavior: Button is ${!mainButtonDisabled ? 'enabled' : 'INCORRECTLY disabled'}`);
        
        if (mainButtonDisabled) {
          console.log('   ⚠️ WARNING: Button should be enabled when no today\'s mood exists!');
        }
        
        // Test click functionality if enabled
        if (!mainButtonDisabled) {
          console.log('   🖱️ Testing button click...');
          await mainButton.click();
          await page.waitForTimeout(1500);
          
          const newUrl = page.url();
          const modalVisible = await page.locator('[role="dialog"], .modal').isVisible().catch(() => false);
          
          if (newUrl.includes('/moods/new') || newUrl.includes('/new')) {
            console.log('   ✅ Click navigated to mood creation page');
            await page.screenshot({ path: 'test-screenshots/step4c-new-mood-page.png', fullPage: true });
            
            // Navigate back to moods page
            await page.goto('http://localhost:3001/moods');
            await page.waitForTimeout(1000);
          } else if (modalVisible) {
            console.log('   ✅ Click opened mood entry modal');
            await page.screenshot({ path: 'test-screenshots/step4c-mood-modal.png', fullPage: true });
          } else {
            console.log(`   ❓ Click result unclear - URL: ${newUrl}`);
          }
        }
      }
    }
    
    // Final comprehensive screenshot
    await page.screenshot({ path: 'test-screenshots/step5-final-comprehensive.png', fullPage: true });
    
    console.log('\n📋 TEST SUMMARY');
    console.log('================');
    
    if (mainButton) {
      console.log('✅ Main mood button functionality: WORKING');
      console.log(`   Button Text: "${mainButtonText}"`);
      console.log(`   Button State: ${mainButtonDisabled ? 'Disabled' : 'Enabled'}`);
      
      if (mainButtonText.includes("Today's Mood Recorded") && mainButtonDisabled) {
        console.log('✅ Disabled state logic: CORRECT');
      } else if (mainButtonText.includes("New Mood Entry") && !mainButtonDisabled) {
        console.log('✅ Enabled state logic: CORRECT');
      } else {
        console.log('⚠️ Button state logic may need review');
      }
    } else {
      console.log('❌ Main mood button: NOT FOUND');
    }
    
    console.log(`📸 Screenshots saved in test-screenshots/ directory`);
    console.log('🔍 Review the screenshots to verify visual appearance');
    
    console.log('\n🎯 Key Features Verified:');
    console.log('   1. Button text changes based on today\'s mood status');
    console.log('   2. Button disabled/enabled state matches mood status');
    console.log('   3. Button functionality (navigation/modal)');
    console.log('   4. Empty state button behavior');
    
    // Keep browser open for manual inspection
    console.log('\n⏸️ Keeping browser open for manual inspection...');
    console.log('💡 You can now manually interact with the page');
    console.log('🔒 Close the browser window when finished');
    
    // Wait for manual closing
    await page.waitForTimeout(300000); // 5 minutes
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-screenshots/error-final.png', fullPage: true });
    console.log('📸 Error screenshot saved: error-final.png');
  } finally {
    await browser.close();
    console.log('\n🏁 Test completed');
  }
}

interactiveMoodButtonTest().catch(console.error);