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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { order_tracking_id, merchant_reference } = await req.json();

    if (!order_tracking_id && !merchant_reference) {
      throw new Error('Order tracking ID or merchant reference is required');
    }

    console.log('Verifying Pesapal payment:', { 
      order_tracking_id, 
      merchant_reference, 
      user_id: user.id 
    });

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

    // Verify with Pesapal
    const verifyResponse = await fetch(`${PESAPAL_STATUS_URL}?orderTrackingId=${order_tracking_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!verifyResponse.ok) {
      throw new Error('Failed to verify transaction with Pesapal');
    }

    const verifyData = await verifyResponse.json();

    if (verifyData.status !== 200) {
      throw new Error(`Verification failed: ${verifyData.message}`);
    }

    const transactionData = verifyData.data;

    // Check if payment session exists
    const { data: paymentSession } = await supabaseAdmin
      .from('payment_sessions')
      .select('*')
      .eq('id', merchant_reference || transactionData.merchant_reference)
      .single();

    if (!paymentSession) {
      console.error('Payment session not found for reference:', merchant_reference || transactionData.merchant_reference);
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: 'Payment session not found'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    const isVerified = transactionData.payment_status_description?.toLowerCase() === 'completed' && 
                      transactionData.currency === 'KES' &&
                      Math.abs(parseFloat(transactionData.amount) - paymentSession.amount) <= 0.01;

    if (isVerified && paymentSession.status !== 'completed') {
      // Process the payment if verified but not yet processed
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
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await supabaseAdmin
        .from('user_plans')
        .upsert({
          user_id: paymentSession.user_id,
          plan_type: 'pro',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: planEndDate.toISOString(),
          pesapal_order_tracking_id: order_tracking_id,
          billing_cycle: paymentSession.plan_type === 'pro_annual' ? 'yearly' : 'monthly'
        }, {
          onConflict: 'user_id'
        });

      // Add credits
      await supabaseAdmin.rpc('restore_user_credits', {
        p_user_id: paymentSession.user_id,
        p_amount: 1000,
        p_description: `Pro subscription activated via Pesapal - ${paymentSession.plan_type}`
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified: isVerified,
        transaction: {
          order_tracking_id: transactionData.order_tracking_id,
          merchant_reference: transactionData.merchant_reference,
          status: transactionData.payment_status_description,
          amount: transactionData.amount,
          currency: transactionData.currency,
          payment_method: transactionData.payment_method,
          created_date: transactionData.created_date
        },
        payment_session: paymentSession
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Pesapal payment verification error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        verified: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});