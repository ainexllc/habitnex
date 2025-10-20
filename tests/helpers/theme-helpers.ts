import { Page, expect, Locator } from '@playwright/test';

export interface ThemeTestConfig {
  page: Page;
  screenshotPath?: string;
  timeout?: number;
}

export interface ColorContrast {
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
}

/**
 * Set the theme by toggling the theme button
 */
export async function setTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
  const currentTheme = await page.evaluate(() => {
    const root = document.documentElement;
    const dataMode = root.dataset.themeMode;
    if (dataMode === 'light' || dataMode === 'dark') {
      return dataMode;
    }
    return root.classList.contains('dark') ? 'dark' : 'light';
  });

  if (currentTheme !== theme) {
    const themeToggle = page
      .locator('[aria-label*="Switch to"], button:has([data-lucide="sun"]), button:has([data-lucide="moon"])')
      .first();

    if (await themeToggle.isVisible({ timeout: 5000 })) {
      await themeToggle.click();
      await page.waitForTimeout(350);

      const newTheme = await page.evaluate(() => {
        const root = document.documentElement;
        const dataMode = root.dataset.themeMode;
        if (dataMode === 'light' || dataMode === 'dark') {
          return dataMode;
        }
        return root.classList.contains('dark') ? 'dark' : 'light';
      });

      if (newTheme !== theme) {
        throw new Error(`Failed to switch to ${theme} theme. Current theme is ${newTheme}`);
      }
    } else {
      await page.evaluate((targetTheme) => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(targetTheme);
        root.dataset.themeMode = targetTheme;
        root.setAttribute('data-theme', targetTheme);

        const stored = JSON.stringify({ mode: targetTheme, preset: 'tidal' });
        localStorage.setItem('habitnex:theme-preference', stored);
        localStorage.setItem('theme', targetTheme);
        window.dispatchEvent(new StorageEvent('storage', { key: 'habitnex:theme-preference', newValue: stored }));
      }, theme);

      await page.waitForTimeout(350);
    }
  }
}

/**
 * Get the current theme from the page
 */
export async function getCurrentTheme(page: Page): Promise<'light' | 'dark'> {
  return await page.evaluate(() => {
    const root = document.documentElement;
    const dataMode = root.dataset.themeMode;
    if (dataMode === 'light' || dataMode === 'dark') {
      return dataMode;
    }
    return root.classList.contains('dark') ? 'dark' : 'light';
  });
}

/**
 * Verify theme consistency across the page
 */
export async function verifyThemeConsistency(page: Page, expectedTheme: 'light' | 'dark'): Promise<void> {
  // Check root element has correct class
  const rootTheme = await getCurrentTheme(page);
  expect(rootTheme).toBe(expectedTheme);

  // Ensure preference persisted to storage
  const storedTheme = await page.evaluate(() => {
    const stored = localStorage.getItem('habitnex:theme-preference');
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return parsed.mode === 'dark' ? 'dark' : 'light';
    } catch {
      return null;
    }
  });

  if (storedTheme) {
    expect(storedTheme).toBe(expectedTheme);
  }

  // Check body background generally aligns with theme selection
  const bodyBg = await page.locator('body').evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor;
  });

  if (expectedTheme === 'dark') {
    // Dark theme should have dark background
    expect(bodyBg).not.toBe('rgb(255, 255, 255)');
  } else {
    // Light theme should have light background
    expect(bodyBg).not.toBe('rgb(15, 23, 42)');
  }
}

/**
 * Check color contrast for accessibility
 */
