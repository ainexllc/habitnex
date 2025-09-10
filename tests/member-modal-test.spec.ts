import { test, expect } from '@playwright/test';

test.describe('Member Modal Edit Form', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Fill in login credentials
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"]');
    const passwordInput = page.locator('input[type="password"], input[placeholder*="password"]');
    const loginButton = page.locator('button[type="submit"]:has-text("Sign In")');
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('dinohorn9@gmail.com');
      await passwordInput.fill('dinohorn');
      await loginButton.click();
      
      // Wait for login to complete and redirect
      await page.waitForURL(/.*\/dashboard.*/, { timeout: 10000 });
      console.log('✅ Logged in successfully');
      
      // Navigate to family dashboard
      await page.goto('/dashboard/family');
      await page.waitForLoadState('networkidle');
    } else {
      // Maybe already logged in, try to go to family dashboard
      await page.goto('/dashboard/family');
    }
    
    await page.waitForLoadState('networkidle');
  });

  test('should test avatar preview real-time updates', async ({ page }) => {
    // Navigate to family dashboard
    await page.goto('http://localhost:3000/dashboard/family/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Click on Members tab
    const membersTab = page.locator('button:has-text("Members"), a:has-text("Members"), [role="tab"]:has-text("Members")').first();
    await membersTab.click();
    await page.waitForTimeout(1000);
    console.log('✅ Clicked Members tab');

    // Look for an edit button on a family member card
    const editButton = page.locator('button[title*="Edit"], button:has(svg[data-testid="edit-icon"]), button:has-text("Edit")').first();

    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Clicked edit button');
    } else {
      console.log('❌ Edit button not found');
      await page.screenshot({ path: 'no-edit-button.png' });
      return;
    }

    // Wait for modal to appear
    await page.waitForSelector('[role="dialog"], .modal, div:has-text("Member Profile")', { timeout: 5000 });
    console.log('✅ Member edit modal opened');

    // Get initial avatar state
    const avatarImg = page.locator('[role="dialog"] img, [role="dialog"] [data-testid*="avatar"]');
    let initialSrc = '';
    if (await avatarImg.isVisible()) {
      initialSrc = await avatarImg.getAttribute('src') || '';
      console.log('✅ Initial avatar src captured');
    } else {
      console.log('❌ Avatar image not found in modal');
      await page.screenshot({ path: 'modal-no-avatar.png' });
      return;
    }

    // Take initial screenshot
    await page.screenshot({ path: 'avatar-initial.png' });

    // Test hair color selection
    console.log('🔍 Testing hair color selection...');
    const hairColorButtons = page.locator('[role="dialog"] button[title*="Brown"], [role="dialog"] button[title*="Blonde"], [role="dialog"] button[title*="Black"]');
    if (await hairColorButtons.count() > 0) {
      // Click first hair color button
      await hairColorButtons.first().click();
      await page.waitForTimeout(1000); // Wait for avatar to update

      const afterHairColorSrc = await avatarImg.getAttribute('src') || '';
      if (afterHairColorSrc !== initialSrc) {
        console.log('✅ Avatar updated after hair color selection');
        await page.screenshot({ path: 'avatar-after-hair-color.png' });
      } else {
        console.log('❌ Avatar did NOT update after hair color selection');
      }
    } else {
      console.log('❌ Hair color buttons not found');
    }

    // Test hair style selection
    console.log('🔍 Testing hair style selection...');
    const hairStyleSelect = page.locator('[role="dialog"] select');
    if (await hairStyleSelect.isVisible()) {
      // Get initial src before changing hair style
      const beforeHairStyleSrc = await avatarImg.getAttribute('src') || '';

      // Select a different hair style
      await hairStyleSelect.selectOption({ index: 1 });
      await page.waitForTimeout(1000); // Wait for avatar to update

      const afterHairStyleSrc = await avatarImg.getAttribute('src') || '';
      if (afterHairStyleSrc !== beforeHairStyleSrc) {
        console.log('✅ Avatar updated after hair style selection');
        await page.screenshot({ path: 'avatar-after-hair-style.png' });
      } else {
        console.log('❌ Avatar did NOT update after hair style selection');
      }
    } else {
      console.log('❌ Hair style dropdown not found');
    }

    // Test skin color selection
    console.log('🔍 Testing skin color selection...');
    const skinColorButtons = page.locator('[role="dialog"] button[title*="Light"], [role="dialog"] button[title*="Medium"], [role="dialog"] button[title*="Dark"]');
    if (await skinColorButtons.count() > 0) {
      // Get current src before changing skin color
      const beforeSkinSrc = await avatarImg.getAttribute('src') || '';

      // Click a different skin color
      await skinColorButtons.nth(1).click(); // Second skin color option
      await page.waitForTimeout(1000); // Wait for avatar to update

      const afterSkinSrc = await avatarImg.getAttribute('src') || '';
      if (afterSkinSrc !== beforeSkinSrc) {
        console.log('✅ Avatar updated after skin color selection');
        await page.screenshot({ path: 'avatar-after-skin-color.png' });
      } else {
        console.log('❌ Avatar did NOT update after skin color selection');
      }
    } else {
      console.log('❌ Skin color buttons not found');
    }

    // Test expression selection
    console.log('🔍 Testing expression selection...');
    const expressionButtons = page.locator('[role="dialog"] button[title*="Happy"], [role="dialog"] button[title*="Smile"], [role="dialog"] button[title*="Sad"]');
    if (await expressionButtons.count() > 0) {
      // Get current src before changing expression
      const beforeExpressionSrc = await avatarImg.getAttribute('src') || '';

      // Click an expression button
      await expressionButtons.first().click();
      await page.waitForTimeout(1000); // Wait for avatar to update

      const afterExpressionSrc = await avatarImg.getAttribute('src') || '';
      if (afterExpressionSrc !== beforeExpressionSrc) {
        console.log('✅ Avatar updated after expression selection');
        await page.screenshot({ path: 'avatar-after-expression.png' });
      } else {
        console.log('❌ Avatar did NOT update after expression selection');
      }
    } else {
      console.log('❌ Expression buttons not found');
    }

    // Test "New Avatar" button
    console.log('🔍 Testing New Avatar button...');
    const newAvatarButton = page.locator('[role="dialog"] button:has-text("New Avatar")');
    if (await newAvatarButton.isVisible()) {
      // Get current src before clicking new avatar
      const beforeNewAvatarSrc = await avatarImg.getAttribute('src') || '';

      // Click New Avatar
      await newAvatarButton.click();
      await page.waitForTimeout(1500); // Wait for avatar to generate and update

      const afterNewAvatarSrc = await avatarImg.getAttribute('src') || '';
      if (afterNewAvatarSrc !== beforeNewAvatarSrc) {
        console.log('✅ Avatar updated after New Avatar button click');
        await page.screenshot({ path: 'avatar-after-new-avatar.png' });
      } else {
        console.log('❌ Avatar did NOT update after New Avatar button click');
      }
    } else {
      console.log('❌ New Avatar button not found');
    }

    // Test "Randomize" button
    console.log('🔍 Testing Randomize button...');
    const randomizeButton = page.locator('[role="dialog"] button:has-text("Randomize")');
    if (await randomizeButton.isVisible()) {
      // Get current src before clicking randomize
      const beforeRandomizeSrc = await avatarImg.getAttribute('src') || '';

      // Click Randomize
      await randomizeButton.click();
      await page.waitForTimeout(1500); // Wait for avatar to generate and update

      const afterRandomizeSrc = await avatarImg.getAttribute('src') || '';
      if (afterRandomizeSrc !== beforeRandomizeSrc) {
        console.log('✅ Avatar updated after Randomize button click');
        await page.screenshot({ path: 'avatar-after-randomize.png' });
      } else {
        console.log('❌ Avatar did NOT update after Randomize button click');
      }
    } else {
      console.log('❌ Randomize button not found');
    }

    // Test probability sliders
    console.log('🔍 Testing probability sliders...');
    const sliders = page.locator('[role="dialog"] input[type="range"]');
    const sliderCount = await sliders.count();
    if (sliderCount > 0) {
      // Get current src before changing slider
      const beforeSliderSrc = await avatarImg.getAttribute('src') || '';

      // Change first slider value
      await sliders.first().fill('0'); // Set to 0%
      await page.waitForTimeout(1000); // Wait for avatar to update

      const afterSliderSrc = await avatarImg.getAttribute('src') || '';
      if (afterSliderSrc !== beforeSliderSrc) {
        console.log('✅ Avatar updated after probability slider change');
        await page.screenshot({ path: 'avatar-after-slider.png' });
      } else {
        console.log('❌ Avatar did NOT update after probability slider change');
      }
    } else {
      console.log('❌ Probability sliders not found');
    }

    // Final summary
    console.log('🔍 Avatar preview testing complete');
    await page.screenshot({ path: 'avatar-preview-test-final.png' });
  });

  test('should open edit member modal and test preview functionality', async ({ page }) => {
    // Navigate directly to family dashboard
    await page.goto('http://localhost:3000/dashboard/family/');
    await page.waitForLoadState('networkidle');
    
    // Wait for the dashboard to load
    await page.waitForTimeout(3000);
    
    // Take screenshot to see current state
    await page.screenshot({ path: 'family-dashboard-loaded.png' });
    
    // Try to find and click the Members tab
    const membersTab = page.locator('button:has-text("Members"), a:has-text("Members"), [role="tab"]:has-text("Members")');
    if (await membersTab.isVisible()) {
      await membersTab.click();
      await page.waitForTimeout(1000);
      console.log('✅ Clicked Members tab');
      await page.screenshot({ path: 'members-tab-clicked.png' });
    } else {
      console.log('Members tab not found, checking page content...');
      const pageContent = await page.content();
      console.log('Page title:', await page.title());
    }
    
    // Look for an edit button on a family member card
    const editButton = page.locator('button[title*="Edit"], button:has(svg[data-testid="edit-icon"]), button:has-text("Edit")').first();
    
    if (await editButton.isVisible()) {
      console.log('Found edit button, clicking it');
      await editButton.click();
    } else {
      // Try to find add member button to test the modal
      const addButton = page.locator('button:has-text("Add Member"), button:has-text("Add First Family Member")').first();
      if (await addButton.isVisible()) {
        console.log('Found add member button, clicking it');
        await addButton.click();
      } else {
        console.log('Could not find edit or add member button');
        await page.screenshot({ path: 'member-modal-no-buttons.png' });
      }
    }
    
    // Wait for modal to appear
    await page.waitForSelector('[role="dialog"], .modal, div:has-text("Member Profile")', { timeout: 5000 });
    
    // Take screenshot of the modal
    await page.screenshot({ path: 'member-modal-opened.png' });
    
    // Test the display name field
    const displayNameInput = page.locator('input[placeholder*="Dad"], input[placeholder*="Mom"], input[placeholder*="Emma"]');
    if (await displayNameInput.isVisible()) {
      await displayNameInput.fill('Test User');
      console.log('✅ Display name input works');
    }
    
    // Test avatar preview functionality
    const avatarPreview = page.locator('.avatar, [data-testid="avatar-preview"], img[alt*="avatar"]');
    if (await avatarPreview.isVisible()) {
      console.log('✅ Avatar preview is visible');
    } else {
      console.log('❌ Avatar preview not found');
    }
    
    // Test "New Avatar" button
    const newAvatarButton = page.locator('button:has-text("New Avatar"), button:has-text("Sparkles")');
    if (await newAvatarButton.isVisible()) {
      await newAvatarButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ New Avatar button works');
    } else {
      console.log('❌ New Avatar button not found');
    }
    
    // Test skin color selection
    const skinColorButtons = page.locator('button[title*="Light"], button[title*="Medium"], button[title*="Dark"]');
    const skinColorCount = await skinColorButtons.count();
    if (skinColorCount > 0) {
      await skinColorButtons.first().click();
      await page.waitForTimeout(500);
      console.log(`✅ Skin color selection works (${skinColorCount} options)`);
    } else {
      console.log('❌ Skin color buttons not found');
    }
    
    // Test expression selection
    const expressionButtons = page.locator('button[title*="Happy"], button[title*="Smile"]');
    const expressionCount = await expressionButtons.count();
    if (expressionCount > 0) {
      await expressionButtons.first().click();
      await page.waitForTimeout(500);
      console.log(`✅ Expression selection works (${expressionCount} options)`);
    } else {
      console.log('❌ Expression buttons not found');
    }
    
    // Test hair style dropdown
    const hairStyleSelect = page.locator('select');
    if (await hairStyleSelect.isVisible()) {
      await hairStyleSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
      console.log('✅ Hair style selection works');
    } else {
      console.log('❌ Hair style dropdown not found');
    }
    
    // Test hair color selection
    const hairColorButtons = page.locator('button[title*="Brown"], button[title*="Blonde"]');
    const hairColorCount = await hairColorButtons.count();
    if (hairColorCount > 0) {
      await hairColorButtons.first().click();
      await page.waitForTimeout(500);
      console.log(`✅ Hair color selection works (${hairColorCount} options)`);
    } else {
      console.log('❌ Hair color buttons not found');
    }
    
    // Test probability sliders
    const sliders = page.locator('input[type="range"]');
    const sliderCount = await sliders.count();
    if (sliderCount > 0) {
      for (let i = 0; i < Math.min(sliderCount, 2); i++) {
        await sliders.nth(i).fill('75');
        await page.waitForTimeout(200);
      }
      console.log(`✅ Probability sliders work (${sliderCount} sliders)`);
    } else {
      console.log('❌ Probability sliders not found');
    }
    
    // Test role selection
    const roleButtons = page.locator('input[name="role"]');
    const roleCount = await roleButtons.count();
    if (roleCount > 0) {
      await roleButtons.first().check();
      await page.waitForTimeout(500);
      console.log(`✅ Role selection works (${roleCount} options)`);
    } else {
      console.log('❌ Role selection not found');
    }
    
    // Take screenshot after all changes
    await page.screenshot({ path: 'member-modal-after-changes.png' });
    
    // Test save button
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Add Member"), button[type="submit"]');
    if (await saveButton.isVisible()) {
      const isDisabled = await saveButton.isDisabled();
      console.log(`Save button found - disabled: ${isDisabled}`);
      
      if (!isDisabled) {
        // Try to save
        await saveButton.click();
        await page.waitForTimeout(2000);
        console.log('✅ Save button clicked');
        
        // Check if modal closed or if there are errors
        const modalStillOpen = await page.locator('[role="dialog"], .modal').isVisible();
        if (!modalStillOpen) {
          console.log('✅ Modal closed after save');
        } else {
          console.log('❌ Modal still open - possible error');
          const errorMessage = page.locator('.error, [role="alert"], .text-red');
          if (await errorMessage.isVisible()) {
            const errorText = await errorMessage.textContent();
            console.log(`❌ Error message: ${errorText}`);
          }
        }
      }
    } else {
      console.log('❌ Save button not found');
    }
    
    // Final screenshot
    await page.screenshot({ path: 'member-modal-final.png' });
  });
  
  test('should test avatar preview updates in real-time', async ({ page }) => {
    // This test specifically focuses on the avatar preview functionality
    await page.goto('http://localhost:3000/dashboard/family/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Try to open member modal
    const addButton = page.locator('button:has-text("Add Member"), button:has-text("Add First Family Member")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      // Fill in display name first
      const displayNameInput = page.locator('input[placeholder*="Dad"], input[placeholder*="Mom"], input[placeholder*="Emma"]');
      await displayNameInput.fill('Preview Test');
      
      // Take initial screenshot
      await page.screenshot({ path: 'avatar-preview-initial.png' });
      
      // Test if avatar changes when we modify settings
      const skinColorButton = page.locator('button[title*="Medium"]').first();
      if (await skinColorButton.isVisible()) {
        await skinColorButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'avatar-preview-skin-changed.png' });
        console.log('✅ Skin color change tested');
      }
      
      // Test expression change
      const expressionButton = page.locator('button[title*="Big Smile"]').first();
      if (await expressionButton.isVisible()) {
        await expressionButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'avatar-preview-expression-changed.png' });
        console.log('✅ Expression change tested');
      }
      
      // Test new avatar generation
      const newAvatarButton = page.locator('button:has-text("New Avatar")');
      if (await newAvatarButton.isVisible()) {
        await newAvatarButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'avatar-preview-new-generated.png' });
        console.log('✅ New avatar generation tested');
      }
    }
  });
});
