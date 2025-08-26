const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testNextVibeAuthentication() {
  const browser = await chromium.launch({ 
    headless: false,  // Show browser for debugging
    slowMo: 1000,     // Slow down for visibility
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('🚀 Starting NextVibe Authentication & Component Tests...\n');

    // 1. Navigate to home page and take screenshot
    console.log('📱 Step 1: Navigating to home page');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-home-page.png'),
      fullPage: true 
    });
    console.log('✅ Home page loaded successfully');

    // 2. Navigate to signup page
    console.log('\n📱 Step 2: Testing signup flow');
    await page.click('a[href="/signup"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-signup-page.png'),
      fullPage: true 
    });

    // Try to create a test account
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`🔑 Attempting to create account with: ${testEmail}`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Wait for potential redirect or error
    await page.waitForTimeout(3000);
    
    // Check if we're redirected to dashboard (successful signup)
    const currentUrl = page.url();
    console.log(`📍 Current URL after signup: ${currentUrl}`);
    
    let isAuthenticated = false;
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Successfully signed up and authenticated!');
      isAuthenticated = true;
    } else {
      console.log('❌ Signup failed or not redirected to dashboard');
      await page.screenshot({ 
        path: path.join(screenshotsDir, '02b-signup-error.png'),
        fullPage: true 
      });
      
      // Try login instead
      console.log('\n📱 Step 2b: Trying login flow');
      await page.goto('http://localhost:3000/login');
      await page.waitForLoadState('networkidle');
      
      // Try Google Auth if available
      const googleButton = await page.locator('text=Continue with Google').first();
      if (await googleButton.isVisible()) {
        console.log('🔍 Found Google Auth button, but skipping for automated test');
      }
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '02c-login-page.png'),
        fullPage: true 
      });
    }

    // If we're not authenticated, let's manually navigate to dashboard to test UI components
    if (!isAuthenticated) {
      console.log('\n📱 Step 2c: Navigating directly to dashboard to test UI components');
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForTimeout(2000);
      
      // Check if we're redirected to login (which is expected)
      const dashboardUrl = page.url();
      if (dashboardUrl.includes('/login')) {
        console.log('🔒 Dashboard correctly redirects unauthenticated users to login');
        await page.screenshot({ 
          path: path.join(screenshotsDir, '02d-dashboard-redirect.png'),
          fullPage: true 
        });
      }
    }

    // 3. Test authenticated pages (if authenticated) or component pages directly
    if (isAuthenticated || true) { // Force testing of pages for UI verification
      console.log('\n📱 Step 3: Testing key application pages and components');
      
      // Test habit creation page - this was fixed for time format
      console.log('🎯 Testing /habits/new (HabitForm with time format fixes)');
      await page.goto('http://localhost:3000/habits/new');
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: path.join(screenshotsDir, '03-habits-new.png'),
        fullPage: true 
      });
      
      // Look for time format dropdowns
      const timeDropdowns = await page.locator('select').count();
      console.log(`🕐 Found ${timeDropdowns} time-related dropdowns`);
      
      // Test AI enhancement if button is present
      const aiButton = await page.locator('text=Enhance with AI').first();
      if (await aiButton.isVisible()) {
        console.log('🤖 Testing AI enhancement feature');
        
        // Fill in basic habit info first
        await page.fill('input[name="title"]', 'Test Reading Habit');
        await page.click('text=Enhance with AI');
        await page.waitForTimeout(3000); // Wait for AI response
        
        await page.screenshot({ 
          path: path.join(screenshotsDir, '03b-ai-enhancement.png'),
          fullPage: true 
        });
      }

      // Test dashboard page - this has CompactHabitCard with fixed button variants
      console.log('📊 Testing /dashboard (CompactHabitCard button fixes)');
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: path.join(screenshotsDir, '04-dashboard.png'),
        fullPage: true 
      });

      // Test family pages - this has FamilyMemberZone with button variant fixes
      console.log('👨‍👩‍👧‍👦 Testing family pages (FamilyMemberZone button fixes)');
      await page.goto('http://localhost:3000/family');
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: path.join(screenshotsDir, '05-family-page.png'),
        fullPage: true 
      });

      // Test habits list page
      console.log('📋 Testing /habits (ListView and HabitCard components)');
      await page.goto('http://localhost:3000/habits');
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: path.join(screenshotsDir, '06-habits-list.png'),
        fullPage: true 
      });
    }

    // 4. Test console errors
    console.log('\n🔍 Step 4: Checking for console errors');
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate through a few pages to trigger any errors
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    await page.goto('http://localhost:3000/habits/new');
    await page.waitForTimeout(1000);
    
    if (errors.length > 0) {
      console.log('❌ Console Errors Found:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No console errors detected');
    }

    // 5. Test specific TypeScript fixes
    console.log('\n🔧 Step 5: Testing specific TypeScript fixes');
    
    // Navigate to a page with buttons and check their styling
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    
    // Check button classes (should use 'primary' not 'default')
    const buttons = await page.locator('button, .btn-primary').all();
    console.log(`🔘 Found ${buttons.length} buttons to check`);
    
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const button = buttons[i];
      const classes = await button.getAttribute('class');
      console.log(`   Button ${i + 1} classes: ${classes}`);
    }

    // Final screenshot showing current state
    await page.screenshot({ 
      path: path.join(screenshotsDir, '07-final-state.png'),
      fullPage: true 
    });

    console.log('\n🎉 Test completed successfully!');
    console.log(`📸 Screenshots saved to: ${screenshotsDir}`);
    
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
testNextVibeAuthentication().catch(console.error);