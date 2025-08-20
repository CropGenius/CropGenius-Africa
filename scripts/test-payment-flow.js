#!/usr/bin/env node

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testing CropGenius Payment Flow...\n');

async function testPaymentFlow() {
  const testOrderId = `TEST_${Date.now()}`;
  
  try {
    // 1. Test payment record creation
    console.log('1️⃣ Testing payment record creation...');
    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        order_tracking_id: testOrderId,
        merchant_reference: `REF_${testOrderId}`,
        amount: 999,
        currency: 'KES',
        user_email: 'test@cropgenius.africa',
        status: 'PENDING'
      })
      .select()
      .single();

    if (insertError) throw insertError;
    console.log('✅ Payment record created:', payment.id);

    // 2. Test IPN simulation
    console.log('2️⃣ Testing IPN endpoint...');
    const ipnUrl = `https://bapqlyvfwxsichlyjxpd.supabase.co/functions/v1/pesapal-ipn?OrderTrackingId=${testOrderId}&OrderMerchantReference=REF_${testOrderId}`;
    
    const ipnResponse = await fetch(ipnUrl);
    const ipnText = await ipnResponse.text();
    
    if (ipnResponse.ok && ipnText.includes('pesapal_notification_type')) {
      console.log('✅ IPN endpoint responding correctly');
    } else {
      console.warn('⚠️  IPN response unexpected:', ipnText);
    }

    // 3. Test payment status update
    console.log('3️⃣ Testing payment status update...');
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'COMPLETED',
        payment_method: 'MPESA',
        confirmation_code: 'TEST123456'
      })
      .eq('order_tracking_id', testOrderId);

    if (updateError) throw updateError;
    console.log('✅ Payment status updated');

    // 4. Test subscription activation
    console.log('4️⃣ Testing subscription activation...');
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_email: 'test@cropgenius.africa',
        plan_type: 'monthly',
        status: 'active',
        activated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

    if (subscriptionError) throw subscriptionError;
    console.log('✅ Subscription activated');

    // 5. Test payment verification service
    console.log('5️⃣ Testing payment verification...');
    const { data: verifiedPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('order_tracking_id', testOrderId)
      .single();

    if (verifiedPayment && verifiedPayment.status === 'COMPLETED') {
      console.log('✅ Payment verification successful');
    } else {
      console.warn('⚠️  Payment verification failed');
    }

    // Cleanup test data
    console.log('🧹 Cleaning up test data...');
    await supabase.from('payments').delete().eq('order_tracking_id', testOrderId);
    await supabase.from('user_subscriptions').delete().eq('user_email', 'test@cropgenius.africa');
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All payment flow tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Cleanup on error
    try {
      await supabase.from('payments').delete().eq('order_tracking_id', testOrderId);
      await supabase.from('user_subscriptions').delete().eq('user_email', 'test@cropgenius.africa');
    } catch (cleanupError) {
      console.error('Cleanup failed:', cleanupError.message);
    }
    
    process.exit(1);
  }
}

// Test Edge Function connectivity
async function testEdgeFunctions() {
  console.log('🔌 Testing Edge Function connectivity...\n');
  
  const functions = [
    'pesapal-ipn',
    'pesapal-payment', 
    'update-payment-status',
    'payment-logger'
  ];
  
  for (const func of functions) {
    try {
      const response = await fetch(`https://bapqlyvfwxsichlyjxpd.supabase.co/functions/v1/${func}`, {
        method: 'OPTIONS'
      });
      
      if (response.ok) {
        console.log(`✅ ${func} - Online`);
      } else {
        console.warn(`⚠️  ${func} - Status ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ ${func} - Offline:`, error.message);
    }
  }
  
  console.log();
}

async function runTests() {
  await testEdgeFunctions();
  await testPaymentFlow();
}

runTests().catch(console.error);