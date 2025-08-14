import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let phone, message, userId, insightType;
    
    if (req.method === 'POST') {
      ({ phone, message, userId, insightType } = req.body);
    } else {
      ({ phone, message, userId, insightType } = req.query);
      phone = phone || '+1234567890';
      message = message || 'Test message from CropGenius';
      userId = userId || 'test-user';
      insightType = insightType || 'weather';
    }

    // Call Supabase Edge Function
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone, message, userId, insightType })
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}