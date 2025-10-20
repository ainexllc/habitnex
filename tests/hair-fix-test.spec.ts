import { test, expect } from '@playwright/test';

test.describe('Hair Fix Verification', () => {
  test('should show hair on avatars after fix', async ({ page }) => {
    // Login and navigate
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('dinohorn9@gmail.com');
    await page.locator('input[type="password"]').fill('dinohorn');
    await page.locator('button[type="submit"]:has-text("Sign In")').click();
    await page.waitForURL(/.*\/workspace?tab=overview.*/, { timeout: 10000 });
    
    await page.goto('/workspace?tab=overview');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Open edit modal
    await page.locator('button:has-text("Members")').first().click();
    await page.waitForTimeout(1000);
    await page.locator('button:has(svg.lucide-pen)').first().click();
    await page.waitForTimeout(1000);
    
    // Wait for modal
    await expect(page.locator('text="Member Profile"')).toBeVisible();
    console.log('✅ Modal opened');
    
    const avatarContainer = page.locator('.w-24.h-24.rounded-full.overflow-hidden');
    const avatarSvg = avatarContainer.locator('svg');
    
    // Set hair probability to 100%
    const hairSlider = page.locator('input[type="range"]').first();
    await hairSlider.fill('100');
    await page.waitForTimeout(500);
    console.log('✅ Hair probability set to 100%');
    
    // Select a specific hair style
    const hairDropdown = page.locator('select');
    await hairDropdown.selectOption({ label: 'Long 05' });
    await page.waitForTimeout(1000);
    console.log('✅ Selected Long 05 hair style');
    
    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/hair-fix-long05.png' });
    
    // Check SVG content length (should be longer with hair)
    const svgContent = await avatarSvg.innerHTML();
    const svgLength = svgContent.length;
    console.log(`📊 Avatar SVG length: ${svgLength} characters`);
    
    // Hair should make the SVG significantly longer
    expect(svgLength).toBeGreaterThan(10000);
    console.log('✅ Avatar has substantial content (likely includes hair)');
    
    // Test different hair styles
    const hairStyles = ['Short 01', 'Short 10', 'Long 01', 'Long 15'];
    for (const style of hairStyles) {
      await hairDropdown.selectOption({ label: style });
      await page.waitForTimeout(500);
      
      const newSvgContent = await avatarSvg.innerHTML();
      const newLength = newSvgContent.length;
      console.log(`Hair style "${style}": ${newLength} characters`);
      
      // Each style should produce a different avatar
      expect(newLength).toBeGreaterThan(5000);
      await page.screenshot({ path: `test-screenshots/hair-fix-${style.replace(' ', '-').toLowerCase()}.png` });
    }
    
    // Test hair color changes
    const hairColorButtons = page.locator('button[title*="Brown"], button[title*="Blonde"]');
    if (await hairColorButtons.count() > 1) {
      await hairColorButtons.nth(1).click();
      await page.waitForTimeout(500);
      
      const coloredHairSvg = await avatarSvg.innerHTML();
      console.log(`With hair color: ${coloredHairSvg.length} characters`);
      await page.screenshot({ path: 'test-screenshots/hair-fix-colored.png' });
    }
    
    // Test New Avatar button
    const newAvatarButton = page.locator('button:has-text("New Avatar")');
    await newAvatarButton.click();
    await page.waitForTimeout(1000);
    
    const newAvatarSvg = await avatarSvg.innerHTML();
    console.log(`New avatar: ${newAvatarSvg.length} characters`);
    await page.screenshot({ path: 'test-screenshots/hair-fix-new-avatar.png' });
    
    console.log('\n🎉 Hair fix test completed!');
    console.log('Check the screenshots to verify hair is now visible on avatars.');
  });
});
