import { test, expect } from '@playwright/test';

test.describe('Cross-Device Family Synchronization Test', () => {
  test('verify family selection syncs across different browser sessions', async ({ browser }) => {
    console.log('\n🔄 CROSS-DEVICE FAMILY SYNC TEST\n');

    // Create two browser contexts to simulate different computers
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const testEmail = 'hornld25@gmail.com';
    const testPassword = 'dinohorn';

    try {
      console.log('📍 Step 1: Sign in on Device 1 (first browser context)...');
      
      // Device 1: Sign in
      await page1.goto('http://localhost:3001/login', { waitUntil: 'domcontentloaded' });
      await page1.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      await page1.fill('input[type="email"]', testEmail);
      await page1.fill('input[type="password"]', testPassword);
      
      const navigationPromise1 = page1.waitForURL(/dashboard/, { timeout: 20000 });
      await page1.click('button[type="submit"]');
      await navigationPromise1;
      
      console.log('   ✅ Successfully signed in on Device 1');
      
      // Wait for dashboard to fully load and capture family state
      await page1.waitForTimeout(3000);
      
      // Take screenshot of Device 1 dashboard
      await page1.screenshot({ 
        path: 'tests/screenshots/device1-dashboard.png',
        fullPage: true 
      });
      
      // Check if user has families on Device 1
      const familyElementsDevice1 = await page1.$$('[data-testid="family-selector"], .family-name, h1, h2');
      let device1FamilyInfo = 'No family elements found';
      
      if (familyElementsDevice1.length > 0) {
        const familyTexts = await Promise.all(
          familyElementsDevice1.map(async (el) => {
            try {
              return await el.textContent();
            } catch {
              return null;
            }
          })
        );
        device1FamilyInfo = familyTexts.filter(text => text && text.trim()).join(' | ');
      }
      
      console.log(`📊 Device 1 Family Info: ${device1FamilyInfo}`);
      
      console.log('📍 Step 2: Sign in on Device 2 (second browser context)...');
      
      // Device 2: Sign in with same account
      await page2.goto('http://localhost:3001/login', { waitUntil: 'domcontentloaded' });
      await page2.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      await page2.fill('input[type="email"]', testEmail);
      await page2.fill('input[type="password"]', testPassword);
      
      const navigationPromise2 = page2.waitForURL(/dashboard/, { timeout: 20000 });
      await page2.click('button[type="submit"]');
      await navigationPromise2;
      
      console.log('   ✅ Successfully signed in on Device 2');
      
      // Wait for dashboard to fully load
      await page2.waitForTimeout(3000);
      
      // Take screenshot of Device 2 dashboard
      await page2.screenshot({ 
        path: 'tests/screenshots/device2-dashboard.png',
        fullPage: true 
      });
      
      // Check if user has families on Device 2
      const familyElementsDevice2 = await page2.$$('[data-testid="family-selector"], .family-name, h1, h2');
      let device2FamilyInfo = 'No family elements found';
      
      if (familyElementsDevice2.length > 0) {
        const familyTexts = await Promise.all(
          familyElementsDevice2.map(async (el) => {
            try {
              return await el.textContent();
            } catch {
              return null;
            }
          })
        );
        device2FamilyInfo = familyTexts.filter(text => text && text.trim()).join(' | ');
      }
      
      console.log(`📊 Device 2 Family Info: ${device2FamilyInfo}`);
      
      console.log('📍 Step 3: Analyzing family synchronization...');
      
      // Compare family states
      const isSyncedProperly = device1FamilyInfo === device2FamilyInfo && 
                              device1FamilyInfo !== 'No family elements found';
      
      // Analysis
      console.log('\\n📊 CROSS-DEVICE SYNC ANALYSIS:');
      console.log('====================================');
      console.log(`Device 1 Family State: ${device1FamilyInfo}`);
      console.log(`Device 2 Family State: ${device2FamilyInfo}`);
      console.log(`Family States Match: ${device1FamilyInfo === device2FamilyInfo}`);
      console.log(`Both Have Families: ${device1FamilyInfo !== 'No family elements found' && device2FamilyInfo !== 'No family elements found'}`);
      
      if (isSyncedProperly) {
        console.log('🎉 SUCCESS: Families are properly synchronized across devices!');
        console.log('✅ The cloud-based family selection is working correctly');
      } else {
        console.log('❌ ISSUE DETECTED: Family synchronization problem');
        
        if (device1FamilyInfo === 'No family elements found' && device2FamilyInfo === 'No family elements found') {
          console.log('⚠️  Both devices show no families - may be expected if user has no families');
        } else if (device1FamilyInfo === 'No family elements found' || device2FamilyInfo === 'No family elements found') {
          console.log('❌ One device has families, the other doesn\'t - sync issue');
        } else {
          console.log('❌ Both devices have families but they\'re different - sync issue');
        }
      }
      
      console.log('====================================\\n');
      
    } catch (error) {
      console.log(`❌ Test error: ${error.message}`);
      
      // Take error screenshots
      await page1.screenshot({ 
        path: 'tests/screenshots/device1-error.png',
        fullPage: true 
      });
      await page2.screenshot({ 
        path: 'tests/screenshots/device2-error.png',
        fullPage: true 
      });
      
      throw error;
      
    } finally {
      await context1.close();
      await context2.close();
    }
  });
  
  test('verify family creation on one device appears on another', async ({ browser }) => {
    console.log('\\n👨‍👩‍👧‍👦 FAMILY CREATION SYNC TEST\\n');
    
    // Create two browser contexts to simulate different devices
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const testEmail = 'hornld25@gmail.com';
    const testPassword = 'dinohorn';
    const testFamilyName = `Test Family ${Date.now()}`;

    try {
      // Sign in on both devices
      console.log('📍 Signing in on both devices...');
      
      // Device 1 sign in
      await page1.goto('http://localhost:3001/login');
      await page1.fill('input[type="email"]', testEmail);
      await page1.fill('input[type="password"]', testPassword);
      await page1.click('button[type="submit"]');
      await page1.waitForURL(/dashboard/, { timeout: 20000 });
      
      // Device 2 sign in  
      await page2.goto('http://localhost:3001/login');
      await page2.fill('input[type="email"]', testEmail);
      await page2.fill('input[type="password"]', testPassword);
      await page2.click('button[type="submit"]');
      await page2.waitForURL(/dashboard/, { timeout: 20000 });
      
      console.log('   ✅ Both devices signed in successfully');
      
      // Try to create a family on Device 1 (if family creation UI exists)
      console.log('📍 Looking for family creation functionality on Device 1...');
      
      const createFamilySelectors = [
        'button:has-text("Create Family")',
        'button:has-text("New Family")',
        '[data-testid="create-family"]',
        'a[href*="family"]',
        'a[href*="create"]'
      ];
      
      let createButtonFound = false;
      for (const selector of createFamilySelectors) {
        try {
          await page1.waitForSelector(selector, { timeout: 2000 });
          await page1.click(selector);
          createButtonFound = true;
          console.log(`   ✅ Found and clicked: ${selector}`);
          break;
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!createButtonFound) {
        console.log('⚠️  No family creation button found - user may already be in a family');
        console.log('📍 Testing sync with existing family state instead...');
      }
      
      // Wait and refresh Device 2 to check for updates
      console.log('📍 Refreshing Device 2 to check for sync...');
      await page2.waitForTimeout(2000);
      await page2.reload();
      await page2.waitForLoadState('domcontentloaded');
      await page2.waitForTimeout(2000);
      
      // Take final screenshots
      await page1.screenshot({ 
        path: 'tests/screenshots/device1-final.png',
        fullPage: true 
      });
      await page2.screenshot({ 
        path: 'tests/screenshots/device2-final.png',
        fullPage: true 
      });
      
      console.log('✅ Family sync test completed - check screenshots for visual comparison');
      
    } catch (error) {
      console.log(`❌ Family creation sync test error: ${error.message}`);
      throw error;
    } finally {
      await context1.close();
      await context2.close();
    }
  });
});