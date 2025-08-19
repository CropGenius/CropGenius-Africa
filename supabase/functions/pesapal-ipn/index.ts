import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const orderTrackingId = url.searchParams.get("OrderTrackingId");
    const merchantReference = url.searchParams.get("OrderMerchantReference");
    
    if (!orderTrackingId || !merchantReference) {
      return new Response("Missing parameters", { status: 400 });
    }

    // Update payment status in database
    await supabase
      .from("payments")
      .update({ 
        status: "COMPLETED",
        updated_at: new Date().toISOString()
      })
      .eq("order_tracking_id", orderTrackingId);

    // Return required response format
    return new Response(`pesapal_notification_type=CHANGE&pesapal_transaction_tracking_id=${orderTrackingId}&pesapal_merchant_reference=${merchantReference}`, {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });

  } catch (error) {
    return new Response("Error processing IPN", { status: 500 });
  }
});