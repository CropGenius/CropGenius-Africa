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

    const { order_tracking_id, status, payment_method, confirmation_code } = await req.json()

    // Update payment record
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .update({
        status,
        payment_method,
        confirmation_code,
        updated_at: new Date().toISOString()
      })
      .eq('order_tracking_id', order_tracking_id)

    if (paymentError) throw paymentError

    // If payment completed, activate subscription
    if (status === 'COMPLETED') {
      const { data: payment } = await supabaseClient
        .from('payments')
        .select('user_email, amount')
        .eq('order_tracking_id', order_tracking_id)
        .single()

      if (payment) {
        const planType = payment.amount === 999 ? 'annual' : 'monthly'
        const expiryDays = planType === 'annual' ? 365 : 30

        await supabaseClient
          .from('user_subscriptions')
          .upsert({
            user_email: payment.user_email,
            plan_type: planType,
            status: 'active',
            activated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
          })
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})