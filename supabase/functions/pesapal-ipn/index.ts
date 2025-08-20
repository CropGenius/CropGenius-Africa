import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Use production credentials directly
const pesapalConsumerKey = "UraJt79+I2cIWLwhEx5KE/CZmg9QTnx5";
const pesapalConsumerSecret = "iyAYoQSOICv4IcPdsS1yzYUIyPg=";
const pesapalBaseUrl = "https://pay.pesapal.com/v3";

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  console.log(`IPN Request: ${req.method} ${req.url}`);
  
  // Log IPN request
  await logPaymentEvent("ipn_received", {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });
  
  try {
    // Handle both GET and POST requests from Pesapal
    let orderTrackingId: string | null = null;
    let merchantReference: string | null = null;
    let notificationType: string | null = null;

    if (req.method === "GET") {
      const url = new URL(req.url);
      orderTrackingId = url.searchParams.get("OrderTrackingId");
      merchantReference = url.searchParams.get("OrderMerchantReference");
      notificationType = "CHANGE";
    } else if (req.method === "POST") {
      const body = await req.json();
      orderTrackingId = body.pesapal_transaction_tracking_id;
      merchantReference = body.pesapal_merchant_reference;
      notificationType = body.pesapal_notification_type;
    }
    
    console.log(`IPN Data: trackingId=${orderTrackingId}, reference=${merchantReference}, type=${notificationType}`);
    
    await logPaymentEvent("ipn_parsed", {
      orderTrackingId,
      merchantReference,
      notificationType
    });
    
    if (!orderTrackingId || !merchantReference) {
      console.error("Missing required parameters");
      await logPaymentEvent("ipn_error", {
        error: "Missing required parameters",
        orderTrackingId,
        merchantReference,
        notificationType
      });
      return new Response("Missing parameters", { status: 400 });
    }

    // Only process CHANGE notifications
    if (notificationType === "CHANGE") {
      await handlePaymentStatusChange(orderTrackingId);
    } else {
      await logPaymentEvent("ipn_ignored", {
        reason: "Not a CHANGE notification",
        notificationType,
        orderTrackingId
      });
    }

    // Return required response format for Pesapal
    const response = `pesapal_notification_type=${notificationType}&pesapal_transaction_tracking_id=${orderTrackingId}&pesapal_merchant_reference=${merchantReference}`;
    
    console.log(`IPN Response: ${response}`);
    
    return new Response(response, {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });

  } catch (error) {
    console.error("IPN Error:", error);
    await logPaymentEvent("ipn_error", {
      error: error.message,
      stack: error.stack
    });
    return new Response("Error processing IPN", { status: 500 });
  }
});

async function handlePaymentStatusChange(trackingId: string) {
  try {
    console.log(`Processing payment status change for: ${trackingId}`);
    
    await logPaymentEvent("status_check_started", {
      trackingId
    });
    
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
    console.log("Got Pesapal token");

    // Query transaction status from Pesapal
    const statusResponse = await fetch(
      `${pesapalBaseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`,
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
    console.log(`Pesapal status response:`, status);
    
    await logPaymentEvent("pesapal_status_received", {
      trackingId,
      status
    });

    // Update payment record in database
    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        status: "COMPLETED",
        payment_method: status.payment_method,
        confirmation_code: status.confirmation_code,
        updated_at: new Date().toISOString()
      })
      .eq("order_tracking_id", trackingId);

    if (paymentError) {
      console.error("Database update error:", paymentError);
      await logPaymentEvent("database_update_failed", {
        trackingId,
        error: paymentError.message
      });
      throw paymentError;
    }

    console.log(`Payment ${trackingId} updated successfully`);
    
    await logPaymentEvent("payment_updated", {
      trackingId,
      status: status.status_description || status.payment_status_description
    });

    // Always activate subscription when IPN is received (payment successful)
    {
      const { data: payment } = await supabase
        .from("payments")
        .select("user_email, amount")
        .eq("order_tracking_id", trackingId)
        .single();

      if (payment) {
        const planType = payment.amount >= 5000 ? "annual" : "monthly";
        const expiryDays = planType === "annual" ? 365 : 30;

        const { error: subscriptionError } = await supabase
          .from("user_subscriptions")
          .upsert({
            user_email: payment.user_email,
            plan_type: planType,
            status: "active",
            activated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
          });

        if (subscriptionError) {
          console.error("Subscription activation error:", subscriptionError);
          await logPaymentEvent("subscription_activation_failed", {
            trackingId,
            userEmail: payment.user_email,
            error: subscriptionError.message
          });
        } else {
          console.log(`Subscription activated for ${payment.user_email}`);
          await logPaymentEvent("subscription_activated", {
            trackingId,
            userEmail: payment.user_email,
            planType
          });
        }
      }
    }

  } catch (error) {
    console.error("Payment status update failed:", error);
    await logPaymentEvent("status_update_failed", {
      trackingId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

async function logPaymentEvent(eventType: string, data: any) {
  try {
    await supabase.from("payment_logs").insert({
      event_type: eventType,
      event_data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Failed to log payment event:", error);
  }
}