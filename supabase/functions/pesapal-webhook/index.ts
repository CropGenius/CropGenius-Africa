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

    let ipnData;
    
    // Handle both GET and POST requests as per PesaPal official documentation
    if (req.method === 'GET') {
      // Extract parameters from URL query string
      const url = new URL(req.url);
      ipnData = {
        OrderTrackingId: url.searchParams.get('OrderTrackingId'),
        OrderMerchantReference: url.searchParams.get('OrderMerchantReference'),
        OrderNotificationType: url.searchParams.get('OrderNotificationType')
      };
    } else if (req.method === 'POST') {
      // Get JSON data from POST body
      ipnData = await req.json();
    } else {
      throw new Error('Unsupported HTTP method');
    }

    console.log('PesaPal IPN received:', ipnData);

    // Validate IPN data according to official documentation  
    if (!ipnData.OrderTrackingId || !ipnData.OrderMerchantReference || !ipnData.OrderNotificationType) {
      throw new Error('Invalid IPN data received: missing required parameters');
    }

    // Find the payment session using merchant reference
    const { data: paymentSession, error: sessionError } = await supabaseAdmin
      .from('payment_sessions')
      .select('*')
      .eq('id', ipnData.OrderMerchantReference)
      .single();

    if (sessionError || !paymentSession) {
      console.error('Payment session not found:', ipnData.OrderMerchantReference);
      // Return proper IPN response format as per official docs
      return new Response(
        JSON.stringify({
          orderNotificationType: ipnData.OrderNotificationType,
          orderTrackingId: ipnData.OrderTrackingId,
          orderMerchantReference: ipnData.OrderMerchantReference,
          status: 500
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    if (paymentSession.status === 'completed') {
      console.log('Payment already processed:', ipnData.OrderMerchantReference);
      // Return success IPN response
      return new Response(
        JSON.stringify({
          orderNotificationType: ipnData.OrderNotificationType,
          orderTrackingId: ipnData.OrderTrackingId,
          orderMerchantReference: ipnData.OrderMerchantReference,
          status: 200
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
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

    // Verify transaction status with Pesapal according to official docs
    const statusResponse = await fetch(`${PESAPAL_STATUS_URL}?orderTrackingId=${ipnData.OrderTrackingId}`, {
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
    
    if (statusData.status !== "200") {
      console.log('Transaction verification failed:', statusData);
      // Return error IPN response
      return new Response(
        JSON.stringify({
          orderNotificationType: ipnData.OrderNotificationType,
          orderTrackingId: ipnData.OrderTrackingId,
          orderMerchantReference: ipnData.OrderMerchantReference,
          status: 500
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // According to official docs, transaction data is directly in response
    const transactionData = statusData;
    
    // Check if payment is successful using official status codes and descriptions
    const isCompleted = (transactionData.payment_status_description?.toUpperCase() === 'COMPLETED' || 
                        transactionData.status_code === 1);
    
    if (!isCompleted) {
      console.log('Payment not completed:', {
        status_description: transactionData.payment_status_description,
        status_code: transactionData.status_code
      });
      // Return success but don't process payment
      return new Response(
        JSON.stringify({
          orderNotificationType: ipnData.OrderNotificationType,
          orderTrackingId: ipnData.OrderTrackingId,
          orderMerchantReference: ipnData.OrderMerchantReference,
          status: 200
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Verify amount matches
    if (Math.abs(parseFloat(transactionData.amount) - paymentSession.amount) > 0.01) {
      console.error('Amount mismatch:', { 
        expected: paymentSession.amount, 
        received: transactionData.amount 
      });
      throw new Error('Amount mismatch');
    }

    console.log('Processing successful PesaPal payment:', {
      orderTrackingId: ipnData.OrderTrackingId,
      merchantReference: ipnData.OrderMerchantReference,
      user_id: paymentSession.user_id,
      plan_type: paymentSession.plan_type,
      amount: transactionData.amount,
      payment_status: transactionData.payment_status_description
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
        pesapal_order_tracking_id: ipnData.OrderTrackingId,
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

    // Return proper IPN response as per official PesaPal documentation
    return new Response(
      JSON.stringify({
        orderNotificationType: ipnData.OrderNotificationType,
        orderTrackingId: ipnData.OrderTrackingId,
        orderMerchantReference: ipnData.OrderMerchantReference,
        status: 200
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('PesaPal IPN processing error:', error);
    
    // Return error response as per official documentation
    return new Response(
      JSON.stringify({
        orderNotificationType: "IPNCHANGE",
        orderTrackingId: "",
        orderMerchantReference: "",
        status: 500
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Still return 200 to PesaPal but with status 500 in body
      }
    );
  }
});