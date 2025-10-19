import { test } from '@playwright/test';

test.describe('Console Error Diagnosis', () => {
  test('capture all console errors on dashboard', async ({ page }) => {
    console.log('\n🐛 CONSOLE ERROR DIAGNOSIS\n');

    const errors: string[] = [];
    const warnings: string[] = [];
    const logs: string[] = [];

    // Capture all console messages
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      
      if (type === 'error') {
        errors.push(text);
        console.log(`❌ [ERROR] ${text}`);
      } else if (type === 'warning') {
        warnings.push(text);
        console.log(`⚠️  [WARNING] ${text}`);
      } else if (type === 'log') {
        logs.push(text);
        if (text.includes('error') || text.includes('Error') || text.includes('fail')) {
          console.log(`🔍 [LOG] ${text}`);
        }
      }
    });

    // Capture network errors
    page.on('response', response => {
      if (!response.ok()) {
        console.log(`🌐 [NETWORK ERROR] ${response.status()} ${response.url()}`);
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      console.log(`💥 [PAGE ERROR] ${error.message}`);
    });

    try {
      console.log('📍 Loading dashboard with full error monitoring...');
      
      await page.goto('http://localhost:3000/?tab=overview', { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });

      console.log(`📍 Page loaded: ${page.url()}`);

      // Wait a moment for any async operations
      await page.waitForTimeout(3000);

      // Check if page has any content
      const bodyText = await page.$eval('body', el => el.textContent || '').catch(() => '');
      const hasContent = bodyText.trim().length > 0;
      
      console.log(`📝 Page has content: ${hasContent}`);
      console.log(`📝 Body text length: ${bodyText.length} characters`);
      
      if (bodyText.length > 0 && bodyText.length < 200) {
        console.log(`📝 Body text preview: "${bodyText.substring(0, 100)}..."`);
      }

      // Check DOM structure
      const htmlStructure = await page.evaluate(() => {
        return {
          hasBody: !!document.body,
          hasMain: !!document.querySelector('main'),
          hasHeader: !!document.querySelector('header'),
          totalElements: document.querySelectorAll('*').length,
          bodyClasses: document.body?.className || '',
          mainContent: document.querySelector('main')?.textContent?.substring(0, 100) || 'No main element'
        };
      });

      console.log('\n📊 DOM STRUCTURE ANALYSIS:');
      console.log('==========================');
      console.log(`Body exists: ${htmlStructure.hasBody}`);
      console.log(`Main exists: ${htmlStructure.hasMain}`);
      console.log(`Header exists: ${htmlStructure.hasHeader}`);
      console.log(`Total elements: ${htmlStructure.totalElements}`);
      console.log(`Body classes: "${htmlStructure.bodyClasses}"`);
      console.log(`Main content: "${htmlStructure.mainContent}"`);

      // Take screenshot
      await page.screenshot({ 
        path: 'tests/screenshots/console-error-diagnosis.png',
        fullPage: true 
      });
      console.log('📷 Diagnosis screenshot saved');

      // Wait longer to see if any delayed content loads
      console.log('\n⏳ Waiting for delayed content...');
      await page.waitForTimeout(5000);

      // Check again after waiting
      const delayedContent = await page.$eval('body', el => el.textContent || '').catch(() => '');
      console.log(`📝 Content after delay: ${delayedContent.length} characters`);

    } catch (error) {
      console.log(`❌ Error during page load: ${error.message}`);
    }

    // Summary
    console.log('\n📋 ERROR SUMMARY:');
    console.log('=================');
    console.log(`JavaScript Errors: ${errors.length}`);
    console.log(`Warnings: ${warnings.length}`);
    console.log(`Relevant Logs: ${logs.filter(log => 
      log.includes('error') || log.includes('Error') || log.includes('fail')
    ).length}`);

    if (errors.length > 0) {
      console.log('\n❌ JavaScript Errors:');
      errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.slice(0, 5).forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
      if (warnings.length > 5) {
        console.log(`   ... and ${warnings.length - 5} more warnings`);
      }
    }

    console.log('=================\n');
  });
});