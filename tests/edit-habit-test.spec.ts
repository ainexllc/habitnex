import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser } from './helpers/auth';
import { waitForDashboard } from './helpers/auth';

test.describe('Edit Family Habit Functionality', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await waitForDashboard(page);
  });

  test('should be able to edit an existing family habit', async ({ page }) => {
    // Navigate to family dashboard
    await page.goto('/workspace?tab=overview');
    await page.waitForTimeout(2000);

    // Check if we're on the family dashboard
    await expect(page).toHaveURL(/.*dashboard\/family/);

    // Wait for habits to load
    await page.waitForTimeout(3000);

    // Look for habit cards and edit buttons
    const habitCards = page.locator('[data-testid="family-habit-card"]').all();
    const habitCardCount = await habitCards.count();

    console.log(`Found ${habitCardCount} habit cards`);

    if (habitCardCount > 0) {
      // Click on the first habit card's edit button
      const editButton = page.locator('[data-testid="edit-habit-button"]').first();
      await editButton.click();

      // Wait for the edit modal to open
      await page.waitForTimeout(2000);

      // Check if the modal opened
      const modal = page.locator('[data-testid="family-habit-modal"]');
      await expect(modal).toBeVisible();

      // Check if form fields are populated
      const habitNameInput = page.locator('input[name="habit-name"]');
      const originalName = await habitNameInput.inputValue();

      console.log(`Original habit name: ${originalName}`);

      // Try to change the habit name
      const newName = `${originalName} (Edited)`;
      await habitNameInput.fill(newName);

      // Submit the form
      const submitButton = page.locator('[data-testid="submit-habit-button"]');
      await submitButton.click();

      // Wait for the modal to close and check if the habit was updated
      await page.waitForTimeout(3000);

      // Check if the modal closed
      await expect(modal).not.toBeVisible();

      // Check if the habit name was updated in the UI
      const updatedHabitCard = page.locator('[data-testid="family-habit-card"]').first();
      const habitName = updatedHabitCard.locator('text').first();
      const habitNameText = await habitName.textContent();

      console.log(`Updated habit name in UI: ${habitNameText}`);

      // The test should pass if we can successfully edit and save
      expect(habitNameText).toContain('Edited');

    } else {
      console.log('No habits found to edit, creating one first...');

      // Try to create a habit first
      const createButton = page.locator('[data-testid="create-habit-button"]');
      if (await createButton.isVisible()) {
        await createButton.click();

        // Wait for modal
        await page.waitForTimeout(2000);

        // Fill out the form
        const habitNameInput = page.locator('input[placeholder*="Drink"]');
        await habitNameInput.fill('Test Habit for Editing');

        // Submit
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Wait and then try to edit the newly created habit
        await page.waitForTimeout(3000);

        const editButton = page.locator('[data-testid="edit-habit-button"]').first();
        if (await editButton.isVisible()) {
          await editButton.click();
          await page.waitForTimeout(2000);

          // Check if edit modal opens
          const modal = page.locator('[data-testid="family-habit-modal"]');
          await expect(modal).toBeVisible();
        }
      }

      // If we can't create or edit, the test will fail
      expect(false).toBe(true);
    }
  });

  test('should handle edit form validation correctly', async ({ page }) => {
    await page.goto('/workspace?tab=overview');
    await page.waitForTimeout(2000);

    // Try to find an edit button
    const editButton = page.locator('[data-testid="edit-habit-button"]').first();

    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(2000);

      // Clear the habit name to trigger validation
      const habitNameInput = page.locator('input[name="habit-name"]');
      await habitNameInput.clear();

      // Try to submit
      const submitButton = page.locator('[data-testid="submit-habit-button"]');
      await submitButton.click();

      // Check for validation error
      const errorMessage = page.locator('[data-testid="validation-error"]');
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should cancel edit operation without saving', async ({ page }) => {
    await page.goto('/workspace?tab=overview');
    await page.waitForTimeout(2000);

    const editButton = page.locator('[data-testid="edit-habit-button"]').first();

    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(2000);

      // Get original name
      const habitNameInput = page.locator('input[name="habit-name"]');
      const originalName = await habitNameInput.inputValue();

      // Change the name
      await habitNameInput.fill(`${originalName} (Changed)`);

      // Cancel instead of submit
      const cancelButton = page.locator('[data-testid="cancel-edit-button"]');
      await cancelButton.click();

      // Check that the modal closed and name wasn't changed
      const modal = page.locator('[data-testid="family-habit-modal"]');
      await expect(modal).not.toBeVisible();

      // Check that the original name is still there
      const habitName = page.locator('[data-testid="family-habit-card"]').first().locator('text').first();
      const habitNameText = await habitName.textContent();

      expect(habitNameText).toBe(originalName);
    }
  });
});
