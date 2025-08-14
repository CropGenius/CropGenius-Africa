import { Handler } from '@netlify/functions'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
}

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  try {
    const path = event.path.replace('/api', '')
    const method = event.httpMethod
    const body = event.body

    // Handle health check locally
    if (path === '/health' && method === 'GET') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: { status: 'healthy', timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString()
        })
      }
    }

    // Route to appropriate Supabase Edge Function
    const functionName = getFunctionName(path, method)

    if (!functionName) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: { code: 'NOT_FOUND', message: `Endpoint ${method} ${path} not found` },
          timestamp: new Date().toISOString()
        })
      }
    }

    // Forward to Supabase Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method,
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeaders(event)
      },
      ...(method !== 'GET' && body ? { body } : {})
    })

    let data
    try {
      const responseText = await response.text()
      data = responseText ? JSON.parse(responseText) : null
    } catch (e) {
      data = null
    }

    // Ensure we always return valid JSON
    const responseData = data || {
      success: response.ok,
      error: response.ok ? undefined : { code: 'SERVER_ERROR', message: 'Internal server error' },
      timestamp: new Date().toISOString()
    }

    return {
      statusCode: response.status,
      headers: corsHeaders,
      body: JSON.stringify(responseData)
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message },
        timestamp: new Date().toISOString()
      })
    }
  }
}

function getFunctionName(path: string, method: string): string | null {
  // Handle health check locally
  if (path === '/health' && method === 'GET') return 'health'

  const routes = {
    // Health and basic endpoints
    'GET /health': 'health',

    // Satellite imagery endpoints
    'POST /satellite/imagery': 'satellite-imagery',
    'POST /satellite-imagery': 'satellite-imagery',
    'GET /satellite/imagery': 'satellite-imagery',

    // Weather endpoints
    'GET /weather': 'weather',
    'POST /weather': 'weather',

    // Market data endpoints
    'GET /market/prices': 'market-intelligence',
    'POST /market/prices': 'market-intelligence',
    'POST /market-prices': 'market-intelligence',

    // WhatsApp integration endpoints
    'POST /whatsapp/send': 'whatsapp-notification',
    'POST /whatsapp-notification': 'whatsapp-notification',

    // Crop-related endpoints
    'POST /': 'crop-recommendations',
    'POST /crops/disease': 'crop-disease-detector',
    'POST /crops/recommendations': 'crop-recommendations',
    'POST /crop-scan': 'crop-scan',
    'GET /crop-records': 'crop-records',
    'POST /crop-records': 'crop-records',
    'PUT /crop-records': 'crop-records',
    'DELETE /crop-records': 'crop-records',

    // Auth endpoints
    'POST /auth/login': 'auth',
    'POST /auth/signup': 'auth',

    // Field analysis
    'POST /field-analysis': 'field-analysis',
    'POST /field-ai-insights': 'field-ai-insights'
  }

  // Handle dynamic paths like /crop-records/{id}
  if (path.startsWith('/crop-records')) {
    const cropRecordRoutes = {
      'GET': 'crop-records',
      'POST': 'crop-records',
      'PUT': 'crop-records',
      'DELETE': 'crop-records'
    }
    return cropRecordRoutes[method] || null
  }

  return routes[`${method} ${path}`] || null
}

function getAuthHeaders(event: any) {
  const auth = event.headers.authorization
  return auth ? { 'Authorization': auth } : {}
}