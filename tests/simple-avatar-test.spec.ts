import { test, expect } from '@playwright/test';

test.describe('Avatar Preview - Quick Test', () => {
  test('should verify avatar preview is working', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('dinohorn9@gmail.com');
    await page.locator('input[type="password"]').fill('dinohorn');
    await page.locator('button[type="submit"]:has-text("Sign In")').click();
    await page.waitForURL(/.*\/?tab=overview.*/, { timeout: 10000 });
    
    // Go to family dashboard
    await page.goto('/?tab=overview');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Click Members tab
    await page.locator('button:has-text("Members")').first().click();
    await page.waitForTimeout(1000);
    
    // Click edit pencil
    await page.locator('button:has(svg.lucide-pen), button:has(path[d*="M21.174 6.812"])').first().click();
    await page.waitForTimeout(1000);
    
    // Verify modal opened
    await expect(page.locator('text="Member Profile"')).toBeVisible();
    console.log('✅ Edit Member modal opened');
    
    // Verify avatar preview exists
    const avatarContainer = page.locator('.w-24.h-24.rounded-full.overflow-hidden');
    await expect(avatarContainer).toBeVisible();
    console.log('✅ Avatar preview container found');
    
    // Verify SVG is present
    const avatarSvg = avatarContainer.locator('svg');
    await expect(avatarSvg).toBeVisible();
    console.log('✅ Avatar SVG is visible');
    
    // Test skin color buttons exist and are clickable
    const skinColorButtons = page.locator('button[title*="Light"], button[title*="Medium"], button[title*="Dark"]');
    const skinButtonCount = await skinColorButtons.count();
    expect(skinButtonCount).toBeGreaterThan(0);
    console.log(`✅ Found ${skinButtonCount} skin color buttons`);
    
    // Test expression buttons exist
    const expressionButtons = page.locator('button:has-text("Happy"), button:has-text("Sad"), button:has-text("Neutral")');
    const expressionCount = await expressionButtons.count();
    expect(expressionCount).toBeGreaterThan(0);
    console.log(`✅ Found ${expressionCount} expression buttons`);
    
    // Test hair style dropdown exists
    const hairDropdown = page.locator('select');
    await expect(hairDropdown).toBeVisible();
    console.log('✅ Hair style dropdown found');
    
    // Test hair color buttons exist
    const hairColorButtons = page.locator('button[title*="Brown"], button[title*="Blonde"], button[title*="Black"]');
    const hairColorCount = await hairColorButtons.count();
    expect(hairColorCount).toBeGreaterThan(0);
    console.log(`✅ Found ${hairColorCount} hair color buttons`);
    
    // Test probability sliders exist
    const sliders = page.locator('input[type="range"]');
    const sliderCount = await sliders.count();
    expect(sliderCount).toBeGreaterThan(0);
    console.log(`✅ Found ${sliderCount} probability sliders`);
    
    // Test New Avatar button exists
    const newAvatarButton = page.locator('button:has-text("New Avatar")');
    await expect(newAvatarButton).toBeVisible();
    console.log('✅ New Avatar button found');
    
    // Test Regenerate button exists
    const regenerateButton = page.locator('button:has-text("Regenerate")');
    await expect(regenerateButton).toBeVisible();
    console.log('✅ Regenerate button found');
    
    // Quick interaction test - click one skin color button
    if (skinButtonCount > 1) {
      await skinColorButtons.nth(1).click();
      await page.waitForTimeout(500);
      console.log('✅ Successfully clicked skin color button');
    }
    
    // Quick interaction test - click New Avatar button
    await newAvatarButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Successfully clicked New Avatar button');
    
    // Final screenshot
    await page.screenshot({ path: 'test-screenshots/avatar-test-complete.png' });
    
    console.log('\n🎉 Avatar preview test completed successfully!');
    console.log('📋 Summary:');
    console.log('  - Modal opens: ✅');
    console.log('  - Avatar preview visible: ✅');
    console.log('  - Skin color options: ✅');
    console.log('  - Expression options: ✅');
    console.log('  - Hair style dropdown: ✅');
    console.log('  - Hair color options: ✅');
    console.log('  - Probability sliders: ✅');
    console.log('  - New Avatar button: ✅');
    console.log('  - Regenerate button: ✅');
    console.log('  - Basic interactions work: ✅');
  });
});
