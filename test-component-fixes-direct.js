const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testComponentFixesDirect() {
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
    console.log('🔧 Testing HabitNex Component Fixes Directly...\n');

    // Mock localStorage to simulate authenticated state
    await page.addInitScript(() => {
      // Mock Firebase auth user
      localStorage.setItem('firebase:authUser:AIzaSyBvVyoRGFqH0gZs9Gw1Jmqx5aQ6N7HdY_U:[DEFAULT]', JSON.stringify({
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      }));
    });

    // 1. Test Home Page
    console.log('📱 Step 1: Testing Home Page UI');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'direct-01-home.png'),
      fullPage: true 
    });

    // Check button styling - should use 'primary' variant
    const primaryButtons = await page.locator('.btn-primary').count();
    const outlineButtons = await page.locator('.btn-outline').count();
    console.log(`🔘 Found ${primaryButtons} primary buttons and ${outlineButtons} outline buttons`);

    // 2. Test Authentication Pages (these should work without auth)
    console.log('\n📱 Step 2: Testing Auth Pages UI (Button variants)');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'direct-02-login.png'),
      fullPage: true 
    });

    // Check login page button classes
    const loginButtons = await page.locator('button').all();
    for (let i = 0; i < loginButtons.length; i++) {
      const button = loginButtons[i];
      const className = await button.getAttribute('class');
      const text = await button.textContent();
      console.log(`   Login button ${i + 1}: "${text?.trim()}" - classes: ${className}`);
    }

    await page.goto('http://localhost:3000/signup');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'direct-03-signup.png'),
      fullPage: true 
    });

    // 3. Try to access protected routes with fake auth
    console.log('\n📱 Step 3: Attempting to access protected routes');
    
    // Add a more comprehensive auth mock
    await page.evaluate(() => {
      // Mock Firebase auth state
      window.mockUser = {
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      };
      
      // Mock Firebase functions if they exist
      if (window.firebase && window.firebase.auth) {
        window.firebase.auth().currentUser = window.mockUser;
      }
    });

    // Try dashboard
    console.log('🏠 Testing dashboard route');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(3000); // Give time for auth check
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'direct-04-dashboard-attempt.png'),
      fullPage: true 
    });

    // Try habits new
    console.log('📝 Testing habits/new route');
    await page.goto('http://localhost:3000/habits/new');
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'direct-05-habits-new-attempt.png'),
      fullPage: true 
    });

    // 4. Analyze Console Messages for TypeScript/Component Errors
    console.log('\n🔍 Step 4: Console Analysis');
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');
    
    console.log(`📊 Console Summary:`);
    console.log(`   - Total messages: ${consoleMessages.length}`);
    console.log(`   - Errors: ${errors.length}`);
    console.log(`   - Warnings: ${warnings.length}`);
    
    // Look for specific TypeScript-related errors
    const tsErrors = errors.filter(error => 
      error.text.toLowerCase().includes('typescript') || 
      error.text.toLowerCase().includes('type') ||
      error.text.toLowerCase().includes('variant') ||
      error.text.toLowerCase().includes('prop')
    );
    
    if (tsErrors.length > 0) {
      console.log('\n❌ TypeScript/Component Related Errors:');
      tsErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.text}`);
      });
    } else {
      console.log('\n✅ No TypeScript/Component errors detected!');
    }

    if (errors.length > 0) {
      console.log('\n❌ All Console Errors:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.text}`);
      });
    }

    // 5. Test specific components by injecting them into a page
    console.log('\n📱 Step 5: Testing Components via Browser Console');
    
    await page.goto('http://localhost:3000');
    
    // Test if we can detect the specific fixes by examining the source
    const pageContent = await page.content();
    
    // Check for button variant usage in the HTML
    const hasDefaultVariant = pageContent.includes('variant="default"');
    const hasPrimaryVariant = pageContent.includes('variant="primary"');
    
    console.log(`🔍 Component Analysis:`);
    console.log(`   - Uses 'default' variant: ${hasDefaultVariant ? '❌ Found (should be fixed)' : '✅ Not found'}`);
    console.log(`   - Uses 'primary' variant: ${hasPrimaryVariant ? '✅ Found' : '⚠️ Not found'}`);

    // Final summary screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'direct-06-final.png'),
      fullPage: true 
    });

    console.log('\n🎉 Direct component testing completed!');
    console.log(`📸 Screenshots saved to: ${screenshotsDir}`);
    console.log('\n📋 Summary of Component Fix Testing:');
    console.log(`   - Button variants: ${hasDefaultVariant ? '❌ Still has "default"' : '✅ No "default" found'}`);
    console.log(`   - Primary buttons: ${hasPrimaryVariant ? '✅ Found' : '⚠️ None found'}`);
    console.log(`   - Console errors: ${errors.length === 0 ? '✅ Clean' : `❌ ${errors.length} errors`}`);
    console.log(`   - TypeScript errors: ${tsErrors.length === 0 ? '✅ None' : `❌ ${tsErrors.length} found`}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'direct-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// Run the test
testComponentFixesDirect().catch(console.error);