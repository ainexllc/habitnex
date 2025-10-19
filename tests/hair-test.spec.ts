import { test, expect } from '@playwright/test';

test.describe('Avatar Hair Issue Investigation', () => {
  test('should investigate why hair is not showing', async ({ page }) => {
    // Login and navigate
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('dinohorn9@gmail.com');
    await page.locator('input[type="password"]').fill('dinohorn');
    await page.locator('button[type="submit"]:has-text("Sign In")').click();
    await page.waitForURL(/.*\/?tab=overview.*/, { timeout: 10000 });
    
    await page.goto('/?tab=overview');
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
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-screenshots/hair-initial.png' });
    console.log('📸 Initial avatar screenshot taken');
    
    // Check hair probability slider - should be 100% by default
    const hairSlider = page.locator('input[type="range"]').first();
    const hairValue = await hairSlider.inputValue();
    console.log(`🔍 Hair probability slider value: ${hairValue}%`);
    
    // Make sure hair probability is 100%
    await hairSlider.fill('100');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-screenshots/hair-100-percent.png' });
    console.log('📸 Hair set to 100% probability');
    
    // Select a specific hair style
    const hairDropdown = page.locator('select');
    await hairDropdown.selectOption({ label: 'Long 05' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-screenshots/hair-long05-selected.png' });
    console.log('📸 Selected Long 05 hair style');
    
    // Select a hair color
    const brownHairButton = page.locator('button[title*="Brown"]').first();
    await brownHairButton.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-screenshots/hair-brown-selected.png' });
    console.log('📸 Selected brown hair color');
    
    // Try different hair styles
    const hairStyles = ['Short 01', 'Short 05', 'Long 10', 'Long 15'];
    for (const style of hairStyles) {
      console.log(`🔍 Testing hair style: ${style}`);
      await hairDropdown.selectOption({ label: style });
      await page.waitForTimeout(500);
      await page.screenshot({ path: `test-screenshots/hair-${style.replace(' ', '-').toLowerCase()}.png` });
    }
    
    // Click "New Avatar" button to generate fresh avatar
    console.log('🔍 Testing New Avatar with hair settings...');
    const newAvatarButton = page.locator('button:has-text("New Avatar")');
    await newAvatarButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/hair-new-avatar.png' });
    console.log('📸 New avatar generated');
    
    // Click "Regenerate" button
    console.log('🔍 Testing Regenerate button...');
    const regenerateButton = page.locator('button:has-text("Regenerate")');
    await regenerateButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/hair-regenerated.png' });
    console.log('📸 Avatar regenerated');
    
    // Check if SVG contains hair-related elements
    const svgContent = await avatarContainer.locator('svg').innerHTML();
    const hasHairPaths = svgContent.includes('hair') || svgContent.includes('Hair');
    console.log(`🔍 SVG contains hair-related content: ${hasHairPaths}`);
    
    // Log current form values for debugging
    const displayName = await page.locator('input[placeholder*="display name"]').inputValue();
    const selectedHairStyle = await hairDropdown.inputValue();
    const hairProbability = await hairSlider.inputValue();
    
    console.log('\n🔍 Current Form Values:');
    console.log(`  Display Name: ${displayName}`);
    console.log(`  Hair Style: ${selectedHairStyle}`);
    console.log(`  Hair Probability: ${hairProbability}%`);
    
    // Final comprehensive screenshot
    await page.screenshot({ path: 'test-screenshots/hair-final-state.png', fullPage: true });
    console.log('📸 Final comprehensive screenshot taken');
    
    console.log('\n❌ Hair Issue Investigation Complete');
    console.log('Check the screenshots to see if hair is rendering properly');
  });
});
