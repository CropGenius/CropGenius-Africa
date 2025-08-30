import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const pesapalConsumerKey = Deno.env.get("PESAPAL_CONSUMER_KEY")!;
const pesapalConsumerSecret = Deno.env.get("PESAPAL_CONSUMER_SECRET")!;
const pesapalApiUrl = Deno.env.get("PESAPAL_API_URL")!;

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    let OrderNotificationType, OrderMerchantReference, OrderTrackingId;
    
    // Parse URL params first since IPN is registered as GET
    const url = new URL(req.url);
    console.log('Raw IPN URL:', req.url);
    console.log('All URL params:', Array.from(url.searchParams.entries()));
    
    // Try multiple possible parameter names from Pesapal docs
    OrderTrackingId = url.searchParams.get('OrderTrackingId') ||
                     url.searchParams.get('orderTrackingId') ||
                     url.searchParams.get('pesapal_transaction_tracking_id') ||
                     url.searchParams.get('tracking_id');
    
    OrderMerchantReference = url.searchParams.get('OrderMerchantReference') ||
                            url.searchParams.get('orderMerchantReference') ||
                            url.searchParams.get('pesapal_merchant_reference') ||
                            url.searchParams.get('merchant_reference');
    
    OrderNotificationType = url.searchParams.get('OrderNotificationType') ||
                           url.searchParams.get('orderNotificationType') ||
                           url.searchParams.get('pesapal_notification_type') ||
                           url.searchParams.get('notification_type') ||
                           'IPNCHANGE';

    // Fallback to POST body parsing for backwards compatibility
    if (!OrderTrackingId && req.method === 'POST') {
      const contentType = req.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const jsonData = await req.json();
        OrderNotificationType = jsonData.OrderNotificationType;
        OrderMerchantReference = jsonData.OrderMerchantReference;
        OrderTrackingId = jsonData.OrderTrackingId;
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await req.text();
        const params = new URLSearchParams(formData);
        OrderNotificationType = params.get('pesapal_notification_type');
        OrderMerchantReference = params.get('pesapal_merchant_reference');
        OrderTrackingId = params.get('pesapal_transaction_tracking_id');
      }
    }

    console.log('IPN parsed:', { OrderNotificationType, OrderMerchantReference, OrderTrackingId });

    // Log the event for debugging
    await logPaymentEvent("ipn_parsed", {
      orderTrackingId: OrderTrackingId,
      notificationType: OrderNotificationType,
      merchantReference: OrderMerchantReference,
      method: req.method,
      url: req.url
    });

    // Validate required parameters
    if (!OrderTrackingId) {
      const errorMsg = "Missing OrderTrackingId parameter";
      console.error(errorMsg);
      await logPaymentEvent("ipn_error", {
        error: errorMsg,
        orderTrackingId: OrderTrackingId,
        notificationType: OrderNotificationType,
        merchantReference: OrderMerchantReference,
        allParams: Array.from(url.searchParams.entries())
      });
      
      // Still return 200 to prevent Pesapal retries
      return new Response(JSON.stringify({ status: "200", message: errorMsg }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (OrderNotificationType === "IPNCHANGE" || OrderNotificationType === "CHANGE") {
      // Asynchronously handle the payment status change
      handlePaymentStatusChange(OrderTrackingId, OrderMerchantReference).catch(error => {
        console.error("Error in background processing:", error);
        logPaymentEvent("background_processing_error", {
            orderTrackingId: OrderTrackingId,
            merchantReference: OrderMerchantReference,
            error: error.message,
        });
      });
    }

    // Immediately acknowledge receipt of the IPN
    return new Response(JSON.stringify({ status: "200" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("IPN Error:", error);
    await logPaymentEvent("ipn_error", {
      error: error.message,
      stack: error.stack,
    });
    return new Response(JSON.stringify({ status: "500" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handlePaymentStatusChange(trackingId: string, merchantReference: string) {
  try {
    console.log(`Processing payment status change for: ${trackingId}`);

    const { data: existingPayment } = await supabase
      .from("payments")
      .select("status")
      .eq("order_tracking_id", trackingId)
      .single();

    if (existingPayment && existingPayment.status === "COMPLETED") {
      console.log(`Payment ${trackingId} already completed.`);
      return;
    }

    const tokenResponse = await fetch(`${pesapalApiUrl}/api/Auth/RequestToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consumer_key: pesapalConsumerKey,
        consumer_secret: pesapalConsumerSecret,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token request failed: ${tokenResponse.status}`);
    }

    const { token } = await tokenResponse.json();

    const statusResponse = await fetch(
      `${pesapalApiUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (!statusResponse.ok) {
      throw new Error(`Status query failed: ${statusResponse.status}`);
    }

    const status = await statusResponse.json();
    console.log('Pesapal status response:', JSON.stringify(status, null, 2));

    // Get the payment record to extract user email
    const { data: paymentRecord } = await supabase
      .from("payments")
      .select("user_email")
      .eq("order_tracking_id", trackingId)
      .single();

    if (!paymentRecord) {
      throw new Error(`Payment record not found for tracking ID: ${trackingId}`);
    }

    // Map Pesapal status correctly - try multiple possible field names
    const pesapalStatus = status.payment_status_description || status.status || status.payment_status || 'UNKNOWN';
    const userEmail = status.billing_address?.email_address || paymentRecord.user_email;
    const amount = status.amount || 0;
    
    console.log('Mapped values:', { pesapalStatus, userEmail, amount });

    const { error } = await supabase.rpc('update_payment_and_subscription', {
        p_order_tracking_id: trackingId,
        p_merchant_reference: merchantReference,
        p_status: pesapalStatus,
        p_payment_method: status.payment_method || 'UNKNOWN',
        p_confirmation_code: status.confirmation_code || status.tracking_id || trackingId,
        p_user_email: userEmail,
        p_amount: amount
    });

    if (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }

    console.log(`Payment ${trackingId} processed successfully.`);

  } catch (error) {
    console.error("Payment status update failed:", error);
    await logPaymentEvent("status_update_failed", {
      trackingId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

async function logPaymentEvent(eventType: string, data: any) {
  try {
    await supabase.from("payment_logs").insert({
      event_type: eventType,
      event_data: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Silent fail for logging
  }
}