export async function checkColorContrast(
  element: Locator,
  minContrast: number = 4.5
): Promise<ColorContrast> {
  const colors = await element.evaluate((el, minContrastValue) => {
    const styles = window.getComputedStyle(el);
    const bgColor = styles.backgroundColor;
    const textColor = styles.color;
    const borderColor = styles.borderColor;

    // Simple contrast ratio calculation (simplified)
    function getRgbValues(color: string): [number, number, number] {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
    }

    function getLuminance(r: number, g: number, b: number): number {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    const [r1, g1, b1] = getRgbValues(bgColor);
    const [r2, g2, b2] = getRgbValues(textColor);
    
    const l1 = getLuminance(r1, g1, b1);
    const l2 = getLuminance(r2, g2, b2);
    
    const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    return {
      backgroundColor: bgColor,
      textColor: textColor,
      borderColor: borderColor,
      contrast: contrast,
      isAccessible: contrast >= minContrastValue
    };
  }, minContrast);

  // Verify contrast meets accessibility standards
  expect(colors.contrast).toBeGreaterThan(minContrast);

  return {
    backgroundColor: colors.backgroundColor,
    textColor: colors.textColor,
    borderColor: colors.borderColor
  };
}

/**
 * Test theme persistence across page navigation
 */
export async function testThemePersistence(
  page: Page,
  startTheme: 'light' | 'dark',
  pagesToTest: string[] = ['/workspace?tab=overview', '/habits', '/moods']
): Promise<void> {
  // Set initial theme
  await setTheme(page, startTheme);
  await verifyThemeConsistency(page, startTheme);

  // Navigate through pages and verify theme persists
  for (const pagePath of pagesToTest) {
    await page.goto(pagePath);
    await page.waitForLoadState('networkidle');
    
    // Wait for theme to load
    await page.waitForTimeout(500);
    
    await verifyThemeConsistency(page, startTheme);
  }
}

/**
 * Test all interactive elements in a theme
 */
export async function testInteractiveElements(page: Page, theme: 'light' | 'dark'): Promise<void> {
  await setTheme(page, theme);

  // Test buttons
  const buttons = page.locator('button:visible');
  const buttonCount = Math.min(await buttons.count(), 10); // Test up to 10 buttons
  
  for (let i = 0; i < buttonCount; i++) {
    const button = buttons.nth(i);
    if (await button.isVisible()) {
      await checkColorContrast(button, 3.0); // Lower contrast for buttons is acceptable
      
      // Test hover state if possible
      await button.hover();
      await page.waitForTimeout(100);
    }
  }

  // Test form inputs
  const inputs = page.locator('input:visible, textarea:visible');
  const inputCount = Math.min(await inputs.count(), 5);
  
  for (let i = 0; i < inputCount; i++) {
    const input = inputs.nth(i);
    if (await input.isVisible()) {
      await checkColorContrast(input, 4.5);
    }
  }

  // Test links
  const links = page.locator('a:visible');
  const linkCount = Math.min(await links.count(), 5);
  
  for (let i = 0; i < linkCount; i++) {
    const link = links.nth(i);
    if (await link.isVisible()) {
      await checkColorContrast(link, 4.5);
    }
  }
}

/**
 * Test modal theme consistency
 */
export async function testModalTheme(page: Page, theme: 'light' | 'dark', modalTriggerSelector: string): Promise<void> {
  await setTheme(page, theme);

  // Open modal
  const trigger = page.locator(modalTriggerSelector);
  if (await trigger.isVisible({ timeout: 5000 })) {
    await trigger.click();
    
    // Wait for modal to appear
    const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Verify modal has correct theme
    await verifyThemeConsistency(page, theme);
    await checkColorContrast(modal, 4.5);
    
    // Test modal form elements if present
    const modalInputs = modal.locator('input, textarea, button');
    const inputCount = Math.min(await modalInputs.count(), 3);
    
    for (let i = 0; i < inputCount; i++) {
      const input = modalInputs.nth(i);
      if (await input.isVisible()) {
        await checkColorContrast(input, 3.0);
      }
    }
    
    // Close modal (try common close methods)
    const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel"), button[aria-label*="close"], [data-testid*="close"]').first();
    if (await closeButton.isVisible({ timeout: 2000 })) {
      await closeButton.click();
    } else {
      // Try escape key
      await page.keyboard.press('Escape');
    }
    
    // Wait for modal to close
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  }
}

/**
 * Take themed screenshot for visual regression
 */
export async function takeThemedScreenshot(
  page: Page,
  theme: 'light' | 'dark',
  name: string,
  options?: {
    fullPage?: boolean;
    clip?: { x: number; y: number; width: number; height: number };
  }
): Promise<void> {
  await setTheme(page, theme);
  await page.waitForTimeout(500); // Let theme settle
  
  const screenshotOptions = {
    path: `tests/screenshots/theme-${theme}-${name}.png`,
    fullPage: options?.fullPage ?? true,
    ...options
  };
  
  await page.screenshot(screenshotOptions);
}

/**
 * Verify no theme flashing occurs
 */
export async function verifyNoThemeFlash(page: Page): Promise<void> {
  // Monitor background color changes during navigation
  let backgroundChanges: string[] = [];
  
  await page.addScriptTag({
    content: `
      let lastBg = window.getComputedStyle(document.body).backgroundColor;
      const observer = new MutationObserver(() => {
        const currentBg = window.getComputedStyle(document.body).backgroundColor;
        if (currentBg !== lastBg) {
          window.bgChanges = window.bgChanges || [];
          window.bgChanges.push({ old: lastBg, new: currentBg, time: Date.now() });
          lastBg = currentBg;
        }
      });
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
    `
  });
  
  // Navigate to a new page
  await page.goto('/workspace?tab=overview');
  await page.waitForLoadState('networkidle');
  
  // Check for background changes
  const changes = await page.evaluate(() => window.bgChanges || []);
  
  // Should have at most 1 change (initial theme load)
  expect(changes.length).toBeLessThanOrEqual(1);
}

/**
 * Get all theme-related CSS custom properties
 */
export async function getThemeVariables(page: Page): Promise<Record<string, string>> {
  return await page.evaluate(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const variables: Record<string, string> = {};
    
    // Get all CSS custom properties
    for (let i = 0; i < computedStyle.length; i++) {
      const property = computedStyle[i];
      if (property.startsWith('--')) {
        variables[property] = computedStyle.getPropertyValue(property).trim();
      }
    }
    
    return variables;
  });
}

/**
 * Test theme variables are properly applied
 */
export async function verifyThemeVariables(page: Page, theme: 'light' | 'dark'): Promise<void> {
  await setTheme(page, theme);
  
  const themeClass = await page.evaluate(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
  
  expect(themeClass).toBe(theme);
  
  // Check some key theme-specific styles
  const bodyStyles = await page.locator('body').evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return {
      backgroundColor: styles.backgroundColor,
      color: styles.color
    };
  });
  
  if (theme === 'dark') {
    expect(bodyStyles.backgroundColor).not.toBe('rgb(255, 255, 255)');
    expect(bodyStyles.color).not.toBe('rgb(0, 0, 0)');
  } else {
    expect(bodyStyles.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(bodyStyles.color).toBe('rgb(15, 23, 42)'); // text-primary-light
  }
}
