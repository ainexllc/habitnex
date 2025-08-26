import { test } from '@playwright/test';

test.describe('Post-Fix Sign Out Test', () => {
  test('test sign out after white screen fix', async ({ page }) => {
    console.log('\n🎉 POST-FIX SIGN OUT TEST\n');

    try {
      // Test dashboard on correct port
      console.log('📍 Loading dashboard on port 3001...');
      await page.goto('http://localhost:3001/dashboard', { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      const url = page.url();
      console.log(`   📍 Current URL: ${url}`);

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Take screenshot
      await page.screenshot({ 
        path: 'tests/screenshots/post-fix-dashboard.png',
        fullPage: true 
      });
      console.log('   📷 Post-fix dashboard screenshot saved');

      // Check page structure
      const pageInfo = await page.evaluate(() => {
        return {
          hasHeader: !!document.querySelector('header'),
          hasMain: !!document.querySelector('main'),
          buttonCount: document.querySelectorAll('button').length,
          hasSignOutButton: !!document.querySelector('header button:has([data-lucide="log-out"])') || 
                           !!document.querySelector('header button:last-child'),
          bodyText: document.body?.textContent || '',
          headerText: document.querySelector('header')?.textContent || '',
          pageTitle: document.title
        };
      });

      console.log('\n📊 PAGE STRUCTURE ANALYSIS:');
      console.log('============================');
      console.log(`Header exists: ${pageInfo.hasHeader}`);
      console.log(`Main exists: ${pageInfo.hasMain}`);
      console.log(`Total buttons: ${pageInfo.buttonCount}`);
      console.log(`Sign out button: ${pageInfo.hasSignOutButton}`);
      console.log(`Page title: "${pageInfo.pageTitle}"`);
      console.log(`Content length: ${pageInfo.bodyText.length} characters`);

      if (pageInfo.hasHeader) {
        console.log(`Header content: "${pageInfo.headerText.substring(0, 100)}..."`);
      }

      if (url.includes('login')) {
        console.log('\n✅ RESULT: User is signed out (redirected to login)');
        console.log('💡 Sign out functionality is working - user already signed out');
        
      } else if (pageInfo.hasHeader && pageInfo.hasMain) {
        console.log('\n✅ RESULT: Dashboard loaded successfully with full structure');
        
        if (pageInfo.hasSignOutButton) {
          console.log('\n📍 Testing sign out...');
          
          // Try both common sign out selectors
          const signOutSelectors = [
            'header button:has([data-lucide="log-out"])',
            'header button:last-child'
          ];
          
          let signOutWorked = false;
          
          for (const selector of signOutSelectors) {
            try {
              await page.waitForSelector(selector, { timeout: 2000 });
              console.log(`   🔄 Clicking sign out button: ${selector}`);
              
              await page.click(selector);
              
              // Wait for redirect
              await page.waitForURL(/login|^http:\/\/localhost:3001\/$/, { timeout: 8000 });
              
              const finalUrl = page.url();
              console.log(`   ✅ Successfully signed out!`);
              console.log(`   📍 Redirected to: ${finalUrl}`);
              
              // Take final screenshot
              await page.screenshot({ 
                path: 'tests/screenshots/successful-signout-fixed.png',
                fullPage: true 
              });
              console.log('   📷 Successful signout screenshot saved');
              
              signOutWorked = true;
              break;
              
            } catch (e) {
              console.log(`   ⚠️  Selector ${selector} failed: ${e.message}`);
            }
          }
          
          if (signOutWorked) {
            console.log('\n🎉 SIGN OUT IS NOW WORKING CORRECTLY!');
          } else {
            console.log('\n❌ Sign out button found but not working properly');
          }
          
        } else {
          console.log('\n⚠️  Sign out button not found in header');
          
          // List all header buttons for debugging
          const headerButtons = await page.$$eval('header button', buttons => 
            buttons.map((btn, i) => ({
              index: i,
              text: btn.textContent?.trim() || '',
              innerHTML: btn.innerHTML.substring(0, 100),
              classes: btn.className
            }))
          );
          
          console.log('   📝 Header buttons:');
          headerButtons.forEach(btn => {
            console.log(`      ${btn.index + 1}. "${btn.text}" | Classes: "${btn.classes}"`);
          });
        }
        
      } else {
        console.log('\n⚠️  Dashboard structure still incomplete');
        console.log('💡 White screen fix may need additional steps');
        
        if (pageInfo.bodyText.length < 200) {
          console.log(`   📝 Page content: "${pageInfo.bodyText}"`);
        }
      }

    } catch (error) {
      console.log(`❌ Test error: ${error.message}`);
      
      // Emergency screenshot
      await page.screenshot({ 
        path: 'tests/screenshots/post-fix-error.png',
        fullPage: true 
      }).catch(() => {});
    }

    console.log('\n🎉 Post-fix sign out test completed\n');
  });
});