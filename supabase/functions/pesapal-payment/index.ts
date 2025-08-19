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

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Token request failed:", tokenResponse.status, errorText);
        throw new Error(`Token request failed: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log("Token response:", tokenData);
      
      if (!tokenData.token) {
        console.error("No token in response:", tokenData);
        throw new Error("Invalid token response from Pesapal");
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

      if (!ipnResponse.ok) {
        const errorText = await ipnResponse.text();
        console.error("IPN registration failed:", ipnResponse.status, errorText);
        throw new Error(`IPN registration failed: ${ipnResponse.status} - ${errorText}`);
      }

      const ipnData = await ipnResponse.json();
      console.log("IPN response:", ipnData);

      return new Response(JSON.stringify(ipnData), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (action === "submit_order") {
      const { token, orderData } = requestBody;
      console.log("Submitting order:", JSON.stringify(orderData));
      
      const orderResponse = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error("Order submission failed:", orderResponse.status, errorText);
        throw new Error(`Order submission failed: ${orderResponse.status} - ${errorText}`);
      }

      const orderResult = await orderResponse.json();
      console.log("Order response:", orderResult);

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