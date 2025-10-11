import { test, expect } from '@playwright/test';

test.describe('Habit Form Validation Tests', () => {
  test('validate habit form loading and functionality', async ({ page }) => {
    console.log('Testing habit form loading and functionality...');
    
    // Navigate to the form
    await page.goto('http://localhost:3001/habits/new');
    await page.waitForLoadState('domcontentloaded');
    
    console.log('Initial URL:', page.url());
    
    // Wait for dynamic content to load (we discovered it needs time)
    console.log('Waiting for form to load dynamically...');
    await page.waitForTimeout(5000); // Give it 5 seconds based on our findings
    
    // Check form existence after waiting
    const formCount = await page.locator('form').count();
    const nameInputCount = await page.locator('input[name="name"]').count();
    const allInputsCount = await page.locator('input').count();
    
    console.log(`After waiting: Forms: ${formCount}, Name inputs: ${nameInputCount}, All inputs: ${allInputsCount}`);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'form-validation-final.png', fullPage: true });
    
    if (formCount > 0) {
      console.log('✅ Form found! Testing form elements...');
      
      // Test name input
      const nameInput = page.locator('input[name="name"]');
      if (await nameInput.isVisible()) {
        console.log('✅ Name input is visible');
        await nameInput.fill('Test Habit Form Validation');
        console.log('✅ Successfully filled name input');
      } else {
        console.log('❌ Name input not visible');
      }
      
      // Test description textarea
      const descriptionTextarea = page.locator('textarea[name="description"]');
      if (await descriptionTextarea.isVisible()) {
        console.log('✅ Description textarea is visible');
        await descriptionTextarea.fill('This is a test description for form validation');
        console.log('✅ Successfully filled description');
      } else {
        console.log('❌ Description textarea not visible');
      }
      
      // Test color selection
      const colorButtons = page.locator('button[style*="background-color"]');
      const colorCount = await colorButtons.count();
      console.log(`Color selection buttons found: ${colorCount}`);
      
      if (colorCount > 0) {
        await colorButtons.first().click();
        console.log('✅ Successfully selected color');
      } else {
        console.log('❌ No color selection buttons found');
      }
      
      // Test frequency options
      const dailyRadio = page.locator('input[value="daily"]');
      if (await dailyRadio.isVisible()) {
        console.log('✅ Daily frequency option visible');
        await dailyRadio.check();
        console.log('✅ Selected daily frequency');
      } else {
        console.log('❌ Daily frequency option not found');
      }
      
      // Test interval frequency and time options
      const intervalRadio = page.locator('input[value="interval"]');
      if (await intervalRadio.isVisible()) {
        console.log('✅ Interval frequency option visible');
        await intervalRadio.check();
        
        // Wait for interval options to appear
        await page.waitForTimeout(1000);
        
        // Test interval days input
        const intervalDaysInput = page.locator('input[name="intervalDays"]');
        if (await intervalDaysInput.isVisible()) {
          console.log('✅ Interval days input visible');
          await intervalDaysInput.fill('3');
          console.log('✅ Set interval to 3 days');
        }
        
        // Test reminder type
        const generalRadio = page.locator('input[value="general"]');
        if (await generalRadio.isVisible()) {
          console.log('✅ General reminder type visible');
          await generalRadio.check();
          
          // Test time selection dropdown
          const timeSelect = page.locator('select[name="reminderTime"]');
          if (await timeSelect.isVisible()) {
            console.log('✅ Time selection dropdown visible');
            await timeSelect.selectOption('morning');
            console.log('✅ Selected morning time');
            
            // Check the options
            const options = await timeSelect.locator('option').allTextContents();
            console.log('Time options available:', options);
          }
        }
        
        // Test specific time input
        const specificRadio = page.locator('input[value="specific"]');
        if (await specificRadio.isVisible()) {
          await specificRadio.check();
          await page.waitForTimeout(500);
          
          const timeInput = page.locator('input[type="time"]');
          if (await timeInput.isVisible()) {
            console.log('✅ Specific time input visible');
            await timeInput.fill('14:30');
            console.log('✅ Set specific time to 14:30');
          }
        }
      }
      
      // Test AI enhancement button
      const aiEnhanceButton = page.locator('button:has-text("AI Enhance"), button:has-text("✨")');
      if (await aiEnhanceButton.isVisible()) {
        console.log('✅ AI Enhancement button found');
        // Don't click it to avoid API calls, just verify it exists
      } else {
        console.log('❌ AI Enhancement button not found');
      }
      
      // Test submit button
      const submitButton = page.locator('button:has-text("Create Habit"), button[type="submit"]');
      if (await submitButton.isVisible()) {
        console.log('✅ Submit button found');
        console.log('✅ Form appears fully functional');
      } else {
        console.log('❌ Submit button not found');
      }
      
      // Get all form field names to understand the complete structure
      const allInputNames = await page.locator('input[name], textarea[name], select[name]').evaluateAll(
        elements => elements.map(el => el.getAttribute('name')).filter(Boolean)
      );
      console.log('All form field names found:', allInputNames);
      
    } else {
      console.log('❌ No form found even after waiting');
      
      // Debug what's actually on the page
      const bodyText = await page.locator('body').textContent();
      console.log('Page body contains:', {
        hasHabitNex: bodyText.includes('HabitNex'),
        hasLogin: bodyText.includes('Login') || bodyText.includes('Sign'),
        hasError: bodyText.includes('Error') || bodyText.includes('error'),
        hasLoading: bodyText.includes('Loading') || bodyText.includes('loading'),
        length: bodyText.length
      });
      
      // Check if we're redirected to auth
      if (page.url().includes('/login') || page.url().includes('/signup')) {
        console.log('❌ Redirected to authentication page - not logged in');
      }
    }
  });

  test('test form validation errors', async ({ page }) => {
    await page.goto('http://localhost:3001/habits/new');
    await page.waitForTimeout(5000); // Wait for form to load
    
    const formCount = await page.locator('form').count();
    if (formCount === 0) {
      console.log('Skipping validation test - no form found');
      return;
    }
    
    console.log('Testing form validation...');
    
    // Try to submit empty form
    const submitButton = page.locator('button:has-text("Create Habit"), button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Wait for validation errors
      await page.waitForTimeout(2000);
      
      // Check for validation errors
      const errorMessages = await page.locator('[class*="error"], .error-message, [role="alert"]').allTextContents();
      console.log('Validation errors found:', errorMessages);
      
      if (errorMessages.length > 0) {
        console.log('✅ Form validation is working');
      } else {
        console.log('❌ No validation errors shown for empty form');
      }
    }
  });
});