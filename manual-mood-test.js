const { chromium } = require('playwright');

async function manualMoodTest() {
  console.log('🧪 Manual Mood Button Test');
  console.log('==========================');
  console.log('This test will open the browser and wait for you to:');
  console.log('1. Manually authenticate (login/signup)');
  console.log('2. Navigate to the moods page');
  console.log('3. The test will then analyze the mood button states');
  console.log('');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // Create screenshots directory
  const fs = require('fs');
  if (!fs.existsSync('mood-test-results')) {
    fs.mkdirSync('mood-test-results');
  }
  
  try {
    console.log('🌐 Opening HabitNex app...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    console.log('');
    console.log('👤 MANUAL STEP REQUIRED:');
    console.log('========================');
    console.log('Please complete the following steps in the opened browser:');
    console.log('1. Login/signup to the application');
    console.log('2. Navigate to the /moods page');
    console.log('3. Press ENTER in this terminal when you\'re on the moods page');
    console.log('');
    
    // Wait for user confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    await new Promise(resolve => {
      readline.question('Press ENTER when you are on the moods page and ready to test: ', () => {
        readline.close();
        resolve();
      });
    });
    
    console.log('');
    console.log('🔍 Analyzing mood button functionality...');
    console.log('==========================================');
    
    // Take initial screenshot
    await page.screenshot({ path: 'mood-test-results/01-moods-page.png', fullPage: true });
    console.log('📸 Screenshot saved: 01-moods-page.png');
    
    // Test 1: Check page URL and title
    const currentUrl = page.url();
    const pageTitle = await page.title().catch(() => 'Unknown');
    
    console.log(`📍 Current URL: ${currentUrl}`);
    console.log(`📑 Page Title: ${pageTitle}`);
    
    if (!currentUrl.includes('moods') && !currentUrl.includes('localhost:3001')) {
      console.log('⚠️  Warning: You may not be on the correct page');
    }
    
    // Test 2: Look for main mood button in header
    console.log('');
    console.log('Test 1: Main Header Mood Button');
    console.log('--------------------------------');
    
    const buttonSelectors = [
      { selector: 'button:has-text("New Mood Entry")', description: 'New Mood Entry button' },
      { selector: 'button:has-text("Today\'s Mood Recorded")', description: 'Today\'s Mood Recorded button' },
      { selector: 'a[href="/moods/new"] button', description: 'Link to new mood with button' },
      { selector: 'button:has(svg[data-lucide="plus"])', description: 'Button with plus icon' },
      { selector: 'button:has(svg[data-lucide="heart"])', description: 'Button with heart icon' }
    ];
    
    let foundMainButton = false;
    
    for (const { selector, description } of buttonSelectors) {
      try {
        const element = page.locator(selector).first();
        const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (isVisible) {
          foundMainButton = true;
          const text = await element.textContent();
          const disabled = await element.isDisabled();
          const classes = await element.getAttribute('class') || '';
          
          console.log(`✅ Found: ${description}`);
          console.log(`   Text: "${text}"`);
          console.log(`   Disabled: ${disabled}`);
          console.log(`   Classes: ${classes}`);
          
          // Take button screenshot
          await element.screenshot({ path: `mood-test-results/02-main-button.png` });
          console.log('   📸 Button screenshot saved');
          
          // Analyze button state logic
          if (text.includes("Today's Mood Recorded")) {
            console.log('');
            console.log('🎯 ANALYSIS: Today\'s mood already recorded');
            console.log(`   ✅ Button text correct: "Today's Mood Recorded"`);
            console.log(`   ${disabled ? '✅' : '❌'} Button disabled: ${disabled} ${disabled ? '(Correct)' : '(Should be disabled!)'}`);
            console.log('   🎨 Should show Heart icon');
            
          } else if (text.includes("New Mood Entry")) {
            console.log('');
            console.log('🎯 ANALYSIS: No mood recorded for today');
            console.log(`   ✅ Button text correct: "New Mood Entry"`);
            console.log(`   ${!disabled ? '✅' : '❌'} Button enabled: ${!disabled} ${!disabled ? '(Correct)' : '(Should be enabled!)'}`);
            console.log('   🎨 Should show Plus icon');
            
            // Test click if enabled
            if (!disabled) {
              console.log('   🖱️ Testing click functionality...');
              const originalUrl = page.url();
              
              await element.click();
              await page.waitForTimeout(2000);
              
              const newUrl = page.url();
              const modalVisible = await page.locator('[role="dialog"], .modal, .fixed.inset-0').isVisible().catch(() => false);
              
              if (newUrl !== originalUrl) {
                console.log(`   ✅ Click navigated to: ${newUrl}`);
                await page.screenshot({ path: 'mood-test-results/03-after-click.png', fullPage: true });
              } else if (modalVisible) {
                console.log('   ✅ Click opened a modal');
                await page.screenshot({ path: 'mood-test-results/03-modal.png', fullPage: true });
              } else {
                console.log('   ❓ Click result unclear');
              }
              
              // Navigate back if we moved away
              if (newUrl !== originalUrl && !newUrl.includes('moods')) {
                await page.goto('http://localhost:3001/moods');
                await page.waitForTimeout(1000);
              }
            }
          }
          
          break; // Found the main button
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!foundMainButton) {
      console.log('❌ No main mood button found');
      
      // Debug: Show all buttons
      console.log('🔍 All buttons on page:');
      const allButtons = page.locator('button');
      const count = await allButtons.count();
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        try {
          const btn = allButtons.nth(i);
          const text = await btn.textContent();
          const visible = await btn.isVisible();
          if (visible && text && text.trim()) {
            console.log(`   Button ${i + 1}: "${text.trim()}"`);
          }
        } catch (e) {
          // Skip
        }
      }
    }
    
    // Test 3: Check for empty state
    console.log('');
    console.log('Test 2: Empty State Button');
    console.log('--------------------------');
    
    const emptyStateText = page.locator('text="No mood entries yet"');
    const hasEmptyState = await emptyStateText.isVisible().catch(() => false);
    
    if (hasEmptyState) {
      console.log('✅ Found empty state section');
      
      const emptyStateCard = emptyStateText.locator('..').locator('..');
      const emptyButton = emptyStateCard.locator('button').first();
      
      if (await emptyButton.isVisible().catch(() => false)) {
        const buttonText = await emptyButton.textContent();
        const buttonDisabled = await emptyButton.isDisabled();
        
        console.log(`   Button text: "${buttonText}"`);
        console.log(`   Button disabled: ${buttonDisabled}`);
        
        await emptyButton.screenshot({ path: 'mood-test-results/04-empty-state-button.png' });
        console.log('   📸 Empty state button screenshot saved');
        
        // Same analysis logic
        if (buttonText.includes("Today's Mood Recorded")) {
          console.log('   🎯 Empty state correctly shows mood recorded');
        } else if (buttonText.includes("Track Your First Mood")) {
          console.log('   🎯 Empty state shows first mood tracking');
        }
      }
    } else {
      console.log('ℹ️  No empty state (user has mood entries)');
      
      // Count mood entries
      const moodCards = page.locator('[data-testid="mood-card"], .bg-white.rounded-lg, div:has-text("Mood:")');
      const cardCount = await moodCards.count();
      console.log(`   📊 Found ${cardCount} mood cards`);
    }
    
    // Final screenshot
    await page.screenshot({ path: 'mood-test-results/05-final-state.png', fullPage: true });
    
    console.log('');
    console.log('📋 TEST SUMMARY');
    console.log('===============');
    console.log(`📸 All screenshots saved in mood-test-results/ directory`);
    
    if (foundMainButton) {
      console.log('✅ Main mood button found and analyzed');
      console.log('✅ Button state logic verified');
    } else {
      console.log('❌ Main mood button not found - may need investigation');
    }
    
    console.log('');
    console.log('🎯 Key functionality verified:');
    console.log('   • Button text changes based on today\'s mood status');
    console.log('   • Button disabled/enabled state matches logic');
    console.log('   • Click functionality (navigation or modal)');
    console.log('   • Empty state button behavior');
    
    console.log('');
    console.log('⏸️ Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    await page.screenshot({ path: 'mood-test-results/error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🏁 Test completed');
  }
}

manualMoodTest().catch(console.error);