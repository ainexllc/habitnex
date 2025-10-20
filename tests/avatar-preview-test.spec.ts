import { test, expect } from '@playwright/test';

test.describe('Avatar Preview Real-time Updates', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    
    // Fill in login credentials
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"]');
    const passwordInput = page.locator('input[type="password"], input[placeholder*="password"]');
    const loginButton = page.locator('button[type="submit"]:has-text("Sign In")');
    
    await emailInput.fill('dinohorn9@gmail.com');
    await passwordInput.fill('dinohorn');
    await loginButton.click();
    
    // Wait for login to complete and redirect
    await page.waitForURL(/.*\/workspace?tab=overview.*/, { timeout: 10000 });
    console.log('✅ Logged in successfully');
    
    // Navigate specifically to dashboard/family
    await page.goto('/workspace?tab=overview');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    console.log('✅ Navigated to dashboard/family');
  });

  test('should update avatar preview when options are changed', async ({ page }) => {
    console.log('🎯 Starting avatar preview test...');
    
    // Step 1: Click on Members tab
    console.log('📍 Looking for Members tab...');
    const membersTab = page.locator('button:has-text("Members"), [role="tab"]:has-text("Members")').first();
    await membersTab.click();
    await page.waitForTimeout(1500);
    console.log('✅ Clicked Members tab');
    
    // Step 2: Find a member card and click the edit pencil icon
    console.log('📍 Looking for member card with edit pencil...');
    // Look for the specific lucide-pen icon with the exact path
    const editPencil = page.locator('button:has(svg.lucide-pen), button:has(path[d*="M21.174 6.812"]), button:has(svg[class*="lucide-pen"])').first();
    
    if (!await editPencil.isVisible()) {
      console.log('❌ No edit pencil found, taking screenshot...');
      await page.screenshot({ path: 'test-screenshots/no-edit-pencil.png' });
      throw new Error('Edit pencil not found on member cards');
    }
    
    await editPencil.click();
    await page.waitForTimeout(1500);
    console.log('✅ Clicked edit pencil on member card');

    // Wait for modal to be fully loaded
    await page.waitForSelector('text="Member Profile"', { timeout: 5000 });
    console.log('✅ Modal opened with Member Profile title');
    
    // Locate the avatar container in the modal (DiceBearAvatar renders as div with SVG inside)
    const avatarContainer = page.locator('.w-24.h-24.rounded-full.overflow-hidden');
    const avatarSvg = avatarContainer.locator('svg').first();
    
    // Wait for avatar to be visible
    await expect(avatarContainer).toBeVisible();
    await expect(avatarSvg).toBeVisible();
    console.log('✅ Avatar preview is visible');

    // Get initial avatar SVG content (look for specific paths that identify the avatar)
    const initialSvgContent = await avatarSvg.innerHTML();
    console.log('📸 Initial avatar SVG content captured (length:', initialSvgContent.length, 'chars)');
    
    // Helper function to get a unique identifier from the SVG (using first few path elements)
    const getAvatarIdentifier = async () => {
      const paths = await avatarSvg.locator('path').all();
      if (paths.length > 0) {
        const firstPath = await paths[0].getAttribute('d');
        return firstPath?.substring(0, 50) || ''; // First 50 chars of first path as identifier
      }
      return '';
    };
    
    const initialIdentifier = await getAvatarIdentifier();
    console.log('📸 Initial avatar src captured');
    await page.screenshot({ path: 'test-screenshots/avatar-initial.png' });

    // Test 1: Change skin color
    console.log('\n🔄 Test 1: Changing skin color...');
    const darkSkinButton = page.locator('button[title="Dark"]').first();
    await darkSkinButton.click();
    await page.waitForTimeout(500);
    
    const identifierAfterSkinChange = await getAvatarIdentifier();
    expect(identifierAfterSkinChange).not.toBe(initialIdentifier);
    console.log('✅ Avatar updated after skin color change');
    await page.screenshot({ path: 'test-screenshots/avatar-skin-changed.png' });

    // Test 2: Change expression
    console.log('\n🔄 Test 2: Changing expression...');
    const sadExpression = page.locator('button:has-text("Sad")').first();
    await sadExpression.click();
    await page.waitForTimeout(500);
    
    const identifierAfterExpressionChange = await getAvatarIdentifier();
    expect(identifierAfterExpressionChange).not.toBe(identifierAfterSkinChange);
    console.log('✅ Avatar updated after expression change');
    await page.screenshot({ path: 'test-screenshots/avatar-expression-changed.png' });

    // Test 3: Change hair style
    console.log('\n🔄 Test 3: Changing hair style...');
    const hairStyleDropdown = page.locator('select').first();
    await hairStyleDropdown.selectOption({ index: 5 }); // Select a different hair style
    await page.waitForTimeout(500);
    
    const identifierAfterHairStyleChange = await getAvatarIdentifier();
    expect(identifierAfterHairStyleChange).not.toBe(identifierAfterExpressionChange);
    console.log('✅ Avatar updated after hair style change');
    await page.screenshot({ path: 'test-screenshots/avatar-hairstyle-changed.png' });

    // Test 4: Change hair color
    console.log('\n🔄 Test 4: Changing hair color...');
    const greenHairButton = page.locator('button[title="Green"]').first();
    await greenHairButton.click();
    await page.waitForTimeout(500);
    
    const identifierAfterHairColorChange = await getAvatarIdentifier();
    expect(identifierAfterHairColorChange).not.toBe(identifierAfterHairStyleChange);
    console.log('✅ Avatar updated after hair color change');
    await page.screenshot({ path: 'test-screenshots/avatar-haircolor-changed.png' });

    // Test 5: Click "New Avatar" button
    console.log('\n🔄 Test 5: Testing "New Avatar" button...');
    const newAvatarButton = page.locator('button:has-text("New Avatar")');
    await newAvatarButton.click();
    await page.waitForTimeout(1000);
    
    const identifierAfterNewAvatar = await getAvatarIdentifier();
    expect(identifierAfterNewAvatar).not.toBe(identifierAfterHairColorChange);
    console.log('✅ Avatar updated after "New Avatar" click');
    await page.screenshot({ path: 'test-screenshots/avatar-new-avatar.png' });

    // Test 6: Click "Regenerate" button
    console.log('\n🔄 Test 6: Testing "Regenerate" button...');
    const regenerateButton = page.locator('button:has-text("Regenerate")');
    await regenerateButton.click();
    await page.waitForTimeout(1000);
    
    const identifierAfterRegenerate = await getAvatarIdentifier();
    expect(identifierAfterRegenerate).not.toBe(identifierAfterNewAvatar);
    console.log('✅ Avatar updated after "Regenerate" click');
    await page.screenshot({ path: 'test-screenshots/avatar-regenerated.png' });

    // Test 7: Change probability slider
    console.log('\n🔄 Test 7: Testing probability sliders...');
    const hairSlider = page.locator('input[type="range"]').first();
    await hairSlider.fill('0'); // Set hair probability to 0%
    await page.waitForTimeout(500);
    
    const identifierAfterSliderChange = await getAvatarIdentifier();
    expect(identifierAfterSliderChange).not.toBe(identifierAfterRegenerate);
    console.log('✅ Avatar updated after slider change');
    await page.screenshot({ path: 'test-screenshots/avatar-slider-changed.png' });

    // Final verification
    console.log('\n✨ All avatar preview tests passed!');
    console.log('📊 Summary:');
    console.log('  - Skin color change: ✅');
    console.log('  - Expression change: ✅');
    console.log('  - Hair style change: ✅');
    console.log('  - Hair color change: ✅');
    console.log('  - New Avatar button: ✅');
    console.log('  - Regenerate button: ✅');
    console.log('  - Probability slider: ✅');
    
    await page.screenshot({ path: 'test-screenshots/avatar-test-complete.png' });
  });

  test('should verify avatar seed changes on each generation', async ({ page }) => {
    console.log('🎯 Testing avatar seed generation...');
    
    // Step 1: Click on Members tab
    console.log('📍 Looking for Members tab...');
    const membersTab = page.locator('button:has-text("Members"), [role="tab"]:has-text("Members")').first();
    await membersTab.click();
    await page.waitForTimeout(1500);
    console.log('✅ Clicked Members tab');
    
    // Step 2: Find and click edit pencil
    console.log('📍 Looking for edit pencil on member card...');
    const editPencil = page.locator('button:has(svg.lucide-pen), button:has(path[d*="M21.174 6.812"]), button:has(svg[class*="lucide-pen"])').first();
    
    if (!await editPencil.isVisible()) {
      console.log('❌ No edit pencil found');
      throw new Error('Edit pencil not found');
    }
    
    await editPencil.click();
    await page.waitForTimeout(1500);
    console.log('✅ Clicked edit pencil');

    // Wait for modal
    await page.waitForSelector('text="Member Profile"', { timeout: 5000 });
    
    const avatarContainer = page.locator('.w-24.h-24.rounded-full.overflow-hidden');
    const avatarSvg = avatarContainer.locator('svg').first();
    
    // Helper function to get avatar identifier
    const getAvatarIdentifier = async () => {
      const paths = await avatarSvg.locator('path').all();
      if (paths.length > 0) {
        const firstPath = await paths[0].getAttribute('d');
        return firstPath?.substring(0, 50) || '';
      }
      return '';
    };
    
    const seeds = new Set<string>();

    // Click "New Avatar" multiple times and collect unique identifiers
    const newAvatarButton = page.locator('button:has-text("New Avatar")');
    
    for (let i = 0; i < 5; i++) {
      await newAvatarButton.click();
      await page.waitForTimeout(800);
      
      const identifier = await getAvatarIdentifier();
      if (identifier) {
        seeds.add(identifier);
        console.log(`  Avatar ${i + 1}: Generated unique identifier`);
      }
    }

    // Verify all seeds are unique
    expect(seeds.size).toBe(5);
    console.log('✅ All 5 avatar generations produced unique identifiers');

    // Test Regenerate button also produces unique seeds
    const regenerateButton = page.locator('button:has-text("Regenerate")');
    for (let i = 0; i < 3; i++) {
      await regenerateButton.click();
      await page.waitForTimeout(800);
      
      const identifier = await getAvatarIdentifier();
      if (identifier) {
        seeds.add(identifier);
      }
    }

    expect(seeds.size).toBe(8); // 5 from New Avatar + 3 from Regenerate
    console.log('✅ Regenerate button also produces unique identifiers');
  });
});
