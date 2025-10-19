import { test, expect } from '@playwright/test';

test.describe('Family Dashboard Task Status Check', () => {
  test('Check if tasks are showing as fresh (not completed)', async ({ page }) => {
    // Navigate to the family dashboard
    await page.goto('http://localhost:3000/?tab=overview', {
      waitUntil: 'networkidle'
    });

    // Wait for the page to fully load
    await page.waitForTimeout(3000);

    // Take a screenshot of the current state
    await page.screenshot({ 
      path: 'tests/screenshots/family-dashboard-current.png',
      fullPage: true 
    });

    // Check for member zones
    const memberZones = await page.locator('[class*="FamilyMemberZone"]').count();
    console.log(`Found ${memberZones} member zones`);

    // Get all habit items
    const habitItems = await page.locator('[class*="rounded-lg"][class*="transition-all"]').all();
    console.log(`Found ${habitItems.length} total habit items`);

    // Check completion status of habits
    let completedCount = 0;
    let freshCount = 0;
    let failedCount = 0;

    for (const habit of habitItems) {
      // Check if habit has "Done" and "Failed" buttons (means it's fresh/uncompleted)
      const doneButton = await habit.locator('button:has-text("Done")').count();
      const failedButton = await habit.locator('button:has-text("Failed")').count();
      
      // Check for checkmark emoji (completed indicator)
      const checkmark = await habit.locator('[alt="Celebration"], [alt="Done"], [alt="Sad"]').count();
      
      // Check for "Yesterday - Failed" text
      const yesterdayFailed = await habit.locator('text=/Yesterday.*Failed/').count();

      if (doneButton > 0 && failedButton > 0) {
        freshCount++;
        console.log('Found fresh task with Done/Failed buttons');
      } else if (checkmark > 0) {
        completedCount++;
        console.log('Found completed task with checkmark');
      } else if (yesterdayFailed > 0) {
        failedCount++;
        console.log('Found yesterday failed task');
      }
    }

    console.log(`\nTask Status Summary:`);
    console.log(`- Fresh/Uncompleted tasks: ${freshCount}`);
    console.log(`- Completed tasks: ${completedCount}`);
    console.log(`- Yesterday's failed tasks: ${failedCount}`);

    // Get the progress percentages
    const progressTexts = await page.locator('text=/\\d+\\/\\d+ Today/').allTextContents();
    console.log('\nProgress indicators found:', progressTexts);

    // Check console logs for debug output
    page.on('console', msg => {
      if (msg.text().includes('[DEBUG]')) {
        console.log('Browser console:', msg.text());
      }
    });

    // Reload the page to trigger console logs
    await page.reload();
    await page.waitForTimeout(2000);

    // Extract and log date information from the page
    const dateInfo = await page.evaluate(() => {
      const today = new Date();
      const todayLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const todayISO = today.toISOString().split('T')[0];
      
      return {
        localDate: todayLocal,
        isoDate: todayISO,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currentTime: today.toString()
      };
    });

    console.log('\nDate Information:');
    console.log('- Local date format:', dateInfo.localDate);
    console.log('- ISO date format:', dateInfo.isoDate);
    console.log('- Timezone:', dateInfo.timezone);
    console.log('- Current time:', dateInfo.currentTime);

    // Assert that we have fresh tasks (not all completed)
    expect(freshCount).toBeGreaterThan(0);
    
    // Take a final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/family-dashboard-final.png',
      fullPage: true 
    });
  });
});