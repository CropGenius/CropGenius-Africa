import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PESAPAL_CONSUMER_KEY = Deno.env.get("PESAPAL_CONSUMER_KEY");
const PESAPAL_CONSUMER_SECRET = Deno.env.get("PESAPAL_CONSUMER_SECRET");
const PESAPAL_BASE_URL = "https://pay.pesapal.com/v3";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://www.cropgenius.africa",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
      throw new Error("Pesapal credentials not configured");
    }

    const { action, ...payload } = await req.json();

    if (action === "get_token") {
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
        throw new Error(`Token request failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      return new Response(JSON.stringify(tokenData), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (action === "register_ipn") {
      const { token, ipn_url } = payload;
      
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
        throw new Error(`IPN registration failed: ${ipnResponse.status}`);
      }

      const ipnData = await ipnResponse.json();
      return new Response(JSON.stringify(ipnData), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (action === "submit_order") {
      const { token, orderData } = payload;
      
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
        throw new Error(`Order submission failed: ${orderResponse.status} - ${errorText}`);
      }

      const orderResult = await orderResponse.json();
      return new Response(JSON.stringify(orderResult), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      status: 500,
    });
  }
});