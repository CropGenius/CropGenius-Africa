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

    // Verify with Flutterwave
    const verifyResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('FLUTTERWAVE_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!verifyResponse.ok) {
      throw new Error('Failed to verify transaction with Flutterwave');
    }

    const verifyData = await verifyResponse.json();

    if (verifyData.status !== 'success') {
      throw new Error(`Verification failed: ${verifyData.message}`);
    }

    const { data: txData } = verifyData;

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

    const isVerified = txData.status === 'successful' && 
                      txData.currency === 'KES' &&
                      parseFloat(txData.amount) === paymentSession.amount;

    if (isVerified && paymentSession.status !== 'completed') {
      // Process the payment if verified but not yet processed
      await supabaseAdmin
        .from('payment_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          flutterwave_data: txData
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
          flutterwave_customer_id: txData.customer?.id || null,
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
          id: txData.id,
          tx_ref: txData.tx_ref,
          status: txData.status,
          amount: txData.amount,
          currency: txData.currency,
          payment_type: txData.payment_type,
          processor_response: txData.processor_response
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