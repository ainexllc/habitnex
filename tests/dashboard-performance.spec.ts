import { test, expect } from '@playwright/test';

test.describe('Dashboard Performance Analysis', () => {
  test('measure dashboard loading performance with authentication', async ({ page }) => {
    // Start performance measurement
    const startTime = Date.now();
    console.log('\n🚀 Starting dashboard performance test...');

    // Navigate to login page
    console.log('📍 Step 1: Navigating to login page...');
    const loginStartTime = Date.now();
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');
    const loginLoadTime = Date.now() - loginStartTime;
    console.log(`✅ Login page loaded in: ${loginLoadTime}ms`);

    // Authenticate with test credentials
    console.log('📍 Step 2: Authenticating...');
    const authStartTime = Date.now();
    await page.fill('input[type="email"]', 'dinohorn9@gmail.com');
    await page.fill('input[type="password"]', 'dinohorn');
    
    // Click submit and wait for navigation
    const submitPromise = page.click('button[type="submit"]');
    const navigationPromise = page.waitForURL('**/workspace?tab=overview**', { timeout: 30000 });
    
    await Promise.all([submitPromise, navigationPromise]);
    const authTime = Date.now() - authStartTime;
    console.log(`✅ Authentication completed in: ${authTime}ms`);

    // Measure dashboard loading components
    console.log('📍 Step 3: Analyzing dashboard loading phases...');
    const dashboardStartTime = Date.now();

    // Wait for basic page structure
    await page.waitForSelector('main', { timeout: 10000 });
    const basicStructureTime = Date.now() - dashboardStartTime;
    console.log(`✅ Basic page structure: ${basicStructureTime}ms`);

    // Wait for header to load
    const headerStartTime = Date.now();
    await page.waitForSelector('[data-testid="header"], header, nav', { timeout: 10000 });
    const headerTime = Date.now() - headerStartTime;
    console.log(`✅ Header loaded: ${headerTime}ms`);

    // Wait for main content area
    const contentStartTime = Date.now();
    await page.waitForSelector('h1', { timeout: 10000 });
    const contentTime = Date.now() - contentStartTime;
    console.log(`✅ Main content area: ${contentTime}ms`);

    // Wait for any loading spinners to disappear
    console.log('📍 Step 4: Waiting for data loading to complete...');
    const dataLoadStartTime = Date.now();
    
    try {
      // Wait for loading spinners to disappear
      await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 15000 });
      console.log('✅ Loading spinners disappeared');
    } catch (e) {
      console.log('⚠️  No loading spinners found or they persisted');
    }

    // Wait for network activity to settle
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    const dataLoadTime = Date.now() - dataLoadStartTime;
    console.log(`✅ Data loading completed: ${dataLoadTime}ms`);

    // Measure total dashboard load time
    const totalDashboardTime = Date.now() - dashboardStartTime;
    const totalTime = Date.now() - startTime;

    console.log('\n📊 PERFORMANCE SUMMARY:');
    console.log('================================');
    console.log(`🔍 Login page load: ${loginLoadTime}ms`);
    console.log(`🔐 Authentication: ${authTime}ms`);
    console.log(`📄 Dashboard basic structure: ${basicStructureTime}ms`);
    console.log(`🎯 Header component: ${headerTime}ms`);
    console.log(`📝 Main content: ${contentTime}ms`);
    console.log(`💾 Data loading: ${dataLoadTime}ms`);
    console.log('--------------------------------');
    console.log(`📊 Total dashboard load: ${totalDashboardTime}ms`);
    console.log(`⏱️  Total test time: ${totalTime}ms`);
    console.log('================================\n');

    // Analyze what might be slow
    if (totalDashboardTime > 3000) {
      console.log('🐌 SLOW LOADING DETECTED (>3s)');
      if (authTime > 1000) console.log('   - Authentication is slow (>1s)');
      if (dataLoadTime > 2000) console.log('   - Data loading is slow (>2s)');
      if (basicStructureTime > 500) console.log('   - Page structure rendering is slow (>500ms)');
    } else if (totalDashboardTime > 1500) {
      console.log('⚠️  MODERATE LOADING TIME (1.5-3s)');
    } else {
      console.log('✅ FAST LOADING (<1.5s)');
    }

    // Take a screenshot of the final state
    await page.screenshot({ path: 'tests/screenshots/workspace-overview-performance-final.png' });
    
    // Verify the dashboard actually loaded correctly
    await expect(page.getByText('Dashboard')).toBeVisible();
    console.log('✅ Dashboard successfully loaded and verified\n');
  });

  test('analyze network requests during dashboard load', async ({ page }) => {
    console.log('\n🌐 Analyzing network requests during dashboard load...');

    const requests: Array<{url: string, method: string, duration: number, status: number}> = [];
    
    // Track all network requests
    page.on('request', request => {
      request.timing().then(timing => {
        requests.push({
          url: request.url(),
          method: request.method(),
          duration: timing?.responseEnd || 0,
          status: 0
        });
      });
    });

    page.on('response', response => {
      const req = requests.find(r => r.url === response.url());
      if (req) {
        req.status = response.status();
      }
    });

    // Navigate through the authentication flow
    await page.goto('http://localhost:3001/login');
    await page.fill('input[type="email"]', 'dinohorn9@gmail.com');
    await page.fill('input[type="password"]', 'dinohorn');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/workspace?tab=overview**', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // Analyze the requests
    console.log('\n📊 NETWORK REQUEST ANALYSIS:');
    console.log('==============================');
    console.log(`Total requests: ${requests.length}`);

    // Group by type
    const apiRequests = requests.filter(r => r.url.includes('/api/'));
    const staticRequests = requests.filter(r => r.url.includes('/_next/') || r.url.includes('.js') || r.url.includes('.css'));
    const firebaseRequests = requests.filter(r => r.url.includes('firebase') || r.url.includes('google'));
    const slowRequests = requests.filter(r => r.duration > 1000);

    console.log(`📡 API requests: ${apiRequests.length}`);
    console.log(`🎨 Static assets: ${staticRequests.length}`);
    console.log(`🔥 Firebase requests: ${firebaseRequests.length}`);
    console.log(`🐌 Slow requests (>1s): ${slowRequests.length}`);

    if (slowRequests.length > 0) {
      console.log('\n🐌 SLOW REQUESTS DETECTED:');
      slowRequests.forEach(req => {
        console.log(`   - ${req.method} ${req.url} (${req.duration}ms) [${req.status}]`);
      });
    }

    // Check for failed requests
    const failedRequests = requests.filter(r => r.status >= 400);
    if (failedRequests.length > 0) {
      console.log('\n❌ FAILED REQUESTS:');
      failedRequests.forEach(req => {
        console.log(`   - ${req.method} ${req.url} [${req.status}]`);
      });
    }

    console.log('==============================\n');
  });
});