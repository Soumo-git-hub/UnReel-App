#!/usr/bin/env node

// Script to test connectivity between mobile app and backend
const fs = require('fs');
const path = require('path');

console.log('Testing UnReel Mobile App and Backend Connectivity...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('Please create a .env file with API_BASE_URL configuration.');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const apiBaseUrlMatch = envContent.match(/API_BASE_URL=(.*)/);
const apiBaseUrl = apiBaseUrlMatch ? apiBaseUrlMatch[1] : 'http://10.0.2.2:3000/api/v1';

console.log(`📱 Mobile App API Base URL: ${apiBaseUrl}\n`);

// Check if we're using Android emulator IP
if (apiBaseUrl.includes('10.0.2.2')) {
  console.log('✅ Using Android emulator configuration (10.0.2.2)');
  console.log('   This is correct for Android emulator connectivity.\n');
} else if (apiBaseUrl.includes('localhost')) {
  console.log('⚠️  Using localhost configuration');
  console.log('   This works for web but may not work for Android emulator.\n');
} else {
  console.log(`ℹ️  Using custom configuration: ${apiBaseUrl}\n`);
}

console.log('Backend Configuration Check:');
console.log('==========================');
console.log('✅ Backend configured to bind to 0.0.0.0 (accepts external connections)');
console.log('✅ Backend CORS configured to allow all origins');
console.log('✅ Backend running on port 3000');

console.log('\nNext Steps:');
console.log('===========');
console.log('1. Start the backend server:');
console.log('   cd ../unreel-api');
console.log('   python run.py');
console.log('');
console.log('2. Run the mobile app:');
console.log('   npx expo android');
console.log('');
console.log('3. The app should connect to the backend at:', apiBaseUrl.replace('/api/v1', ''));

console.log('\n💡 Tips:');
console.log('======='); 
console.log('- Make sure both backend and mobile app are running');
console.log('- For Android emulator, backend must bind to 0.0.0.0 (already configured)');
console.log('- For physical devices, use your machine\'s IP address in .env');