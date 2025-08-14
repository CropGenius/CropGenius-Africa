/**
 * 🌾 CROPGENIUS – CROP RECORDS MANAGEMENT EDGE FUNCTION
 * -------------------------------------------------------------
 * PRODUCTION-READY Crop Records API with comprehensive validation
 * - Create, update, delete, and query crop records
 * - Input validation and error handling
 * - Standardized JSON responses
 * - Authentication and authorization
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
}

interface CropRecord {
  id?: string
  field_id: string
  crop_type: string
  planting_date: string
  expected_harvest_date: string
  status: 'planning' | 'growing' | 'harvested' | 'failed'
  area_planted: number
  expected_yield?: number
  actual_yield?: number
  notes?: string
  created_at?: string
  updated_at?: string
}

interface ApiResponse {
  success: boolean
  data?: any
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return createErrorResponse('UNAUTHORIZED', 'Authorization header required')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return createErrorResponse('UNAUTHORIZED', 'Invalid authentication')
    }

    // Route requests based on method and path
    switch (method) {
      case 'GET':
        return handleGetCropRecords(req, supabaseClient, user.id)
      case 'POST':
        return handleCreateCropRecord(req, supabaseClient, user.id)
      case 'PUT':
        return handleUpdateCropRecord(req, supabaseClient, user.id)
      case 'DELETE':
        return handleDeleteCropRecord(req, supabaseClient, user.id)
      default:
        return createErrorResponse('METHOD_NOT_ALLOWED', `Method ${method} not allowed`)
    }

  } catch (error) {
    console.error('Crop records API error:', error)
    return createErrorResponse('INTERNAL_ERROR', 'Internal server error', error.message)
  }
})

// GET /crop-records or /crop-records/{id}
async function handleGetCropRecords(req: Request, supabase: any, userId: string) {
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/')
  const recordId = pathParts[pathParts.length - 1] !== 'crop-records' ? pathParts[pathParts.length - 1] : null

  try {
    let query = supabase
      .from('crop_records')
      .select(`*, fields(name, location)`)
      .eq('user_id', userId)

    if (recordId) {
      query = query.eq('id', recordId).single()
    } else {
      // Add query parameters support
      const fieldId = url.searchParams.get('field_id')
      const status = url.searchParams.get('status')
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      if (fieldId) query = query.eq('field_id', fieldId)
      if (status) query = query.eq('status', status)
      
      query = query.order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
    }

    const { data, error } = await query

    if (error) {
      if (recordId && error.code === 'PGRST116') {
        return createErrorResponse('NOT_FOUND', 'Crop record not found')
      }
      throw error
    }

    return createSuccessResponse(recordId ? data : { records: data, total: data?.length || 0 })

  } catch (error) {
    console.error('Error fetching crop records:', error)
    return createErrorResponse('DATABASE_ERROR', 'Failed to fetch crop records', error.message)
  }
}

// POST /crop-records
async function handleCreateCropRecord(req: Request, supabase: any, userId: string) {
  try {
    const body = await req.json()
    
    // Validate required fields
    const validation = validateCropRecord(body)
    if (!validation.valid) {
      return createErrorResponse('VALIDATION_ERROR', 'Invalid input data', validation.errors)
    }

    // Verify field ownership
    const { data: field, error: fieldError } = await supabase
      .from('fields')
      .select('id')
      .eq('id', body.field_id)
      .eq('user_id', userId)
      .single()

    if (fieldError || !field) {
      return createErrorResponse('NOT_FOUND', 'Field not found or access denied')
    }

    // Create crop record
    const cropRecord = {
      ...validation.data,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('crop_records')
      .insert(cropRecord)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return createErrorResponse('DUPLICATE_ERROR', 'Crop record already exists')
      }
      throw error
    }

    return createSuccessResponse(data, 201)

  } catch (error) {
    console.error('Error creating crop record:', error)
    return createErrorResponse('DATABASE_ERROR', 'Failed to create crop record', error.message)
  }
}

// PUT /crop-records/{id}
async function handleUpdateCropRecord(req: Request, supabase: any, userId: string) {
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/')
  const recordId = pathParts[pathParts.length - 1]

  try {
    const body = await req.json()
    
    // Check if record exists and belongs to user
    const { data: existingRecord, error: checkError } = await supabase
      .from('crop_records')
      .select('id')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single()

    if (checkError || !existingRecord) {
      return createErrorResponse('NOT_FOUND', 'Crop record not found or access denied')
    }

    // Validate update data
    const validation = validateCropRecord(body, true)
    if (!validation.valid) {
      return createErrorResponse('VALIDATION_ERROR', 'Invalid update data', validation.errors)
    }

    // Update record
    const updateData = {
      ...validation.data,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('crop_records')
      .update(updateData)
      .eq('id', recordId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return createSuccessResponse(data)

  } catch (error) {
    console.error('Error updating crop record:', error)
    return createErrorResponse('DATABASE_ERROR', 'Failed to update crop record', error.message)
  }
}

// DELETE /crop-records/{id}
async function handleDeleteCropRecord(req: Request, supabase: any, userId: string) {
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/')
  const recordId = pathParts[pathParts.length - 1]

  try {
    // Check if record exists and belongs to user
    const { data: existingRecord, error: checkError } = await supabase
      .from('crop_records')
      .select('id')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single()

    if (checkError || !existingRecord) {
      return createErrorResponse('NOT_FOUND', 'Crop record not found or access denied')
    }

    // Delete record
    const { error } = await supabase
      .from('crop_records')
      .delete()
      .eq('id', recordId)
      .eq('user_id', userId)

    if (error) {
      throw error
    }

    return createSuccessResponse({ deleted: true, id: recordId })

  } catch (error) {
    console.error('Error deleting crop record:', error)
    return createErrorResponse('DATABASE_ERROR', 'Failed to delete crop record', error.message)
  }
}

// Validation function for crop records
function validateCropRecord(data: any, isUpdate = false): { valid: boolean; data?: any; errors?: any } {
  const errors: any = {}
  const requiredFields = ['field_id', 'crop_type', 'planting_date', 'expected_harvest_date', 'status', 'area_planted']
  
  if (!isUpdate) {
    for (const field of requiredFields) {
      if (!data[field]) {
        errors[field] = `${field} is required`
      }
    }
  }

  // Validate field types
  if (data.field_id && typeof data.field_id !== 'string') {
    errors.field_id = 'field_id must be a string'
  }

  if (data.crop_type && typeof data.crop_type !== 'string') {
    errors.crop_type = 'crop_type must be a string'
  }

  if (data.status && !['planning', 'growing', 'harvested', 'failed'].includes(data.status)) {
    errors.status = 'status must be one of: planning, growing, harvested, failed'
  }

  if (data.area_planted && (typeof data.area_planted !== 'number' || data.area_planted <= 0)) {
    errors.area_planted = 'area_planted must be a positive number'
  }

  if (data.planting_date && !isValidDate(data.planting_date)) {
    errors.planting_date = 'planting_date must be a valid ISO date string'
  }

  if (data.expected_harvest_date && !isValidDate(data.expected_harvest_date)) {
    errors.expected_harvest_date = 'expected_harvest_date must be a valid ISO date string'
  }

  if (data.expected_yield && (typeof data.expected_yield !== 'number' || data.expected_yield < 0)) {
    errors.expected_yield = 'expected_yield must be a non-negative number'
  }

  if (data.actual_yield && (typeof data.actual_yield !== 'number' || data.actual_yield < 0)) {
    errors.actual_yield = 'actual_yield must be a non-negative number'
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  // Filter out only valid fields
  const validFields = [
    'field_id', 'crop_type', 'planting_date', 'expected_harvest_date', 
    'status', 'area_planted', 'expected_yield', 'actual_yield', 'notes'
  ]
  const filteredData: any = {}
  
  for (const field of validFields) {
    if (data[field] !== undefined) {
      filteredData[field] = data[field]
    }
  }

  return { valid: true, data: filteredData }
}

// Helper functions
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

function createSuccessResponse(data: any, statusCode = 200): Response {
  const response: ApiResponse = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
  
  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: corsHeaders
  })
}

function createErrorResponse(code: string, message: string, details?: any): Response {
  const response: ApiResponse = {
    success: false,
    error: { code, message, ...(details && { details }) },
    timestamp: new Date().toISOString()
  }
  
  const statusCodes: { [key: string]: number } = {
    'UNAUTHORIZED': 401,
    'NOT_FOUND': 404,
    'VALIDATION_ERROR': 400,
    'DUPLICATE_ERROR': 409,
    'DATABASE_ERROR': 500,
    'INTERNAL_ERROR': 500,
    'METHOD_NOT_ALLOWED': 405
  }
  
  return new Response(JSON.stringify(response), {
    status: statusCodes[code] || 500,
    headers: corsHeaders
  })
}