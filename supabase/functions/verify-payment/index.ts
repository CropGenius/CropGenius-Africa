import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    const { transaction_id, tx_ref } = await req.json();

    if (!transaction_id && !tx_ref) {
      throw new Error('Transaction ID or transaction reference is required');
    }

    console.log('Verifying payment:', { transaction_id, tx_ref, user_id: user.id });

    // Verify with Pesapal  
    const pesapalConsumerKey = Deno.env.get('PESAPAL_CONSUMER_KEY');
    const pesapalConsumerSecret = Deno.env.get('PESAPAL_CONSUMER_SECRET');
    
    // Get Pesapal auth token
    const authResponse = await fetch('https://pay.pesapal.com/v3/api/Auth/RequestToken', {
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

    const verifyResponse = await fetch(`https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus?orderTrackingId=${transaction_id}`, {
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

    const txData = verifyData.data;

    // Check if payment session exists
    const { data: paymentSession } = await supabaseAdmin
      .from('payment_sessions')
      .select('*')
      .eq('id', tx_ref || txData.tx_ref)
      .single();

    if (!paymentSession) {
      console.error('Payment session not found for tx_ref:', tx_ref || txData.tx_ref);
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

    const isVerified = txData.payment_status_description?.toLowerCase() === 'completed' && 
                      txData.currency === 'KES' &&
                      Math.abs(parseFloat(txData.amount) - paymentSession.amount) <= 0.01;

    if (isVerified && paymentSession.status !== 'completed') {
      // Process the payment if verified but not yet processed
      await supabaseAdmin
        .from('payment_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          pesapal_data: txData
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
          pesapal_order_tracking_id: txData.order_tracking_id || null,
          billing_cycle: paymentSession.plan_type === 'pro_annual' ? 'yearly' : 'monthly'
        }, {
          onConflict: 'user_id'
        });

      // Add credits
      await supabaseAdmin.rpc('restore_user_credits', {
        p_user_id: paymentSession.user_id,
        p_amount: 1000,
        p_description: `Pro subscription activated - ${paymentSession.plan_type}`
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified: isVerified,
        transaction: {
          order_tracking_id: txData.order_tracking_id,
          merchant_reference: txData.merchant_reference,
          status: txData.payment_status_description,
          amount: txData.amount,
          currency: txData.currency,
          payment_method: txData.payment_method,
          created_date: txData.created_date
        },
        payment_session: paymentSession
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment verification error:', error);
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