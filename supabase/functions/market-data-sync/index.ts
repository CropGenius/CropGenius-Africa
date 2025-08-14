/**
 * 🌅 CROPGENIUS MARKET DATA SYNC - DIVINE TRANSFORMATION
 * =================================================================
 * REAL-TIME COMMODITY PRICES FROM KACE & NSE FOR 100M FARMERS
 * CLEAN, PRODUCTION-READY WITH SUPABASE MAGIC
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

// 🔗 KACE API CONFIGURATION
const KACE_API_ENDPOINT = 'https://api.kacekenya.co.ke/v1/prices'
const NSE_API_ENDPOINT = 'https://api.nse.co.ke/market/commodities'

// 🎯 COMMODITY MAPPING FOR AFRICAN MARKETS
const AFRICAN_COMMODITIES = {
  'maize': ['maize', 'corn', 'mahindi'],
  'beans': ['beans', 'maharagwe', 'njahi'],
  'cassava': ['cassava', 'mwogo', 'yuca'],
  'tomato': ['tomato', 'nyanya'],
  'potato': ['potato', 'viazi'],
  'sweet_potato': ['sweet potato', 'viazi tamu'],
  'sorghum': ['sorghum', 'mtama'],
  'millet': ['millet', 'ulezi'],
  'rice': ['rice', 'mchele'],
  'wheat': ['wheat', 'ngano'],
  'banana': ['banana', 'ndizi'],
  'mango': ['mango', 'embe'],
  'avocado': ['avocado', 'parachichi'],
  'coffee': ['coffee', 'kahawa'],
  'tea': ['tea', 'chai'],
  'cotton': ['cotton', 'pamba'],
  'sunflower': ['sunflower', 'alizeti'],
  'groundnuts': ['groundnuts', 'njugu'],
  'soybeans': ['soybeans', 'soya']
} as const

interface MarketPrice {
  commodity: string
  price: number
  market_name: string
  date: string
  volume: number
  source: 'kace' | 'nse' | 'local_market'
  quality_grade: 'grade_1' | 'grade_2' | 'grade_3' | 'rejected'
  weather_impact?: {
    rainfall_effect: string
    temperature_effect: string
  }
}

interface WeatherContext {
  current_conditions: {
    temperature: number
    humidity: number
    rainfall: number
  }
  forecast_impact: string
}

// 🌐 REAL-TIME DATA FETCHING
async function fetchKACEData(): Promise<MarketPrice[]> {
  try {
    const response = await fetch(KACE_API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('KACE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`KACE API error: ${response.status}`)
    }

    const data = await response.json()
    return data.prices.map((item: any) => ({
      commodity: normalizeCommodityName(item.commodity),
      price: parseFloat(item.price),
      market_name: item.market_name || 'KACE Nairobi',
      date: new Date().toISOString().split('T')[0],
      volume: parseInt(item.volume) || 0,
      source: 'kace' as const,
      quality_grade: classifyQuality(item.quality_description),
      weather_impact: await getWeatherImpact(item.market_location, item.commodity)
    }))
  } catch (error) {
    console.error('KACE fetch error:', error)
    return []
  }
}

async function fetchNSEData(): Promise<MarketPrice[]> {
  try {
    const response = await fetch(NSE_API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('NSE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`NSE API error: ${response.status}`)
    }

    const data = await response.json()
    return data.commodities.map((item: any) => ({
      commodity: normalizeCommodityName(item.symbol),
      price: parseFloat(item.last_price),
      market_name: 'NSE Commodity Market',
      date: new Date().toISOString().split('T')[0],
      volume: parseInt(item.volume) || 0,
      source: 'nse' as const,
      quality_grade: 'grade_1' as const,
      weather_impact: await getWeatherImpact(item.location, item.symbol)
    }))
  } catch (error) {
    console.error('NSE fetch error:', error)
    return []
  }
}

// 🎯 COMMODITY NAME NORMALIZATION
function normalizeCommodityName(name: string): string {
  const normalized = name.toLowerCase().trim()
  
  for (const [standard, variations] of Object.entries(AFRICAN_COMMODITIES)) {
    if (variations.some(v => normalized.includes(v.toLowerCase()))) {
      return standard
    }
  }
  
  return 'maize' // Default fallback
}

// 🏷️ QUALITY CLASSIFICATION
function classifyQuality(description: string): MarketPrice['quality_grade'] {
  const desc = description?.toLowerCase() || ''
  
  if (desc.includes('grade 1') || desc.includes('premium') || desc.includes('best')) {
    return 'grade_1'
  } else if (desc.includes('grade 2') || desc.includes('standard')) {
    return 'grade_2'
  } else if (desc.includes('grade 3') || desc.includes('fair')) {
    return 'grade_3'
  } else {
    return 'grade_1'
  }
}

// 🌦️ WEATHER IMPACT ANALYSIS
async function getWeatherImpact(location: any, commodity: string): Promise<WeatherContext> {
  try {
    const weatherApiKey = Deno.env.get('OPENWEATHER_API_KEY')
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${weatherApiKey}&units=metric`
    )
    
    if (!weatherResponse.ok) {
      throw new Error('Weather data unavailable')
    }

    const weather = await weatherResponse.json()
    
    return {
      current_conditions: {
        temperature: weather.main.temp,
        humidity: weather.main.humidity,
        rainfall: weather.rain?.['1h'] || 0
      },
      forecast_impact: analyzeWeatherImpact(weather, commodity)
    }
  } catch (error) {
    return {
      current_conditions: { temperature: 25, humidity: 60, rainfall: 0 },
      forecast_impact: 'Stable conditions'
    }
  }
}

function analyzeWeatherImpact(weather: any, commodity: string): string {
  const temp = weather.main.temp
  const humidity = weather.main.humidity
  const rainfall = weather.rain?.['1h'] || 0
  
  let impact = 'Normal'
  
  // Crop-specific weather analysis
  const weatherImpacts: Record<string, any> = {
    maize: { optimal_temp: [18, 27], rain_sensitivity: 'high' },
    beans: { optimal_temp: [15, 25], rain_sensitivity: 'medium' },
    tomato: { optimal_temp: [20, 30], rain_sensitivity: 'high' }
  }
  
  const cropData = weatherImpacts[commodity] || weatherImpacts.maize
  
  if (temp < cropData.optimal_temp[0]) {
    impact = 'Low temperature may reduce yields'
  } else if (temp > cropData.optimal_temp[1]) {
    impact = 'High temperature stress expected'
  }
  
  if (rainfall > 10 && cropData.rain_sensitivity === 'high') {
    impact = 'Heavy rain may cause waterlogging'
  } else if (rainfall === 0) {
    impact = 'Dry conditions may require irrigation'
  }
  
  return impact
}

// 🔄 SUPABASE SYNC FUNCTION
async function syncToSupabase(marketData: MarketPrice[]) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_KEY') || ''
  )

  try {
    // Batch insert with conflict resolution
    const { data, error } = await supabase
      .from('market_data')
      .upsert(
        marketData.map(item => ({
          commodity: item.commodity,
          price: item.price,
          market_name: item.market_name,
          date: item.date,
          volume: item.volume,
          source: item.source,
          quality_grade: item.quality_grade,
          weather_impact: item.weather_impact
        })),
        { onConflict: 'commodity,market_name,date,source' }
      )

    if (error) {
      throw new Error(`Supabase sync error: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Supabase sync error:', error)
    throw error
  }
}

// 🌟 MAIN FUNCTION - THE SUN RISES
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🌅 Starting market data sync for 100M farmers...')
    
    // Fetch data from all sources
    const [kaceData, nseData] = await Promise.all([
      fetchKACEData(),
      fetchNSEData()
    ])
    
    const allData = [...kaceData, ...nseData]
    
    if (allData.length === 0) {
      throw new Error('No market data received from sources')
    }
    
    // Sync to Supabase
    const syncedData = await syncToSupabase(allData)
    
    // Trigger real-time updates
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_KEY') || ''
    )
    
    await supabase.realtime.send({
      type: 'broadcast',
      event: 'market_data_updated',
      payload: { count: allData.length, timestamp: new Date().toISOString() }
    })
    
    const response = {
      success: true,
      data: {
        total_records: allData.length,
        kace_records: kaceData.length,
        nse_records: nseData.length,
        commodities: [...new Set(allData.map(d => d.commodity))],
        sync_timestamp: new Date().toISOString()
      }
    }
    
    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
    
  } catch (error) {
    console.error('Market sync error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// 🎯 SCHEDULED EXECUTION
// This function runs every 30 minutes via Supabase Edge Functions
// curl -X POST https://your-project.supabase.co/functions/v1/market-data-sync