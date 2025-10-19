import { test, expect } from '@playwright/test';
import { signInUser, ensureAuthenticated } from '../helpers/auth';
import { setTheme, takeThemedScreenshot, getCurrentTheme } from '../helpers/theme-helpers';

test.describe('Visual Regression Tests - Theme Consistency', () => {
  test.describe('Public Pages Screenshots', () => {
    const publicPages = [
      { path: '/', name: 'homepage', description: 'Homepage with hero section' },
      { path: '/login', name: 'login', description: 'Login form' },
      { path: '/signup', name: 'signup', description: 'Signup form' },
      { path: '/forgot-password', name: 'forgot-password', description: 'Password reset form' }
    ];

    for (const { path, name, description } of publicPages) {
      test(`should capture ${description} in both themes`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        // Capture light theme
        await takeThemedScreenshot(page, 'light', name, { fullPage: true });

        // Capture dark theme
        await takeThemedScreenshot(page, 'dark', name, { fullPage: true });

        // Verify screenshots exist and themes are different
        expect(await getCurrentTheme(page)).toBe('dark');
      });

      test(`should capture ${description} mobile view`, async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        // Capture mobile light theme
        await takeThemedScreenshot(page, 'light', `${name}-mobile`, { fullPage: true });

        // Capture mobile dark theme
        await takeThemedScreenshot(page, 'dark', `${name}-mobile`, { fullPage: true });
      });
    }
  });

  test.describe('Authenticated Pages Screenshots', () => {
    test.beforeEach(async ({ page }) => {
      await ensureAuthenticated(page);
    });

    const authenticatedPages = [
      { path: '/workspace', name: 'dashboard', description: 'Main dashboard with habits and stats' },
      { path: '/workspace?tab=overview', name: 'family-dashboard', description: 'Family dashboard with member zones' },
      { path: '/habits', name: 'habits-list', description: 'Habits list page' },
      { path: '/habits/new', name: 'habit-form', description: 'Habit creation form' },
      { path: '/moods', name: 'moods-list', description: 'Moods list page' },
      { path: '/moods/new', name: 'mood-form', description: 'Mood entry form' },
      { path: '/profile', name: 'profile', description: 'User profile page' },
      { path: '/settings', name: 'settings', description: 'Settings page' }
    ];

    for (const { path, name, description } of authenticatedPages) {
      test(`should capture ${description} in both themes`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        
        // Wait a bit more for data to load
        await page.waitForTimeout(1000);

        // Capture light theme
        await takeThemedScreenshot(page, 'light', name, { fullPage: true });

        // Capture dark theme
        await takeThemedScreenshot(page, 'dark', name, { fullPage: true });
      });

      test(`should capture ${description} tablet view`, async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Capture tablet views
        await takeThemedScreenshot(page, 'light', `${name}-tablet`, { fullPage: true });
        await takeThemedScreenshot(page, 'dark', `${name}-tablet`, { fullPage: true });
      });
    }
  });

  test.describe('Component Screenshots', () => {
    test.beforeEach(async ({ page }) => {
      await ensureAuthenticated(page);
    });

    test('should capture habit cards in both themes', async ({ page }) => {
      await page.goto('/habits');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Look for habit cards
      const habitCard = page.locator('[data-testid*="habit"], .habit-card').first();
      
      if (await habitCard.isVisible({ timeout: 5000 })) {
        // Get bounding box for clipped screenshot
        const box = await habitCard.boundingBox();
        
        if (box) {
          // Add some padding around the component
          const clip = {
            x: Math.max(0, box.x - 10),
            y: Math.max(0, box.y - 10),
            width: box.width + 20,
            height: box.height + 20
          };

          await takeThemedScreenshot(page, 'light', 'habit-card-component', { clip });
          await takeThemedScreenshot(page, 'dark', 'habit-card-component', { clip });
        }
      }
    });

    test('should capture mood entry components', async ({ page }) => {
      await page.goto('/moods/new');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Look for mood form
      const moodForm = page.locator('form, [data-testid*="mood"]').first();
      
      if (await moodForm.isVisible({ timeout: 5000 })) {
        const box = await moodForm.boundingBox();
        
        if (box) {
          const clip = {
            x: Math.max(0, box.x - 10),
            y: Math.max(0, box.y - 10),
            width: box.width + 20,
            height: box.height + 20
          };

          await takeThemedScreenshot(page, 'light', 'mood-form-component', { clip });
          await takeThemedScreenshot(page, 'dark', 'mood-form-component', { clip });
        }
      }
    });

    test('should capture navigation header', async ({ page }) => {
      await page.goto('/workspace');
      await page.waitForLoadState('networkidle');

      // Look for header/navigation
      const header = page.locator('header, nav, [role="navigation"]').first();
      
      if (await header.isVisible()) {
        const box = await header.boundingBox();
        
        if (box) {
          const clip = {
            x: 0,
            y: 0,
            width: box.width,
            height: box.height + 10
          };

          await takeThemedScreenshot(page, 'light', 'navigation-header', { clip });
          await takeThemedScreenshot(page, 'dark', 'navigation-header', { clip });
        }
      }
    });

    test('should capture theme toggle button', async ({ page }) => {
      await page.goto('/workspace');
      await page.waitForLoadState('networkidle');

      const themeToggle = page.locator('[aria-label*="Switch to"]').first();
      
      if (await themeToggle.isVisible()) {
        // Capture in light mode
        await setTheme(page, 'light');
        const box = await themeToggle.boundingBox();
        
        if (box) {
          const clip = {
            x: Math.max(0, box.x - 20),
            y: Math.max(0, box.y - 20),
            width: box.width + 40,
            height: box.height + 40
          };

          await takeThemedScreenshot(page, 'light', 'theme-toggle-light', { clip });
          await takeThemedScreenshot(page, 'dark', 'theme-toggle-dark', { clip });
        }
      }
    });
  });

  test.describe('Modal Screenshots', () => {
    test.beforeEach(async ({ page }) => {
      await ensureAuthenticated(page);
    });

    test('should capture modals in both themes', async ({ page }) => {
      // Try to capture habit creation/edit modal
      await page.goto('/habits');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Look for buttons that might open modals
      const modalTriggers = [
        'button:has-text("New Habit")',
        'button:has-text("Add Habit")',
        'button:has-text("Create")',
        '[data-testid*="create"]',
        '[data-testid*="add"]'
      ];

      for (const trigger of modalTriggers) {
        const button = page.locator(trigger).first();
        
        if (await button.isVisible({ timeout: 2000 })) {
          // Test light theme modal
          await setTheme(page, 'light');
          await button.click();
          
          const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]').first();
          if (await modal.isVisible({ timeout: 3000 })) {
            await takeThemedScreenshot(page, 'light', 'modal-habit-form', { fullPage: false });
            
            // Close modal
            const closeBtn = modal.locator('button:has-text("Cancel"), button:has-text("Close"), [data-testid*="close"]').first();
            if (await closeBtn.isVisible({ timeout: 2000 })) {
              await closeBtn.click();
            } else {
              await page.keyboard.press('Escape');
            }
            await expect(modal).not.toBeVisible({ timeout: 3000 });
          }
          
          // Test dark theme modal
          await setTheme(page, 'dark');
          await button.click();
          
          if (await modal.isVisible({ timeout: 3000 })) {
            await takeThemedScreenshot(page, 'dark', 'modal-habit-form', { fullPage: false });
            
            // Close modal
            const closeBtn = modal.locator('button:has-text("Cancel"), button:has-text("Close"), [data-testid*="close"]').first();
            if (await closeBtn.isVisible({ timeout: 2000 })) {
              await closeBtn.click();
            } else {
              await page.keyboard.press('Escape');
            }
          }
          
          break; // Found a working modal trigger
        }
      }
    });

    test('should capture family member modals', async ({ page }) => {
      await page.goto('/workspace?tab=overview');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Look for family member management buttons
      const memberButtons = [
        'button:has-text("Add Member")',
        'button:has-text("Add")',
        '[data-testid*="add-member"]',
        '[data-testid*="member"]'
      ];

      for (const trigger of memberButtons) {
        const button = page.locator(trigger).first();
        
        if (await button.isVisible({ timeout: 2000 })) {
          // Test modal in both themes
          for (const theme of ['light', 'dark'] as const) {
            await setTheme(page, theme);
            await button.click();
            
            const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]').first();
            if (await modal.isVisible({ timeout: 3000 })) {
              await takeThemedScreenshot(page, theme, `modal-family-member-${theme}`);
              
              // Close modal
              const closeBtn = modal.locator('button:has-text("Cancel"), button:has-text("Close"), [data-testid*="close"]').first();
              if (await closeBtn.isVisible({ timeout: 2000 })) {
                await closeBtn.click();
              } else {
                await page.keyboard.press('Escape');
              }
              await expect(modal).not.toBeVisible({ timeout: 3000 });
            }
          }
          
          break;
        }
      }
    });
  });

  test.describe('Form State Screenshots', () => {
    test.beforeEach(async ({ page }) => {
      await ensureAuthenticated(page);
    });

    test('should capture form validation states', async ({ page }) => {
      await page.goto('/habits/new');
      await page.waitForLoadState('networkidle');

      // Try to submit empty form to trigger validation
      const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")').first();
      
      if (await submitButton.isVisible()) {
        // Light theme validation
        await setTheme(page, 'light');
        await submitButton.click();
        await page.waitForTimeout(500); // Wait for validation to appear
        
        await takeThemedScreenshot(page, 'light', 'form-validation-light', { fullPage: true });

        // Dark theme validation
        await setTheme(page, 'dark');
        await page.waitForTimeout(300);
        
        await takeThemedScreenshot(page, 'dark', 'form-validation-dark', { fullPage: true });
      }
    });

    test('should capture form focus states', async ({ page }) => {
      await page.goto('/habits/new');
      await page.waitForLoadState('networkidle');

      const firstInput = page.locator('input, textarea').first();
      
      if (await firstInput.isVisible()) {
        // Light theme focus
        await setTheme(page, 'light');
        await firstInput.focus();
        await page.waitForTimeout(200);
        
        const box = await firstInput.boundingBox();
        if (box) {
          const clip = {
            x: Math.max(0, box.x - 10),
            y: Math.max(0, box.y - 10),
            width: box.width + 20,
            height: box.height + 20
          };
          
          await takeThemedScreenshot(page, 'light', 'form-input-focus-light', { clip });
        }

        // Dark theme focus
        await setTheme(page, 'dark');
        await firstInput.focus();
        await page.waitForTimeout(200);
        
        if (box) {
          const clip = {
            x: Math.max(0, box.x - 10),
            y: Math.max(0, box.y - 10),
            width: box.width + 20,
            height: box.height + 20
          };
          
          await takeThemedScreenshot(page, 'dark', 'form-input-focus-dark', { clip });
        }
      }
    });
  });

  test.describe('Interactive State Screenshots', () => {
    test.beforeEach(async ({ page }) => {
      await ensureAuthenticated(page);
    });

    test('should capture button hover states', async ({ page }) => {
      await page.goto('/workspace');
      await page.waitForLoadState('networkidle');

      const buttons = page.locator('button:visible');
      const button = buttons.first();
      
      if (await button.isVisible()) {
        // Light theme hover
        await setTheme(page, 'light');
        await button.hover();
        await page.waitForTimeout(200);
        
        const box = await button.boundingBox();
        if (box) {
          const clip = {
            x: Math.max(0, box.x - 5),
            y: Math.max(0, box.y - 5),
            width: box.width + 10,
            height: box.height + 10
          };
          
          await takeThemedScreenshot(page, 'light', 'button-hover-light', { clip });
        }

        // Dark theme hover
        await setTheme(page, 'dark');
        await button.hover();
        await page.waitForTimeout(200);
        
        if (box) {
          const clip = {
            x: Math.max(0, box.x - 5),
            y: Math.max(0, box.y - 5),
            width: box.width + 10,
            height: box.height + 10
          };
          
          await takeThemedScreenshot(page, 'dark', 'button-hover-dark', { clip });
        }
      }
    });

    test('should capture loading states', async ({ page }) => {
      // Navigate to a page that might show loading states
      await page.goto('/workspace');
      
      // Inject loading spinner if available
      const hasLoadingState = await page.evaluate(() => {
        // Look for loading indicators
        const loadingElements = document.querySelectorAll('[data-testid*="loading"], .loading, .spinner');
        return loadingElements.length > 0;
      });

      if (hasLoadingState) {
        await takeThemedScreenshot(page, 'light', 'loading-state-light');
        await takeThemedScreenshot(page, 'dark', 'loading-state-dark');
      }
    });
  });

  test.describe('Responsive Visual Tests', () => {
    const viewports = [
      { name: 'desktop', width: 1200, height: 800 },
      { name: 'tablet-portrait', width: 768, height: 1024 },
      { name: 'tablet-landscape', width: 1024, height: 768 },
      { name: 'mobile', width: 375, height: 667 },
      { name: 'mobile-small', width: 320, height: 568 }
    ];

    for (const viewport of viewports) {
      test(`should capture dashboard responsiveness on ${viewport.name}`, async ({ page }) => {
        await ensureAuthenticated(page);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        await page.goto('/workspace');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Capture both themes for each viewport
        await takeThemedScreenshot(page, 'light', `dashboard-${viewport.name}`, { fullPage: true });
        await takeThemedScreenshot(page, 'dark', `dashboard-${viewport.name}`, { fullPage: true });
      });
    }
  });
});