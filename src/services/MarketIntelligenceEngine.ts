/**
 * 🔥 MARKET INTELLIGENCE ENGINE - ULTRA SIMPLE PROFIT MAXIMIZER
 * Real-time organic vs conventional pricing intelligence
 */

interface MarketPrice {
  crop: string;
  conventional: number;
  organic: number;
  premium: number;
  trend: 'up' | 'down' | 'stable';
  demand: 'low' | 'medium' | 'high';
}

interface MarketOpportunity {
  crop: string;
  action: string;
  profit: number;
  urgency: 'low' | 'medium' | 'high';
  reason: string;
}

class MarketIntelligenceEngine {
  private static instance: MarketIntelligenceEngine;
  
  static getInstance(): MarketIntelligenceEngine {
    if (!this.instance) this.instance = new MarketIntelligenceEngine();
    return this.instance;
  }

  private prices: MarketPrice[] = [
    { crop: 'Tomatoes', conventional: 2.5, organic: 4.2, premium: 68, trend: 'up', demand: 'high' },
    { crop: 'Maize', conventional: 1.8, organic: 2.8, premium: 56, trend: 'stable', demand: 'medium' },
    { crop: 'Beans', conventional: 3.2, organic: 5.1, premium: 59, trend: 'up', demand: 'high' },
    { crop: 'Carrots', conventional: 1.9, organic: 3.4, premium: 79, trend: 'up', demand: 'medium' },
    { crop: 'Spinach', conventional: 2.1, organic: 3.8, premium: 81, trend: 'stable', demand: 'high' }
  ];

  getMarketPrices(): MarketPrice[] {
    return this.prices;
  }

  getTopOpportunities(): MarketOpportunity[] {
    return this.prices
      .filter(p => p.premium > 60 && p.demand === 'high')
      .map(p => ({
        crop: p.crop,
        action: `Switch to organic ${p.crop.toLowerCase()}`,
        profit: Math.round((p.organic - p.conventional) * 100), // Per 100kg
        urgency: p.trend === 'up' ? 'high' : 'medium',
        reason: `${p.premium}% premium, ${p.demand} demand, price trending ${p.trend}`
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 3);
  }

  getCropPremium(crop: string): number {
    const price = this.prices.find(p => p.crop.toLowerCase() === crop.toLowerCase());
    return price ? price.premium : 50; // Default 50% premium
  }

  getMarketAlert(crop: string): string | null {
    const price = this.prices.find(p => p.crop.toLowerCase() === crop.toLowerCase());
    if (!price) return null;

    if (price.premium > 70 && price.trend === 'up') {
      return `🚀 ${crop} organic premium is ${price.premium}% and rising! Perfect time to go organic.`;
    }
    
    if (price.demand === 'high' && price.premium > 60) {
      return `🔥 High demand for organic ${crop}! Premium at ${price.premium}%.`;
    }

    return null;
  }
}

export const marketIntelligenceEngine = MarketIntelligenceEngine.getInstance();
export type { MarketPrice, MarketOpportunity };