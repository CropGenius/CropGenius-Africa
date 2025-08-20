
// Pesapal Payment Initiation - Production Ready
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { amount, currency, description, callback_url, notification_id, user_details } = req.body;

    // 1. Get Pesapal access token
    const tokenResponse = await fetch(`${process.env.PESAPAL_API_URL}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        consumer_key: process.env.PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.token) {
      return res.status(500).json({ error: 'Failed to get Pesapal token', details: tokenData });
    }
    const token = tokenData.token;

    // 2. Register IPN URL (if not already done)
    const ipnRegisterResponse = await fetch(`${process.env.PESAPAL_API_URL}/api/URLSetup/RegisterIPN`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            url: `https://bapqlyvfwxsichlyjxpd.supabase.co/functions/v1/pesapal-ipn`,
            ipn_notification_type: 'GET'
        })
    });

    const ipnRegisterData = await ipnRegisterResponse.json();
    const ipn_id = ipnRegisterData.ipn_id;


    // 3. Submit Order Request
    const orderRequest = {
      id: uuidv4(),
      currency,
      amount,
      description,
      callback_url,
      notification_id: ipn_id,
      billing_address: {
        email_address: user_details.email,
        phone_number: user_details.phone,
        first_name: user_details.first_name,
        last_name: user_details.last_name
      }
    };

    const orderResponse = await fetch(`${process.env.PESAPAL_API_URL}/api/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(orderRequest)
    });

    const orderData = await orderResponse.json();

    if (orderData.error) {
        return res.status(400).json(orderData);
    }

    res.status(200).json({ redirect_url: orderData.redirect_url });

  } catch (error) {
    console.error('Payment Initiation Error:', error);
    res.status(500).send('Server error');
  }
}
