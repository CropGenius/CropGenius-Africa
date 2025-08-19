import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PESAPAL_CONSUMER_KEY = Deno.env.get("PESAPAL_CONSUMER_KEY");
const PESAPAL_CONSUMER_SECRET = Deno.env.get("PESAPAL_CONSUMER_SECRET");
const PESAPAL_BASE_URL = "https://pay.pesapal.com/v3";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    console.log("Pesapal function called");
    
    if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
      console.error("Missing credentials");
      throw new Error("Pesapal credentials not configured");
    }

    const requestBody = await req.json();
    console.log("Request body:", JSON.stringify(requestBody));
    
    const { action } = requestBody;

    if (action === "get_token") {
      console.log("Getting token...");
      const tokenResponse = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          consumer_key: PESAPAL_CONSUMER_KEY,
          consumer_secret: PESAPAL_CONSUMER_SECRET,
        }),
      });

      const tokenData = await tokenResponse.json();
      console.log("Token response:", tokenData);
      
      if (!tokenResponse.ok) {
        throw new Error(`Token request failed: ${tokenResponse.status}`);
      }

      return new Response(JSON.stringify(tokenData), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (action === "register_ipn") {
      const { token, ipn_url } = requestBody;
      console.log("Registering IPN:", ipn_url);
      
      const ipnResponse = await fetch(`${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: ipn_url,
          ipn_notification_type: "GET"
        }),
      });

      const ipnData = await ipnResponse.json();
      console.log("IPN response:", ipnData);
      
      if (!ipnResponse.ok) {
        throw new Error(`IPN registration failed: ${ipnResponse.status}`);
      }

      return new Response(JSON.stringify(ipnData), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (action === "submit_order") {
      const { token, orderData } = requestBody;
      console.log("Submitting order:", JSON.stringify(orderData));
      
      const orderResponse = await fetch(`${PESAPAL_BASE_URL}/api/SubmitOrderRequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderResponse.json();
      console.log("Order response:", orderResult);
      
      if (!orderResponse.ok) {
        console.error("Order failed:", orderResult);
        throw new Error(`Order submission failed: ${orderResponse.status}`);
      }

      return new Response(JSON.stringify(orderResult), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");

  } catch (error) {
    console.error("Function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      status: 500,
    });
  }
});