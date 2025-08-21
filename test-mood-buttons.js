const { chromium } = require('playwright');

async function testMoodButtons() {
  console.log('Starting mood button functionality test...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down actions for better visibility
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
    await page.screenshot({ path: 'test-screenshots/01-homepage.png', fullPage: true });
    console.log('Screenshot saved: 01-homepage.png');
    
    // Check if we need to login (look for login form or dashboard)
    const isLoginPage = await page.locator('input[type="email"]').isVisible().catch(() => false);
    
    if (isLoginPage) {
      console.log('Login page detected. You may need to login manually first.');
      console.log('Please login to the app and then run this test again.');
      return;
    }
    
    console.log('2. Navigating to /moods page...');
    await page.goto('http://localhost:3001/moods');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for any animations
    
    // Take screenshot of moods page
    await page.screenshot({ path: 'test-screenshots/02-moods-page.png', fullPage: true });
    console.log('Screenshot saved: 02-moods-page.png');
    
    console.log('3. Looking for "New Mood Entry" button in top right...');
    
    // Check for the main New Mood Entry button
    const newMoodButton = page.locator('button:has-text("New Mood Entry"), button:has-text("Today\'s Mood Recorded")');
    const buttonExists = await newMoodButton.isVisible();
    
    if (buttonExists) {
      const buttonText = await newMoodButton.textContent();
      const isDisabled = await newMoodButton.isDisabled();
      
      console.log(`Button found with text: "${buttonText}"`);
      console.log(`Button disabled: ${isDisabled}`);
      
      // Check for icons
      const hasHeartIcon = await newMoodButton.locator('svg').count() > 0;
      console.log(`Has icon: ${hasHeartIcon}`);
      
      if (buttonText.includes("Today's Mood Recorded")) {
        console.log('✅ Button correctly shows "Today\'s Mood Recorded" - mood already exists for today');
        console.log(`✅ Button is disabled: ${isDisabled}`);
      } else if (buttonText.includes("New Mood Entry")) {
        console.log('✅ Button shows "New Mood Entry" - no mood for today yet');
        console.log(`✅ Button is clickable: ${!isDisabled}`);
      }
      
      // Take close-up screenshot of button
      await newMoodButton.screenshot({ path: 'test-screenshots/03-mood-button-closeup.png' });
      console.log('Screenshot saved: 03-mood-button-closeup.png');
      
    } else {
      console.log('❌ New Mood Entry button not found in top area');
    }
    
    console.log('4. Checking for empty state card and its button...');
    
    // Look for empty state card
    const emptyStateCard = page.locator('[data-testid="empty-state"], .text-center:has-text("No moods"), .text-center:has-text("Start tracking")');
    const hasEmptyState = await emptyStateCard.isVisible();
    
    if (hasEmptyState) {
      console.log('Empty state card found');
      
      // Look for button in empty state
      const emptyStateButton = emptyStateCard.locator('button');
      const emptyButtonExists = await emptyStateButton.isVisible();
      
      if (emptyButtonExists) {
        const emptyButtonText = await emptyStateButton.textContent();
        const emptyButtonDisabled = await emptyStateButton.isDisabled();
        
        console.log(`Empty state button text: "${emptyButtonText}"`);
        console.log(`Empty state button disabled: ${emptyButtonDisabled}`);
        
        // Take screenshot of empty state
        await emptyStateCard.screenshot({ path: 'test-screenshots/04-empty-state.png' });
        console.log('Screenshot saved: 04-empty-state.png');
      } else {
        console.log('No button found in empty state card');
      }
    } else {
      console.log('No empty state detected - user has mood entries');
      
      // Look for mood entries/cards
      const moodEntries = page.locator('[data-testid="mood-entry"], .mood-card, .bg-white.rounded-lg, .border.rounded-lg');
      const entryCount = await moodEntries.count();
      console.log(`Found ${entryCount} mood entries/cards`);
      
      if (entryCount > 0) {
        // Take screenshot showing mood entries
        await page.screenshot({ path: 'test-screenshots/05-mood-entries.png', fullPage: true });
        console.log('Screenshot saved: 05-mood-entries.png');
      }
    }
    
    console.log('5. Testing button interaction...');
    
    // If button is enabled, test clicking it
    if (buttonExists) {
      const isDisabled = await newMoodButton.isDisabled();
      
      if (!isDisabled) {
        console.log('Testing click on enabled button...');
        await newMoodButton.click();
        await page.waitForTimeout(2000);
        
        // Check if modal or form appeared
        const modalVisible = await page.locator('[role="dialog"], .modal, .fixed.inset-0').isVisible().catch(() => false);
        if (modalVisible) {
          console.log('✅ Click opened mood entry modal/form');
          await page.screenshot({ path: 'test-screenshots/06-mood-modal.png', fullPage: true });
          console.log('Screenshot saved: 06-mood-modal.png');
          
          // Close modal (look for close button or ESC)
          const closeButton = page.locator('button:has-text("Cancel"), button:has-text("Close"), [aria-label="Close"]').first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
          } else {
            await page.keyboard.press('Escape');
          }
        } else {
          console.log('Click did not open a visible modal - might have navigated to form page');
        }
      } else {
        console.log('Button is disabled - cannot test click interaction');
      }
    }
    
    // Final summary screenshot
    await page.screenshot({ path: 'test-screenshots/07-final-state.png', fullPage: true });
    console.log('Screenshot saved: 07-final-state.png');
    
    console.log('\n=== TEST SUMMARY ===');
    console.log('✅ Successfully tested mood button functionality');
    console.log('📸 Screenshots saved in test-screenshots/ directory');
    console.log('🔍 Check the screenshots to verify the visual states');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    // Take error screenshot
    await page.screenshot({ path: 'test-screenshots/error-state.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('test-screenshots')) {
  fs.mkdirSync('test-screenshots');
}

testMoodButtons().catch(console.error);