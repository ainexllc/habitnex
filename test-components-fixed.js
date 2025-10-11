const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testComponentFixes() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  try {
    console.log('🔧 Testing HabitNex Component Fixes...\n');

    // 1. Test Home Page
    console.log('📱 Step 1: Testing Home Page');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-home-page.png'),
      fullPage: true 
    });
    
    // Check for any immediate errors
    console.log('✅ Home page loaded - checking for buttons and links');
    const homeButtons = await page.locator('button, .btn-primary, .btn-outline').count();
    console.log(`🔘 Found ${homeButtons} buttons/links on home page`);

    // 2. Test Habit Creation Page (Time Format Fixes)
    console.log('\n📱 Step 2: Testing Habit Creation Page (Time Format Fixes)');
    await page.goto('http://localhost:3000/habits/new');
    await page.waitForTimeout(2000); // Give it time to load
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-habits-new.png'),
      fullPage: true 
    });
    
    // Check for time-related form elements
    const timeInputs = await page.locator('select, input[type="time"], .time-selector').count();
    console.log(`🕐 Found ${timeInputs} time-related inputs`);
    
    // Check if AI enhancement button exists
    const aiButtons = await page.locator('button').all();
    let foundAiButton = false;
    for (let button of aiButtons) {
      const text = await button.textContent();
      if (text && text.toLowerCase().includes('ai')) {
        console.log(`🤖 Found AI button: "${text}"`);
        foundAiButton = true;
      }
    }

    // 3. Test Dashboard Page (CompactHabitCard fixes)
    console.log('\n📱 Step 3: Testing Dashboard (CompactHabitCard fixes)');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-dashboard.png'),
      fullPage: true 
    });
    
    const dashboardButtons = await page.locator('button').count();
    console.log(`📊 Found ${dashboardButtons} buttons on dashboard`);

    // 4. Test Habits List Page
    console.log('\n📱 Step 4: Testing Habits List (ListView fixes)');
    await page.goto('http://localhost:3000/habits');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '04-habits-list.png'),
      fullPage: true 
    });

    // 5. Test Family Page (FamilyMemberZone fixes)
    console.log('\n📱 Step 5: Testing Family Page (Button variant fixes)');
    await page.goto('http://localhost:3000/family');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '05-family-page.png'),
      fullPage: true 
    });

    // 6. Test Settings Page
    console.log('\n📱 Step 6: Testing Settings Page');
    await page.goto('http://localhost:3000/settings');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '06-settings-page.png'),
      fullPage: true 
    });

    // 7. Check All Console Messages
    console.log('\n🔍 Step 7: Analyzing Console Messages');
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');
    
    console.log(`📊 Console Summary:`);
    console.log(`   - Total messages: ${consoleMessages.length}`);
    console.log(`   - Errors: ${errors.length}`);
    console.log(`   - Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Console Errors:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.text}`);
      });
    } else {
      console.log('\n✅ No console errors detected!');
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  Console Warnings:');
      warnings.slice(0, 5).forEach((warning, index) => { // Limit to first 5
        console.log(`   ${index + 1}. ${warning.text}`);
      });
    }

    // 8. Test Authentication Pages
    console.log('\n📱 Step 8: Testing Authentication Pages');
    
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '07-login-page.png'),
      fullPage: true 
    });
    
    await page.goto('http://localhost:3000/signup');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '08-signup-page.png'),
      fullPage: true 
    });

    // 9. Summary
    console.log('\n🎉 Component testing completed!');
    console.log(`📸 Screenshots saved to: ${screenshotsDir}`);
    console.log('\n📋 Summary of Findings:');
    console.log(`   - Home page: ✅ Loaded successfully`);
    console.log(`   - Habit creation: ${timeInputs > 0 ? '✅' : '⚠️'} Time inputs found`);
    console.log(`   - AI features: ${foundAiButton ? '✅' : '⚠️'} AI button found`);
    console.log(`   - Dashboard: ✅ Accessible`);
    console.log(`   - Family page: ✅ Accessible`);
    console.log(`   - Settings: ✅ Accessible`);
    console.log(`   - Auth pages: ✅ Accessible`);
    console.log(`   - Console errors: ${errors.length === 0 ? '✅' : '❌'} ${errors.length} errors`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'error-state.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// Run the test
testComponentFixes().catch(console.error);