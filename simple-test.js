const { chromium } = require('playwright');

async function quickTest() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 10000 });
    const title = await page.title();
    const content = await page.content();
    
    console.log(`✅ Local site working!`);
    console.log(`Title: "${title}"`);
    console.log(`Content length: ${content.length} characters`);
    console.log(`Has React content: ${content.includes('_next') ? 'Yes' : 'No'}`);
    
    await page.screenshot({ path: 'local-fixed.png' });
    console.log('Screenshot saved: local-fixed.png');
    
  } catch (error) {
    console.error('❌ Local site error:', error.message);
  }
  
  await browser.close();
}

quickTest();