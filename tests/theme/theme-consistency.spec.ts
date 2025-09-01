import { test, expect, Page } from '@playwright/test';
import { signInUser, ensureAuthenticated, DEFAULT_TEST_USER } from '../helpers/auth';
import { 
  setTheme, 
  getCurrentTheme, 
  verifyThemeConsistency,
  checkColorContrast,
  testThemePersistence,
  testInteractiveElements,
  testModalTheme,
  verifyNoThemeFlash,
  verifyThemeVariables
} from '../helpers/theme-helpers';

test.describe('Theme Consistency Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Start with light theme
    await page.goto('/');
    await setTheme(page, 'light');
  });

  test.describe('Basic Theme Functionality', () => {
    test('should toggle between light and dark themes', async () => {
      await page.goto('/');
      
      // Start with light theme
      await setTheme(page, 'light');
      expect(await getCurrentTheme(page)).toBe('light');
      await verifyThemeConsistency(page, 'light');
      
      // Switch to dark theme
      await setTheme(page, 'dark');
      expect(await getCurrentTheme(page)).toBe('dark');
      await verifyThemeConsistency(page, 'dark');
      
      // Switch back to light theme
      await setTheme(page, 'light');
      expect(await getCurrentTheme(page)).toBe('light');
      await verifyThemeConsistency(page, 'light');
    });

    test('should persist theme across page reloads', async () => {
      await page.goto('/');
      
      // Set dark theme
      await setTheme(page, 'dark');
      await verifyThemeConsistency(page, 'dark');
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500); // Wait for theme to load
      
      // Verify theme persisted
      expect(await getCurrentTheme(page)).toBe('dark');
      await verifyThemeConsistency(page, 'dark');
    });

    test('should maintain theme variables in both modes', async () => {
      await page.goto('/');
      
      // Test light theme variables
      await verifyThemeVariables(page, 'light');
      
      // Test dark theme variables
      await verifyThemeVariables(page, 'dark');
    });
  });

  test.describe('Public Pages Theme Consistency', () => {
    const publicPages = [
      { path: '/', name: 'homepage' },
      { path: '/login', name: 'login' },
      { path: '/signup', name: 'signup' },
      { path: '/forgot-password', name: 'forgot-password' }
    ];

    for (const { path, name } of publicPages) {
      test(`should maintain theme consistency on ${name} page`, async () => {
        // Test light theme
        await page.goto(path);
        await setTheme(page, 'light');
        await verifyThemeConsistency(page, 'light');
        await testInteractiveElements(page, 'light');
        
        // Test dark theme
        await setTheme(page, 'dark');
        await verifyThemeConsistency(page, 'dark');
        await testInteractiveElements(page, 'dark');
      });

      test(`should have proper color contrast on ${name} page`, async () => {
        await page.goto(path);
        
        // Test light theme contrast
        await setTheme(page, 'light');
        await page.waitForTimeout(300);
        
        const mainContent = page.locator('main, .main, [role="main"]').first();
        if (await mainContent.isVisible()) {
          await checkColorContrast(mainContent);
        }
        
        // Check headings
        const headings = page.locator('h1, h2, h3').first();
        if (await headings.isVisible()) {
          await checkColorContrast(headings);
        }
        
        // Test dark theme contrast
        await setTheme(page, 'dark');
        await page.waitForTimeout(300);
        
        if (await mainContent.isVisible()) {
          await checkColorContrast(mainContent);
        }
        
        if (await headings.isVisible()) {
          await checkColorContrast(headings);
        }
      });
    }
  });

  test.describe('Authenticated Pages Theme Consistency', () => {
    test.beforeEach(async () => {
      await ensureAuthenticated(page);
    });

    const authenticatedPages = [
      { path: '/dashboard', name: 'dashboard' },
      { path: '/dashboard/family', name: 'family-dashboard' },
      { path: '/habits', name: 'habits' },
      { path: '/moods', name: 'moods' },
      { path: '/profile', name: 'profile' },
      { path: '/settings', name: 'settings' }
    ];

    for (const { path, name } of authenticatedPages) {
      test(`should maintain theme consistency on ${name} page`, async () => {
        // Test light theme
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        await setTheme(page, 'light');
        await verifyThemeConsistency(page, 'light');
        await testInteractiveElements(page, 'light');
        
        // Test dark theme
        await setTheme(page, 'dark');
        await verifyThemeConsistency(page, 'dark');
        await testInteractiveElements(page, 'dark');
      });

      test(`should persist theme when navigating to ${name}`, async () => {
        // Set dark theme on dashboard
        await page.goto('/dashboard');
        await setTheme(page, 'dark');
        await verifyThemeConsistency(page, 'dark');
        
        // Navigate to target page
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        // Verify theme persisted
        expect(await getCurrentTheme(page)).toBe('dark');
        await verifyThemeConsistency(page, 'dark');
      });
    }

    test('should maintain theme across navigation flow', async () => {
      await testThemePersistence(page, 'dark', [
        '/dashboard',
        '/habits',
        '/moods',
        '/dashboard/family',
        '/profile'
      ]);
    });
  });

  test.describe('Form Elements Theme Consistency', () => {
    test.beforeEach(async () => {
      await ensureAuthenticated(page);
    });

    test('should properly theme habit creation form', async () => {
      await page.goto('/habits/new');
      await page.waitForLoadState('networkidle');
      
      // Test light theme
      await setTheme(page, 'light');
      
      const form = page.locator('form').first();
      if (await form.isVisible()) {
        await checkColorContrast(form, 3.0);
        
        // Test form inputs
        const inputs = form.locator('input, textarea, select');
        const count = Math.min(await inputs.count(), 5);
        
        for (let i = 0; i < count; i++) {
          const input = inputs.nth(i);
          if (await input.isVisible()) {
            await checkColorContrast(input);
            
            // Test focus state
            await input.focus();
            await page.waitForTimeout(100);
            await checkColorContrast(input, 3.0); // Focus state may have lower contrast
          }
        }
        
        // Test form buttons
        const buttons = form.locator('button');
        const buttonCount = Math.min(await buttons.count(), 3);
        
        for (let i = 0; i < buttonCount; i++) {
          const button = buttons.nth(i);
          if (await button.isVisible()) {
            await checkColorContrast(button, 3.0);
          }
        }
      }
      
      // Test dark theme
      await setTheme(page, 'dark');
      
      if (await form.isVisible()) {
        await checkColorContrast(form, 3.0);
      }
    });

    test('should properly theme mood entry form', async () => {
      await page.goto('/moods/new');
      await page.waitForLoadState('networkidle');
      
      const form = page.locator('form, [data-testid*="mood"]').first();
      
      // Test both themes
      for (const theme of ['light', 'dark'] as const) {
        await setTheme(page, theme);
        
        if (await form.isVisible()) {
          await checkColorContrast(form, 3.0);
          
          // Test mood buttons/sliders
          const moodInputs = form.locator('input[type="range"], button[data-testid*="mood"]');
          const count = Math.min(await moodInputs.count(), 4);
          
          for (let i = 0; i < count; i++) {
            const input = moodInputs.nth(i);
            if (await input.isVisible()) {
              await checkColorContrast(input, 2.5); // Mood inputs may have artistic colors
            }
          }
        }
      }
    });
  });

  test.describe('Modal Theme Consistency', () => {
    test.beforeEach(async () => {
      await ensureAuthenticated(page);
    });

    test('should properly theme habit edit modal', async () => {
      await page.goto('/habits');
      await page.waitForLoadState('networkidle');
      
      // Look for habit cards and edit buttons
      const editButton = page.locator('button:has-text("Edit"), [data-testid*="edit"]').first();
      
      if (await editButton.isVisible({ timeout: 5000 })) {
        // Test modal in light theme
        await testModalTheme(page, 'light', 'button:has-text("Edit"), [data-testid*="edit"]');
        
        // Test modal in dark theme
        await testModalTheme(page, 'dark', 'button:has-text("Edit"), [data-testid*="edit"]');
      }
    });

    test('should properly theme family member modals', async () => {
      await page.goto('/dashboard/family');
      await page.waitForLoadState('networkidle');
      
      // Look for add member button
      const addMemberButton = page.locator('button:has-text("Add Member"), button:has-text("Add"), [data-testid*="add-member"]').first();
      
      if (await addMemberButton.isVisible({ timeout: 5000 })) {
        // Test modal in both themes
        await testModalTheme(page, 'light', 'button:has-text("Add Member"), button:has-text("Add"), [data-testid*="add-member"]');
        await testModalTheme(page, 'dark', 'button:has-text("Add Member"), button:has-text("Add"), [data-testid*="add-member"]');
      }
    });
  });

  test.describe('Navigation Theme Consistency', () => {
    test.beforeEach(async () => {
      await ensureAuthenticated(page);
    });

    test('should properly theme navigation elements', async () => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Test navigation in both themes
      for (const theme of ['light', 'dark'] as const) {
        await setTheme(page, theme);
        
        // Test header/navigation
        const header = page.locator('header, nav, [role="navigation"]').first();
        if (await header.isVisible()) {
          await checkColorContrast(header, 3.0);
          
          // Test navigation links
          const navLinks = header.locator('a, button');
          const count = Math.min(await navLinks.count(), 5);
          
          for (let i = 0; i < count; i++) {
            const link = navLinks.nth(i);
            if (await link.isVisible()) {
              await checkColorContrast(link, 3.0);
            }
          }
        }
        
        // Test theme toggle button specifically
        const themeToggle = page.locator('[aria-label*="Switch to"]').first();
        if (await themeToggle.isVisible()) {
          await checkColorContrast(themeToggle, 3.0);
          
          // Test hover state
          await themeToggle.hover();
          await page.waitForTimeout(100);
        }
      }
    });
  });

  test.describe('Theme Flash Prevention', () => {
    test('should not flash white/black during theme switches', async () => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      await verifyNoThemeFlash(page);
    });

    test('should not flash during page navigation', async () => {
      await ensureAuthenticated(page);
      
      // Set dark theme
      await page.goto('/dashboard');
      await setTheme(page, 'dark');
      
      // Navigate to different page and monitor for flashing
      await verifyNoThemeFlash(page);
    });
  });

  test.describe('Theme Synchronization', () => {
    test.beforeEach(async () => {
      await ensureAuthenticated(page);
    });

    test('should sync theme with Firebase after login', async () => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Set theme
      await setTheme(page, 'dark');
      await page.waitForTimeout(1000); // Wait for Firebase sync
      
      // Reload page to test Firebase persistence
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Wait for theme to load from Firebase
      
      // Should maintain dark theme
      expect(await getCurrentTheme(page)).toBe('dark');
      await verifyThemeConsistency(page, 'dark');
    });

    test('should maintain theme after logout/login cycle', async () => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Set dark theme
      await setTheme(page, 'dark');
      await page.waitForTimeout(1000); // Wait for Firebase sync
      
      // Sign out
      const signOutButton = page.locator('button:has-text("Sign Out"), a:has-text("Sign Out")').first();
      if (await signOutButton.isVisible({ timeout: 5000 })) {
        await signOutButton.click();
        await page.waitForURL('**/login**', { timeout: 10000 });
      }
      
      // Sign back in
      await signInUser(page);
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      await page.waitForTimeout(1000); // Wait for theme to load
      
      // Should restore dark theme
      expect(await getCurrentTheme(page)).toBe('dark');
      await verifyThemeConsistency(page, 'dark');
    });
  });

  test.describe('Responsive Theme Consistency', () => {
    const viewports = [
      { name: 'desktop', width: 1200, height: 800 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      test(`should maintain theme consistency on ${viewport.name}`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        await page.goto('/');
        
        // Test both themes
        for (const theme of ['light', 'dark'] as const) {
          await setTheme(page, theme);
          await verifyThemeConsistency(page, theme);
          
          // Test key interactive elements
          const buttons = page.locator('button:visible');
          const count = Math.min(await buttons.count(), 3);
          
          for (let i = 0; i < count; i++) {
            const button = buttons.nth(i);
            if (await button.isVisible()) {
              await checkColorContrast(button, 3.0);
            }
          }
        }
      });
    }
  });
});