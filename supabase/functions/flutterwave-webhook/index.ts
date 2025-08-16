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

    const body = await req.text();
    const webhookData = JSON.parse(body);

    console.log('Flutterwave webhook received:', webhookData);

    // Verify webhook signature (recommended in production)
    const webhookHash = req.headers.get('verif-hash');
    
    if (!webhookData || !webhookData.data) {
      throw new Error('Invalid webhook payload');
    }

    const { event, data } = webhookData;
    const { tx_ref, status, amount, currency, customer, charged_amount, id: flw_id } = data;

    if (!tx_ref) {
      console.error('No transaction reference in webhook');
      return new Response('No tx_ref', { status: 400 });
    }

    // Verify transaction with Flutterwave API
    const verifyResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${flw_id}/verify`, {
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
    
    if (verifyData.status !== 'success' || verifyData.data.status !== 'successful') {
      console.log('Transaction verification failed:', verifyData);
      return new Response('Transaction not successful', { status: 400 });
    }

    // Get payment session
    const { data: paymentSession, error: sessionError } = await supabaseAdmin
      .from('payment_sessions')
      .select('*')
      .eq('id', tx_ref)
      .single();

    if (sessionError || !paymentSession) {
      console.error('Payment session not found:', tx_ref);
      return new Response('Payment session not found', { status: 404 });
    }

    if (paymentSession.status === 'completed') {
      console.log('Payment already processed:', tx_ref);
      return new Response('Already processed', { status: 200 });
    }

    // Verify amount matches
    if (Math.abs(parseFloat(charged_amount) - paymentSession.amount) > 0.01) {
      console.error('Amount mismatch:', { expected: paymentSession.amount, received: charged_amount });
      throw new Error('Amount mismatch');
    }

    console.log('Processing successful payment:', {
      tx_ref,
      user_id: paymentSession.user_id,
      plan_type: paymentSession.plan_type,
      amount: charged_amount
    });

    // Update payment session
    await supabaseAdmin
      .from('payment_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        flutterwave_data: verifyData.data
      })
      .eq('id', tx_ref);

    // Update user plan
    const planEndDate = paymentSession.plan_type === 'pro_annual' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);  // 30 days

    await supabaseAdmin
      .from('user_plans')
      .upsert({
        user_id: paymentSession.user_id,
        plan_type: paymentSession.plan_type === 'pro_annual' ? 'pro' : 'pro',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: planEndDate.toISOString(),
        flutterwave_customer_id: customer?.id || null,
        billing_cycle: paymentSession.plan_type === 'pro_annual' ? 'yearly' : 'monthly'
      }, {
        onConflict: 'user_id'
      });

    // Add credits for successful payment
    await supabaseAdmin.rpc('restore_user_credits', {
      p_user_id: paymentSession.user_id,
      p_amount: 1000,
      p_description: `Pro subscription activated - ${paymentSession.plan_type}`
    });

    console.log('User plan updated successfully:', {
      user_id: paymentSession.user_id,
      plan_type: paymentSession.plan_type,
      end_date: planEndDate
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment processed successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});