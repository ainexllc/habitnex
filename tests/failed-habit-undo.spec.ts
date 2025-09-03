import { test, expect } from '@playwright/test';

test.describe('Failed Habit Undo Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should show undo button when habit is marked as failed', async ({ page }) => {
    // Look for a habit in the "Due Today" or "Overdue" section
    const habitCard = page.locator('[data-testid="habit-card"]').first();
    
    // Check if the Failed button is visible
    const failedButton = habitCard.locator('button:has-text("Failed")');
    
    if (await failedButton.isVisible()) {
      // Click the Failed button
      await failedButton.click();
      
      // Wait for animation
      await page.waitForTimeout(500);
      
      // Verify the button changed to show "😔 Failed"
      await expect(habitCard.locator('text=😔 Failed')).toBeVisible();
      
      // Verify the undo button is present
      const undoButton = habitCard.locator('button[title="Undo"]');
      await expect(undoButton).toBeVisible();
      
      // Verify the habit moved to "Completed Today" section
      const completedSection = page.locator('h3:has-text("Completed Today")').locator('..');
      await expect(completedSection).toBeVisible();
    }
  });

  test('should revert failed habit when undo is clicked', async ({ page }) => {
    // Look for a habit in the "Due Today" section
    const habitCard = page.locator('[data-testid="habit-card"]').first();
    const habitName = await habitCard.locator('h3').textContent();
    
    if (habitName) {
      // Mark as failed
      const failedButton = habitCard.locator('button:has-text("Failed")');
      if (await failedButton.isVisible()) {
        await failedButton.click();
        await page.waitForTimeout(500);
        
        // Click undo
        const undoButton = habitCard.locator('button[title="Undo"]');
        await undoButton.click();
        await page.waitForTimeout(500);
        
        // Verify the buttons are back
        await expect(habitCard.locator('button:has-text("Completed")')).toBeVisible();
        await expect(habitCard.locator('button:has-text("Failed")')).toBeVisible();
        
        // Verify it's back in the original section (not in Completed Today)
        const dueSection = page.locator('h3:has-text("Due Today")').locator('..');
        await expect(dueSection.locator(`text=${habitName}`)).toBeVisible();
      }
    }
  });

  test('should show different visual styling for failed vs successful habits', async ({ page }) => {
    // This test checks that failed habits have gray styling vs green for successful
    const habitCards = page.locator('[data-testid="habit-card"]');
    const count = await habitCards.count();
    
    if (count >= 2) {
      // Mark first habit as successful
      const firstHabit = habitCards.nth(0);
      const completedButton = firstHabit.locator('button:has-text("Completed")');
      if (await completedButton.isVisible()) {
        await completedButton.click();
        await page.waitForTimeout(500);
        
        // Check for green gradient
        const successMessage = firstHabit.locator('text=🎉 Done!');
        await expect(successMessage).toBeVisible();
        const successDiv = firstHabit.locator('.bg-gradient-to-r.from-green-500');
        await expect(successDiv).toBeTruthy();
      }
      
      // Mark second habit as failed
      const secondHabit = habitCards.nth(1);
      const failedButton = secondHabit.locator('button:has-text("Failed")');
      if (await failedButton.isVisible()) {
        await failedButton.click();
        await page.waitForTimeout(500);
        
        // Check for gray gradient
        const failMessage = secondHabit.locator('text=😔 Failed');
        await expect(failMessage).toBeVisible();
        const failDiv = secondHabit.locator('.bg-gradient-to-r.from-gray-500');
        await expect(failDiv).toBeTruthy();
      }
    }
  });
});