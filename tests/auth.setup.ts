import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Go to login page
  await page.goto('http://localhost:3001/login');
  
  // Fill in credentials
  await page.fill('input[type="email"]', 'dinohorn9@gmail.com');
  await page.fill('input[type="password"]', 'dinohorn');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard
  await page.waitForURL('**/workspace?tab=overview', { timeout: 10000 });
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
});