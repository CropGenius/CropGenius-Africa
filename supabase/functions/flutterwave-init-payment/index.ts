import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  email: string;
  amount: number;
  currency: string;
  payment_plan?: string;
  payment_options?: string;
  redirect_url: string;
  customer: {
    email: string;
    name: string;
    phonenumber?: string;
  };
  customizations: {
    title: string;
    description: string;
    logo?: string;
  };
  tx_ref: string;
}

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

    const { plan_type, redirect_url } = await req.json();

    if (!plan_type) {
      throw new Error('Plan type is required');
    }

    // Get plan details
    const planDetails = plan_type === 'pro' ? {
      amount: 999, // KES 999 per month
      name: 'CropGenius Pro',
      interval: 'monthly'
    } : {
      amount: 9999, // KES 9999 per year  
      name: 'CropGenius Pro Annual',
      interval: 'yearly'
    };

    // Get user profile for details
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const customerName = profile?.full_name || user.email?.split('@')[0] || 'Customer';
    const customerEmail = profile?.email || user.email || '';

    // Generate unique transaction reference
    const tx_ref = `CG-${user.id.slice(0, 8)}-${Date.now()}`;

    // Prepare Flutterwave payment request
    const paymentRequest: PaymentRequest = {
      email: customerEmail,
      amount: planDetails.amount,
      currency: 'KES',
      payment_options: 'card,mobilemoney,banktransfer,qr',
      redirect_url: redirect_url || `${req.headers.get('origin')}/dashboard`,
      customer: {
        email: customerEmail,
        name: customerName,
        phonenumber: '', // Can be added later
      },
      customizations: {
        title: 'CropGenius Pro Subscription',
        description: `${planDetails.name} - ${planDetails.interval} billing`,
        logo: 'https://cropgenius.com/logo.png', // Update with actual logo
      },
      tx_ref,
    };

    console.log('Initializing Flutterwave payment:', {
      user_id: user.id,
      amount: planDetails.amount,
      plan: plan_type,
      tx_ref
    });

    // Make request to Flutterwave
    const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('FLUTTERWAVE_SECRET_KEY')}`,
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

    // Store payment session in database
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