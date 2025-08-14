import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const PLANTNET_API_KEY = '2b10yCMhWLwEpKAsrM48n1xLoe' // This should be in environment variables
const PLANTNET_BASE_URL = 'https://my-api.plantnet.org/v2'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, cropType } = await req.json()
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Remove data URL prefix if present
    const base64Image = image.replace(/^data:image\/[a-zA-Z+]+;base64,/, '')
    
    // Convert base64 to binary
    const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0))
    
    // Create form data for PlantNet API
    const formData = new FormData()
    const imageFile = new File([imageBuffer], 'plant-image.jpg', { type: 'image/jpeg' })
    formData.append('images', imageFile)
    
    // Add organs parameter based on crop type
    if (cropType) {
      const organMap: Record<string, string> = {
        'maize': 'leaf',
        'rice': 'leaf',
        'wheat': 'leaf',
        'cotton': 'leaf',
        'tomato': 'leaf',
        'potato': 'leaf',
        'default': 'leaf'
      }
      formData.append('organs', organMap[cropType.toLowerCase()] || organMap.default)
    } else {
      formData.append('organs', 'leaf')
    }

    // Make request to PlantNet API
    const plantnetResponse = await fetch(
      `${PLANTNET_BASE_URL}/identify/all?api-key=${PLANTNET_API_KEY}`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!plantnetResponse.ok) {
      const errorText = await plantnetResponse.text()
      console.error('PlantNet API error:', {
        status: plantnetResponse.status,
        statusText: plantnetResponse.statusText,
        error: errorText
      })
      
      return new Response(
        JSON.stringify({
          error: `PlantNet API error: ${plantnetResponse.status}`,
          details: errorText
        }),
        {
          status: plantnetResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const plantnetData = await plantnetResponse.json()

    // Transform PlantNet response to our format
    const transformedResponse = {
      results: plantnetData.results?.slice(0, 5).map((result: any) => ({
        scientificName: result.species?.scientificNameWithoutAuthor || 'Unknown',
        commonNames: result.species?.commonNames || [],
        confidence: Math.round((result.score || 0) * 100),
        family: result.species?.family?.scientificNameWithoutAuthor || 'Unknown',
        genus: result.species?.genus?.scientificNameWithoutAuthor || 'Unknown',
        disease: this.inferDiseaseFromName(result.species?.scientificNameWithoutAuthor || ''),
        severity: this.calculateSeverity(result.score || 0),
        treatment: this.getTreatmentRecommendation(result.species?.scientificNameWithoutAuthor || '')
      })) || []
    }

    return new Response(
      JSON.stringify(transformedResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Crop disease proxy error:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper functions for disease analysis
function inferDiseaseFromName(scientificName: string): string {
  const diseaseMap: Record<string, string> = {
    'zea mays': 'Healthy maize',
    'oryza sativa': 'Healthy rice',
    'triticum aestivum': 'Healthy wheat',
    'gossypium': 'Healthy cotton',
    'solanum lycopersicum': 'Healthy tomato',
    'solanum tuberosum': 'Healthy potato',
    'puccinia': 'Rust disease',
    'pyricularia': 'Rice blast',
    'rhizoctonia': 'Sheath blight',
    'fusarium': 'Fusarium wilt',
    'xanthomonas': 'Bacterial blight',
    'alternaria': 'Alternaria leaf spot',
    'cercospora': 'Cercospora leaf spot'
  }

  const lowerName = scientificName.toLowerCase()
  for (const [key, disease] of Object.entries(diseaseMap)) {
    if (lowerName.includes(key)) {
      return disease
    }
  }

  return 'General plant health issue'
}

function calculateSeverity(confidence: number): string {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.6) return 'medium'
  return 'low'
}

function getTreatmentRecommendation(scientificName: string): string {
  if (scientificName.toLowerCase().includes('healthy')) {
    return 'Plant appears healthy. Continue regular monitoring and maintenance practices.'
  }
  
  return 'Consult with a local agricultural extension officer for specific treatment recommendations based on your region and crop type.'
}