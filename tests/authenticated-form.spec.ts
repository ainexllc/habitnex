import { test, expect, chromium } from '@playwright/test';

test.describe('Authenticated Habit Form Tests', () => {
  let browser;
  let context;
  let page;

  test.beforeAll(async () => {
    // Launch Chrome with persistent context to use existing session
    context = await chromium.launchPersistentContext('/Users/dino/Library/Application Support/Google/Chrome/Default', {
      headless: false, // Keep visible so you can see what's happening
      channel: 'chrome', // Use your Chrome installation
      viewport: { width: 1280, height: 720 },
      args: [
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions-except',
        '--disable-default-apps',
      ]
    });
    
    page = await context.newPage();
    browser = context; // For cleanup
  });

  test.afterAll(async () => {
    await browser?.close();
  });

  test('check if habit form loads with authenticated session', async () => {
    console.log('Testing with authenticated session...');
    
    // Navigate to the habits/new page
    await page.goto('http://localhost:3001/habits/new');
    await page.waitForLoadState('domcontentloaded');
    
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Take a screenshot to see what's actually displayed
    await page.screenshot({ path: 'authenticated-habits-new.png', fullPage: true });
    
    // Check if we're redirected to login
    if (page.url().includes('/login')) {
      console.log('Still redirected to login - need to sign in manually first');
      
      // Wait for manual sign-in
      console.log('Please sign in manually in the browser, then press any key...');
      
      // Try dashboard first to verify auth
      await page.goto('http://localhost:3001/workspace');
      await page.waitForLoadState('domcontentloaded');
      console.log('Dashboard URL:', page.url());
      
      // Now try habits/new again
      await page.goto('http://localhost:3001/habits/new');
      await page.waitForLoadState('domcontentloaded');
      console.log('Habits/new URL after auth:', page.url());
    }
    
    // Check for form elements
    const formCount = await page.locator('form').count();
    const nameInputCount = await page.locator('input[name="name"]').count();
    const allInputsCount = await page.locator('input').count();
    
    console.log('Forms found:', formCount);
    console.log('Name inputs found:', nameInputCount);
    console.log('All inputs found:', allInputsCount);
    
    // Check what's actually on the page
    const bodyText = await page.locator('body').textContent();
    console.log('Page contains "Add" or "Create":', bodyText.includes('Add') || bodyText.includes('Create'));
    console.log('Page contains "Habit":', bodyText.includes('Habit'));
    
    // Look for any error messages
    const errorElements = await page.locator('[class*="error"], .error, [data-testid*="error"]').count();
    console.log('Error elements found:', errorElements);
    
    // Check if page is loading
    const loadingElements = await page.locator('[class*="loading"], .loading, [data-testid*="loading"]').count();
    console.log('Loading elements found:', loadingElements);
    
    // Get all headings to understand page structure
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('Page headings:', headings);
    
    // If form exists, test it
    if (formCount > 0) {
      console.log('Form found! Testing form functionality...');
      
      // Try to fill the name field
      const nameInput = page.locator('input[name="name"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Habit from Playwright');
        console.log('Successfully filled name field');
        
        // Look for color selection
        const colorButtons = page.locator('button[style*="background-color"]');
        const colorCount = await colorButtons.count();
        console.log('Color buttons found:', colorCount);
        
        if (colorCount > 0) {
          await colorButtons.first().click();
          console.log('Selected color');
        }
        
        // Look for submit button
        const submitButton = page.locator('button:has-text("Create Habit"), button[type="submit"]');
        const submitCount = await submitButton.count();
        console.log('Submit buttons found:', submitCount);
        
        if (submitCount > 0) {
          console.log('Form appears complete - ready for testing');
        }
      }
    } else {
      console.log('No form found - investigating page structure...');
      
      // Check if we're on the right page
      const pageContent = await page.content();
      console.log('Page HTML length:', pageContent.length);
      
      // Look for React/Next.js specific elements
      const reactElements = await page.locator('[data-reactroot], #__next').count();
      console.log('React root elements found:', reactElements);
      
      // Check console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('Browser console error:', msg.text());
        }
      });
      
      // Check for JavaScript errors
      page.on('pageerror', error => {
        console.log('Page error:', error.message);
      });
      
      // Wait a bit for any dynamic content to load
      await page.waitForTimeout(3000);
      
      // Check again after waiting
      const formCountAfterWait = await page.locator('form').count();
      const inputCountAfterWait = await page.locator('input').count();
      console.log('After waiting - Forms:', formCountAfterWait, 'Inputs:', inputCountAfterWait);
    }
  });

  test('test navigation to habit form from dashboard', async () => {
    console.log('Testing navigation from dashboard...');
    
    // Start from dashboard
    await page.goto('http://localhost:3001/workspace');
    await page.waitForLoadState('domcontentloaded');
    
    console.log('Dashboard URL:', page.url());
    await page.screenshot({ path: 'authenticated-dashboard.png', fullPage: true });
    
    // Look for "Add Habit" or similar buttons
    const allButtons = await page.locator('button, a').allTextContents();
    const addButtons = allButtons.filter(text => 
      text.includes('Add') || text.includes('Create') || text.includes('New') || text.includes('Habit')
    );
    console.log('Potential Add Habit buttons:', addButtons);
    
    // Try to find and click add habit button
    const addHabitSelectors = [
      'a:has-text("Add Habit")',
      'button:has-text("Add Habit")',
      'a:has-text("Create Habit")',
      'button:has-text("Create Habit")',
      'a:has-text("New Habit")',
      'button:has-text("New Habit")',
      '[href="/habits/new"]',
      '[href*="habits"][href*="new"]'
    ];
    
    for (const selector of addHabitSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`Found add habit button with selector: ${selector}`);
        await element.click();
        await page.waitForLoadState('domcontentloaded');
        console.log('After clicking, URL is:', page.url());
        
        // Check if we reached the form
        const formExists = await page.locator('form').count() > 0;
        if (formExists) {
          console.log('Successfully navigated to habit form!');
          break;
        }
      }
    }
  });

  test('test navigation from habits page', async () => {
    console.log('Testing navigation from habits page...');
    
    // Go to habits page
    await page.goto('http://localhost:3001/habits');
    await page.waitForLoadState('domcontentloaded');
    
    console.log('Habits page URL:', page.url());
    await page.screenshot({ path: 'authenticated-habits.png', fullPage: true });
    
    // Similar process for habits page
    const allButtons = await page.locator('button, a').allTextContents();
    const addButtons = allButtons.filter(text => 
      text.includes('Add') || text.includes('Create') || text.includes('New') || text.includes('Habit')
    );
    console.log('Add buttons on habits page:', addButtons);
  });
});