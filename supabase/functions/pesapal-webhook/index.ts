import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { OrderTrackingId, OrderMerchantReference } = await req.json()

    // Verify payment with Pesapal
    const pesapalResponse = await fetch(
      `${Deno.env.get('PESAPAL_BASE_URL')}/api/Transactions/GetTransactionStatus?orderTrackingId=${OrderTrackingId}`,
      {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('PESAPAL_ACCESS_TOKEN')}`,
          'Accept': 'application/json'
        }
      }
    )

    const paymentStatus = await pesapalResponse.json()

    // Update payment record
    await supabaseClient
      .from('payments')
      .update({
        status: paymentStatus.status,
        payment_method: paymentStatus.payment_method,
        confirmation_code: paymentStatus.confirmation_code,
        updated_at: new Date().toISOString()
      })
      .eq('order_tracking_id', OrderTrackingId)

    // If payment completed, activate subscription
    if (paymentStatus.status === 'COMPLETED') {
      const planType = paymentStatus.description.includes('Annual') ? 'annual' : 'monthly'
      const expiryDays = planType === 'annual' ? 365 : 30

      await supabaseClient
        .from('user_subscriptions')
        .upsert({
          user_email: paymentStatus.payment_account,
          plan_type: planType,
          status: 'active',
          activated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
        })

      // Grant user credits
      const creditAmount = planType === 'annual' ? 10000 : 1000
      await supabaseClient
        .from('user_credits')
        .upsert({
          user_email: paymentStatus.payment_account,
          credits: creditAmount,
          updated_at: new Date().toISOString()
        })
    }

    return new Response(
      JSON.stringify({ success: true, status: paymentStatus.status }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})