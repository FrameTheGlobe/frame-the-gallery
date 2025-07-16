#!/usr/bin/env node

/**
 * Post-deployment test script for FrameTheGallery
 * Tests all critical endpoints and functionality
 */

import https from 'https';
import { URL } from 'url';

const VERCEL_URL = process.argv[2] || 'https://frame-the-gallery.vercel.app';

console.log(`🧪 Testing FrameTheGallery deployment at: ${VERCEL_URL}\n`);

const tests = [];
let allPassed = true;

function test(name, url, expectedStatus = 200, expectedContentType = null) {
  return new Promise((resolve) => {
    const fullUrl = new URL(url, VERCEL_URL);
    
    https.get(fullUrl, (res) => {
      const passed = res.statusCode === expectedStatus && 
        (!expectedContentType || res.headers['content-type']?.includes(expectedContentType));
      
      tests.push({ name, passed, status: res.statusCode, contentType: res.headers['content-type'] });
      if (!passed) allPassed = false;
      
      console.log(`${passed ? '✅' : '❌'} ${name}: ${res.statusCode} ${res.headers['content-type'] || ''}`);
      resolve();
    }).on('error', (err) => {
      tests.push({ name, passed: false, error: err.message });
      allPassed = false;
      console.log(`❌ ${name}: ERROR - ${err.message}`);
      resolve();
    });
  });
}

async function runTests() {
  console.log('🔍 Testing core endpoints...\n');
  
  await test('Main App', '/', 200, 'text/html');
  await test('Farcaster Manifest', '/.well-known/farcaster.json', 200, 'application/json');
  await test('App Icon', '/icon.svg', 200, 'image/svg');
  await test('Splash Screen', '/splash.svg', 200, 'image/svg');
  await test('OG Image', '/og-image.png', 200, 'image/png');
  
  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('🎉 All tests passed! Your app is live and ready.');
    console.log('\n📋 Next steps:');
    console.log('1. Test portfolio creation and photo uploads');
    console.log('2. Test Farcaster authentication');
    console.log('3. Test photo sharing to casts');
    console.log('4. Submit to Farcaster Mini App directory');
  } else {
    console.log('❌ Some tests failed. Check the issues above.');
  }
  
  console.log(`\n🔗 Your app: ${VERCEL_URL}`);
  console.log(`🔗 Manifest: ${VERCEL_URL}/.well-known/farcaster.json`);
}

runTests().catch(console.error);
