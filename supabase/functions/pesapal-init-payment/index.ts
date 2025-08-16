import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pesapal API endpoints
const PESAPAL_BASE_URL = 'https://pay.pesapal.com/v3';
const PESAPAL_AUTH_URL = `${PESAPAL_BASE_URL}/api/Auth/RequestToken`;
const PESAPAL_SUBMIT_ORDER_URL = `${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

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

    const { plan_type, redirect_url } = await req.json();

    if (!plan_type) {
      throw new Error('Plan type is required');
    }

    const planDetails = plan_type === 'pro' ? {
      amount: 999,
      name: 'CropGenius Pro',
      interval: 'monthly'
    } : {
      amount: 9999,
      name: 'CropGenius Pro Annual', 
      interval: 'yearly'
    };

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const customerName = profile?.full_name || user.email?.split('@')[0] || 'Customer';
    const customerEmail = profile?.email || user.email || '';
    const orderTrackingId = `CG-${user.id.slice(0, 8)}-${Date.now()}`;

    // Validate required fields
    if (!customerEmail || !customerName) {
      throw new Error('Customer email and name are required');
    }

    const pesapalConsumerKey = Deno.env.get('PESAPAL_CONSUMER_KEY');
    const pesapalConsumerSecret = Deno.env.get('PESAPAL_CONSUMER_SECRET');
    
    if (!pesapalConsumerKey || !pesapalConsumerSecret) {
      throw new Error('Pesapal credentials not configured');
    }

    // Get registered IPN notification_id
    const { data: ipnData } = await supabaseAdmin
      .from('pesapal_ipn_urls')
      .select('notification_id')
      .eq('environment', 'live')
      .single();

    if (!ipnData?.notification_id) {
      throw new Error('IPN URL not registered. Please register IPN URL first.');
    }

    console.log('Pesapal payment request details:', {
      customerEmail,
      customerName,
      planDetails,
      orderTrackingId
    });

    // Step 1: Get authentication token from Pesapal
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

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('Pesapal auth error:', errorText);
      throw new Error(`Pesapal authentication failed: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    
    if (!authData.token) {
      throw new Error('Failed to get Pesapal authentication token');
    }

    console.log('Pesapal auth successful, submitting order...');

    // Step 2: Submit order request
    const orderRequest = {
      id: orderTrackingId,
      currency: 'KES',
      amount: planDetails.amount,
      description: `${planDetails.name} - ${planDetails.interval} billing`,
      callback_url: redirect_url || `${req.headers.get('origin')}/upgrade?upgrade=success`,
      notification_id: ipnData.notification_id,
      branch: 'CropGenius',
      billing_address: {
        email_address: customerEmail,
        phone_number: '',
        country_code: 'KE',
        first_name: customerName.split(' ')[0] || customerName,
        middle_name: '',
        last_name: customerName.split(' ').slice(1).join(' ') || '',
        line_1: '',
        line_2: '',
        city: '',
        state: '',
        postal_code: '',
        zip_code: ''
      }
    };

    const orderResponse = await fetch(PESAPAL_SUBMIT_ORDER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(orderRequest),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('Pesapal order submission error:', errorText);
      throw new Error(`Pesapal order submission failed: ${orderResponse.status}`);
    }

    const orderData = await orderResponse.json();

    if (orderData.status !== 200) {
      throw new Error(`Order submission failed: ${orderData.message || 'Unknown error'}`);
    }

    // Save payment session
    await supabaseAdmin
      .from('payment_sessions')
      .insert({
        id: orderTrackingId,
        user_id: user.id,
        amount: planDetails.amount,
        currency: 'KES',
        plan_type,
        status: 'pending',
        payment_data: {
          pesapal_redirect_url: orderData.redirect_url,
          pesapal_order_tracking_id: orderData.order_tracking_id,
          plan_details: planDetails,
          payment_method: 'pesapal'
        }
      });

    console.log('Pesapal payment session created successfully:', orderTrackingId);

    return new Response(
      JSON.stringify({
        success: true,
        payment_link: orderData.redirect_url,
        order_tracking_id: orderData.order_tracking_id,
        tx_ref: orderTrackingId,
        amount: planDetails.amount,
        currency: 'KES',
        plan: planDetails
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Pesapal payment initialization error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});