// Netlify Function for Pesapal IPN
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      body: 'Invalid IPN request'
    };
  }

  try {
    const params = new URLSearchParams(event.body);
    const pesapal_notification_type = params.get('pesapal_notification_type');
    const pesapal_transaction_tracking_id = params.get('pesapal_transaction_tracking_id');
    const pesapal_merchant_reference = params.get('pesapal_merchant_reference');

    if (!pesapal_notification_type || !pesapal_transaction_tracking_id || !pesapal_merchant_reference) {
      return {
        statusCode: 200,
        body: 'Invalid IPN request'
      };
    }

    // Handle CHANGE notification
    if (pesapal_notification_type === 'CHANGE') {
      await handlePaymentStatusChange(pesapal_transaction_tracking_id);
    }

    // Respond with exact format Pesapal expects
    const response = `pesapal_notification_type=${pesapal_notification_type}&pesapal_transaction_tracking_id=${pesapal_transaction_tracking_id}&pesapal_merchant_reference=${pesapal_merchant_reference}`;
    
    return {
      statusCode: 200,
      body: response
    };
  } catch (error) {
    console.error('IPN Error:', error);
    return {
      statusCode: 500,
      body: 'Server error'
    };
  }
};

async function handlePaymentStatusChange(trackingId) {
  try {
    const baseUrl = process.env.PESAPAL_ENVIRONMENT === 'production' 
      ? 'https://pay.pesapal.com/v3'
      : 'https://cybqa.pesapal.com/pesapalv3';

    // Get access token
    const tokenResponse = await fetch(`${baseUrl}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_key: process.env.PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
      })
    });
    
    const { token } = await tokenResponse.json();

    // Get transaction status
    const statusResponse = await fetch(
      `${baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    const status = await statusResponse.json();

    // Update via Supabase Edge Function
    await fetch(`${process.env.SUPABASE_URL}/functions/v1/update-payment-status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_tracking_id: trackingId,
        status: status.status,
        payment_method: status.payment_method,
        confirmation_code: status.confirmation_code
      })
    });

  } catch (error) {
    console.error('Payment status update failed:', error);
    throw error;
  }
}