import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PESAPAL_BASE_URL = 'https://pay.pesapal.com/v3';
const PESAPAL_AUTH_URL = `${PESAPAL_BASE_URL}/api/Auth/RequestToken`;
const PESAPAL_REGISTER_IPN_URL = `${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check if IPN URL is already registered
    const { data: existingIpn } = await supabaseAdmin
      .from('pesapal_ipn_urls')
      .select('*')
      .eq('environment', 'live')
      .single();

    if (existingIpn && existingIpn.notification_id) {
      console.log('IPN URL already registered:', existingIpn.notification_id);
      return new Response(
        JSON.stringify({
          success: true,
          notification_id: existingIpn.notification_id,
          ipn_url: existingIpn.ipn_url,
          message: 'IPN URL already registered'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const pesapalConsumerKey = Deno.env.get('PESAPAL_CONSUMER_KEY');
    const pesapalConsumerSecret = Deno.env.get('PESAPAL_CONSUMER_SECRET');
    
    if (!pesapalConsumerKey || !pesapalConsumerSecret) {
      throw new Error('Pesapal credentials not configured');
    }

    // Step 1: Get authentication token
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

    // Step 2: Register IPN URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const ipnUrl = `${supabaseUrl}/functions/v1/pesapal-webhook`;
    
    const ipnRequest = {
      url: ipnUrl,
      ipn_notification_type: 'POST'
    };

    console.log('Registering IPN URL:', ipnUrl);

    const ipnResponse = await fetch(PESAPAL_REGISTER_IPN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(ipnRequest),
    });

    if (!ipnResponse.ok) {
      const errorText = await ipnResponse.text();
      console.error('Pesapal IPN registration error:', errorText);
      throw new Error(`IPN registration failed: ${ipnResponse.status}`);
    }

    const ipnData = await ipnResponse.json();

    if (ipnData.status !== 200) {
      throw new Error(`IPN registration failed: ${ipnData.message || 'Unknown error'}`);
    }

    const notificationId = ipnData.ipn_id;

    // Save IPN registration details
    await supabaseAdmin
      .from('pesapal_ipn_urls')
      .upsert({
        notification_id: notificationId,
        ipn_url: ipnUrl,
        environment: 'live',
        created_at: new Date().toISOString()
      }, {
        onConflict: 'environment'
      });

    console.log('IPN URL registered successfully:', {
      notification_id: notificationId,
      ipn_url: ipnUrl
    });

    return new Response(
      JSON.stringify({
        success: true,
        notification_id: notificationId,
        ipn_url: ipnUrl,
        message: 'IPN URL registered successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('IPN registration error:', error);
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