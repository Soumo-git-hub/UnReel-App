#!/usr/bin/env node

// Script to verify that all required dependencies are installed
const fs = require('fs');
const path = require('path');

console.log('Verifying UnReel Mobile App Setup...\n');

// Check if package.json exists
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found!');
  process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Check required dependencies
const requiredDependencies = [
  'react',
  'react-native',
  'expo',
  '@react-navigation/native',
  '@react-navigation/stack',
  '@expo/vector-icons',
  'react-native-screens',
  'react-native-safe-area-context'
];

console.log('Checking dependencies...\n');

let allDependenciesFound = true;

requiredDependencies.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.error(`❌ ${dep}: Not found!`);
    allDependenciesFound = false;
  }
});

console.log('\n' + '='.repeat(50) + '\n');

if (allDependenciesFound) {
  console.log('✅ All required dependencies are installed!');
  console.log('\nYou can now run the app with:');
  console.log('  npm start');
} else {
  console.error('❌ Some dependencies are missing!');
  console.log('\nPlease install the missing dependencies with:');
  console.log('  npm install');
}

console.log('\n' + '='.repeat(50));