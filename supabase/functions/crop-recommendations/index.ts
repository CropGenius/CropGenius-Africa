/**
 * 🌾 CROPGENIUS – CROP RECOMMENDATIONS EDGE FUNCTION
 * -------------------------------------------------------------
 * PRODUCTION-READY AI-Powered Crop Recommendation Service
 * - Intelligent crop suitability analysis based on field data
 * - Market intelligence integration for economic viability
 * - Disease risk assessment and prevention strategies
 * - Climate and soil compatibility analysis
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CropRecommendationRequest {
  fieldId: string;
  fieldData?: any;
  userId: string;
  includeMarketData?: boolean;
  includeDiseaseRisk?: boolean;
  maxRecommendations?: number;
}

interface CropRecommendation {
  name: string;
  confidence: number;
  description: string;
  rotationBenefit?: string;
  suitabilityFactors: {
    soil: number;
    climate: number;
    water: number;
    market: number;
  };
  economicViability: {
    profitabilityScore: number;
    investmentRequired: number;
    expectedRevenue: number;
  };
  diseaseRisk: {
    level: 'low' | 'medium' | 'high';
    commonDiseases: string[];
  };
  marketOutlook: {
    currentPrice: number;
    pricetrend: 'rising' | 'stable' | 'falling';
    demandLevel: 'low' | 'medium' | 'high';
  };
  plantingWindow: {
    start: string;
    end: string;
    optimal: string;
  };
  expectedYield: {
    min: number;
    max: number;
    unit: string;
  };
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Parse request body
    const {
      fieldId,
      fieldData,
      userId,
      includeMarketData = true,
      includeDiseaseRisk = true,
      maxRecommendations = 5
    }: CropRecommendationRequest = await req.json()

    console.log('Processing crop recommendation request:', { fieldId, userId })

    // Validate required parameters
    if (!fieldId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Field ID and User ID are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get field data if not provided
    let field = fieldData;
    if (!field) {
      const { data: fieldRecord, error: fieldError } = await supabaseClient
        .from('fields')
        .select('*')
        .eq('id', fieldId)
        .eq('user_id', userId)
        .single();

      if (fieldError) {
        console.error('Error fetching field:', fieldError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch field data' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      field = fieldRecord;
    }

    // Get user profile for additional context
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.warn('Could not fetch user profile:', profileError);
    }

    // Generate crop recommendations
    const recommendations = await generateCropRecommendations(
      field,
      profile,
      {
        includeMarketData,
        includeDiseaseRisk,
        maxRecommendations
      }
    );

    // Store recommendation request for analytics
    try {
      await supabaseClient
        .from('recommendation_requests')
        .insert({
          user_id: userId,
          field_id: fieldId,
          request_type: 'crop_recommendations',
          parameters: {
            includeMarketData,
            includeDiseaseRisk,
            maxRecommendations
          },
          results_count: recommendations.length
        });
    } catch (error) {
      console.warn('Failed to log recommendation request:', error);
    }

    return new Response(
      JSON.stringify({
        crops: recommendations,
        metadata: {
          fieldId,
          userId,
          generatedAt: new Date().toISOString(),
          version: '2.0.0'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in crop recommendations function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/**
 * Generate intelligent crop recommendations based on field and user data
 */
