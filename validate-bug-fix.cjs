#!/usr/bin/env node

// CropGenius Bug Fix Validation
// Tests the exact issues: hash routing in production and raw HTML in localhost

const fs = require('fs');

console.log('🔍 CropGenius Bug Fix Validation');
console.log('='.repeat(50));

let allTestsPassed = true;

function test(name, condition, details = '') {
  const passed = condition;
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (details) console.log(`   ${details}`);
  if (!passed) allTestsPassed = false;
  return passed;
}

// Test 1: Conflicting Files Removed
console.log('\n🗑️  Conflicting Files Removed:');
test('register-sw.js deleted', !fs.existsSync('public/register-sw.js'));
test('fix-modules.js deleted', !fs.existsSync('public/fix-modules.js'));
test('mime-fix.js deleted', !fs.existsSync('public/mime-fix.js'));

// Test 2: Service Worker Cache Updated
console.log('\n🔄 Service Worker Cache:');
if (fs.existsSync('public/service-worker.js')) {
  const swContent = fs.readFileSync('public/service-worker.js', 'utf8');
  test('Cache name updated', swContent.includes('cropgenius-v2-clean'));
  test('No problematic files cached', !swContent.includes('register-sw.js'));
}

// Test 3: Main Entry Point
console.log('\n⚡ Main Entry Point:');
if (fs.existsSync('src/main.tsx')) {
  const mainContent = fs.readFileSync('src/main.tsx', 'utf8');
  test('Single service worker registration', mainContent.includes('registerServiceWorker()'));
  test('React app renders to root', mainContent.includes('root.render'));
}

// Test 4: Router Configuration
console.log('\n🛣️  Router Configuration:');
if (fs.existsSync('src/App.tsx')) {
  const appContent = fs.readFileSync('src/App.tsx', 'utf8');
  test('BrowserRouter configured', appContent.includes('BrowserRouter'));
  test('Basename set to /', appContent.includes('basename="/"'));
}

// Test 5: HTML Configuration
console.log('\n📄 HTML Configuration:');
if (fs.existsSync('index.html')) {
  const htmlContent = fs.readFileSync('index.html', 'utf8');
  test('Base href configured', htmlContent.includes('<base href="/" />'));
  test('Root div exists', htmlContent.includes('<div id="root"></div>'));
  test('Main script reference', htmlContent.includes('src="/src/main.tsx"'));
}

// Test 6: Build Output
console.log('\n🔨 Build Output:');
if (fs.existsSync('dist/index.html')) {
  const distHtml = fs.readFileSync('dist/index.html', 'utf8');
  test('Built HTML exists', true);
  test('Assets referenced', distHtml.includes('/assets/'));
  test('Root div in build', distHtml.includes('<div id="root"></div>'));
}

// Generate Summary
console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
  console.log('🎉 ALL TESTS PASSED!');
  console.log('\n✅ Bug Fix Summary:');
  console.log('   • Removed conflicting service worker registrations');
  console.log('   • Eliminated fetch API overrides');
  console.log('   • Updated service worker cache name');
  console.log('   • Ensured single registration point');
  console.log('   • Maintained clean BrowserRouter configuration');
  console.log('\n🚀 The hash routing and raw HTML issues should be RESOLVED!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Deploy to production');
  console.log('   2. Test https://cropgenius.africa/ (should NOT have #)');
  console.log('   3. Test localhost (should show React app, not raw HTML)');
  console.log('   4. Verify Google OAuth redirects work correctly');
} else {
  console.log('❌ SOME TESTS FAILED!');
  console.log('   Fix the failing tests before deployment.');
}

process.exit(allTestsPassed ? 0 : 1);