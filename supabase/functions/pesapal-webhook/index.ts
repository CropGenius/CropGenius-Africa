import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PESAPAL_BASE_URL = 'https://pay.pesapal.com/v3';
const PESAPAL_AUTH_URL = `${PESAPAL_BASE_URL}/api/Auth/RequestToken`;
const PESAPAL_STATUS_URL = `${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Handle POST request with URL-encoded parameters from Pesapal IPN
    let pesapal_notification_type, pesapal_transaction_tracking_id, pesapal_merchant_reference;
    
    if (req.method === 'POST') {
      const body = await req.text();
      console.log('Pesapal IPN POST body received:', body);
      
      // Parse URL-encoded parameters
      const params = new URLSearchParams(body);
      pesapal_notification_type = params.get('pesapal_notification_type');
      pesapal_transaction_tracking_id = params.get('pesapal_transaction_tracking_id');
      pesapal_merchant_reference = params.get('pesapal_merchant_reference');
      
      console.log('Pesapal IPN parameters:', { 
        pesapal_notification_type, 
        pesapal_transaction_tracking_id, 
        pesapal_merchant_reference 
      });
      
      // Respond with concatenated parameters as required by Pesapal
      const response_body = `pesapal_notification_type=${pesapal_notification_type}&pesapal_transaction_tracking_id=${pesapal_transaction_tracking_id}&pesapal_merchant_reference=${pesapal_merchant_reference}`;
      
      // If notification type is not CHANGE, just acknowledge
      if (pesapal_notification_type !== 'CHANGE') {
        console.log('IPN notification type is not CHANGE, acknowledging receipt');
        return new Response(response_body, { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
      }
    } else {
      return new Response('Invalid IPN request', { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    // Use transaction tracking ID to find payment session
    const OrderTrackingId = pesapal_transaction_tracking_id;
    const OrderMerchantReference = pesapal_merchant_reference;

    if (!OrderTrackingId && !OrderMerchantReference) {
      throw new Error('Invalid webhook payload: missing order tracking ID');
    }

    // Get payment session
    const { data: paymentSession, error: sessionError } = await supabaseAdmin
      .from('payment_sessions')
      .select('*')
      .eq('id', OrderMerchantReference || OrderTrackingId)
      .single();

    if (sessionError || !paymentSession) {
      console.error('Payment session not found:', OrderMerchantReference || OrderTrackingId);
      return new Response('Payment session not found', { status: 404 });
    }

    if (paymentSession.status === 'completed') {
      console.log('Payment already processed:', OrderMerchantReference || OrderTrackingId);
      return new Response('Already processed', { status: 200 });
    }

    // Get Pesapal auth token
    const pesapalConsumerKey = Deno.env.get('PESAPAL_CONSUMER_KEY');
    const pesapalConsumerSecret = Deno.env.get('PESAPAL_CONSUMER_SECRET');
    
    const authResponse = await fetch(PESAPAL_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: pesapalConsumerKey,
        consumer_secret: pesapalConsumerSecret,
      }),
    });

    const authData = await authResponse.json();
    
    if (!authData.token) {
      throw new Error('Failed to get Pesapal authentication token');
    }

    // Verify transaction status with Pesapal
    const statusResponse = await fetch(`${PESAPAL_STATUS_URL}?orderTrackingId=${OrderTrackingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!statusResponse.ok) {
      throw new Error('Failed to verify transaction with Pesapal');
    }

    const statusData = await statusResponse.json();
    
    if (statusData.status !== 200) {
      console.log('Transaction verification failed:', statusData);
      return new Response('Transaction not successful', { status: 400 });
    }

    const transactionData = statusData.data;
    
    // Check if payment is successful
    if (transactionData.payment_status_description?.toLowerCase() !== 'completed') {
      console.log('Payment not completed:', transactionData.payment_status_description);
      return new Response('Payment not completed', { status: 400 });
    }

    // Verify amount matches
    if (Math.abs(parseFloat(transactionData.amount) - paymentSession.amount) > 0.01) {
      console.error('Amount mismatch:', { 
        expected: paymentSession.amount, 
        received: transactionData.amount 
      });
      throw new Error('Amount mismatch');
    }

    console.log('Processing successful Pesapal payment:', {
      orderTrackingId: OrderTrackingId,
      merchantReference: OrderMerchantReference,
      user_id: paymentSession.user_id,
      plan_type: paymentSession.plan_type,
      amount: transactionData.amount
    });

    // Update payment session
    await supabaseAdmin
      .from('payment_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        pesapal_data: transactionData
      })
      .eq('id', paymentSession.id);

    // Update user plan
    const planEndDate = paymentSession.plan_type === 'pro_annual' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);  // 30 days

    await supabaseAdmin
      .from('user_plans')
      .upsert({
        user_id: paymentSession.user_id,
        plan_type: 'pro',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: planEndDate.toISOString(),
        pesapal_order_tracking_id: OrderTrackingId,
        billing_cycle: paymentSession.plan_type === 'pro_annual' ? 'yearly' : 'monthly'
      }, {
        onConflict: 'user_id'
      });

    // Add credits for successful payment
    await supabaseAdmin.rpc('restore_user_credits', {
      p_user_id: paymentSession.user_id,
      p_amount: 1000,
      p_description: `Pro subscription activated via Pesapal - ${paymentSession.plan_type}`
    });

    console.log('User plan updated successfully via Pesapal:', {
      user_id: paymentSession.user_id,
      plan_type: paymentSession.plan_type,
      end_date: planEndDate
    });

    // Respond with concatenated parameters as required by Pesapal
    const response_body = `pesapal_notification_type=${pesapal_notification_type}&pesapal_transaction_tracking_id=${pesapal_transaction_tracking_id}&pesapal_merchant_reference=${pesapal_merchant_reference}`;
    
    return new Response(response_body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      status: 200,
    });

  } catch (error) {
    console.error('Pesapal webhook processing error:', error);
    // Return 500 to allow Pesapal retries on server errors
    return new Response('Internal Server Error', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      status: 500,
    });
  }
});