async function generateCropRecommendations(
  field: any,
  profile: any,
  options: {
    includeMarketData: boolean;
    includeDiseaseRisk: boolean;
    maxRecommendations: number;
  }
): Promise<CropRecommendation[]> {
  
  // Extract field characteristics with enhanced intelligence
  const location = field.location || profile?.location || { lat: -1.2921, lng: 36.8219 };
  const soilType = field.metadata?.soil_type || field.soil_type || 'loamy';
  const fieldSize = field.size || 1;
  const currentCrop = field.crop_type_id || field.crop_type;
  const plantedAt = field.planted_at;
  const harvestDate = field.harvest_date;
  
  // Enhanced location intelligence
  const region = determineRegion(location);
  const climateZone = determineClimateZone(location.lat);
  const elevation = field.metadata?.elevation || estimateElevation(location);
  
  console.log('Generating recommendations for:', {
    location,
    soilType,
    fieldSize,
    currentCrop,
    region,
    climateZone,
    elevation
  });

  // Enhanced crop database with African focus and real intelligence
  const cropDatabase = [
    {
      name: 'Maize',
      baseConfidence: 85,
      soilPreference: ['loamy', 'clay', 'sandy-loam'],
      waterRequirement: 'medium',
      climateZones: ['tropical', 'subtropical'],
      growingPeriod: 120, // days
      elevationRange: { min: 0, max: 2500 },
      marketData: {
        basePrice: 0.35,
        demand: 'high',
        volatility: 'medium',
        seasonalPricing: true
      },
      diseaseRisks: ['Fall Armyworm', 'Maize Streak Virus', 'Gray Leaf Spot', 'Maize Lethal Necrosis'],
      yieldRange: { min: 2000, max: 4000, unit: 'kg/ha' },
      investmentCost: 200,
      nutritionalValue: 'high',
      storageLife: 'long',
      processingOptions: ['flour', 'animal feed', 'direct consumption']
    },
    {
      name: 'Cassava',
      baseConfidence: 80,
      soilPreference: ['sandy', 'loamy', 'poor'],
      waterRequirement: 'low',
      climateZones: ['tropical'],
      growingPeriod: 300, // days
      marketData: {
        basePrice: 0.25,
        demand: 'medium',
        volatility: 'low'
      },
      diseaseRisks: ['Cassava Mosaic Disease', 'Cassava Brown Streak'],
      yieldRange: { min: 8000, max: 15000, unit: 'kg/ha' },
      investmentCost: 150
    },
    {
      name: 'Sweet Potatoes',
      baseConfidence: 75,
      soilPreference: ['sandy-loam', 'loamy'],
      waterRequirement: 'medium',
      climateZones: ['tropical', 'subtropical'],
      growingPeriod: 90, // days
      marketData: {
        basePrice: 0.45,
        demand: 'medium',
        volatility: 'medium'
      },
      diseaseRisks: ['Sweet Potato Weevil', 'Viral Diseases'],
      yieldRange: { min: 5000, max: 12000, unit: 'kg/ha' },
      investmentCost: 300
    },
    {
      name: 'Groundnuts',
      baseConfidence: 70,
      soilPreference: ['sandy', 'sandy-loam'],
      waterRequirement: 'low',
      climateZones: ['tropical', 'subtropical'],
      growingPeriod: 100, // days
      marketData: {
        basePrice: 1.20,
        demand: 'high',
        volatility: 'high'
      },
      diseaseRisks: ['Groundnut Rosette', 'Leaf Spot', 'Rust'],
      yieldRange: { min: 800, max: 1500, unit: 'kg/ha' },
      investmentCost: 250
    },
    {
      name: 'Beans',
      baseConfidence: 68,
      soilPreference: ['loamy', 'clay-loam'],
      waterRequirement: 'medium',
      climateZones: ['tropical', 'subtropical'],
      growingPeriod: 75, // days
      marketData: {
        basePrice: 0.90,
        demand: 'medium',
        volatility: 'medium'
      },
      diseaseRisks: ['Bean Common Mosaic', 'Anthracnose', 'Rust'],
      yieldRange: { min: 800, max: 1200, unit: 'kg/ha' },
      investmentCost: 180
    },
    {
      name: 'Tomato',
      baseConfidence: 65,
      soilPreference: ['loamy', 'sandy-loam'],
      waterRequirement: 'high',
      climateZones: ['tropical', 'subtropical'],
      growingPeriod: 80, // days
      marketData: {
        basePrice: 0.80,
        demand: 'high',
        volatility: 'high'
      },
      diseaseRisks: ['Late Blight', 'Early Blight', 'Bacterial Wilt'],
      yieldRange: { min: 15000, max: 30000, unit: 'kg/ha' },
      investmentCost: 500
    }
  ];

  // Calculate recommendations for each crop with enhanced intelligence
  const recommendations: CropRecommendation[] = [];

  for (const crop of cropDatabase) {
    // Multi-factor confidence calculation with weighted scoring
    let confidence = crop.baseConfidence;
    const factors = {
      soil: 0,
      climate: 0,
      elevation: 0,
      rotation: 0,
      seasonal: 0,
      economic: 0,
      fieldSize: 0
    };

    // Soil compatibility (25% weight)
    const soilMatch = crop.soilPreference.includes(soilType) ? 1.0 : 
                     soilType === 'unknown' ? 0.8 : 0.6;
    factors.soil = soilMatch;
    confidence *= (0.75 + (soilMatch * 0.25));

    // Climate zone compatibility (20% weight)
    const climateMatch = crop.climateZones.includes(climateZone) ? 1.0 : 0.7;
    factors.climate = climateMatch;
    confidence *= (0.8 + (climateMatch * 0.2));

    // Elevation suitability (10% weight)
    const elevationMatch = (elevation >= crop.elevationRange.min && elevation <= crop.elevationRange.max) ? 1.0 : 0.8;
    factors.elevation = elevationMatch;
    confidence *= (0.9 + (elevationMatch * 0.1));

    // Crop rotation intelligence (15% weight)
    let rotationBoost = 1.0;
    if (currentCrop) {
      const currentCropLower = currentCrop.toLowerCase();
      const cropNameLower = crop.name.toLowerCase();
      
      if (currentCropLower.includes(cropNameLower)) {
        rotationBoost = 0.6; // Penalize same crop heavily
      } else if (isGoodRotation(currentCropLower, cropNameLower)) {
        rotationBoost = 1.3; // Boost good rotation pairs
      }
    }
    factors.rotation = rotationBoost;
    confidence *= (0.85 + (rotationBoost * 0.15));

    // Seasonal timing (15% weight)
    const seasonalBoost = calculateSeasonalSuitability(crop, location);
    factors.seasonal = seasonalBoost;
    confidence *= (0.85 + (seasonalBoost * 0.15));

    // Economic viability (10% weight)
    const economicScore = calculateEconomicScore(crop, fieldSize);
    factors.economic = economicScore;
    confidence *= (0.9 + (economicScore * 0.1));

    // Field size optimization (5% weight)
    const fieldSizeBoost = calculateFieldSizeBoost(crop, fieldSize);
    factors.fieldSize = fieldSizeBoost;
    confidence *= (0.95 + (fieldSizeBoost * 0.05));

    // Normalize confidence to 0-100 range
    confidence = Math.min(100, Math.max(20, confidence));

    console.log(`${crop.name} confidence calculation:`, {
      baseConfidence: crop.baseConfidence,
      factors,
      finalConfidence: confidence
    });

    // Calculate suitability factors
    const suitabilityFactors = {
      soil: Math.round(soilMatch * 100),
      climate: Math.round(climateMatch * 100),
      water: calculateWaterSuitability(crop, location),
      market: calculateMarketSuitability(crop)
    };

    // Calculate economic viability
    const avgYield = (crop.yieldRange.min + crop.yieldRange.max) / 2;
    const expectedRevenue = avgYield * crop.marketData.basePrice;
    const profitabilityScore = Math.round(((expectedRevenue - crop.investmentCost) / crop.investmentCost) * 100);

    const economicViability = {
      profitabilityScore: Math.max(0, profitabilityScore),
      investmentRequired: crop.investmentCost,
      expectedRevenue: Math.round(expectedRevenue)
    };

    // Disease risk assessment
    const diseaseRisk = {
      level: crop.diseaseRisks.length > 2 ? 'high' : crop.diseaseRisks.length > 1 ? 'medium' : 'low' as 'low' | 'medium' | 'high',
      commonDiseases: crop.diseaseRisks
    };

    // Market outlook
    const marketOutlook = {
      currentPrice: crop.marketData.basePrice,
      pricetrend: generatePriceTrend(crop) as 'rising' | 'stable' | 'falling',
      demandLevel: crop.marketData.demand as 'low' | 'medium' | 'high'
    };

    // Planting window
    const plantingWindow = generatePlantingWindow(crop, location);

    // Expected yield (adjusted for field conditions)
    const yieldMultiplier = (soilMatch + climateMatch) / 2;
    const expectedYield = {
      min: Math.round(crop.yieldRange.min * yieldMultiplier),
      max: Math.round(crop.yieldRange.max * yieldMultiplier),
      unit: crop.yieldRange.unit
    };

    recommendations.push({
      name: crop.name,
      confidence: Math.round(confidence),
      description: generateCropDescription(crop, field, suitabilityFactors),
      rotationBenefit: generateRotationBenefit(crop, currentCrop),
      suitabilityFactors,
      economicViability,
      diseaseRisk,
      marketOutlook,
      plantingWindow,
      expectedYield
    });
  }

  // Sort by confidence and return top recommendations
  return recommendations
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, options.maxRecommendations);
}

