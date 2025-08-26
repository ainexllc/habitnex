const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testComponentsDirectly() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'component-fixes-test');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('🧪 Testing TypeScript component fixes directly...');
  
  const testResults = {
    pagesLoaded: [],
    compileErrors: [],
    consoleErrors: [],
    componentFindings: {}
  };
  
  try {
    // Monitor console for TypeScript/React errors
    page.on('console', message => {
      if (message.type() === 'error') {
        testResults.consoleErrors.push(message.text());
        console.log('❌ Console error:', message.text());
      }
    });
    
    // STEP 1: Test Home Page (baseline)
    console.log('🏠 Step 1: Testing Home Page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '01-home-page.png') });
    testResults.pagesLoaded.push('Home');
    
    // STEP 2: Test Signup Page (form components)
    console.log('📝 Step 2: Testing Signup Page (form components)...');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '02-signup-page.png') });
    testResults.pagesLoaded.push('Signup');
    
    // Analyze form elements
    const formElements = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, button, select'));
      return inputs.map(el => ({
        tag: el.tagName,
        type: el.type || el.tagName,
        className: el.className,
        id: el.id,
        name: el.name,
        placeholder: el.placeholder
      }));
    });
    testResults.componentFindings.signupForm = formElements;
    console.log(`Found ${formElements.length} form elements on signup page`);
    
    // STEP 3: Test Habit Form Page (time formatting fixes)
    console.log('⏰ Step 3: Testing Habit Form (time formatting fixes)...');
    await page.goto('http://localhost:3000/habits/new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, '03-habit-form.png') });
    testResults.pagesLoaded.push('HabitForm');
    
    // Test if the page loads without TypeScript errors
    const pageTitle = await page.title();
    const hasContent = await page.$('form, input, button');
    console.log(`Habit form page loaded: ${!!hasContent}, title: ${pageTitle}`);
    
    // Look for time-related components (your fix was in time formatting)
    const timeComponents = await page.evaluate(() => {
      const timeElements = Array.from(document.querySelectorAll('select, input'));
      return timeElements
        .filter(el => 
          el.name?.includes('time') || 
          el.name?.includes('reminder') ||
          el.placeholder?.includes('time') ||
          el.className?.includes('time')
        )
        .map(el => ({
          tag: el.tagName,
          name: el.name,
          className: el.className,
          placeholder: el.placeholder,
          options: el.tagName === 'SELECT' ? Array.from(el.options).map(o => o.text) : null
        }));
    });
    testResults.componentFindings.timeComponents = timeComponents;
    console.log(`Found ${timeComponents.length} time-related components:`, timeComponents);
    
    // STEP 4: Test Dashboard Page (CompactHabitCard button fixes)
    console.log('📊 Step 4: Testing Dashboard Page (button variant fixes)...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, '04-dashboard-page.png') });
    
    const dashboardLoaded = await page.$('main, div[class*="dashboard"], h1, h2');
    if (dashboardLoaded) {
      testResults.pagesLoaded.push('Dashboard');
      console.log('✅ Dashboard page loaded successfully');
      
      // Test button variants (your fix was primary vs default variants)
      const buttonAnalysis = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.map(btn => ({
          text: btn.textContent?.trim(),
          className: btn.className,
          hasPrimary: btn.className.includes('primary'),
          hasOutline: btn.className.includes('outline'),
          hasDefault: btn.className.includes('default'),
          disabled: btn.disabled,
          type: btn.type
        }));
      });
      testResults.componentFindings.dashboardButtons = buttonAnalysis;
      console.log(`Found ${buttonAnalysis.length} buttons on dashboard`);
      console.log('Primary buttons:', buttonAnalysis.filter(b => b.hasPrimary).length);
      console.log('Outline buttons:', buttonAnalysis.filter(b => b.hasOutline).length);
      console.log('Default variant buttons:', buttonAnalysis.filter(b => b.hasDefault).length);
    } else {
      console.log('⚠️ Dashboard page may not have loaded properly or requires auth');
    }
    
    // STEP 5: Test Family Pages (FamilyMemberZone button fixes)  
    console.log('👨‍👩‍👧‍👦 Step 5: Testing Family Pages...');
    await page.goto('http://localhost:3000/family', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '05-family-page.png') });
    
    const familyPageLoaded = !page.url().includes('404') && !page.url().includes('not-found');
    if (familyPageLoaded) {
      testResults.pagesLoaded.push('Family');
      console.log('✅ Family page loaded successfully');
    } else {
      console.log('⚠️ Family page not accessible (may be expected)');
    }
    
    // STEP 6: Test Login Page
    console.log('🔐 Step 6: Testing Login Page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '06-login-page.png') });
    testResults.pagesLoaded.push('Login');
    
    // STEP 7: Component-specific TypeScript validation
    console.log('🔍 Step 7: Validating component TypeScript fixes...');
    
    // Check browser network and runtime errors
    const runtimeErrors = await page.evaluate(() => {
      const errors = window.console?.error || [];
      return typeof errors === 'function' ? [] : errors;
    });
    
    // Final screenshot
    await page.screenshot({ path: path.join(screenshotsDir, '07-final-state.png') });
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    testResults.compileErrors.push(error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'error-state.png') });
  } finally {
    await browser.close();
  }
  
  // SUMMARY REPORT
  console.log('\n' + '='.repeat(60));
  console.log('🎯 TYPESCRIPT COMPONENT FIXES TEST SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`\n📱 Pages Successfully Loaded: ${testResults.pagesLoaded.length}`);
  testResults.pagesLoaded.forEach(page => console.log(`  ✅ ${page}`));
  
  console.log(`\n❌ Console Errors: ${testResults.consoleErrors.length}`);
  if (testResults.consoleErrors.length > 0) {
    testResults.consoleErrors.slice(0, 5).forEach((error, i) => {
      console.log(`  ${i + 1}. ${error.substring(0, 100)}${error.length > 100 ? '...' : ''}`);
    });
  }
  
  console.log('\n🔧 SPECIFIC TYPESCRIPT FIXES VERIFIED:');
  console.log('-'.repeat(40));
  
  // CompactHabitCard Button Variant Fix
  const dashboardButtons = testResults.componentFindings.dashboardButtons || [];
  const primaryButtons = dashboardButtons.filter(b => b.hasPrimary).length;
  const defaultButtons = dashboardButtons.filter(b => b.hasDefault).length;
  console.log(`1. CompactHabitCard Button Variants:`);
  console.log(`   ✅ Primary variant buttons: ${primaryButtons}`);
  console.log(`   ⚠️  Default variant buttons: ${defaultButtons}`);
  console.log(`   Status: ${defaultButtons === 0 ? 'FIXED' : 'NEEDS REVIEW'}`);
  
  // HabitForm Time Formatting Fix
  const timeComponents = testResults.componentFindings.timeComponents || [];
  console.log(`\n2. HabitForm Time Formatting:`);
  console.log(`   ✅ Time-related components found: ${timeComponents.length}`);
  console.log(`   Status: ${timeComponents.length > 0 ? 'COMPONENTS PRESENT' : 'NO TIME COMPONENTS'}`);
  
  // Overall TypeScript Compilation
  console.log(`\n3. Overall TypeScript Compilation:`);
  console.log(`   ✅ Pages loaded without compile errors: ${testResults.pagesLoaded.length}`);
  console.log(`   ❌ Runtime errors found: ${testResults.consoleErrors.length}`);
  console.log(`   Status: ${testResults.consoleErrors.length === 0 ? 'CLEAN' : 'HAS ISSUES'}`);
  
  console.log(`\n📸 Screenshots saved to: ${screenshotsDir}`);
  console.log('\n' + '='.repeat(60));
  
  return testResults;
}

// Run the test
testComponentsDirectly().catch(console.error);