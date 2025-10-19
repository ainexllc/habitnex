import { Page } from '@playwright/test';

export async function loginToApp(page: Page, email: string = 'dinohorn27@gmail.com', password: string = 'dinohorn') {
  console.log('🔐 Checking authentication status...');

  // Navigate to the application
  await page.goto('/');

  // Wait for page to stabilize
  await page.waitForTimeout(2000);

  // Check if we need to log in
  const currentUrl = page.url();
  if (currentUrl.includes('login') || currentUrl.includes('signup')) {
    console.log('🔐 Authentication required, logging in...');

    // Handle login
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button[type="submit"], button:has-text("Sign"), button:has-text("Login")').first();

    await emailInput.fill(email);
    await passwordInput.fill(password);
    await loginButton.click();

    // Wait for login to complete and redirect
    await page.waitForTimeout(5000);

    // Check if login was successful
    const newUrl = page.url();
    if (newUrl.includes('login') || newUrl.includes('signup')) {
      throw new Error('Login failed - still on login/signup page');
    }

    console.log('✅ Login successful');
  } else {
    console.log('✅ Already authenticated');
  }
}

export async function navigateToFamilyDashboard(page: Page) {
  console.log('🏠 Navigating to family dashboard...');

  const currentUrl = page.url();
  if (!currentUrl.includes('/?tab=overview')) {
    await page.goto('/?tab=overview');
  }

  await page.waitForTimeout(3000);

  // Verify we're on the family dashboard
  await page.waitForURL(/.*dashboard\/family/);
  console.log('✅ On family dashboard');
}