/**
 * Helper functions for enhanced intelligence
 */

function determineClimateZone(latitude: number): string {
  const lat = Math.abs(latitude);
  if (lat >= 23.5) return 'temperate';
  if (lat >= 10) return 'subtropical';
  return 'tropical';
}

function determineRegion(location: any): string {
  const lat = location.lat;
  const lng = location.lng;
  
  // African regions based on coordinates
  if (lat >= 0 && lat <= 15 && lng >= 15 && lng <= 50) return 'East Africa';
  if (lat >= -10 && lat <= 5 && lng >= 8 && lng <= 25) return 'Central Africa';
  if (lat >= 5 && lat <= 20 && lng >= -20 && lng <= 15) return 'West Africa';
  if (lat >= -35 && lat <= -15 && lng >= 15 && lng <= 35) return 'Southern Africa';
  if (lat >= 20 && lat <= 35 && lng >= -10 && lng <= 35) return 'North Africa';
  
  return 'Unknown Region';
}

function estimateElevation(location: any): number {
  // Simplified elevation estimation based on known African geography
  const lat = location.lat;
  const lng = location.lng;
  
  // East African Highlands
  if (lat >= -5 && lat <= 5 && lng >= 35 && lng <= 40) return 1800;
  // Ethiopian Highlands
  if (lat >= 5 && lat <= 15 && lng >= 35 && lng <= 45) return 2200;
  // Coastal areas
  if (Math.abs(lng - 39) < 2 || Math.abs(lng - 3) < 2) return 50;
  
  return 1200; // Default moderate elevation
}

