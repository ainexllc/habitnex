import { test, expect } from '@playwright/test';

// Test helper to sign in (you may need to adjust this based on your auth flow)
async function signIn(page) {
  // Navigate to login page
  await page.goto('/login');
  
  // Check if already signed in by looking for dashboard redirect
  if (page.url().includes('/workspace?tab=overview')) {
    return; // Already signed in
  }
  
  // Try to find and fill login form
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  const loginButton = page.locator('button:has-text("Sign In")');
  
  if (await emailInput.isVisible()) {
    await emailInput.fill('test@example.com'); // You may need a test account
    await passwordInput.fill('testpassword123');
    await loginButton.click();
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/workspace?tab=overview**', { timeout: 10000 });
  }
}

test.describe('Habit Form Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the habits page
    await page.goto('/habits');
    
    // Handle authentication if needed
    if (page.url().includes('/login')) {
      await signIn(page);
      await page.goto('/habits');
    }
  });

  test('should display habit form when clicking "Add Habit" button', async ({ page }) => {
    // Look for the Add Habit button
    const addHabitButton = page.locator('a:has-text("Add Habit"), button:has-text("Add Habit")').first();
    await expect(addHabitButton).toBeVisible();
    
    // Click to navigate to habit creation
    await addHabitButton.click();
    
    // Should navigate to habits/new page
    await expect(page).toHaveURL(/.*\/habits\/new/);
    
    // Should see the habit form
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/habits/new');
    
    // Try to submit form without filling required fields
    const submitButton = page.locator('button:has-text("Create Habit")');
    await submitButton.click();
    
    // Should show validation errors
    await expect(page.locator('text=Habit name is required')).toBeVisible();
    await expect(page.locator('text=Please select a color')).toBeVisible();
  });

  test('should create a basic daily habit', async ({ page }) => {
    await page.goto('/habits/new');
    
    // Fill in basic habit information
    await page.locator('input[name="name"]').fill('Test Daily Habit');
    await page.locator('textarea[name="description"]').fill('This is a test habit for daily tracking');
    
    // Select a color (click on the first color option)
    await page.locator('button[style*="background-color"]').first().click();
    
    // Frequency should default to daily, but let's make sure
    const dailyRadio = page.locator('input[value="daily"]');
    await dailyRadio.check();
    
    // Submit the form
    const submitButton = page.locator('button:has-text("Create Habit")');
    await submitButton.click();
    
    // Should navigate back to habits page or dashboard
    await page.waitForURL(/.*\/(habits|dashboard)/, { timeout: 10000 });
    
    // Should see success (either on habits page or dashboard)
    // The habit should appear in the list
    await expect(page.locator('text=Test Daily Habit')).toBeVisible({ timeout: 10000 });
  });

  test('should create an interval habit with time preferences', async ({ page }) => {
    await page.goto('/habits/new');
    
    // Fill basic information
    await page.locator('input[name="name"]').fill('Test Interval Habit');
    await page.locator('textarea[name="description"]').fill('Every 3 days habit with morning preference');
    
    // Select color
    await page.locator('button[style*="background-color"]').first().click();
    
    // Select interval frequency
    const intervalRadio = page.locator('input[value="interval"]');
    await intervalRadio.check();
    
    // Should show interval options
    await expect(page.locator('input[name="intervalDays"]')).toBeVisible();
    
    // Set interval to 3 days
    await page.locator('input[name="intervalDays"]').fill('3');
    
    // Set reminder type to general
    const generalRadio = page.locator('input[value="general"]');
    await generalRadio.check();
    
    // Select morning time
    const reminderSelect = page.locator('select[name="reminderTime"]');
    await reminderSelect.selectOption('morning');
    
    // Submit the form
    await page.locator('button:has-text("Create Habit")').click();
    
    // Wait for navigation
    await page.waitForURL(/.*\/(habits|dashboard)/, { timeout: 10000 });
    
    // Should see the habit with time indicator
    await expect(page.locator('text=Test Interval Habit')).toBeVisible({ timeout: 10000 });
  });

  test('should test AI enhancement feature', async ({ page }) => {
    await page.goto('/habits/new');
    
    // Fill basic information
    await page.locator('input[name="name"]').fill('Exercise Daily');
    
    // Look for AI enhance button
    const aiEnhanceButton = page.locator('button:has-text("✨ AI Enhance")');
    await expect(aiEnhanceButton).toBeVisible();
    
    // Click AI enhance button
    await aiEnhanceButton.click();
    
    // Should show loading state
    await expect(page.locator('button:has-text("Enhancing")')).toBeVisible({ timeout: 5000 });
    
    // Wait for AI response (this might take a few seconds)
    await page.waitForTimeout(8000); // Give AI time to respond
    
    // Should show enhancement card or auto-populated fields
    const enhancementVisible = await page.locator('[data-testid="enhancement-card"], .enhancement-card').isVisible().catch(() => false);
    const nameField = page.locator('input[name="name"]');
    const descriptionField = page.locator('textarea[name="description"]');
    
    // Either enhancement card should be visible OR fields should be auto-populated
    if (enhancementVisible) {
      await expect(page.locator('[data-testid="enhancement-card"], .enhancement-card')).toBeVisible();
    } else {
      // Check if fields were auto-populated
      const nameValue = await nameField.inputValue();
      const descriptionValue = await descriptionField.inputValue();
      
      expect(nameValue.length).toBeGreaterThan(0);
      expect(descriptionValue.length).toBeGreaterThan(0);
    }
  });

  test('should handle form validation for interval habits', async ({ page }) => {
    await page.goto('/habits/new');
    
    // Fill basic info
    await page.locator('input[name="name"]').fill('Test Interval');
    await page.locator('button[style*="background-color"]').first().click();
    
    // Select interval frequency
    await page.locator('input[value="interval"]').check();
    
    // Try to submit without setting interval days
    await page.locator('button:has-text("Create Habit")').click();
    
    // Should show validation error for interval days
    await expect(page.locator('text=Interval days is required')).toBeVisible();
  });

  test('should handle different time formats based on user preferences', async ({ page }) => {
    await page.goto('/habits/new');
    
    // Fill basic info and select interval
    await page.locator('input[name="name"]').fill('Time Format Test');
    await page.locator('button[style*="background-color"]').first().click();
    await page.locator('input[value="interval"]').check();
    await page.locator('input[name="intervalDays"]').fill('2');
    
    // Check general time options
    await page.locator('input[value="general"]').check();
    
    const timeSelect = page.locator('select[name="reminderTime"]');
    await expect(timeSelect).toBeVisible();
    
    // Check that time options include proper formatting
    const options = await timeSelect.locator('option').allTextContents();
    
    // Should contain morning, afternoon, evening with time ranges
    expect(options.some(option => option.includes('Morning'))).toBeTruthy();
    expect(options.some(option => option.includes('Afternoon'))).toBeTruthy();
    expect(options.some(option => option.includes('Evening'))).toBeTruthy();
    
    // Test specific time input
    await page.locator('input[value="specific"]').check();
    const timeInput = page.locator('input[type="time"]');
    await expect(timeInput).toBeVisible();
    
    // Set a specific time
    await timeInput.fill('14:30');
    
    // Submit form
    await page.locator('button:has-text("Create Habit")').click();
    await page.waitForURL(/.*\/(habits|dashboard)/, { timeout: 10000 });
  });

  test('should test habit editing functionality', async ({ page }) => {
    // First create a habit to edit
    await page.goto('/habits/new');
    await page.locator('input[name="name"]').fill('Habit to Edit');
    await page.locator('button[style*="background-color"]').first().click();
    await page.locator('button:has-text("Create Habit")').click();
    await page.waitForURL(/.*\/(habits|dashboard)/, { timeout: 10000 });
    
    // Find and click edit button for our habit
    const habitCard = page.locator('text=Habit to Edit').locator('..').locator('..');
    const editButton = habitCard.locator('button:has([data-testid="edit-icon"]), button:has(svg)').first();
    
    await editButton.click();
    
    // Should open edit modal
    await expect(page.locator('text=Edit Habit')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Update "Habit to Edit" settings')).toBeVisible();
    
    // Edit the habit name
    const nameInput = page.locator('input[name="name"]');
    await nameInput.clear();
    await nameInput.fill('Updated Habit Name');
    
    // Submit changes
    await page.locator('button:has-text("Update Habit")').click();
    
    // Modal should close and habit should be updated
    await expect(page.locator('text=Edit Habit')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Updated Habit Name')).toBeVisible({ timeout: 10000 });
  });

  test('should test form accessibility', async ({ page }) => {
    await page.goto('/habits/new');
    
    // Check that form fields have proper labels
    await expect(page.locator('label:has-text("Habit Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Description")')).toBeVisible();
    await expect(page.locator('label:has-text("Frequency")')).toBeVisible();
    
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus').getAttribute('name');
    expect(focusedElement).toBe('name');
    
    // Test that color selection is keyboard accessible
    await page.keyboard.press('Tab'); // Should move to description
    await page.keyboard.press('Tab'); // Should move to tags or color section
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/habits/new');
    
    // Fill out form
    await page.locator('input[name="name"]').fill('Network Test Habit');
    await page.locator('button[style*="background-color"]').first().click();
    
    // Intercept the network request and make it fail
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // Submit form
    await page.locator('button:has-text("Create Habit")').click();
    
    // Should show error message or remain on form
    // The exact error handling depends on your implementation
    await page.waitForTimeout(3000);
    
    // Form should still be visible (not navigated away)
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });
});

test.describe('Habit Form Mobile Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size
  
  test('should work properly on mobile devices', async ({ page }) => {
    await page.goto('/habits/new');
    
    // Check that form is responsive
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    
    // Test touch interactions
    await page.locator('input[name="name"]').tap();
    await page.locator('input[name="name"]').fill('Mobile Test Habit');
    
    // Test color selection on mobile
    await page.locator('button[style*="background-color"]').first().tap();
    
    // Submit form
    await page.locator('button:has-text("Create Habit")').tap();
    
    await page.waitForURL(/.*\/(habits|dashboard)/, { timeout: 10000 });
  });
});