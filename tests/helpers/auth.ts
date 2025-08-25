import { Page, expect } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  displayName?: string;
}

// Default test user - you may need to create this account manually or use a test email
export const DEFAULT_TEST_USER: TestUser = {
  email: 'test+playwright@example.com',
  password: 'TestPassword123!',
  displayName: 'Test User'
};

/**
 * Sign in a user for testing
 */
export async function signInUser(page: Page, user: TestUser = DEFAULT_TEST_USER) {
  // Navigate to login page
  await page.goto('/login');
  
  // Check if already signed in by looking for dashboard redirect
  await page.waitForLoadState('networkidle');
  
  if (page.url().includes('/dashboard')) {
    console.log('User already signed in');
    return; // Already signed in
  }
  
  try {
    // Look for email input
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const loginButton = page.locator('button:has-text("Sign In"), button[type="submit"]');
    
    // Wait for form to be visible
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    
    // Fill in credentials
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    
    // Click sign in
    await loginButton.click();
    
    // Wait for navigation to dashboard or main app
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    
    console.log('Successfully signed in user:', user.email);
    
  } catch (error) {
    console.log('Sign in failed or user may need to be created:', error.message);
    
    // Try to check if we're on signup page or need to create account
    const signUpLink = page.locator('a:has-text("Sign up"), a:has-text("Create account")');
    if (await signUpLink.isVisible()) {
      console.log('Attempting to create test account...');
      await createTestUser(page, user);
    } else {
      throw new Error(`Failed to sign in user: ${error.message}`);
    }
  }
}

/**
 * Create a test user account
 */
export async function createTestUser(page: Page, user: TestUser = DEFAULT_TEST_USER) {
  // Navigate to signup page
  await page.goto('/signup');
  
  try {
    // Fill signup form
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    const displayNameInput = page.locator('input[name="displayName"]');
    const signUpButton = page.locator('button:has-text("Sign Up"), button[type="submit"]');
    
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    
    if (await confirmPasswordInput.isVisible()) {
      await confirmPasswordInput.fill(user.password);
    }
    
    if (await displayNameInput.isVisible() && user.displayName) {
      await displayNameInput.fill(user.displayName);
    }
    
    await signUpButton.click();
    
    // Wait for account creation and navigation
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    
    console.log('Successfully created test account:', user.email);
    
  } catch (error) {
    console.log('Failed to create test account:', error.message);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(page: Page) {
  try {
    // Look for sign out button/link
    const signOutButton = page.locator('button:has-text("Sign Out"), a:has-text("Sign Out"), button:has-text("Logout")');
    
    if (await signOutButton.isVisible()) {
      await signOutButton.click();
      
      // Wait for navigation to login page
      await page.waitForURL('**/login**', { timeout: 10000 });
      console.log('Successfully signed out user');
    }
  } catch (error) {
    console.log('Failed to sign out user:', error.message);
  }
}

/**
 * Ensure user is authenticated before running tests
 */
export async function ensureAuthenticated(page: Page, user: TestUser = DEFAULT_TEST_USER) {
  // Check current URL
  if (page.url().includes('/login') || page.url().includes('/signup')) {
    await signInUser(page, user);
  } else {
    // Check if we can access protected content
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/login')) {
      await signInUser(page, user);
    }
  }
}

/**
 * Clean up test data (habits created during tests)
 */
export async function cleanupTestData(page: Page) {
  try {
    await page.goto('/habits');
    await page.waitForLoadState('networkidle');
    
    // Find and delete any test habits
    const testHabits = page.locator('[data-testid="habit-card"]:has-text("Test"), [data-testid="habit-card"]:has-text("Playwright")');
    const count = await testHabits.count();
    
    for (let i = 0; i < count; i++) {
      const habit = testHabits.nth(i);
      const deleteButton = habit.locator('button:has([data-testid="delete-icon"]), button:has(svg)').last();
      
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Confirm deletion if prompted
        const confirmButton = page.locator('button:has-text("Delete"), button:has-text("Confirm"), button:has-text("Yes")');
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }
        
        await page.waitForTimeout(1000); // Wait for deletion
      }
    }
    
    console.log(`Cleaned up ${count} test habits`);
  } catch (error) {
    console.log('Failed to cleanup test data:', error.message);
  }
}