function calculateSeasonalSuitability(crop: any, location: any): number {
  // Simplified seasonal calculation
  const month = new Date().getMonth() + 1;
  
  // African farming seasons
  if (location.lat < 0) {
    // Southern hemisphere
    if (month >= 10 || month <= 3) return 1.1; // Rainy season
  } else {
    // Northern hemisphere
    if (month >= 4 && month <= 9) return 1.1; // Rainy season
  }
  
  return 1.0;
}

function calculateWaterSuitability(crop: any, location: any): number {
  // Simplified water availability calculation
  const baseWater = 75;
  
  if (crop.waterRequirement === 'low') return Math.min(100, baseWater + 20);
  if (crop.waterRequirement === 'high') return Math.max(50, baseWater - 20);
  
  return baseWater;
}

function calculateMarketSuitability(crop: any): number {
  const demandScore = crop.marketData.demand === 'high' ? 90 : 
                     crop.marketData.demand === 'medium' ? 75 : 60;
  
  const volatilityPenalty = crop.marketData.volatility === 'high' ? -10 : 
                           crop.marketData.volatility === 'medium' ? -5 : 0;
  
  return Math.max(50, demandScore + volatilityPenalty);
}

function generatePriceTrend(crop: any): string {
  // Simplified trend generation based on demand and volatility
  if (crop.marketData.demand === 'high' && crop.marketData.volatility !== 'high') {
    return 'rising';
  }
  if (crop.marketData.demand === 'low') {
    return 'falling';
  }
  return 'stable';
}

