#!/bin/bash
while true; do
  echo "=== Enhanced Dev Monitor $(date) ==="
  
  # Check server health
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200"; then
    echo "✅ Server responding"
  else
    echo "❌ Server down - restarting..."
    pkill -f "next dev" && sleep 2 && npx next dev -p 3001 &
  fi
  
  # Use Playwright to check for console errors with authentication
  node -e "
    const { chromium } = require('playwright');
    (async () => {
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      const consoleMessages = [];
      
      page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push({ type: msg.type(), text });
        // Log ALL console messages for debugging
        console.log(\`[CONSOLE-\${msg.type().toUpperCase()}] \${text}\`);
      });
      
      try {
        // First, authenticate
        console.log('🔐 Authenticating...');
        await page.goto('http://localhost:3001/login');
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Fill credentials and login
        await page.fill('input[type=\"email\"]', 'dinohorn9@gmail.com');
        await page.fill('input[type=\"password\"]', 'dinohorn');
        await page.click('button[type=\"submit\"]');
        
        // Wait for redirect to dashboard
        await page.waitForTimeout(2000);
        console.log('📍 Current URL:', page.url());
        
        // If not on dashboard, navigate there
        if (!page.url().includes('/dashboard')) {
          await page.goto('http://localhost:3001/dashboard');
        }
        
        // Wait longer for all family queries to execute
        console.log('⏳ Waiting for dashboard to fully load...');
        await page.waitForTimeout(8000);
        
        // Count different types of messages
        const errorMessages = consoleMessages.filter(m => m.type === 'error');
        const warnMessages = consoleMessages.filter(m => m.type === 'warn' || m.text.includes('family') || m.text.includes('member'));
        
        if (errorMessages.length > 0 || warnMessages.length > 0) {
          console.log(\`🔥 ISSUES DETECTED: \${errorMessages.length} errors, \${warnMessages.length} warnings\`);
        } else {
          console.log('✅ No console errors detected');
        }
        
      } catch (e) {
        console.log('❌ Failed to check dashboard:', e.message);
      }
      
      await browser.close();
    })();
  " 2>/dev/null || echo "⚠️ Playwright check failed"
  
  echo "---"
  sleep 120  # Check every 2 minutes
done
