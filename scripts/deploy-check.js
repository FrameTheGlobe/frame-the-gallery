#!/usr/bin/env node

/**
 * Pre-deployment check script for FrameTheGallery
 * Verifies all requirements are met before deploying to Vercel
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const checks = [];
let allPassed = true;

function check(name, condition, message) {
  const passed = condition();
  checks.push({ name, passed, message });
  if (!passed) allPassed = false;
  console.log(`${passed ? '✅' : '❌'} ${name}: ${message}`);
}

console.log('🚀 FrameTheGallery Deployment Readiness Check\n');

// Check if essential files exist
check('Package.json', () => existsSync('package.json'), 'Package configuration found');
check('Vite Config', () => existsSync('vite.config.js'), 'Vite build configuration found');
check('Vercel Config', () => existsSync('vercel.json'), 'Vercel deployment configuration found');
check('Main HTML', () => existsSync('index.html'), 'Main HTML file found');
check('Main JS', () => existsSync('app.js'), 'Main JavaScript file found');
check('Main CSS', () => existsSync('styles.css'), 'Main CSS file found');

// Check Farcaster manifest
check('Farcaster Manifest', () => existsSync('public/.well-known/farcaster.json'), 'Farcaster manifest found');

// Check if manifest is valid JSON
try {
  const manifest = JSON.parse(readFileSync('public/.well-known/farcaster.json', 'utf8'));
  check('Manifest Valid', () => true, 'Farcaster manifest is valid JSON');
  check('Manifest Complete', () => 
    manifest.miniapp && 
    manifest.miniapp.name && 
    manifest.miniapp.homeUrl && 
    manifest.miniapp.iconUrl,
    'Manifest contains required fields'
  );
} catch (e) {
  check('Manifest Valid', () => false, 'Farcaster manifest JSON is invalid');
}

// Check package.json scripts
try {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  check('Build Script', () => pkg.scripts && pkg.scripts.build, 'Build script configured');
  check('Preview Script', () => pkg.scripts && pkg.scripts.preview, 'Preview script configured');
  check('Farcaster SDK', () => 
    pkg.dependencies && pkg.dependencies['@farcaster/miniapp-sdk'],
    'Farcaster Mini App SDK dependency found'
  );
} catch (e) {
  check('Package.json', () => false, 'Package.json is invalid');
}

// Check static assets
check('Icon SVG', () => existsSync('public/icon.svg'), 'App icon found');
check('Splash SVG', () => existsSync('public/splash.svg'), 'Splash screen found');

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Your app is ready for deployment.');
  console.log('\n📋 Next steps:');
  console.log('1. Run: vercel');
  console.log('2. Follow the prompts to deploy');
  console.log('3. Update manifest URLs with your deployed domain');
  console.log('4. Test in Farcaster client developer mode');
} else {
  console.log('❌ Some checks failed. Please fix the issues above before deploying.');
  process.exit(1);
}

console.log('\n📖 For detailed instructions, see DEPLOYMENT.md');
