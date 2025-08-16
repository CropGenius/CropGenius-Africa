import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const tx_ref = `CG-${user.id.slice(0, 8)}-${Date.now()}`;

    // Validate required fields per Flutterwave API docs
    if (!customerEmail || !customerName) {
      throw new Error('Customer email and name are required');
    }

    const flutterwaveSecretKey = Deno.env.get('FLUTTERWAVE_SECRET_KEY');
    if (!flutterwaveSecretKey) {
      throw new Error('Flutterwave secret key not configured');
    }

    console.log('Payment request details:', {
      customerEmail,
      customerName,
      planDetails,
      tx_ref,
      flutterwaveSecretKey: flutterwaveSecretKey ? 'Present' : 'Missing'
    });

    const paymentRequest = {
      tx_ref,
      amount: planDetails.amount,
      currency: 'KES',
      redirect_url: redirect_url || `${req.headers.get('origin')}/dashboard`,
      payment_options: 'card,mobilemoney,banktransfer,qr',
      customer: {
        email: customerEmail,
        name: customerName,
        phonenumber: '',
      },
      customizations: {
        title: 'CropGenius Pro Subscription',
        description: `${planDetails.name} - ${planDetails.interval} billing`,
        logo: 'https://cropgenius.com/logo.png',
      },
      meta: {
        user_id: user.id,
        plan_type: plan_type
      }
    };

    console.log('Initializing Flutterwave payment:', {
      user_id: user.id,
      amount: planDetails.amount,
      plan: plan_type,
      tx_ref,
      paymentRequest
    });

    const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${flutterwaveSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRequest),
    });

    if (!flutterwaveResponse.ok) {
      const errorText = await flutterwaveResponse.text();
      console.error('Flutterwave API error:', errorText);
      throw new Error(`Flutterwave API error: ${flutterwaveResponse.status}`);
    }

    const flutterwaveData = await flutterwaveResponse.json();

    if (flutterwaveData.status !== 'success') {
      throw new Error(`Payment initialization failed: ${flutterwaveData.message}`);
    }

    await supabaseAdmin
      .from('payment_sessions')
      .insert({
        id: tx_ref,
        user_id: user.id,
        amount: planDetails.amount,
        currency: 'KES',
        plan_type,
        status: 'pending',
        payment_data: {
          flutterwave_link: flutterwaveData.data.link,
          plan_details: planDetails,
          payment_options: 'card,mobilemoney,banktransfer,qr'
        }
      });

    console.log('Payment session created successfully:', tx_ref);

    return new Response(
      JSON.stringify({
        success: true,
        payment_link: flutterwaveData.data.link,
        tx_ref,
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
    console.error('Payment initialization error:', error);
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