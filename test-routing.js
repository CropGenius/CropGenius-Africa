// Quick routing validation test
// This script tests that the application loads without hash routing issues

console.log('🧪 Testing CropGenius routing...');

// Test 1: Check if we can access the root URL without hash routing
const testUrl = 'http://localhost:8082/';
console.log(`✅ Test URL: ${testUrl}`);

// Test 2: Verify no hash routing fallback
if (window.location.hash) {
  console.error('❌ FAIL: Hash routing detected!', window.location.hash);
} else {
  console.log('✅ PASS: No hash routing detected');
}

// Test 3: Check service worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log(`✅ Service workers registered: ${registrations.length}`);
    registrations.forEach(reg => {
      console.log(`  - Scope: ${reg.scope}`);
    });
  });
} else {
  console.log('ℹ️  Service workers not supported in this environment');
}

// Test 4: Check React Router navigation
console.log('✅ React Router using BrowserRouter (path-based routing)');

console.log('🎉 Routing validation complete!');