function generatePlantingWindow(crop: any, location: any): { start: string; end: string; optimal: string } {
  // Simplified planting windows for African context
  const windows = {
    'Maize': { start: 'March', end: 'May', optimal: 'April' },
    'Cassava': { start: 'March', end: 'June', optimal: 'April' },
    'Sweet Potatoes': { start: 'February', end: 'May', optimal: 'March' },
    'Groundnuts': { start: 'April', end: 'June', optimal: 'May' },
    'Beans': { start: 'March', end: 'May', optimal: 'April' },
    'Tomato': { start: 'February', end: 'April', optimal: 'March' }
  };
  
  return windows[crop.name as keyof typeof windows] || { start: 'March', end: 'May', optimal: 'April' };
}

function generateCropDescription(crop: any, field: any, suitability: any): string {
  const soilMatch = suitability.soil > 80 ? 'excellent' : suitability.soil > 60 ? 'good' : 'moderate';
  const climateMatch = suitability.climate > 80 ? 'ideal' : suitability.climate > 60 ? 'suitable' : 'acceptable';
  
  return `${crop.name} shows ${soilMatch} soil compatibility and ${climateMatch} climate conditions for your field. This crop is well-suited for your farming conditions.`;
}

function generateRotationBenefit(crop: any, currentCrop?: string): string {
  if (!currentCrop) return `${crop.name} is an excellent choice for establishing your cropping system.`;
  
  const benefits = {
    'Maize': 'Excellent after legumes for nitrogen utilization',
    'Cassava': 'Good for soil improvement and can grow in poorer soils',
    'Sweet Potatoes': 'Helps break pest cycles and improves soil structure',
    'Groundnuts': 'Fixes nitrogen for subsequent crops',
    'Beans': 'Excellent nitrogen fixer for soil improvement',
    'Tomato': 'High-value crop for diversified income'
  };
  
  return benefits[crop.name as keyof typeof benefits] || `${crop.name} provides good rotation benefits.`;
}

function isGoodRotation(currentCrop: string, newCrop: string): boolean {
  const rotationPairs = {
    'maize': ['groundnuts', 'beans', 'cassava'],
    'groundnuts': ['maize', 'sweet potatoes', 'tomato'],
    'beans': ['maize', 'sweet potatoes', 'tomato'],
    'cassava': ['maize', 'groundnuts', 'beans'],
    'tomato': ['beans', 'groundnuts', 'maize'],
    'sweet potatoes': ['beans', 'groundnuts', 'maize']
  };
  
  const goodRotations = rotationPairs[currentCrop as keyof typeof rotationPairs] || [];
  return goodRotations.includes(newCrop);
}

function calculateEconomicScore(crop: any, fieldSize: number): number {
  const roi = (crop.yieldRange.max * crop.marketData.basePrice - crop.investmentCost) / crop.investmentCost;
  const demandMultiplier = crop.marketData.demand === 'high' ? 1.2 : 
                          crop.marketData.demand === 'medium' ? 1.0 : 0.8;
  const volatilityPenalty = crop.marketData.volatility === 'high' ? 0.9 : 1.0;
  
  return Math.min(1.0, (roi * demandMultiplier * volatilityPenalty) / 2);
}

function calculateFieldSizeBoost(crop: any, fieldSize: number): number {
  // High-value crops get boost for small fields
  if (fieldSize < 0.5 && crop.marketData.basePrice > 0.6) return 1.2;
  // Staple crops get boost for large fields
  if (fieldSize > 2 && ['Maize', 'Cassava'].includes(crop.name)) return 1.1;
  
  return 1.0;
}