import { Handler } from '@netlify/functions'

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

  // Only handle POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Allow': 'POST, OPTIONS' },
      body: JSON.stringify({
        success: false,
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST method is allowed' },
        timestamp: new Date().toISOString()
      })
    }
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {}

    // Validate required fields
    if (!body.key) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Field "key" is required' },
          timestamp: new Date().toISOString()
        })
      }
    }

    // Handle special characters
    if (typeof body.key === 'string' && body.key.length > 100) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Field "key" exceeds maximum length of 100 characters' },
          timestamp: new Date().toISOString()
        })
      }
    }

    // Success response
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: { message: 'Request processed successfully', received: body },
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    // Handle JSON parsing errors
    if (error.message.includes('JSON')) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON' },
          timestamp: new Date().toISOString()
        })
      }
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Internal server error' },
        timestamp: new Date().toISOString()
      })
    }
  }
}