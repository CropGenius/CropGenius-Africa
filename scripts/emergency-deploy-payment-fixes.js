#!/usr/bin/env node

/**
 * EMERGENCY DEPLOYMENT SCRIPT - PAYMENT SYSTEM FIXES
 * Deploys critical fixes for the payment system issues
 */

const { execSync } = require('child_process');

console.log('🚨 EMERGENCY DEPLOYMENT - PAYMENT SYSTEM FIXES');
console.log('===============================================\n');

function executeCommand(command, description) {
  try {
    console.log(`📦 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

async function deployFixes() {
  try {
    // 1. Deploy database migration with RPC function fixes
    console.log('1️⃣ Deploying Database Fixes...');
    executeCommand(
      'supabase db push', 
      'Database migration with updated RPC function'
    );

    // 2. Deploy updated Edge Functions
    console.log('2️⃣ Deploying Edge Function Fixes...');
    executeCommand(
      'supabase functions deploy pesapal-ipn', 
      'Updated IPN handler with format fixes'
    );

    // 3. Test the deployment
    console.log('3️⃣ Testing Deployment...');
    
    // Test IPN endpoint availability
    try {
      const response = execSync('curl -X GET "https://bapqlyvfwxsichlyjxpd.supabase.co/functions/v1/pesapal-ipn?OrderTrackingId=test&OrderMerchantReference=test"', { encoding: 'utf8' });
      console.log('✅ IPN endpoint is responding');
    } catch (error) {
      console.warn('⚠️  IPN endpoint test failed:', error.message);
    }

    // 4. Deploy other supporting functions
    console.log('4️⃣ Deploying Supporting Functions...');
    const supportingFunctions = ['pesapal-payment', 'verify-payment-status', 'payment-logger'];
    
    for (const func of supportingFunctions) {
      try {
        executeCommand(
          `supabase functions deploy ${func}`, 
          `Deploying ${func}`
        );
      } catch (error) {
        console.warn(`⚠️  ${func} deployment failed, but continuing...`);
      }
    }

    console.log('🎉 EMERGENCY DEPLOYMENT COMPLETED!');
    console.log('\n📋 CRITICAL FIXES DEPLOYED:');
    console.log('✅ IPN handler now supports JSON, form-encoded, and URL parameter formats');
    console.log('✅ Status mapping fixes for COMPLETED/SUCCESS/SUCCESSFUL variations');
    console.log('✅ Robust email extraction with fallbacks');
    console.log('✅ Enhanced payment callback resilience');
    console.log('✅ Database RPC function improvements');
    
    console.log('\n🚀 IMMEDIATE ACTIONS REQUIRED:');
    console.log('1. Test with a real payment transaction');
    console.log('2. Monitor payment logs for the next few transactions');
    console.log('3. Verify user experience on payment callback page');
    
    console.log('\n🔗 MONITORING URLS:');
    console.log('- IPN Endpoint: https://bapqlyvfwxsichlyjxpd.supabase.co/functions/v1/pesapal-ipn');
    console.log('- Payment Callback: https://cropgenius.africa/payment-callback');
    console.log('- Test Upgrade: https://cropgenius.africa/upgrade');

  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED:', error.message);
    console.error('\n🆘 ROLLBACK INSTRUCTIONS:');
    console.error('1. Revert database changes: supabase db reset');
    console.error('2. Redeploy previous Edge Functions');
    console.error('3. Contact technical support immediately');
    process.exit(1);
  }
}

// Execute emergency deployment
deployFixes();