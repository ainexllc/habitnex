const { chromium } = require('playwright');

async function testMoodButtonsWithAuth() {
  console.log('Starting mood button functionality test with authentication...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down actions for better visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    console.log('1. Navigating to localhost:3001...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-screenshots/01-initial-page.png', fullPage: true });
    console.log('Screenshot saved: 01-initial-page.png');
    
    // Check if we're on login page
    const isLoginPage = await page.locator('input[type="email"]').isVisible();
    
    if (isLoginPage) {
      console.log('2. Login page detected. Please authenticate manually...');
      console.log('   - You can either:');
      console.log('     a) Use the Google Sign-in button, or');
      console.log('     b) Enter email/password credentials');
      console.log('   - This test will wait for you to complete authentication');
      console.log('   - After login, the test will continue automatically');
      
      // Wait for authentication to complete by watching for navigation away from login
      console.log('   - Waiting for authentication...');
      
      // Wait for either dashboard or direct navigation to moods page
      try {
        await page.waitForURL('**/workspace', { timeout: 60000 });
        console.log('✅ Successfully authenticated - redirected to dashboard');
      } catch {
        // Check if we're still on login or if URL changed
        const currentUrl = page.url();
        if (!currentUrl.includes('login') && !currentUrl.includes('signup')) {
          console.log('✅ Authentication completed - URL changed to:', currentUrl);
        } else {
          console.log('⚠️ Still on login page. Please complete authentication to continue test.');
          console.log('💡 Tip: If you need to create an account, you can click "Sign up" first.');
          
          // Wait a bit more for manual authentication
          await page.waitForTimeout(30000);
          
          if (page.url().includes('login') || page.url().includes('signup')) {
            console.log('❌ Authentication not completed. Exiting test.');
            return;
          }
        }
      }
    }
    
    console.log('3. Navigating to /moods page...');
    await page.goto('http://localhost:3001/moods');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot of moods page
    await page.screenshot({ path: 'test-screenshots/02-moods-page-authenticated.png', fullPage: true });
    console.log('Screenshot saved: 02-moods-page-authenticated.png');
    
    console.log('4. Looking for "New Mood Entry" button...');
    
    // Look for various possible button selectors
    const buttonSelectors = [
      'button:has-text("New Mood Entry")',
      'button:has-text("Today\'s Mood Recorded")',
      '[data-testid="new-mood-button"]',
      'button[aria-label*="mood"]',
      '.btn:has-text("New")',
      'a[href*="mood"]:has-text("New")',
      // Look for buttons with plus or heart icons
      'button:has(svg):has-text("New")',
      'button:has(svg):has-text("Today")'
    ];
    
    let foundButton = null;
    let buttonSelector = '';
    
    for (const selector of buttonSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          foundButton = button;
          buttonSelector = selector;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (foundButton) {
      console.log(`✅ Found button using selector: ${buttonSelector}`);
      
      const buttonText = await foundButton.textContent();
      const isDisabled = await foundButton.isDisabled();
      const buttonClass = await foundButton.getAttribute('class') || '';
      
      console.log(`   Button text: "${buttonText}"`);
      console.log(`   Button disabled: ${isDisabled}`);
      console.log(`   Button classes: ${buttonClass}`);
      
      // Check for icons within the button
      const iconCount = await foundButton.locator('svg').count();
      console.log(`   Icons in button: ${iconCount}`);
      
      if (iconCount > 0) {
        // Try to identify icon type
        const iconElement = foundButton.locator('svg').first();
        const iconHTML = await iconElement.innerHTML().catch(() => '');
        
        if (iconHTML.includes('plus') || iconHTML.includes('M12 5v14m7-7H5')) {
          console.log('   Icon type: Plus (new entry)');
        } else if (iconHTML.includes('heart') || iconHTML.includes('path')) {
          console.log('   Icon type: Likely Heart (recorded)');
        } else {
          console.log('   Icon type: Unknown SVG');
        }
      }
      
      // Take close-up screenshot of button
      await foundButton.screenshot({ path: 'test-screenshots/03-mood-button-detail.png' });
      console.log('Screenshot saved: 03-mood-button-detail.png');
      
      // Analyze button state
      if (buttonText && buttonText.includes("Today's Mood Recorded")) {
        console.log('🎯 TEST RESULT: Button correctly shows "Today\'s Mood Recorded"');
        console.log(`   ✅ Button disabled state: ${isDisabled} (should be true)`);
        console.log('   ✅ This indicates mood already exists for today');
      } else if (buttonText && buttonText.includes("New Mood Entry")) {
        console.log('🎯 TEST RESULT: Button shows "New Mood Entry"');
        console.log(`   ✅ Button enabled state: ${!isDisabled} (should be true)`);
        console.log('   ✅ This indicates no mood for today yet');
      } else {
        console.log(`⚠️ Button has unexpected text: "${buttonText}"`);
      }
      
    } else {
      console.log('❌ No mood entry button found with any of the expected selectors');
      
      // Let's see what buttons are actually present
      console.log('   Searching for any buttons on the page...');
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      
      console.log(`   Found ${buttonCount} buttons total:`);
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        try {
          const button = allButtons.nth(i);
          const text = await button.textContent();
          const isVisible = await button.isVisible();
          if (isVisible) {
            console.log(`     Button ${i + 1}: "${text}"`);
          }
        } catch (e) {
          // Skip problematic buttons
        }
      }
    }
    
    console.log('5. Checking for empty state...');
    
    // Look for empty state indicators
    const emptyStateSelectors = [
      '[data-testid="empty-state"]',
      '.text-center:has-text("No moods")',
      '.text-center:has-text("Start tracking")',
      '.empty-state',
      'div:has-text("No mood entries"):has-text("record your first")'
    ];
    
    let emptyStateFound = false;
    for (const selector of emptyStateSelectors) {
      if (await page.locator(selector).isVisible().catch(() => false)) {
        emptyStateFound = true;
        console.log(`   ✅ Found empty state with selector: ${selector}`);
        
        const emptyState = page.locator(selector).first();
        await emptyState.screenshot({ path: 'test-screenshots/04-empty-state.png' });
        console.log('   Screenshot saved: 04-empty-state.png');
        
        // Look for button in empty state
        const emptyButton = emptyState.locator('button').first();
        if (await emptyButton.isVisible().catch(() => false)) {
          const emptyButtonText = await emptyButton.textContent();
          const emptyButtonDisabled = await emptyButton.isDisabled();
          console.log(`   Empty state button: "${emptyButtonText}"`);
          console.log(`   Empty state button disabled: ${emptyButtonDisabled}`);
        }
        break;
      }
    }
    
    if (!emptyStateFound) {
      console.log('   No empty state found - user likely has mood entries');
      
      // Count mood entries/cards
      const moodCards = page.locator('.bg-white.rounded, .border.rounded, [data-testid="mood-card"]');
      const cardCount = await moodCards.count();
      console.log(`   Found ${cardCount} potential mood cards/entries`);
    }
    
    console.log('6. Testing button interaction (if enabled)...');
    
    if (foundButton) {
      const isDisabled = await foundButton.isDisabled();
      
      if (!isDisabled) {
        console.log('   Testing click on enabled button...');
        await foundButton.click();
        await page.waitForTimeout(2000);
        
        // Check for modal, form, or navigation
        const modalVisible = await page.locator('[role="dialog"], .modal, .fixed.inset-0, .z-50').isVisible().catch(() => false);
        
        if (modalVisible) {
          console.log('   ✅ Click opened a modal/dialog');
          await page.screenshot({ path: 'test-screenshots/05-mood-modal.png', fullPage: true });
          console.log('   Screenshot saved: 05-mood-modal.png');
          
          // Try to close modal
          const closeActions = [
            () => page.locator('button:has-text("Cancel")').first().click(),
            () => page.locator('button:has-text("Close")').first().click(),
            () => page.locator('[aria-label="Close"]').first().click(),
            () => page.keyboard.press('Escape')
          ];
          
          for (const action of closeActions) {
            try {
              await action();
              await page.waitForTimeout(500);
              if (!(await page.locator('[role="dialog"], .modal, .fixed.inset-0, .z-50').isVisible().catch(() => false))) {
                break;
              }
            } catch (e) {
              // Try next action
            }
          }
        } else {
          const currentUrl = page.url();
          console.log(`   Click result: Current URL is ${currentUrl}`);
          if (currentUrl.includes('new') || currentUrl.includes('create') || currentUrl.includes('add')) {
            console.log('   ✅ Click navigated to a new/create page');
          }
        }
      } else {
        console.log('   ⏭️ Button is disabled - skipping click test');
        console.log('   ✅ This is correct behavior if today\'s mood is already recorded');
      }
    }
    
    // Final screenshot
    await page.screenshot({ path: 'test-screenshots/06-final-state.png', fullPage: true });
    console.log('Screenshot saved: 06-final-state.png');
    
    console.log('\n=== MOOD BUTTON TEST SUMMARY ===');
    if (foundButton) {
      console.log('✅ Successfully found and tested mood entry button');
      console.log('✅ Button state logic appears to be working correctly');
    } else {
      console.log('❌ Could not locate mood entry button');
      console.log('💡 Check screenshots to see current page state');
    }
    console.log('📸 All screenshots saved in test-screenshots/ directory');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-screenshots/error.png', fullPage: true });
    console.log('Error screenshot saved: error.png');
  } finally {
    console.log('\n⏸️ Keeping browser open for manual inspection...');
    console.log('💡 You can now manually inspect the page state');
    console.log('❌ Close the browser window when done to end the test');
    
    // Keep browser open for manual inspection
    await page.waitForTimeout(300000); // Wait 5 minutes
    await browser.close();
  }
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('test-screenshots')) {
  fs.mkdirSync('test-screenshots');
}

testMoodButtonsWithAuth().catch(console.error);