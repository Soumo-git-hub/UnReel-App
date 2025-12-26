#!/usr/bin/env node

// Script to test API connectivity
const fs = require('fs');
const path = require('path');

async function testApi() {
  console.log('Testing UnReel API Connectivity...\n');

  // Read API base URL from .env
  const envPath = path.join(__dirname, '..', '.env');
  let apiBaseUrl = 'http://10.0.2.2:3000/api/v1';
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const apiBaseUrlMatch = envContent.match(/API_BASE_URL=(.*)/);
    if (apiBaseUrlMatch) {
      apiBaseUrl = apiBaseUrlMatch[1];
    }
  }

  console.log(`API Base URL: ${apiBaseUrl}\n`);

  try {
    // Test root endpoint
    console.log('1. Testing root endpoint (/) ...');
    const rootResponse = await fetch(apiBaseUrl.replace('/api/v1', ''));
    if (rootResponse.ok) {
      const rootData = await rootResponse.json();
      console.log('   ✅ Root endpoint accessible');
      console.log(`   📄 Response: ${JSON.stringify(rootData)}`);
    } else {
      console.log(`   ❌ Root endpoint returned status ${rootResponse.status}`);
    }

    // Test health endpoint
    console.log('\n2. Testing health endpoint (/health) ...');
    const healthResponse = await fetch(`${apiBaseUrl.replace('/api/v1', '')}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Health endpoint accessible');
      console.log(`   📄 Response: ${JSON.stringify(healthData)}`);
    } else {
      console.log(`   ❌ Health endpoint returned status ${healthResponse.status}`);
    }

    // Test analyze endpoint (OPTIONS method to check if it exists)
    console.log('\n3. Testing analyze endpoint (/api/v1/analyze) ...');
    const analyzeResponse = await fetch(`${apiBaseUrl}/analyze`, {
      method: 'OPTIONS'
    });
    if (analyzeResponse.ok) {
      console.log('   ✅ Analyze endpoint accessible');
    } else {
      console.log(`   ❌ Analyze endpoint returned status ${analyzeResponse.status}`);
    }

    // Test chat endpoint (OPTIONS method to check if it exists)
    console.log('\n4. Testing chat endpoint (/api/v1/chat) ...');
    const chatResponse = await fetch(`${apiBaseUrl}/chat`, {
      method: 'OPTIONS'
    });
    if (chatResponse.ok) {
      console.log('   ✅ Chat endpoint accessible');
    } else {
      console.log(`   ❌ Chat endpoint returned status ${chatResponse.status}`);
    }

    console.log('\n🎉 API connectivity test completed!');
  } catch (error) {
    console.error('❌ Error testing API connectivity:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   - Make sure the backend server is running');
    console.log('   - Check if the API_BASE_URL in .env is correct');
    console.log('   - Verify network connectivity');
  }
}

// Run the test
testApi();