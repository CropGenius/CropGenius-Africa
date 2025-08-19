// Pesapal IPN Listener - Production Ready
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('Invalid IPN request');
  }

  try {
    const { 
      pesapal_notification_type, 
      pesapal_transaction_tracking_id, 
      pesapal_merchant_reference 
    } = req.body;

    // Validate required parameters
    if (!pesapal_notification_type || !pesapal_transaction_tracking_id || !pesapal_merchant_reference) {
      return res.status(200).send('Invalid IPN request');
    }

    // Handle CHANGE notification
    if (pesapal_notification_type === 'CHANGE') {
      await handlePaymentStatusChange(pesapal_transaction_tracking_id);
    }

    // Respond with exact format Pesapal expects
    const response = `pesapal_notification_type=${pesapal_notification_type}&pesapal_transaction_tracking_id=${pesapal_transaction_tracking_id}&pesapal_merchant_reference=${pesapal_merchant_reference}`;
    
    res.status(200).send(response);
  } catch (error) {
    console.error('IPN Error:', error);
    res.status(500).send('Server error');
  }
}

async function handlePaymentStatusChange(trackingId) {
  try {
    // Get Pesapal access token
    const tokenResponse = await fetch(`${process.env.PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_key: process.env.PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
      })
    });
    
    const { token } = await tokenResponse.json();

    // Query transaction status
    const statusResponse = await fetch(
      `${process.env.PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    const status = await statusResponse.json();

    // Update database via Supabase Edge Function
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