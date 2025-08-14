/**
 * 🔥 PREMIUM ENGINE - ULTRA SIMPLE MONETIZATION MACHINE
 * BioCert Pro premium tier with maximum value
 */

interface PremiumTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  savings: number;
}

interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  value: string;
}

class PremiumEngine {
  private static instance: PremiumEngine;
  
  static getInstance(): PremiumEngine {
    if (!this.instance) this.instance = new PremiumEngine();
    return this.instance;
  }

  private tiers: PremiumTier[] = [
    {
      id: 'free',
      name: 'Free Farmer',
      price: 0,
      features: ['3 daily superpowers', 'Basic recipes', 'Community access'],
      savings: 50
    },
    {
      id: 'pro',
      name: 'BioCert Pro',
      price: 9.99,
      features: ['Unlimited superpowers', 'Premium recipes', 'Certification support', 'Export market access', 'Priority support'],
      savings: 500
    }
  ];

  private features: PremiumFeature[] = [
    { id: 'unlimited_actions', name: 'Unlimited Daily Actions', description: 'Get unlimited organic superpowers daily', isPremium: true, value: '$200/month' },
    { id: 'premium_recipes', name: 'Premium Recipe Arsenal', description: 'Access 200+ exclusive organic recipes', isPremium: true, value: '$150/month' },
    { id: 'certification_support', name: 'Certification Support', description: 'Step-by-step organic certification guidance', isPremium: true, value: '$300/month' },
    { id: 'export_markets', name: 'Export Market Access', description: 'Connect with international organic buyers', isPremium: true, value: '$500/month' },
    { id: 'ai_consultant', name: 'Personal AI Consultant', description: '24/7 organic farming AI expert', isPremium: true, value: '$400/month' }
  ];

  getTiers(): PremiumTier[] {
    return this.tiers;
  }

  getFeatures(): PremiumFeature[] {
    return this.features;
  }

  isPremiumUser(userId: string): boolean {
    // Simplified check - in real app, check subscription status
    return localStorage.getItem(`premium_${userId}`) === 'true';
  }

  upgradeToPremium(userId: string): void {
    localStorage.setItem(`premium_${userId}`, 'true');
  }

  getUpgradeMessage(feature: string): string {
    const messages = {
      'unlimited_actions': '🚀 Unlock unlimited organic superpowers! Upgrade to BioCert Pro for just $9.99/month and save $500+ monthly!',
      'premium_recipes': '🧪 Access 200+ premium organic recipes! Upgrade to BioCert Pro and become an organic master!',
      'certification_support': '📜 Get certified organic faster! BioCert Pro includes step-by-step certification guidance!',
      'export_markets': '🌍 Connect with international buyers! BioCert Pro opens doors to premium export markets!',
      'ai_consultant': '🤖 Get your personal AI farming consultant! Available 24/7 with BioCert Pro!'
    };
    return messages[feature] || '⭐ Upgrade to BioCert Pro for premium organic farming features!';
  }

  calculateROI(): { investment: number; returns: number; roi: number } {
    const investment = 9.99 * 12; // Annual cost
    const returns = 500 * 12; // Annual savings
    const roi = Math.round(((returns - investment) / investment) * 100);
    return { investment, returns, roi };
  }
}

export const premiumEngine = PremiumEngine.getInstance();
export type { PremiumTier, PremiumFeature };