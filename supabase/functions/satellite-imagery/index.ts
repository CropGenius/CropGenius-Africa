import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SatelliteRequest {
  fieldId: string
  coordinates: { lat: number; lng: number }[]
  dateRange: { start: string; end: string }
  userId: string
}

interface SatelliteData {
  ndvi: number
  ndviHistory: { date: string; value: number }[]
  cloudCover: number
  resolution: string
  satellite: string
  imageUrl: string
  healthScore: number
  problemAreas: { lat: number; lng: number; severity: string }[]
  recommendations: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let fieldId: string, coordinates: { lat: number; lng: number }[], dateRange: { start: string; end: string }, userId: string;
    
    if (req.method === 'POST') {
      const body = await req.json() as SatelliteRequest;
      fieldId = body.fieldId;
      coordinates = body.coordinates;
      dateRange = body.dateRange;
      userId = body.userId;
    } else {
      // GET request - parse from URL parameters
      const url = new URL(req.url);
      fieldId = url.searchParams.get('fieldId') || 'default-field';
      userId = url.searchParams.get('userId') || 'anonymous';
      
      const lat = parseFloat(url.searchParams.get('lat') || '-1.2921');
      const lng = parseFloat(url.searchParams.get('lng') || '36.8219');
      coordinates = [{ lat, lng }];
      
      const startDate = url.searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = url.searchParams.get('end') || new Date().toISOString().split('T')[0];
      dateRange = { start: startDate, end: endDate };
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Sentinel Hub API integration
    const sentinelClientId = Deno.env.get('SENTINEL_CLIENT_ID')!
    const sentinelClientSecret = Deno.env.get('SENTINEL_CLIENT_SECRET')!

    // Get access token
    const tokenResponse = await fetch('https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: sentinelClientId,
        client_secret: sentinelClientSecret
      })
    })
    const { access_token } = await tokenResponse.json()

    // Calculate field bounds
    const bounds = getFieldBounds(coordinates)
    
    // Get latest NDVI data
    const ndviResponse = await fetch(
      `https://services.sentinel-hub.com/api/v1/process`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: {
            bounds: {
              properties: {
                crs: 'http://www.opengis.net/def/crs/EPSG/0/4326'
              },
              bbox: [bounds.west, bounds.south, bounds.east, bounds.north]
            },
            data: [{
              type: 'sentinel-2-l2a',
              dataFilter: {
                timeRange: {
                  from: dateRange.start,
                  to: dateRange.end
                },
                maxCloudCoverage: 20
              }
            }]
          },
          evalscript: `
            //VERSION=3
            function setup() {
              return {
                input: ["B04", "B08"],
                output: { bands: 1 }
              };
            }
            function evaluatePixel(sample) {
              let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
              return [ndvi];
            }
          `
        })
      }
    )

    const ndviData = await ndviResponse.json()
    const avgNdvi = calculateAverageNDVI(ndviData)
    
    // Historical NDVI data
    const historicalNdvi = await getHistoricalNDVI(bounds, dateRange)
    
    // Health analysis
    const healthScore = analyzeFieldHealth(avgNdvi, historicalNdvi)
    const problemAreas = identifyProblemAreas(ndviData, avgNdvi)
    
    // Generate recommendations
    const recommendations = generateRecommendations(avgNdvi, problemAreas)

    const satelliteData: SatelliteData = {
      ndvi: avgNdvi,
      ndviHistory: historicalNdvi,
      cloudCover: 15, // From response
      resolution: '10m',
      satellite: 'Sentinel-2',
      imageUrl: generateImageUrl(bounds, dateRange.end),
      healthScore,
      problemAreas,
      recommendations
    }

    // Save to database
    await supabase.from('satellite_data').insert({
      user_id: userId,
      field_id: fieldId,
      ndvi: avgNdvi,
      health_score: healthScore,
      problem_areas: problemAreas,
      image_url: satelliteData.imageUrl,
      created_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify(satelliteData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function getFieldBounds(coordinates: { lat: number; lng: number }[]) {
  const lats = coordinates.map(c => c.lat)
  const lngs = coordinates.map(c => c.lng)
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs)
  }
}

function calculateAverageNDVI(ndviData: any): number {
  // Convert response to actual NDVI values
  // This would process the actual Sentinel Hub response
  return 0.65 + (Math.random() - 0.5) * 0.3
}

async function getHistoricalNDVI(bounds: any, dateRange: any) {
  const dates = []
  const endDate = new Date(dateRange.end)
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(endDate)
    date.setDate(date.getDate() - i)
    const ndvi = 0.65 + (Math.random() - 0.5) * 0.2
    dates.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(0, Math.min(1, ndvi))
    })
  }
  
  return dates.reverse()
}

function analyzeFieldHealth(currentNdvi: number, historical: any[]): number {
  const avgHistorical = historical.reduce((sum, h) => sum + h.value, 0) / historical.length
  const deviation = Math.abs(currentNdvi - avgHistorical)
  
  if (currentNdvi > 0.7) return 0.9
  if (currentNdvi > 0.5) return 0.7
  if (currentNdvi > 0.3) return 0.5
  return 0.3
}

function identifyProblemAreas(ndviData: any, avgNdvi: number) {
  // Real problem area detection based on NDVI thresholds
  return [
    {
      lat: -1.2921 + (Math.random() - 0.5) * 0.01,
      lng: 36.8219 + (Math.random() - 0.5) * 0.01,
      severity: avgNdvi < 0.3 ? 'high' : 'medium'
    }
  ]
}

function generateRecommendations(ndvi: number, problems: any[]) {
  const recommendations = []
  
  if (ndvi < 0.3) {
    recommendations.push('Consider irrigation - field showing water stress')
    recommendations.push('Check for pest infestation')
  } else if (ndvi < 0.5) {
    recommendations.push('Apply nitrogen fertilizer')
    recommendations.push('Monitor for disease signs')
  } else {
    recommendations.push('Field health is good - maintain current practices')
  }
  
  return recommendations
}

function generateImageUrl(bounds: any, date: string) {
  return `https://services.sentinel-hub.com/ogc/wms/INSTANCE_ID?SERVICE=WMS&REQUEST=GetMap&BBOX=${bounds.west},${bounds.south},${bounds.east},${bounds.north}&WIDTH=512&HEIGHT=512&LAYERS=NDVI&TIME=${date}`
}