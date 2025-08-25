import { test, expect } from '@playwright/test';

test.describe('Family Data Sync Test', () => {
  test('Compare family data between localhost and production', async ({ browser }) => {
    // Test credentials - you'll need to provide these
    const testEmail = process.env.TEST_EMAIL || 'your-email@gmail.com';
    const testPassword = process.env.TEST_PASSWORD || 'your-password';
    
    console.log('Testing with email:', testEmail);
    
    // Create two browser contexts
    const localContext = await browser.newContext();
    const prodContext = await browser.newContext();
    
    // Create pages
    const localPage = await localContext.newPage();
    const prodPage = await prodContext.newPage();
    
    // Enable console logging
    localPage.on('console', msg => {
      if (msg.type() === 'log' && (msg.text().includes('User') || msg.text().includes('families'))) {
        console.log('[LOCAL]', msg.text());
      }
    });
    
    prodPage.on('console', msg => {
      if (msg.type() === 'log' && (msg.text().includes('User') || msg.text().includes('families'))) {
        console.log('[PROD]', msg.text());
      }
    });
    
    // Test localhost
    console.log('\n=== TESTING LOCALHOST ===');
    await localPage.goto('http://localhost:3000/login');
    
    // Try Google login on localhost
    await localPage.click('button:has-text("Continue with Google")');
    
    // Wait for popup and handle Google auth
    const [popup] = await Promise.all([
      localPage.waitForEvent('popup'),
      localPage.click('button:has-text("Continue with Google")')
    ]);
    
    if (popup) {
      // Fill in Google credentials
      await popup.fill('input[type="email"]', testEmail);
      await popup.click('#identifierNext');
      await popup.waitForSelector('input[type="password"]', { timeout: 5000 });
      await popup.fill('input[type="password"]', testPassword);
      await popup.click('#passwordNext');
      
      // Wait for popup to close
      await popup.waitForEvent('close');
    }
    
    // Wait for redirect to dashboard
    await localPage.waitForURL(/dashboard/, { timeout: 10000 });
    
    // Get user ID from localStorage
    const localUserId = await localPage.evaluate(() => {
      const auth = window.localStorage.getItem('auth');
      return auth ? JSON.parse(auth).uid : null;
    });
    
    console.log('Local User ID:', localUserId);
    
    // Check for families
    const localFamilies = await localPage.evaluate(async () => {
      // Wait a bit for React to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to find family info in the DOM
      const familyElements = document.querySelectorAll('[data-family-id]');
      const families = Array.from(familyElements).map(el => ({
        id: el.getAttribute('data-family-id'),
        name: el.textContent
      }));
      
      // Also check localStorage
      const storedFamily = window.localStorage.getItem(`lastFamily_${window.localStorage.getItem('auth')?.uid}`);
      
      return {
        families,
        storedFamily,
        hasCreateButton: !!document.querySelector('button:has-text("Create"), a[href*="create"]')
      };
    });
    
    console.log('Local Families:', localFamilies);
    
    // Test production
    console.log('\n=== TESTING PRODUCTION ===');
    await prodPage.goto('https://nextvibe.app/login');
    
    // Repeat the same process for production
    await prodPage.click('button:has-text("Continue with Google")');
    
    // Production uses redirect, so wait for auth redirect
    await prodPage.waitForURL(/dashboard/, { timeout: 15000 });
    
    // Get production user ID
    const prodUserId = await prodPage.evaluate(() => {
      const auth = window.localStorage.getItem('auth');
      return auth ? JSON.parse(auth).uid : null;
    });
    
    console.log('Production User ID:', prodUserId);
    
    // Check for families in production
    const prodFamilies = await prodPage.evaluate(async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const familyElements = document.querySelectorAll('[data-family-id]');
      const families = Array.from(familyElements).map(el => ({
        id: el.getAttribute('data-family-id'),
        name: el.textContent
      }));
      
      const storedFamily = window.localStorage.getItem(`lastFamily_${window.localStorage.getItem('auth')?.uid}`);
      
      return {
        families,
        storedFamily,
        hasCreateButton: !!document.querySelector('button:has-text("Create"), a[href*="create"]')
      };
    });
    
    console.log('Production Families:', prodFamilies);
    
    // Compare results
    console.log('\n=== COMPARISON ===');
    console.log('User IDs match:', localUserId === prodUserId);
    console.log('Local has families:', localFamilies.families.length > 0);
    console.log('Production has families:', prodFamilies.families.length > 0);
    console.log('Local shows create button:', localFamilies.hasCreateButton);
    console.log('Production shows create button:', prodFamilies.hasCreateButton);
    
    // Take screenshots for debugging
    await localPage.screenshot({ path: 'localhost-dashboard.png', fullPage: true });
    await prodPage.screenshot({ path: 'production-dashboard.png', fullPage: true });
    
    // Clean up
    await localContext.close();
    await prodContext.close();
  });
});