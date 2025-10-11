/**
 * Simple telemetry test script
 */

const { spawn } = require('child_process');

console.log('🔍 Testing HabitNex OpenTelemetry Implementation...\n');

// Test endpoints
const endpoints = [
  'http://localhost:3001/api/telemetry/health',
  'http://localhost:3001/api/telemetry/metrics',
  'http://localhost:3001/api/claude/enhance-habit', // GET for info
];

async function testEndpoint(url) {
  try {
    const response = await fetch(url);
    const data = await response.text();
    
    console.log(`✅ ${url}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
    console.log('');
    
    return { url, status: response.status, success: response.ok };
  } catch (error) {
    console.log(`❌ ${url}`);
    console.log(`   Error: ${error.message}`);
    console.log('');
    
    return { url, status: 'ERROR', success: false, error: error.message };
  }
}

async function runTests() {
  console.log('Testing telemetry endpoints...\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (successful === total) {
    console.log('\n🎉 All telemetry endpoints are working correctly!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Check browser console for client-side telemetry');
    console.log('2. Configure monitoring service exporters');
    console.log('3. Set up alerting rules');
    console.log('4. Review TELEMETRY_README.md for complete documentation');
  } else {
    console.log('\n⚠️  Some endpoints failed. Check the development server logs.');
  }
  
  console.log('\n📖 Documentation: ./TELEMETRY_README.md');
  console.log('🔧 Configuration: .env.example');
}

// Check if server is running
async function checkServer() {
  try {
    await fetch('http://localhost:3001/api/claude/enhance-habit');
    return true;
  } catch (error) {
    console.log('❌ Development server not running on port 3001');
    console.log('   Please run: npm run dev');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (serverRunning) {
    await runTests();
  }
}

// Use dynamic import for fetch in Node.js
if (typeof fetch === 'undefined') {
  (async () => {
    const { default: fetch } = await import('node-fetch');
    global.fetch = fetch;
    await main();
  })();
} else {
  main();
}