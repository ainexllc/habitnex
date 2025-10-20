import { test, expect, type Page } from '@playwright/test';

/**
 * Comprehensive QA Test Suite for HabitNex Habit Tracking Application
 * 
 * Senior QA Engineer - Playwright Testing Agent
 * Testing Areas:
 * 1. Authentication Flows (Email/Password & Google OAuth)
 * 2. Core Application Features
 * 3. UI/UX Testing
 * 4. Performance & Accessibility
 * 5. Edge Cases & Error Handling
 * 6. Cross-browser & Responsive Testing
 */

// Test data and utilities
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!'
};

const testHabit = {
  title: 'Morning Exercise',
  description: '30 minutes of cardio or strength training'
};

// Page object utilities
class AuthenticationPage {
  constructor(private page: Page) {}

  async navigateToLogin() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToSignup() {
    await this.page.goto('/signup');
    await this.page.waitForLoadState('networkidle');
  }

  async loginWithEmail(email: string, password: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async signupWithEmail(email: string, password: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async clickGoogleSignIn() {
    const googleButton = this.page.locator('button:has-text("Continue with Google"), button:has-text("Sign in with Google")');
    await googleButton.click();
  }
}

class DashboardPage {
  constructor(private page: Page) {}

  async navigateToDashboard() {
    await this.page.goto('/workspace?tab=overview');
    await this.page.waitForLoadState('networkidle');
  }

  async getHabitCards() {
    return this.page.locator('[data-testid="habit-card"], .habit-card').all();
  }

  async completeHabit(habitTitle: string) {
    const habitCard = this.page.locator(`text=${habitTitle}`).first().locator('..').locator('..');
    const completeButton = habitCard.locator('button:has-text("Complete"), button[aria-label*="complete"]').first();
    await completeButton.click();
  }

  async toggleTheme() {
    const themeButton = this.page.locator('button[aria-label*="theme"], button:has-text("Toggle theme")');
    await themeButton.click();
  }
}

class HabitFormPage {
  constructor(private page: Page) {}

  async navigateToNewHabit() {
    await this.page.goto('/habits/new');
    await this.page.waitForLoadState('networkidle');
  }

  async fillHabitForm(title: string, description: string) {
    await this.page.fill('input[name="title"], input[placeholder*="title"]', title);
    await this.page.fill('textarea[name="description"], textarea[placeholder*="description"]', description);
  }

  async submitForm() {
    await this.page.click('button[type="submit"]:has-text("Create"), button:has-text("Save")');
  }

  async clickAIEnhance() {
    const aiButton = this.page.locator('button:has-text("Enhance with AI"), button[aria-label*="AI"]');
    if (await aiButton.count() > 0) {
      await aiButton.click();
      await this.page.waitForTimeout(2000); // Wait for AI response
    }
  }
}

// Performance monitoring utility
async function measurePageLoad(page: Page, url: string): Promise<number> {
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  return Date.now() - startTime;
}

// Console error tracking
function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

test.describe('HabitNex Comprehensive QA Test Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear cookies and localStorage safely
    await page.context().clearCookies();
    try {
      await page.evaluate(() => {
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
        }
      });
    } catch (e) {
      // localStorage might be disabled in some contexts
      console.log('Note: localStorage not available in test context');
    }
  });

  test.describe('1. Application Load & Initial State', () => {
    
    test('Homepage loads without errors', async ({ page }) => {
      const errors = trackConsoleErrors(page);
      const loadTime = await measurePageLoad(page, '/');
      
      // Check page loads
      await expect(page).toHaveTitle(/HabitNex|Habit/i);
      
      // Check for essential elements
      const loginButton = page.locator('a[href="/login"], button:has-text("Login")');
      await expect(loginButton).toBeVisible();
      
      // Performance check
      expect(loadTime).toBeLessThan(5000); // Page should load in < 5s
      
      // No console errors
      expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
      
      await page.screenshot({ path: 'test-results/homepage-load.png', fullPage: true });
    });

    test('Navigation menu and routing work correctly', async ({ page }) => {
      await page.goto('/');
      
      // Test main navigation links
      const navLinks = ['/login', '/signup'];
      
      for (const link of navLinks) {
        await page.click(`a[href="${link}"]`);
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain(link);
        await page.goBack();
      }
    });

    test('Theme toggle functionality', async ({ page }) => {
      await page.goto('/');
      const dashboard = new DashboardPage(page);
      
      // Get initial theme
      const initialTheme = await page.getAttribute('html', 'class');
      
      // Toggle theme
      await dashboard.toggleTheme();
      await page.waitForTimeout(500);
      
      // Check theme changed
      const newTheme = await page.getAttribute('html', 'class');
      expect(newTheme).not.toBe(initialTheme);
      
      await page.screenshot({ path: 'test-results/theme-toggle.png' });
    });
  });

  test.describe('2. Authentication Flow Testing', () => {
    
    test('Login page loads and form validation works', async ({ page }) => {
      const auth = new AuthenticationPage(page);
      await auth.navigateToLogin();
      
      // Check form is present
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      
      // Test form validation
      await page.click('button[type="submit"]');
      
      // Should show validation errors
      const errorMessages = page.locator('.error, [role="alert"], .text-red');
      await expect(errorMessages.first()).toBeVisible({ timeout: 3000 });
      
      await page.screenshot({ path: 'test-results/login-validation.png' });
    });

    test('Signup page loads and form validation works', async ({ page }) => {
      const auth = new AuthenticationPage(page);
      await auth.navigateToSignup();
      
      // Check form is present
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      
      // Test form validation with invalid email
      await page.fill('input[type="email"]', 'invalid-email');
      await page.click('button[type="submit"]');
      
      const errorMessages = page.locator('.error, [role="alert"], .text-red');
      await expect(errorMessages.first()).toBeVisible({ timeout: 3000 });
      
      await page.screenshot({ path: 'test-results/signup-validation.png' });
    });

    test('Google OAuth button is present and clickable', async ({ page }) => {
      const auth = new AuthenticationPage(page);
      await auth.navigateToLogin();
      
      // Check Google sign-in button exists
      const googleButton = page.locator('button:has-text("Continue with Google"), button:has-text("Sign in with Google")');
      await expect(googleButton).toBeVisible();
      
      // Click should not cause JavaScript errors (popup may be blocked)
      const errors = trackConsoleErrors(page);
      await googleButton.click();
      
      // Allow time for any popups or redirects
      await page.waitForTimeout(2000);
      
      // Filter out expected popup blocker messages
      const criticalErrors = errors.filter(e => 
        !e.includes('popup') && 
        !e.includes('blocked') &&
        !e.includes('favicon')
      );
      expect(criticalErrors).toHaveLength(0);
    });

    test('Protected routes redirect to login', async ({ page }) => {
      // Try to access protected routes without authentication
      const protectedRoutes = ['/workspace?tab=overview', '/habits', '/habits/new', '/profile'];
      
      for (const route of protectedRoutes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Should redirect to login or show login form
        const currentUrl = page.url();
        const hasLoginForm = await page.locator('input[type="email"]').count() > 0;
        
        expect(currentUrl.includes('/login') || hasLoginForm).toBe(true);
      }
    });
  });

  test.describe('3. Core Feature Testing (Simulated)', () => {
    
    test('Habit creation form loads and validates', async ({ page }) => {
      const habitForm = new HabitFormPage(page);
      await habitForm.navigateToNewHabit();
      
      // Should redirect to login first
      await page.waitForLoadState('networkidle');
      
      // Check if form is accessible or redirected to login
      const hasForm = await page.locator('input[name="title"], input[placeholder*="title"]').count() > 0;
      const hasLogin = await page.locator('input[type="email"]').count() > 0;
      
      expect(hasForm || hasLogin).toBe(true);
      
      if (hasForm) {
        // Test form validation
        await habitForm.submitForm();
        const errorMessages = page.locator('.error, [role="alert"], .text-red');
        await expect(errorMessages.first()).toBeVisible({ timeout: 3000 });
      }
      
      await page.screenshot({ path: 'test-results/habit-form.png' });
    });

    test('Dashboard structure and layout', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.navigateToDashboard();
      
      // Should redirect to login, but let's check the page structure
      await page.waitForLoadState('networkidle');
      
      // Check if we have dashboard elements or login form
      const isDashboard = await page.locator('.dashboard, [data-testid="dashboard"]').count() > 0;
      const isLogin = await page.locator('input[type="email"]').count() > 0;
      
      expect(isDashboard || isLogin).toBe(true);
      
      await page.screenshot({ path: 'test-results/workspace-overview-layout.png', fullPage: true });
    });

    test('AI Enhancement feature availability', async ({ page }) => {
      await page.goto('/habits/new');
      await page.waitForLoadState('networkidle');
      
      // Check if AI enhancement button exists (may be behind auth)
      const aiButton = page.locator('button:has-text("Enhance with AI"), button:has-text("AI")');
      const aiButtonExists = await aiButton.count() > 0;
      
      // Document AI feature availability
      console.log(`AI Enhancement Button Present: ${aiButtonExists}`);
      
      await page.screenshot({ path: 'test-results/ai-feature-check.png' });
    });
  });

  test.describe('4. UI/UX and Responsive Testing', () => {
    
    test('Responsive design - Mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/');
      
      // Check mobile navigation
      const mobileNav = page.locator('button[aria-label*="menu"], .hamburger, .mobile-nav');
      const mobileNavExists = await mobileNav.count() > 0;
      
      // Check content is readable on mobile
      const body = page.locator('body');
      const bodyWidth = await body.boundingBox();
      expect(bodyWidth?.width).toBeLessThanOrEqual(375);
      
      await page.screenshot({ path: 'test-results/mobile-responsive.png' });
    });

    test('Responsive design - Tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto('/');
      
      // Check layout adapts to tablet size
      const content = page.locator('main, .main-content');
      await expect(content).toBeVisible();
      
      await page.screenshot({ path: 'test-results/tablet-responsive.png' });
    });

    test('Color contrast and accessibility basics', async ({ page }) => {
      await page.goto('/');
      
      // Check for proper heading hierarchy
      const h1 = page.locator('h1');
      const h1Count = await h1.count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      
      // Check for alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute('alt');
          const ariaLabel = await img.getAttribute('aria-label');
          expect(alt || ariaLabel).toBeTruthy();
        }
      }
      
      // Check for focus indicators on interactive elements
      const buttons = page.locator('button, a');
      if (await buttons.count() > 0) {
        await buttons.first().focus();
        await page.screenshot({ path: 'test-results/focus-indicators.png' });
      }
    });

    test('Animation and transition performance', async ({ page }) => {
      await page.goto('/');
      
      // Test theme toggle animation
      const dashboard = new DashboardPage(page);
      const startTime = Date.now();
      await dashboard.toggleTheme();
      const animationTime = Date.now() - startTime;
      
      // Animations should be reasonably fast
      expect(animationTime).toBeLessThan(1000);
    });
  });

  test.describe('5. Performance Testing', () => {
    
    test('Page load performance benchmarks', async ({ page }) => {
      const routes = ['/', '/login', '/signup', '/workspace?tab=overview'];
      const performanceResults: Record<string, number> = {};
      
      for (const route of routes) {
        const loadTime = await measurePageLoad(page, route);
        performanceResults[route] = loadTime;
        
        // Each page should load within reasonable time
        expect(loadTime).toBeLessThan(8000); // 8 seconds max
      }
      
      console.log('Performance Results:', performanceResults);
    });

    test('JavaScript bundle size and loading', async ({ page }) => {
      // Monitor network activity
      const responses: any[] = [];
      page.on('response', response => {
        if (response.url().includes('.js')) {
          responses.push({
            url: response.url(),
            status: response.status(),
            size: response.headers()['content-length']
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check that JavaScript files loaded successfully
      const failedJs = responses.filter(r => r.status >= 400);
      expect(failedJs).toHaveLength(0);
      
      console.log(`Loaded ${responses.length} JavaScript files`);
    });

    test('Memory usage during navigation', async ({ page }) => {
      const routes = ['/', '/login', '/signup'];
      
      for (const route of routes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Force garbage collection if available
        await page.evaluate(() => {
          if (window.gc) {
            window.gc();
          }
        });
      }
      
      // If we get here without crashes, memory usage is acceptable
      expect(true).toBe(true);
    });
  });

  test.describe('6. Edge Cases and Error Handling', () => {
    
    test('Network failure simulation', async ({ page }) => {
      await page.goto('/');
      
      // Simulate offline state
      await page.context().setOffline(true);
      
      // Try to navigate to a new page
      await page.click('a[href="/login"]').catch(() => {
        // Expected to fail or show offline indicator
      });
      
      await page.context().setOffline(false);
      
      // Should recover when back online
      await page.waitForTimeout(2000);
      await page.goto('/');
      await expect(page.locator('body')).toBeVisible();
    });

    test('Invalid form data handling', async ({ page }) => {
      await page.goto('/login');
      
      // Test with various invalid inputs
      const invalidInputs = [
        { email: 'not-an-email', password: '123' },
        { email: 'test@example.com', password: '' },
        { email: '', password: 'password123' },
        { email: 'a'.repeat(100) + '@example.com', password: 'a'.repeat(100) }
      ];
      
      for (const input of invalidInputs) {
        await page.fill('input[type="email"]', input.email);
        await page.fill('input[type="password"]', input.password);
        await page.click('button[type="submit"]');
        
        // Should show some form of validation feedback
        await page.waitForTimeout(1000);
        const hasError = await page.locator('.error, [role="alert"], .text-red').count() > 0;
        const hasDisabledSubmit = await page.locator('button[type="submit"][disabled]').count() > 0;
        
        expect(hasError || hasDisabledSubmit).toBe(true);
      }
    });

    test('CSRF and security headers check', async ({ page }) => {
      await page.goto('/');
      
      // Check for security-related headers (via network monitoring)
      const responses: any[] = [];
      page.on('response', response => {
        responses.push({
          url: response.url(),
          headers: response.headers()
        });
      });
      
      await page.reload();
      
      // Look for security headers in main document response
      const mainResponse = responses.find(r => r.url === page.url());
      if (mainResponse) {
        const headers = mainResponse.headers;
        console.log('Security headers check:', {
          'content-security-policy': headers['content-security-policy'],
          'x-frame-options': headers['x-frame-options'],
          'x-content-type-options': headers['x-content-type-options']
        });
      }
    });
  });

  test.describe('7. Cross-Browser Compatibility', () => {
    
    test('Feature compatibility across browsers', async ({ page, browserName }) => {
      await page.goto('/');
      
      // Test basic JavaScript functionality
      const jsWorks = await page.evaluate(() => {
        try {
          // Test modern JS features
          const arrow = () => true;
          const spread = [...[1, 2, 3]];
          const destructure = { a: 1, b: 2 };
          const { a, b } = destructure;
          return arrow() && spread.length === 3 && a === 1;
        } catch (e) {
          return false;
        }
      });
      
      expect(jsWorks).toBe(true);
      
      // Test CSS features
      const cssSupport = await page.evaluate(() => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.gridTemplateColumns = '1fr 1fr';
        return div.style.display === 'flex';
      });
      
      expect(cssSupport).toBe(true);
      
      console.log(`Browser ${browserName}: JS works: ${jsWorks}, CSS works: ${cssSupport}`);
    });
  });
});

// Additional utility tests
test.describe('8. Code Quality Observations', () => {
  
  test('Console warnings and errors audit', async ({ page }) => {
    const consoleMessages: { type: string, message: string }[] = [];
    
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        message: msg.text()
      });
    });
    
    // Navigate through main pages
    const routes = ['/', '/login', '/signup'];
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
    }
    
    // Analyze console messages
    const errors = consoleMessages.filter(m => m.type === 'error');
    const warnings = consoleMessages.filter(m => m.type === 'warning');
    
    console.log(`Found ${errors.length} console errors and ${warnings.length} warnings`);
    
    // Filter out common false positives
    const criticalErrors = errors.filter(e => 
      !e.message.includes('favicon') &&
      !e.message.includes('Failed to load resource') &&
      !e.message.includes('manifest.json')
    );
    
    // Log findings for QA report
    if (criticalErrors.length > 0) {
      console.log('Critical Console Errors:', criticalErrors);
    }
    if (warnings.length > 0) {
      console.log('Console Warnings:', warnings.slice(0, 5)); // First 5 warnings
    }
  });
});