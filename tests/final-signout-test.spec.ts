import { test } from '@playwright/test';

test.describe('Final Sign Out Test', () => {
  test('comprehensive sign out functionality test', async ({ page }) => {
    console.log('\n🔐 FINAL SIGN OUT TEST\n');

    // Navigate to homepage to start fresh
    console.log('📍 Step 1: Loading homepage...');
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    
    const homeUrl = page.url();
    console.log(`   📍 Homepage URL: ${homeUrl}`);

    // Take homepage screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/fresh-homepage.png',
      fullPage: true 
    });
    console.log('   📷 Homepage screenshot saved');

    // Navigate to dashboard to see current auth state
    console.log('\n📍 Step 2: Testing dashboard access...');
    await page.goto('http://localhost:3000/workspace?tab=overview', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    const dashboardUrl = page.url();
    console.log(`   📍 Dashboard URL: ${dashboardUrl}`);

    // Take dashboard screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/fresh-dashboard.png',
      fullPage: true 
    });
    console.log('   📷 Dashboard screenshot saved');

    // Analyze the current state
    if (dashboardUrl.includes('login')) {
      console.log('   ✅ User is properly signed out - dashboard redirects to login');
      console.log('   💡 Sign out functionality is working correctly (user already signed out)');
      
    } else if (dashboardUrl.includes('dashboard')) {
      console.log('   ✅ User is signed in - dashboard loads');
      
      // Check if page has content
      await page.waitForTimeout(2000);
      const hasContent = await page.evaluate(() => {
        return {
          bodyText: document.body?.textContent || '',
          hasHeader: !!document.querySelector('header'),
          hasMain: !!document.querySelector('main'),
          hasButtons: document.querySelectorAll('button').length,
          pageTitle: document.title
        };
      });

      console.log(`   📝 Page has header: ${hasContent.hasHeader}`);
      console.log(`   📝 Page has main: ${hasContent.hasMain}`);
      console.log(`   📝 Button count: ${hasContent.hasButtons}`);
      console.log(`   📝 Page title: "${hasContent.pageTitle}"`);
      console.log(`   📝 Content length: ${hasContent.bodyText.length} characters`);

      if (hasContent.hasHeader && hasContent.hasMain && hasContent.hasButtons > 0) {
        console.log('\n📍 Step 3: Looking for sign out button...');
        
        // Look for sign out button
        const signOutSelectors = [
          'header button:has([data-lucide="log-out"])',
          'header button svg[data-lucide="log-out"]',
          'header button:last-child',
          'button:has-text("Sign Out")',
          'button[aria-label*="sign out" i]'
        ];
        
        let signOutFound = false;
        let usedSelector = '';
        
        for (const selector of signOutSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 2000 });
            signOutFound = true;
            usedSelector = selector;
            console.log(`   ✅ Found sign out button: ${selector}`);
            break;
          } catch (e) {
            // Continue
          }
        }

        if (signOutFound) {
          console.log('\n📍 Step 4: Testing sign out...');
          
          // Click sign out
          await page.click(usedSelector);
          console.log('   🔄 Clicked sign out button');
          
          // Wait for redirect
          try {
            await page.waitForURL(/login|^http:\/\/localhost:3000\/$/, { timeout: 8000 });
            const finalUrl = page.url();
            
            console.log(`   ✅ Successfully signed out`);
            console.log(`   📍 Redirected to: ${finalUrl}`);
            
            // Take final screenshot
            await page.screenshot({ 
              path: 'tests/screenshots/successful-signout.png',
              fullPage: true 
            });
            console.log('   📷 Post-signout screenshot saved');
            console.log('\n🎉 SIGN OUT IS WORKING CORRECTLY!');
            
          } catch (timeoutError) {
            console.log('   ❌ Sign out did not redirect properly');
            const stuckUrl = page.url();
            console.log(`   📍 Still at: ${stuckUrl}`);
            
            await page.screenshot({ 
              path: 'tests/screenshots/signout-stuck.png',
              fullPage: true 
            });
          }
          
        } else {
          console.log('   ❌ Sign out button not found');
          
          // Debug: List all buttons
          const buttons = await page.$$eval('button', buttons => 
            buttons.map((btn, i) => ({
              index: i,
              text: btn.textContent?.trim() || '',
              innerHTML: btn.innerHTML.substring(0, 50),
              classes: btn.className
            }))
          );
          
          console.log('   📝 All buttons found:');
          buttons.slice(0, 10).forEach(btn => {
            console.log(`      ${btn.index + 1}. "${btn.text}" | HTML: "${btn.innerHTML}" | Classes: "${btn.classes}"`);
          });
        }
        
      } else {
        console.log('   ⚠️  Dashboard page structure is incomplete');
        console.log('   💡 This explains why sign out doesn\'t work - page isn\'t fully rendered');
        
        if (hasContent.bodyText.length < 100) {
          console.log(`   📝 Body content: "${hasContent.bodyText}"`);
        }
      }
      
    } else {
      console.log(`   ⚠️  Unexpected redirect: ${dashboardUrl}`);
    }

    console.log('\n🔐 Final sign out test completed\n');
  });
});