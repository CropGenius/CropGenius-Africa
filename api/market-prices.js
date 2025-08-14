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
    let crop, location, radius, userId;
    
    if (req.method === 'POST') {
      ({ crop, location, radius, userId } = req.body);
    } else {
      ({ crop, lat: location?.lat, lng: location?.lng, radius, userId } = req.query);
      location = { lat: parseFloat(req.query.lat), lng: parseFloat(req.query.lng) };
    }

    crop = crop || 'maize';
    location = location || { lat: -1.2921, lng: 36.8219 };
    radius = parseInt(radius) || 50;
    userId = userId || 'anonymous';

    // Call Supabase Edge Function
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/market-intelligence`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ crop, location, radius, userId })
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}