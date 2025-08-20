// Public Pesapal IPN Handler - No Auth Required
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bapqlyvfwxsichlyjxpd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcHFseXZmd3hzaWNobHlqeHBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTcwODIzMiwiZXhwIjoyMDU3Mjg0MjMyfQ.hJqnOnNzWr7au_Ql_Ej_b-2uTmTCQjb1lQx-tZMxd7s';

exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      },
      body: 'OK'
    };
  }

  console.log('IPN received:', event.httpMethod, event.queryStringParameters);

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get tracking ID from query params (Pesapal sends via GET)
    const orderTrackingId = event.queryStringParameters?.OrderTrackingId;
    const merchantReference = event.queryStringParameters?.OrderMerchantReference;
    
    if (!orderTrackingId) {
      return {
        statusCode: 400,
        body: 'Missing OrderTrackingId'
      };
    }

    console.log('Processing payment:', orderTrackingId);

    // Update payment status to COMPLETED
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'COMPLETED',
        updated_at: new Date().toISOString()
      })
      .eq('order_tracking_id', orderTrackingId);

    if (error) {
      console.error('Database update failed:', error);
      throw error;
    }

    console.log('Payment updated successfully:', orderTrackingId);

    // Activate subscription
    const { data: payment } = await supabase
      .from('payments')
      .select('user_email, amount')
      .eq('order_tracking_id', orderTrackingId)
      .single();

    if (payment) {
      const planType = payment.amount >= 5000 ? 'annual' : 'monthly';
      const expiryDays = planType === 'annual' ? 365 : 30;

      await supabase
        .from('user_subscriptions')
        .upsert({
          user_email: payment.user_email,
          plan_type: planType,
          status: 'active',
          activated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
        });

      console.log('Subscription activated for:', payment.user_email);
    }

    // Return required Pesapal response format
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain'
      },
      body: `pesapal_notification_type=CHANGE&pesapal_transaction_tracking_id=${orderTrackingId}&pesapal_merchant_reference=${merchantReference || orderTrackingId}`
    };

  } catch (error) {
    console.error('IPN processing failed:', error);
    return {
      statusCode: 500,
      body: 'IPN processing failed'
    };
  }
};