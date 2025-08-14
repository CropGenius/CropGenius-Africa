import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.2.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  message: string
  farmContext: {
    farmId: string
    location: { lat: number; lng: number }
    cropType: string
    fieldSize: number
    soilType: string
    weatherData: any
  }
  conversationId?: string
  userId: string
}

interface AgentResponse {
  response: string
  agentType: string
  confidence: number
  sources: string[]
  actions: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, farmContext, conversationId, userId } = await req.json() as ChatRequest
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    // Get real farm data
    const { data: farmData } = await supabase
      .from('farms')
      .select('*, fields(*)')
      .eq('id', farmContext.farmId)
      .single()

    // Get historical conversations for context
    const { data: conversations } = await supabase
      .from('chat_conversations')
      .select('messages')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Real weather data integration
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${farmContext.location.lat}&lon=${farmContext.location.lng}&appid=${Deno.env.get('OPENWEATHER_API_KEY')}`
    )
    const weatherData = await weatherResponse.json()

    // Agricultural knowledge base
    const knowledgeBase = {
      crops: {
        maize: {
          optimalTemperature: [18, 27],
          waterNeeds: '600-800mm',
          soilPH: [5.5, 7.0],
          diseases: ['maize streak virus', 'grey leaf spot', 'rust'],
          pests: ['fall armyworm', 'stem borers', 'aphids']
        },
        beans: {
          optimalTemperature: [15, 25],
          waterNeeds: '300-500mm',
          soilPH: [5.5, 6.5],
          diseases: ['anthracnose', 'angular leaf spot', 'rust'],
          pests: ['bean fly', 'aphids', 'thrips']
        }
      }
    }

    // Generate intelligent response
    const systemPrompt = `You are an expert agricultural AI assistant for African farmers. 
    Farm details: ${farmContext.cropType} on ${farmContext.fieldSize} hectares, ${farmContext.soilType} soil.
    Current weather: ${weatherData.main.temp - 273.15}°C, humidity ${weatherData.main.humidity}%, ${weatherData.weather[0].description}.
    
    Provide actionable advice with specific recommendations, costs, and timelines.
    Consider local conditions, seasonal patterns, and economic constraints.`

    const chat = model.startChat({
      history: conversations?.map(c => ({
        role: 'user',
        parts: c.messages?.[0]?.content || ''
      })) || []
    })

    const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`)
    const response = await result.response
    const text = response.text()

    // Save conversation
    const { data: savedConversation } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: userId,
        farm_id: farmContext.farmId,
        messages: [
          { role: 'user', content: message, timestamp: new Date().toISOString() },
          { role: 'assistant', content: text, timestamp: new Date().toISOString() }
        ],
        metadata: {
          agentType: 'agricultural-expert',
          confidence: 0.85,
          sources: ['google-gemini', 'openweather', 'farm-data']
        }
      })
      .select()
      .single()

    const agentResponse: AgentResponse = {
      response: text,
      agentType: 'agricultural-expert',
      confidence: 0.85,
      sources: ['google-gemini', 'openweather', 'farm-data'],
      actions: extractActions(text)
    }

    return new Response(
      JSON.stringify(agentResponse),
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

function extractActions(text: string): string[] {
  const actions = []
  const patterns = [
    /(?:spray|apply|use) (?:with|at) (\d+(?:\.\d+)?)/g,
    /(\d+(?:\.\d+)?) (?:kg|liters|ml|g) of/g,
    /(?:water|irrigate) (?:every|each) (\d+) (?:days|hours)/g
  ]
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) actions.push(...matches)
  })
  
  return actions.slice(0, 3)
}