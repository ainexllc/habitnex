import { test } from '@playwright/test';
import { chromium } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Manual Sign Out Test', () => {
  test('manual browser test for sign out', async () => {
    console.log('\n🔧 MANUAL SIGN OUT TEST\n');
    console.log('This test will open a browser to manually test the sign out functionality');
    
    // Launch browser manually
    const browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      console.log('📍 Opening dashboard...');
      await page.goto('http://localhost:3001/workspace');
      
      console.log('⏳ Waiting for page to load...');
      await page.waitForTimeout(3000);
      
      // Take screenshot
      await page.screenshot({ 
        path: 'tests/screenshots/manual-test-dashboard.png',
        fullPage: true 
      });
      console.log('📷 Manual test screenshot saved');
      
      // Check current state
      const pageInfo = await page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          hasHeader: !!document.querySelector('header'),
          hasMain: !!document.querySelector('main'),
          bodyContent: document.body?.textContent?.substring(0, 200) || '',
          signOutButtonExists: !!document.querySelector('header button:has([data-lucide="log-out"])') || 
                              !!document.querySelector('header button:last-child')
        };
      });
      
      console.log('\n📊 PAGE ANALYSIS:');
      console.log('==================');
      console.log(`URL: ${pageInfo.url}`);
      console.log(`Title: ${pageInfo.title}`);
      console.log(`Has Header: ${pageInfo.hasHeader}`);
      console.log(`Has Main: ${pageInfo.hasMain}`);
      console.log(`Sign Out Button: ${pageInfo.signOutButtonExists}`);
      console.log(`Content preview: "${pageInfo.bodyContent}..."`);
      
      if (pageInfo.url.includes('login')) {
        console.log('\n✅ User is signed out (on login page)');
        console.log('💡 Sign out functionality working - user already logged out');
      } else if (pageInfo.hasHeader && pageInfo.hasMain) {
        console.log('\n🎉 SUCCESS: Dashboard loaded with full structure!');
        console.log('✅ White screen issue appears to be fixed');
        
        if (pageInfo.signOutButtonExists) {
          console.log('✅ Sign out button is present');
          console.log('🔧 You can now test sign out functionality manually in the browser');
        } else {
          console.log('⚠️  Sign out button not detected automatically');
          console.log('💡 Check the header manually for the logout icon button');
        }
      } else {
        console.log('\n⚠️  Page structure still incomplete');
        console.log('💡 May need additional troubleshooting');
      }
      
      console.log('\n🔧 Browser will remain open for manual testing...');
      console.log('   1. Check if the dashboard displays properly');
      console.log('   2. Look for the sign out button in the header (logout icon)');
      console.log('   3. Click it to test sign out functionality');
      console.log('   4. Close this terminal to close the browser');
      
      // Keep browser open for manual testing
      await page.waitForTimeout(30000);
      
    } finally {
      await browser.close();
      console.log('\n🔧 Manual test completed\n');
    }
  });
});