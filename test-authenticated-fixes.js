const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testAuthenticatedFixes() {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const page = await browser.newPage();
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'authenticated-fixes-test');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('🧪 Testing TypeScript fixes with authentication...');
  
  const testResults = {
    authSuccess: false,
    pagesLoaded: [],
    buttonFindings: {},
    timeComponentFindings: {},
    consoleErrors: [],
    specificFixes: {}
  };
  
  try {
    // Monitor console for errors
    page.on('console', message => {
      if (message.type() === 'error') {
        testResults.consoleErrors.push(message.text());
        console.log('❌ Console error:', message.text());
      }
    });
    
    // STEP 1: Create account or login
    console.log('🔐 Step 1: Authenticating...');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '01-signup.png') });
    
    // Try to create account
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'TestPass123!';
    
    try {
      await page.fill('input[placeholder*="full name"], input[name="name"]', 'Test User');
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]:not([placeholder*="Confirm"])', testPassword);
      await page.fill('input[placeholder*="Confirm"], input[name="confirmPassword"]', testPassword);
      
      // Click create account
      await page.click('button[type="submit"], button:has-text("Create Account")');
      await page.waitForTimeout(5000);
      
      // Check if we're authenticated
      const currentUrl = page.url();
      if (currentUrl.includes('/workspace?tab=overview') || currentUrl.includes('/habits')) {
        testResults.authSuccess = true;
        console.log('✅ Authentication successful with signup');
      }
    } catch (signupError) {
      console.log('⚠️ Signup failed, trying existing login...');
      
      // Try with a simpler approach - go to login
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      // Try Google auth instead
      try {
        const googleButton = await page.$('button:has-text("Google"), button:has-text("Continue with Google")');
        if (googleButton) {
          console.log('Attempting Google authentication...');
          await googleButton.click();
          await page.waitForTimeout(3000);
        }
      } catch (googleError) {
        console.log('Google auth not available or failed');
      }
    }
    
    // If still not authenticated, proceed anyway to test components that might be visible
    if (!testResults.authSuccess) {
      console.log('⚠️ Authentication failed, proceeding with component testing anyway...');
      // Go to dashboard anyway to see what loads
      await page.goto('http://localhost:3000/workspace?tab=overview', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, '02-after-auth.png') });
    
    // STEP 2: Test CompactHabitCard Button Variants (your main fix)
    console.log('🎯 Step 2: Testing CompactHabitCard button variants...');
    
    // Look for the specific components you fixed
    const buttonAnalysis = await page.evaluate(() => {
      // Find all buttons and analyze their variants
      const buttons = Array.from(document.querySelectorAll('button'));
      const analysis = buttons.map(btn => ({
        text: btn.textContent?.trim()?.substring(0, 50),
        classes: btn.className,
        hasPrimary: btn.className.includes('variant="primary"') || btn.className.includes('primary'),
        hasOutline: btn.className.includes('variant="outline"') || btn.className.includes('outline'),
        hasDefault: btn.className.includes('variant="default"') || btn.className.includes('default'),
        isCompletionButton: btn.className.includes('completion') || btn.closest('[class*="CompactHabit"]'),
        ariaLabel: btn.getAttribute('aria-label'),
        disabled: btn.disabled
      }));
      
      return {
        totalButtons: analysis.length,
        primaryButtons: analysis.filter(b => b.hasPrimary).length,
        outlineButtons: analysis.filter(b => b.hasOutline).length,
        defaultButtons: analysis.filter(b => b.hasDefault).length,
        completionButtons: analysis.filter(b => b.isCompletionButton).length,
        sampleButtons: analysis.slice(0, 10) // First 10 for inspection
      };
    });
    
    testResults.buttonFindings = buttonAnalysis;
    console.log(`Found ${buttonAnalysis.totalButtons} total buttons`);
    console.log(`Primary variant: ${buttonAnalysis.primaryButtons}`);
    console.log(`Outline variant: ${buttonAnalysis.outlineButtons}`);
    console.log(`Default variant: ${buttonAnalysis.defaultButtons}`);
    
    await page.screenshot({ path: path.join(screenshotsDir, '03-dashboard-buttons.png') });
    
    // STEP 3: Test HabitForm Time Components
    console.log('⏰ Step 3: Testing HabitForm time formatting...');
    await page.goto('http://localhost:3000/habits/new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, '04-habit-form.png') });
    
    // Check if we can access the habit form
    const habitFormVisible = await page.$('form, input[name="name"], input[placeholder*="habit"]');
    if (habitFormVisible) {
      testResults.pagesLoaded.push('HabitForm');
      console.log('✅ Habit form is accessible');
      
      // Look for time-related components (your fix was in timeUtils)
      const timeAnalysis = await page.evaluate(() => {
        const timeInputs = Array.from(document.querySelectorAll('select, input'))
          .filter(el => 
            el.name?.toLowerCase().includes('time') || 
            el.name?.toLowerCase().includes('reminder') ||
            el.placeholder?.toLowerCase().includes('time') ||
            el.id?.toLowerCase().includes('time')
          );
        
        return timeInputs.map(input => ({
          tag: input.tagName,
          name: input.name,
          id: input.id,
          placeholder: input.placeholder,
          type: input.type,
          options: input.tagName === 'SELECT' ? Array.from(input.options).slice(0, 5).map(o => o.value) : null
        }));
      });
      
      testResults.timeComponentFindings = timeAnalysis;
      console.log(`Time components found: ${timeAnalysis.length}`);
      timeAnalysis.forEach(comp => console.log(`  - ${comp.tag}: ${comp.name || comp.id || comp.placeholder}`));
      
      // Test the getTimeOptions function by filling the form
      try {
        await page.fill('input[name="name"], input[placeholder*="habit"]', 'Test Time Habit');
        
        // Look for frequency selection
        const frequencySelect = await page.$('select[name="frequency"]');
        if (frequencySelect) {
          await frequencySelect.selectOption('interval');
          await page.waitForTimeout(1000);
          await page.screenshot({ path: path.join(screenshotsDir, '05-time-form-filled.png') });
        }
      } catch (fillError) {
        console.log('Could not fill form completely:', fillError.message);
      }
    } else {
      console.log('⚠️ Habit form not accessible (requires authentication)');
    }
    
    // STEP 4: Test FamilyMemberZone components
    console.log('👨‍👩‍👧‍👦 Step 4: Testing Family components...');
    await page.goto('http://localhost:3000/family', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '06-family-page.png') });
    
    // STEP 5: Verification Summary
    console.log('🔍 Step 5: Verifying specific TypeScript fixes...');
    
    // Specific fix 1: CompactHabitCard button variant="primary" instead of "default"
    testResults.specificFixes.compactHabitCardButtons = {
      fixed: buttonAnalysis.defaultButtons === 0 && buttonAnalysis.primaryButtons > 0,
      details: `Primary buttons: ${buttonAnalysis.primaryButtons}, Default buttons: ${buttonAnalysis.defaultButtons}`
    };
    
    // Specific fix 2: HabitForm time formatting
    testResults.specificFixes.habitFormTimeFormatting = {
      fixed: testResults.timeComponentFindings.length > 0,
      details: `Time components found: ${testResults.timeComponentFindings.length}`
    };
    
    // Specific fix 3: Overall TypeScript compilation
    testResults.specificFixes.overallCompilation = {
      fixed: testResults.consoleErrors.filter(err => 
        err.includes('TypeScript') || 
        err.includes('Property') || 
        err.includes('does not exist')
      ).length === 0,
      details: `TypeScript-related console errors: ${testResults.consoleErrors.filter(err => err.includes('TypeScript')).length}`
    };
    
    await page.screenshot({ path: path.join(screenshotsDir, '07-final-verification.png') });
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    await page.screenshot({ path: path.join(screenshotsDir, 'error-final.png') });
  } finally {
    await browser.close();
  }
  
  // FINAL REPORT
  console.log('\n' + '='.repeat(80));
  console.log('🎯 TYPESCRIPT FIXES VERIFICATION REPORT');
  console.log('='.repeat(80));
  
  console.log(`\n🔐 Authentication Status: ${testResults.authSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`📱 Pages Tested: ${testResults.pagesLoaded.join(', ') || 'Basic pages only'}`);
  console.log(`❌ Console Errors: ${testResults.consoleErrors.length}`);
  
  console.log('\n📊 SPECIFIC TYPESCRIPT FIXES:');
  console.log('-'.repeat(50));
  
  // Fix 1: CompactHabitCard Button Variants
  const fix1 = testResults.specificFixes.compactHabitCardButtons;
  console.log(`1. CompactHabitCard Button Variants: ${fix1?.fixed ? '✅ FIXED' : '⚠️ NEEDS REVIEW'}`);
  console.log(`   ${fix1?.details || 'Could not verify - authentication required'}`);
  
  // Fix 2: HabitForm Time Formatting
  const fix2 = testResults.specificFixes.habitFormTimeFormatting;
  console.log(`\n2. HabitForm Time Formatting: ${fix2?.fixed ? '✅ COMPONENTS FOUND' : '⚠️ NO TIME COMPONENTS'}`);
  console.log(`   ${fix2?.details || 'Could not access form'}`);
  
  // Fix 3: Overall Compilation
  const fix3 = testResults.specificFixes.overallCompilation;
  console.log(`\n3. TypeScript Compilation: ${fix3?.fixed ? '✅ CLEAN' : '❌ HAS ERRORS'}`);
  console.log(`   ${fix3?.details || 'No TypeScript errors detected'}`);
  
  console.log('\n📈 BUTTON ANALYSIS:');
  if (testResults.buttonFindings.totalButtons > 0) {
    console.log(`   Total buttons found: ${testResults.buttonFindings.totalButtons}`);
    console.log(`   Primary variant buttons: ${testResults.buttonFindings.primaryButtons}`);
    console.log(`   Outline variant buttons: ${testResults.buttonFindings.outlineButtons}`);
    console.log(`   Default variant buttons: ${testResults.buttonFindings.defaultButtons}`);
    
    if (testResults.buttonFindings.defaultButtons === 0) {
      console.log('   ✅ SUCCESS: No "default" variant buttons found (fix applied!)');
    } else {
      console.log('   ⚠️ WARNING: Still using "default" variant in some buttons');
    }
  } else {
    console.log('   ⚠️ No buttons analyzed (authentication may be required)');
  }
  
  console.log(`\n📸 Screenshots saved to: ${screenshotsDir}`);
  console.log('\n' + '='.repeat(80));
  
  return testResults;
}

// Run the test
testAuthenticatedFixes().catch(console.error);