import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PESAPAL_CONSUMER_KEY = Deno.env.get("PESAPAL_CONSUMER_KEY");
const PESAPAL_CONSUMER_SECRET = Deno.env.get("PESAPAL_CONSUMER_SECRET");
const PESAPAL_API_URL = "https://pay.pesapal.com/v3";

if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
  console.error("FATAL: Pesapal consumer key or secret is not configured in environment variables.");
}

function handleCors(req: Request): Response | null {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  return null;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    const orderDetails = await req.json();

    console.log("Requesting Pesapal Access Token...");
    const tokenResponse = await fetch(`${PESAPAL_API_URL}/api/Auth/RequestToken`, {
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
      const errorBody = await tokenResponse.text();
      throw new Error(`Pesapal token request failed: ${tokenResponse.status} ${errorBody}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.token;

    if (!accessToken) {
      throw new Error("Pesapal access token was not returned.");
    }
    console.log("Successfully obtained Pesapal Access Token.");

    console.log("Submitting order to Pesapal...");
    const submitOrderResponse = await fetch(`${PESAPAL_API_URL}/api/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderDetails),
    });

    if (!submitOrderResponse.ok) {
      const errorBody = await submitOrderResponse.text();
      throw new Error(`Pesapal submit order failed: ${submitOrderResponse.status} ${errorBody}`);
    }

    const paymentData = await submitOrderResponse.json();
    console.log("Successfully submitted order. Returning redirect URL to client.");

    return new Response(JSON.stringify(paymentData), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });

  } catch (error) {
    console.error("Pesapal proxy error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 500,
    });
  }
});