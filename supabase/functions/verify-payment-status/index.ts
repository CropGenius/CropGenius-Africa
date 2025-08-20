import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const pesapalConsumerKey = "UraJt79+I2cIWLwhEx5KE/CZmg9QTnx5";
const pesapalConsumerSecret = "iyAYoQSOICv4IcPdsS1yzYUIyPg=";
const pesapalBaseUrl = "https://pay.pesapal.com/v3";

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderTrackingId } = await req.json();

    if (!orderTrackingId) {
      return new Response(
        JSON.stringify({ error: "orderTrackingId is required" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    console.log(`Manual payment verification requested for: ${orderTrackingId}`);

    // First check our database
    const { data: payment, error: dbError } = await supabase
      .from("payments")
      .select("*")
      .eq("order_tracking_id", orderTrackingId)
      .single();

    if (dbError) {
      console.error("Database lookup error:", dbError);
      return new Response(
        JSON.stringify({ error: "Payment record not found" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404 
        }
      );
    }

    // If already completed, return current status
    if (payment.status === "COMPLETED") {
      return new Response(
        JSON.stringify({ 
          success: true, 
          payment,
          message: "Payment already completed"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Query Pesapal for latest status
    console.log("Querying Pesapal for latest payment status...");
    
    // Get Pesapal access token
    const tokenResponse = await fetch(`${pesapalBaseUrl}/api/Auth/RequestToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consumer_key: pesapalConsumerKey,
        consumer_secret: pesapalConsumerSecret
      })
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token request failed: ${tokenResponse.status}`);
    }

    const { token } = await tokenResponse.json();

    // Query transaction status
    const statusResponse = await fetch(
      `${pesapalBaseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      }
    );

    if (!statusResponse.ok) {
      throw new Error(`Status query failed: ${statusResponse.status}`);
    }

    const status = await statusResponse.json();
    console.log("Pesapal status response:", status);

    // Map Pesapal status to our system status
    let systemStatus = "PENDING";
    if (status.payment_status_description === "COMPLETED") {
      systemStatus = "COMPLETED";
    } else if (status.payment_status_description === "FAILED") {
      systemStatus = "FAILED";
    } else if (status.payment_status_description === "REVERSED") {
      systemStatus = "CANCELLED";
    } else if (status.payment_status_description === "INVALID") {
      systemStatus = "FAILED";
    }

    console.log(`Manual verification: Pesapal status '${status.payment_status_description}' -> system status '${systemStatus}'`);

    // Update payment record if status changed
    if (payment.status !== systemStatus) {
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          status: systemStatus,
          payment_method: status.payment_method,
          confirmation_code: status.confirmation_code,
          updated_at: new Date().toISOString()
        })
        .eq("order_tracking_id", orderTrackingId);

      if (updateError) {
        console.error("Database update error:", updateError);
        throw updateError;
      }

      // Activate subscription if payment completed
      if (systemStatus === "COMPLETED") {
        const planType = payment.amount >= 5000 ? "annual" : "monthly";
        const expiryDays = planType === "annual" ? 365 : 30;

        await supabase
          .from("user_subscriptions")
          .upsert({
            user_email: payment.user_email,
            plan_type: planType,
            status: "active",
            activated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
          });

        console.log(`Subscription activated for ${payment.user_email} via manual verification`);
      }
    }

    // Get updated payment record
    const { data: updatedPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("order_tracking_id", orderTrackingId)
      .single();

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment: updatedPayment,
        pesapalStatus: status,
        statusChanged: payment.status !== systemStatus,
        message: "Payment status verified and updated"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Manual verification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});