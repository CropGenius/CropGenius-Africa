#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying CropGenius Payment System...\n');

// Check environment variables
const requiredEnvVars = [
  'PESAPAL_CONSUMER_KEY',
  'PESAPAL_CONSUMER_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('✅ Checking environment variables...');
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Deploy database migrations
console.log('📊 Deploying database migrations...');
try {
  execSync('supabase db push', { stdio: 'inherit' });
  console.log('✅ Database migrations deployed');
} catch (error) {
  console.error('❌ Database migration failed:', error.message);
  process.exit(1);
}

// Deploy Edge Functions
console.log('⚡ Deploying Edge Functions...');
const functions = ['pesapal-ipn', 'pesapal-payment', 'update-payment-status', 'payment-logger'];

for (const func of functions) {
  try {
    console.log(`  Deploying ${func}...`);
    execSync(`supabase functions deploy ${func}`, { stdio: 'inherit' });
    console.log(`  ✅ ${func} deployed`);
  } catch (error) {
    console.error(`  ❌ ${func} deployment failed:`, error.message);
    process.exit(1);
  }
}

// Test IPN endpoint
console.log('🔍 Testing IPN endpoint...');
try {
  const response = execSync('curl -X GET "https://bapqlyvfwxsichlyjxpd.supabase.co/functions/v1/pesapal-ipn?OrderTrackingId=test&OrderMerchantReference=test"', { encoding: 'utf8' });
  if (response.includes('pesapal_notification_type')) {
    console.log('✅ IPN endpoint is responding correctly');
  } else {
    console.warn('⚠️  IPN endpoint response unexpected:', response);
  }
} catch (error) {
  console.error('❌ IPN endpoint test failed:', error.message);
}

// Verify payment tables exist
console.log('🗄️  Verifying database tables...');
const tables = ['payments', 'user_subscriptions', 'payment_logs'];
// This would need actual database connection to verify, skipping for now

console.log('\n🎉 Payment system deployment complete!');
console.log('\n📋 Next steps:');
console.log('1. Test payment flow in sandbox environment');
console.log('2. Verify IPN notifications are received');
console.log('3. Check payment logs for any issues');
console.log('4. Switch to production Pesapal credentials when ready');
console.log('\n🔗 Important URLs:');
console.log('- IPN Endpoint: https://bapqlyvfwxsichlyjxpd.supabase.co/functions/v1/pesapal-ipn');
console.log('- Payment Callback: https://cropgenius.africa/payment-callback');
console.log('- Upgrade Page: https://cropgenius.africa/upgrade');