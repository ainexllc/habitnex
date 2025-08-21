const { chromium } = require('playwright');
const fs = require('fs');

async function diagnoseWhiteScreen() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const results = {
    production: {},
    local: {}
  };

  // Test Production Site
  console.log('Testing Production: https://nextvibe.app');
  const prodPage = await context.newPage();
  
  // Capture network requests and console logs
  const prodRequests = [];
  const prodConsoleMessages = [];
  const prodErrors = [];

  prodPage.on('request', request => {
    prodRequests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType()
    });
  });

  prodPage.on('response', response => {
    if (!response.ok()) {
      prodErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  prodPage.on('console', msg => {
    prodConsoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  prodPage.on('pageerror', error => {
    prodErrors.push({
      type: 'JavaScript Error',
      message: error.message,
      stack: error.stack
    });
  });

  try {
    await prodPage.goto('https://nextvibe.app', { waitUntil: 'networkidle', timeout: 30000 });
    await prodPage.waitForTimeout(5000); // Wait for any delayed loading
    
    // Take screenshot
    await prodPage.screenshot({ path: 'production-screenshot.png', fullPage: true });
    
    // Get page content
    const prodContent = await prodPage.content();
    const prodTitle = await prodPage.title();
    
    results.production = {
      title: prodTitle,
      contentLength: prodContent.length,
      hasContent: prodContent.includes('<div') || prodContent.includes('<main'),
      requests: prodRequests.length,
      errors: prodErrors,
      consoleMessages: prodConsoleMessages,
      url: prodPage.url()
    };
    
    console.log(`Production - Title: "${prodTitle}", Content Length: ${prodContent.length}`);
    console.log(`Production - Requests: ${prodRequests.length}, Errors: ${prodErrors.length}`);
    
  } catch (error) {
    results.production.error = error.message;
    console.error('Production error:', error.message);
  }

  // Test Local Development Server
  console.log('\nTesting Local: http://localhost:3001');
  const localPage = await context.newPage();
  
  const localRequests = [];
  const localConsoleMessages = [];
  const localErrors = [];

  localPage.on('request', request => {
    localRequests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType()
    });
  });

  localPage.on('response', response => {
    if (!response.ok()) {
      localErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  localPage.on('console', msg => {
    localConsoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  localPage.on('pageerror', error => {
    localErrors.push({
      type: 'JavaScript Error',
      message: error.message,
      stack: error.stack
    });
  });

  try {
    await localPage.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
    await localPage.waitForTimeout(5000);
    
    // Take screenshot
    await localPage.screenshot({ path: 'local-screenshot.png', fullPage: true });
    
    const localContent = await localPage.content();
    const localTitle = await localPage.title();
    
    results.local = {
      title: localTitle,
      contentLength: localContent.length,
      hasContent: localContent.includes('<div') || localContent.includes('<main'),
      requests: localRequests.length,
      errors: localErrors,
      consoleMessages: localConsoleMessages,
      url: localPage.url()
    };
    
    console.log(`Local - Title: "${localTitle}", Content Length: ${localContent.length}`);
    console.log(`Local - Requests: ${localRequests.length}, Errors: ${localErrors.length}`);
    
  } catch (error) {
    results.local.error = error.message;
    console.error('Local error:', error.message);
  }

  await browser.close();

  // Save detailed results
  fs.writeFileSync('diagnosis-results.json', JSON.stringify(results, null, 2));
  
  // Print summary
  console.log('\n=== DIAGNOSIS SUMMARY ===');
  console.log('Production Site (https://nextvibe.app):');
  console.log(`- Title: "${results.production.title || 'N/A'}"`);
  console.log(`- Content Length: ${results.production.contentLength || 0} characters`);
  console.log(`- Has Content: ${results.production.hasContent ? 'Yes' : 'No'}`);
  console.log(`- Total Requests: ${results.production.requests || 0}`);
  console.log(`- Failed Requests: ${results.production.errors?.length || 0}`);
  console.log(`- Console Messages: ${results.production.consoleMessages?.length || 0}`);

  if (results.production.errors?.length > 0) {
    console.log('\nProduction Failed Requests:');
    results.production.errors.forEach(error => {
      console.log(`  - ${error.status} ${error.url}`);
    });
  }

  console.log('\nLocal Development (http://localhost:3001):');
  console.log(`- Title: "${results.local.title || 'N/A'}"`);
  console.log(`- Content Length: ${results.local.contentLength || 0} characters`);
  console.log(`- Has Content: ${results.local.hasContent ? 'Yes' : 'No'}`);
  console.log(`- Total Requests: ${results.local.requests || 0}`);
  console.log(`- Failed Requests: ${results.local.errors?.length || 0}`);
  console.log(`- Console Messages: ${results.local.consoleMessages?.length || 0}`);

  if (results.local.errors?.length > 0) {
    console.log('\nLocal Failed Requests:');
    results.local.errors.forEach(error => {
      console.log(`  - ${error.status} ${error.url}`);
    });
  }

  // Specific checks for webpack/Next.js assets
  console.log('\n=== WEBPACK/NEXT.JS ASSET ANALYSIS ===');
  const checkAssets = (requests, errors, site) => {
    const nextAssets = requests.filter(req => req.url.includes('/_next/'));
    const failedNextAssets = errors.filter(err => err.url.includes('/_next/'));
    
    console.log(`${site} Next.js Assets:`);
    console.log(`- Total _next requests: ${nextAssets.length}`);
    console.log(`- Failed _next requests: ${failedNextAssets.length}`);
    
    if (failedNextAssets.length > 0) {
      console.log(`Failed assets:`);
      failedNextAssets.forEach(asset => {
        console.log(`  - ${asset.status} ${asset.url}`);
      });
    }
  };

  if (results.production.requests) {
    checkAssets(
      prodRequests, 
      results.production.errors || [], 
      'Production'
    );
  }

  if (results.local.requests) {
    checkAssets(
      localRequests, 
      results.local.errors || [], 
      'Local'
    );
  }

  console.log('\nScreenshots saved: production-screenshot.png, local-screenshot.png');
  console.log('Detailed results saved: diagnosis-results.json');
}

diagnoseWhiteScreen().catch(console.error);