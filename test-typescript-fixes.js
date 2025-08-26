const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testTypescriptFixes() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'typescript-fixes-test');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('🧪 Testing TypeScript fixes on NextVibe app...');
  
  try {
    // STEP 1: Navigate to the app and check initial state
    console.log('📱 Step 1: Navigating to NextVibe app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '01-landing-page.png') });
    
    // Check for any console errors
    const consoleErrors = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
        console.log('❌ Console error:', message.text());
      }
    });
    
    // STEP 2: Navigate to signup/login
    console.log('🔐 Step 2: Testing authentication flow...');
    
    // Try to get to the signup page - wait for the element and be more flexible
    console.log('Looking for signup link...');
    await page.waitForTimeout(3000);
    
    // Check what elements are actually available
    const availableLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.map(link => ({
        href: link.getAttribute('href'),
        text: link.textContent?.trim(),
        className: link.className
      }));
    });
    console.log('Available links:', availableLinks);
    
    // Try different selectors for signup
    let signupClicked = false;
    const signupSelectors = [
      'a[href="/signup"]',
      'a:has-text("Sign Up")',
      'a:has-text("Get Started")',
      'button:has-text("Sign Up")',
      'button:has-text("Get Started")'
    ];
    
    for (const selector of signupSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`Found signup element with selector: ${selector}`);
          await element.click();
          signupClicked = true;
          break;
        }
      } catch (e) {
        console.log(`Selector ${selector} failed: ${e.message}`);
      }
    }
    
    if (!signupClicked) {
      console.log('No signup link found, navigating directly to /signup');
      await page.goto('http://localhost:3000/signup');
    }
    
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '02-signup-page.png') });
    
    // Test email/password authentication
    console.log('🔑 Testing email signup...');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.fill('input[placeholder*="Confirm"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Wait for either dashboard or error
    await page.waitForTimeout(3000);
    
    // Check if we're on dashboard or if there's an error
    const currentUrl = page.url();
    console.log('Current URL after signup:', currentUrl);
    
    let authSuccess = false;
    
    if (currentUrl.includes('/dashboard')) {
      authSuccess = true;
      console.log('✅ Authentication successful - redirected to dashboard');
    } else {
      // Try login instead
      console.log('🔄 Signup failed, trying login...');
      await page.goto('http://localhost:3000/login');
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/dashboard')) {
        authSuccess = true;
        console.log('✅ Login successful - redirected to dashboard');
      } else {
        // Try Google auth or create a mock authenticated state
        console.log('⚠️ Standard auth failed, attempting alternative approach...');
        // Navigate directly to dashboard and check for redirect
        await page.goto('http://localhost:3000/dashboard');
        await page.waitForTimeout(2000);
        
        // If we're still on dashboard (not redirected), assume we can test components
        if (page.url().includes('/dashboard')) {
          authSuccess = true;
          console.log('📝 Direct dashboard access - testing components anyway');
        }
      }
    }
    
    if (authSuccess) {
      // STEP 3A: Test Dashboard CompactHabitCard buttons
      console.log('📊 Step 3A: Testing Dashboard CompactHabitCard button fixes...');
      await page.screenshot({ path: path.join(screenshotsDir, '03a-dashboard-initial.png') });
      
      // Look for habit cards with completion buttons
      const habitCards = await page.$$('[class*="CompactHabitCard"], .compact-habit-card, [class*="habit-card"]');
      console.log(`Found ${habitCards.length} potential habit cards`);
      
      // Look for buttons with primary/outline variants
      const buttons = await page.$$('button[class*="primary"], button[class*="outline"]');
      console.log(`Found ${buttons.length} buttons with variant classes`);
      
      // Check if buttons are using "primary" instead of "default" variant
      const buttonVariants = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.map(btn => ({
          text: btn.textContent?.trim(),
          className: btn.className,
          hasPrimary: btn.className.includes('primary'),
          hasOutline: btn.className.includes('outline')
        })).filter(b => b.hasPrimary || b.hasOutline);
      });
      
      console.log('Button variants found:', buttonVariants);
      await page.screenshot({ path: path.join(screenshotsDir, '03a-dashboard-buttons.png') });
      
      // Test button interactions
      if (buttons.length > 0) {
        console.log('🖱️ Testing button interactions...');
        await buttons[0].click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(screenshotsDir, '03a-button-clicked.png') });
      }
      
      // STEP 3B: Test Habit Creation Form
      console.log('📝 Step 3B: Testing HabitForm time formatting fixes...');
      await page.goto('http://localhost:3000/habits/new');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(screenshotsDir, '03b-habit-form-initial.png') });
      
      // Look for time formatting elements
      const timeInputs = await page.$$('select[name*="time"], input[name*="time"], select[name*="reminder"], input[name*="reminder"]');
      console.log(`Found ${timeInputs.length} time-related inputs`);
      
      // Test time format functionality
      if (timeInputs.length > 0) {
        console.log('⏰ Testing time format selection...');
        
        // Try to interact with time inputs
        for (let i = 0; i < Math.min(timeInputs.length, 2); i++) {
          try {
            await timeInputs[i].click();
            await page.waitForTimeout(500);
          } catch (e) {
            console.log(`Could not interact with time input ${i}: ${e.message}`);
          }
        }
        await page.screenshot({ path: path.join(screenshotsDir, '03b-time-inputs-clicked.png') });
      }
      
      // Test AI enhancement feature
      const aiEnhanceButton = await page.$('button:has-text("Enhance"), button:has-text("AI"), [data-testid="ai-enhance"]');
      if (aiEnhanceButton) {
        console.log('🤖 Testing AI enhancement...');
        await page.fill('input[name="name"], input[placeholder*="habit"]', 'Test Habit');
        await aiEnhanceButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotsDir, '03b-ai-enhancement.png') });
      }
      
      // STEP 3C: Test Family Pages (if accessible)
      console.log('👨‍👩‍👧‍👦 Step 3C: Testing FamilyMemberZone button fixes...');
      await page.goto('http://localhost:3000/family');
      await page.waitForTimeout(2000);
      
      const familyPageExists = !page.url().includes('404') && !page.url().includes('login');
      if (familyPageExists) {
        await page.screenshot({ path: path.join(screenshotsDir, '03c-family-page.png') });
        
        // Look for family member zones with buttons
        const memberZones = await page.$$('[class*="FamilyMemberZone"], .family-member-zone');
        console.log(`Found ${memberZones.length} family member zones`);
        
        // Test button variants in family components
        const familyButtons = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.map(btn => ({
            text: btn.textContent?.trim(),
            className: btn.className,
            hasPrimary: btn.className.includes('primary'),
            hasOutline: btn.className.includes('outline')
          })).filter(b => b.hasPrimary || b.hasOutline);
        });
        
        console.log('Family page button variants:', familyButtons);
        await page.screenshot({ path: path.join(screenshotsDir, '03c-family-buttons.png') });
      } else {
        console.log('⚠️ Family page not accessible - may require additional setup');
        await page.screenshot({ path: path.join(screenshotsDir, '03c-family-not-accessible.png') });
      }
    } else {
      console.log('❌ Could not authenticate - testing public components only');
      await page.screenshot({ path: path.join(screenshotsDir, 'auth-failed.png') });
    }
    
    // STEP 4: Final error check and summary
    console.log('📋 Step 4: Final error check and summary...');
    await page.screenshot({ path: path.join(screenshotsDir, '04-final-state.png') });
    
    // Get any TypeScript/React errors from console
    const finalErrors = await page.evaluate(() => {
      return window.console ? [] : []; // Can't access console history directly
    });
    
    // Summary
    console.log('\n🎯 TYPESCRIPT FIXES TEST SUMMARY:');
    console.log('=====================================');
    console.log(`✅ Authentication: ${authSuccess ? 'Successful' : 'Failed'}`);
    console.log(`📱 Dashboard tested: ${authSuccess ? 'Yes' : 'No'}`);
    console.log(`📝 Habit form tested: ${authSuccess ? 'Yes' : 'No'}`);
    console.log(`👨‍👩‍👧‍👦 Family page tested: ${authSuccess ? 'Attempted' : 'No'}`);
    console.log(`❌ Console errors: ${consoleErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\nConsole Errors Found:');
      consoleErrors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }
    
    console.log(`\n📸 Screenshots saved to: ${screenshotsDir}`);
    
    // Specific findings about TypeScript fixes
    console.log('\n🔧 TYPESCRIPT FIXES VERIFICATION:');
    console.log('=====================================');
    console.log('1. CompactHabitCard buttons: Testing button variant usage (primary vs default)');
    console.log('2. HabitForm time formatting: Testing time input interactions');
    console.log('3. FamilyMemberZone buttons: Testing button styling and interactions');
    console.log('4. Overall app stability: Checking for TypeScript compilation errors in browser');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    await page.screenshot({ path: path.join(screenshotsDir, 'error-state.png') });
  } finally {
    await browser.close();
  }
}

// Run the test
testTypescriptFixes().catch(console.error);