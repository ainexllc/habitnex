import { test, expect } from '@playwright/test';

test.describe('Comprehensive Habit Form Update Testing', () => {
  test('comprehensive habit form and update functionality test', async ({ page }) => {
    console.log('🚀 Starting comprehensive habit form test...');
    
    // Navigate to the app
    await page.goto('http://localhost:3001');
    console.log('✅ Navigated to app:', page.url());
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-screenshots/01-home-page.png', fullPage: true });
    
    // Check if we need to login
    if (page.url().includes('/login')) {
      console.log('⚠️ Not authenticated - need to login');
      await page.screenshot({ path: 'test-screenshots/02-login-required.png', fullPage: true });
      
      // For now, let's try to navigate directly to dashboard to see if we can bypass
      await page.goto('http://localhost:3001/workspace');
      await page.waitForLoadState('domcontentloaded');
      console.log('Dashboard URL:', page.url());
      
      if (page.url().includes('/login')) {
        console.log('❌ Authentication required - cannot proceed with automated test');
        return;
      }
    }
    
    // Navigate to dashboard if not already there
    if (!page.url().includes('/workspace')) {
      await page.goto('http://localhost:3001/workspace');
      await page.waitForLoadState('domcontentloaded');
    }
    
    console.log('✅ On dashboard:', page.url());
    await page.screenshot({ path: 'test-screenshots/03-dashboard.png', fullPage: true });
    
    // Look for existing habits
    console.log('🔍 Looking for existing habits...');
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // Check for existing habits
    const habitCards = await page.locator('[data-testid="habit-card"], .habit-card, [class*="habit"], [class*="Card"]').count();
    console.log(`Found ${habitCards} potential habit elements`);
    
    // Look for edit buttons
    const editButtons = await page.locator('button:has([data-testid="edit-icon"]), button:has(svg[class*="edit"]), button[title*="edit"], button[aria-label*="edit"]').count();
    console.log(`Found ${editButtons} potential edit buttons`);
    
    // If we have habits, try to edit one
    if (editButtons > 0) {
      console.log('🎯 Testing existing habit edit functionality...');
      
      // Click the first edit button
      const firstEditButton = page.locator('button:has([data-testid="edit-icon"]), button:has(svg[class*="edit"]), button[title*="edit"], button[aria-label*="edit"]').first();
      
      console.log('📝 Clicking edit button...');
      await firstEditButton.click();
      
      // Wait for modal to appear
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-screenshots/04-after-edit-click.png', fullPage: true });
      
      // Check if edit modal appeared
      const modalVisible = await page.locator('[role="dialog"], .modal, [class*="modal"], [class*="Modal"]').isVisible().catch(() => false);
      console.log('Modal visible:', modalVisible);
      
      if (modalVisible) {
        console.log('✅ Edit modal opened successfully');
        
        // Check for form elements in modal
        const formInModal = await page.locator('[role="dialog"] form, .modal form, [class*="modal"] form').count();
        const inputsInModal = await page.locator('[role="dialog"] input, .modal input, [class*="modal"] input').count();
        
        console.log(`Form in modal: ${formInModal}, Inputs in modal: ${inputsInModal}`);
        
        if (formInModal > 0 && inputsInModal > 0) {
          console.log('🧪 Testing form interaction in modal...');
          
          // Try to interact with the name field
          const nameInput = page.locator('[role="dialog"] input[name="name"], .modal input[name="name"], [class*="modal"] input[name="name"]').first();
          
          if (await nameInput.isVisible()) {
            const originalValue = await nameInput.inputValue();
            console.log('Original habit name:', originalValue);
            
            // Clear and enter new value
            await nameInput.clear();
            await nameInput.fill('Updated Test Habit Name');
            console.log('✅ Updated habit name field');
            
            // Look for submit/update button
            const updateButtons = await page.locator('[role="dialog"] button:has-text("Update"), [role="dialog"] button:has-text("Save"), .modal button:has-text("Update"), .modal button:has-text("Save")').count();
            console.log(`Found ${updateButtons} update buttons in modal`);
            
            if (updateButtons > 0) {
              const updateButton = page.locator('[role="dialog"] button:has-text("Update"), [role="dialog"] button:has-text("Save"), .modal button:has-text("Update"), .modal button:has-text("Save")').first();
              
              console.log('🎯 Testing update button click...');
              
              // Get button text and attributes before clicking
              const buttonText = await updateButton.textContent();
              const isDisabled = await updateButton.isDisabled();
              const isVisible = await updateButton.isVisible();
              
              console.log(`Update button: "${buttonText}", Disabled: ${isDisabled}, Visible: ${isVisible}`);
              
              if (!isDisabled && isVisible) {
                // Click the update button
                await updateButton.click();
                console.log('✅ Clicked update button');
                
                // Wait for any response
                await page.waitForTimeout(3000);
                
                // Check if modal is still visible (should close if update worked)
                const modalStillVisible = await page.locator('[role="dialog"], .modal, [class*="modal"]').isVisible().catch(() => false);
                console.log('Modal still visible after update:', modalStillVisible);
                
                if (!modalStillVisible) {
                  console.log('✅ Modal closed - update might have worked');
                  
                  // Check if the habit name was updated on the page
                  await page.waitForTimeout(2000);
                  const updatedHabitVisible = await page.locator('text=Updated Test Habit Name').isVisible().catch(() => false);
                  console.log('Updated habit name visible on page:', updatedHabitVisible);
                  
                  if (updatedHabitVisible) {
                    console.log('🎉 SUCCESS: Update functionality working correctly!');
                  } else {
                    console.log('⚠️ Modal closed but habit name not updated on page');
                  }
                } else {
                  console.log('❌ ISSUE: Modal still visible after clicking update button');
                  console.log('This suggests the update button is not working properly');
                  
                  // Check for error messages
                  const errorMessages = await page.locator('[class*="error"], [role="alert"], .error-message').allTextContents();
                  if (errorMessages.length > 0) {
                    console.log('Error messages found:', errorMessages);
                  }
                  
                  // Check browser console for errors
                  page.on('console', msg => {
                    if (msg.type() === 'error') {
                      console.log('Browser console error:', msg.text());
                    }
                  });
                  
                  page.on('pageerror', error => {
                    console.log('Page error:', error.message);
                  });
                }
              } else {
                console.log('❌ Update button is disabled or not visible');
              }
            } else {
              console.log('❌ No update button found in modal');
            }
          } else {
            console.log('❌ No name input found in modal');
          }
        } else {
          console.log('❌ No form or inputs found in modal');
        }
      } else {
        console.log('❌ Edit modal did not open');
        
        // Let's investigate what happened when we clicked edit
        const allModals = await page.locator('[role="dialog"], .modal, [class*="modal"], [class*="Modal"]').count();
        console.log('Total modal elements on page:', allModals);
        
        // Check if there are any hidden modals
        const hiddenModals = await page.locator('[role="dialog"][style*="display: none"], .modal[style*="display: none"]').count();
        console.log('Hidden modals:', hiddenModals);
        
        // Check for overlay elements
        const overlays = await page.locator('[class*="overlay"], [class*="backdrop"], [style*="z-index"]').count();
        console.log('Overlay elements:', overlays);
      }
    } else {
      console.log('🆕 No existing habits found. Creating a new habit first...');
      
      // Try to create a new habit first
      const addHabitButtons = await page.locator('a:has-text("Add Habit"), button:has-text("Add Habit"), a:has-text("Create"), button:has-text("Create"), [href*="habits/new"]').count();
      console.log(`Found ${addHabitButtons} add habit buttons`);
      
      if (addHabitButtons > 0) {
        const addButton = page.locator('a:has-text("Add Habit"), button:has-text("Add Habit"), a:has-text("Create"), button:has-text("Create"), [href*="habits/new"]').first();
        await addButton.click();
        
        await page.waitForLoadState('domcontentloaded');
        console.log('After clicking add habit:', page.url());
        
        // Wait for form to load
        await page.waitForTimeout(5000);
        
        const formCount = await page.locator('form').count();
        console.log('Forms found on new habit page:', formCount);
        
        if (formCount > 0) {
          // Create a test habit
          const nameInput = page.locator('input[name="name"]');
          if (await nameInput.isVisible()) {
            await nameInput.fill('Test Habit for Update Testing');
            
            // Select a color
            const colorButtons = await page.locator('button[style*="background-color"]').count();
            if (colorButtons > 0) {
              await page.locator('button[style*="background-color"]').first().click();
            }
            
            // Submit
            const submitButton = page.locator('button:has-text("Create Habit")');
            if (await submitButton.isVisible()) {
              await submitButton.click();
              await page.waitForLoadState('domcontentloaded');
              
              console.log('✅ Created test habit, now testing edit functionality...');
              
              // Now go back to dashboard and try to edit
              await page.goto('http://localhost:3001/workspace');
              await page.waitForTimeout(3000);
              
              // Try the edit test again
              const newEditButtons = await page.locator('button:has(svg), button[title*="edit"], button[aria-label*="edit"]').count();
              console.log(`Found ${newEditButtons} edit buttons after creating habit`);
            }
          }
        }
      }
    }
    
    // Final screenshot
    await page.screenshot({ path: 'test-screenshots/05-final-state.png', fullPage: true });
    
    console.log('🏁 Comprehensive habit form test completed');
  });
  
  test('check page console errors and network requests', async ({ page }) => {
    const consoleErrors = [];
    const networkErrors = [];
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      consoleErrors.push(`Page error: ${error.message}`);
    });
    
    // Capture failed network requests
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });
    
    await page.goto('http://localhost:3001/workspace');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
    
    console.log('Console errors found:', consoleErrors);
    console.log('Network errors found:', networkErrors);
    
    if (consoleErrors.length > 0 || networkErrors.length > 0) {
      console.log('❌ Issues detected that might affect update functionality');
    } else {
      console.log('✅ No obvious console or network errors detected');
    }
  });
});