/**
 * 🌍 CROPGENIUS SMART MARKET AGENT v2.0
 * Real-time market intelligence for African farmers
 * Integrates live market APIs with intelligent fallback
 */

import { supabase } from '../integrations/supabase/client';
import { fetchLiveMarketPrices, getMarketTrends, type LiveMarketPrice, type MarketDataResponse } from '../services/marketDataService';

export interface MarketDataInput {
  cropType: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  userId?: string;
  region?: string;
}

export interface MarketListing {
  id?: string;
  crop_name: string;
  created_at?: string;
  price: number;
  source: string;
  date_recorded: string;
  currency: string;
  location: string;
  market_name?: string;
  trend?: 'up' | 'down' | 'stable';
  change_percentage?: number;
  quality_grade?: string;
  unit?: string;
}

export interface MarketDataOutput {
  cropType: string;
  listings: MarketListing[];
  source: 'live' | 'cached' | 'static';
  last_updated: string;
  priceTrends?: {
    current_price: number;
    average_price: number;
    trend: 'up' | 'down' | 'stable';
    change_percentage: number;
  };
  demandIndicator?: string;
  recommendations?: string[];
}

/**
 * Enhanced market listings with live data integration
 */
export const fetchMarketListings = async (
  input: MarketDataInput
): Promise<MarketDataOutput> => {
  const { cropType, latitude, longitude, radiusKm, userId, region = 'kenya' } = input;

  console.log(`🌍 Fetching enhanced market data for ${cropType} in ${region}...`);

  try {
    // Try live market data first
    const liveMarketResponse = await fetchLiveMarketPrices(cropType, region);
    
    if (liveMarketResponse.success && liveMarketResponse.data.length > 0) {
      // Convert live data to MarketListing format
      const listings: MarketListing[] = liveMarketResponse.data.map(item => ({
        crop_name: item.crop_name,
        price: item.price,
        source: item.source,
        date_recorded: item.date_recorded,
        currency: item.currency,
        location: item.location,
        market_name: item.market_name,
        trend: item.trend,
        change_percentage: item.change_percentage,
        quality_grade: item.quality_grade,
        unit: item.unit
      }));

      // Get price trends
      const trends = await getMarketTrends(cropType, region);
      
      // Generate recommendations
      const recommendations = generateMarketRecommendations(listings, trends);

      return {
        cropType,
        listings,
        source: liveMarketResponse.source,
        last_updated: liveMarketResponse.last_updated,
        priceTrends: trends,
        demandIndicator: calculateDemandIndicator(trends),
        recommendations
      };
    }
  } catch (error) {
    console.warn('Live market data failed, falling back to database:', error);
  }

  // Fallback to database query
  try {
    let query = supabase
      .from('market_prices')
      .select('*')
      .ilike('crop_name', `%${cropType}%`)
      .order('date_recorded', { ascending: false })
      .limit(20);

    if (region) {
      query = query.ilike('location', `%${region}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      throw error;
    }

    const listings: MarketListing[] = (data || []).map(item => ({
      id: item.id,
      crop_name: item.crop_name,
      created_at: item.created_at,
      price: item.price,
      source: item.source || 'database',
      date_recorded: item.date_recorded,
      currency: item.currency || 'KES',
      location: item.location,
      trend: 'stable',
      change_percentage: 0
    }));

    // Get trends from database
    const trends = await getMarketTrends(cropType, region);
    const recommendations = generateMarketRecommendations(listings, trends);

    return {
      cropType,
      listings,
      source: 'cached',
      last_updated: new Date().toISOString(),
      priceTrends: trends,
      demandIndicator: calculateDemandIndicator(trends),
      recommendations
    };

  } catch (error) {
    console.error('Error in fetchMarketListings:', error);
    
    // Final fallback with static data
    return generateFallbackMarketData(cropType, region);
  }
};

/**
 * Generate market recommendations based on data
 */
function generateMarketRecommendations(
  listings: MarketListing[], 
  trends: any
): string[] {
  const recommendations: string[] = [];
  
  if (trends.trend === 'up' && trends.change_percentage > 10) {
    recommendations.push(`🔥 Prices rising ${trends.change_percentage.toFixed(1)}% - Good time to sell!`);
    recommendations.push('Consider selling your current stock before prices stabilize');
  } else if (trends.trend === 'down' && trends.change_percentage < -10) {
    recommendations.push(`📉 Prices falling ${Math.abs(trends.change_percentage).toFixed(1)}% - Hold if possible`);
    recommendations.push('Wait for price recovery or find alternative markets');
  } else {
    recommendations.push('📊 Prices are stable - Normal trading conditions');
  }

  // Market-specific recommendations
  if (listings.length > 0) {
    const avgPrice = listings.reduce((sum, item) => sum + item.price, 0) / listings.length;
    const highestPrice = Math.max(...listings.map(item => item.price));
    const bestMarket = listings.find(item => item.price === highestPrice);
    
    if (bestMarket) {
      recommendations.push(`💰 Best price: ${bestMarket.currency} ${highestPrice} at ${bestMarket.location}`);
    }
    
    recommendations.push(`📈 Average market price: ${listings[0]?.currency || 'KES'} ${avgPrice.toFixed(0)}`);
  }

  return recommendations;
}

/**
 * Calculate demand indicator
 */
function calculateDemandIndicator(trends: any): string {
  if (trends.change_percentage > 15) return 'Very High';
  if (trends.change_percentage > 5) return 'High';
  if (trends.change_percentage > -5) return 'Moderate';
  if (trends.change_percentage > -15) return 'Low';
  return 'Very Low';
}

/**
 * Generate fallback market data when all sources fail
 */
function generateFallbackMarketData(cropType: string, region: string): MarketDataOutput {
  const basePrices = {
    maize: 3500,
    beans: 8000,
    rice: 4500,
    tomato: 2500,
    onion: 3000,
    potato: 2800,
    wheat: 4000,
    sorghum: 3200
  };

  const basePrice = basePrices[cropType.toLowerCase()] || 3000;
  const variation = (Math.random() - 0.5) * 0.2;
  const price = Math.round(basePrice * (1 + variation));
  const changePercentage = (Math.random() - 0.5) * 20;

  const listings: MarketListing[] = [
    {
      crop_name: cropType,
      price: price,
      source: 'static',
      date_recorded: new Date().toISOString(),
      currency: 'KES',
      location: region,
      market_name: 'Local Market',
      trend: changePercentage > 0 ? 'up' : 'down',
      change_percentage: Math.round(changePercentage * 100) / 100,
      quality_grade: 'Standard',
      unit: 'per bag'
    }
  ];

  const trends = {
    current_price: price,
    average_price: price,
    trend: changePercentage > 0 ? 'up' as const : 'down' as const,
    change_percentage: changePercentage
  };

  return {
    cropType,
    listings,
    source: 'static',
    last_updated: new Date().toISOString(),
    priceTrends: trends,
    demandIndicator: calculateDemandIndicator(trends),
    recommendations: [
      '⚠️ Using estimated market data - actual prices may vary',
      'Contact local markets for current pricing',
      'Check with agricultural cooperatives for better rates'
    ]
  };
}

console.log('✅ SmartMarketAgent v2.0 loaded with live market integration');
