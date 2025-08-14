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
    let fieldId, coordinates, dateRange, userId;
    
    if (req.method === 'POST') {
      ({ fieldId, coordinates, dateRange, userId } = req.body);
    } else {
      const { lat, lng, fieldId: fid, userId: uid, start, end } = req.query;
      fieldId = fid || 'default-field';
      userId = uid || 'anonymous';
      coordinates = [{ lat: parseFloat(lat || -1.2921), lng: parseFloat(lng || 36.8219) }];
      dateRange = {
        start: start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: end || new Date().toISOString().split('T')[0]
      };
    }

    // Call Supabase Edge Function
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/satellite-imagery`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fieldId, coordinates, dateRange, userId })
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}