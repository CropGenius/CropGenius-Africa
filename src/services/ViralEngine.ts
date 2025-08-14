/**
 * 🔥 VIRAL ENGINE - ULTRA SIMPLE VIRAL DISTRIBUTION
 * Maximum viral spread with minimal code
 */

import { UserStats } from './OrganicGamificationEngine';

interface ReferralStats {
  count: number;
  credits: number;
  conversionRate: number;
}

type MessageVariant = 'emotional' | 'savings' | 'social_proof' | 'urgency' | 'achievement';

class ViralEngine {
  private static instance: ViralEngine;
  
  static getInstance(): ViralEngine {
    if (!this.instance) this.instance = new ViralEngine();
    return this.instance;
  }

  // WhatsApp sharing - instant viral spread
  shareToWhatsApp(message: string): void {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  // Generate viral achievement message
  createAchievementMessage(stats: UserStats): string {
    return `🌿 I just became a ${stats.level.name} ${stats.level.icon} on CropGenius!

💰 Total Saved: $${stats.totalSavings}
🔥 Streak: ${stats.streakDays} days
🏆 Actions Completed: ${stats.completedActions}
⭐ Achievements: ${stats.achievements.filter(a => a.earned).length}/${stats.achievements.length}

Join me in organic farming revolution! 
Download CropGenius: cropgenius.app

#OrganicFarming #CropGenius #SustainableAgriculture`;
  }

  // Generate viral recipe message
  createRecipeMessage(recipeName: string, savings: number): string {
    return `🔥 Just tried "${recipeName}" from CropGenius!

💰 Saved: $${savings}
🌿 100% Organic ingredients
⚡ Works like magic!

Get the full recipe: cropgenius.app

#OrganicFarming #DIYFarming #CropGenius`;
  }

  // Generate viral milestone message
  createMilestoneMessage(milestone: string, totalSavings: number): string {
    return `🎉 MILESTONE ACHIEVED! ${milestone}

💰 Total Saved: $${totalSavings}
🌱 Going 100% Organic with CropGenius

Join the organic revolution: cropgenius.app

#OrganicFarming #CropGenius`;
  }

  // Social media sharing
  shareToSocial(platform: 'twitter' | 'facebook' | 'instagram', message: string): void {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://cropgenius.app')}&quote=${encodeURIComponent(message)}`,
      instagram: '' // Instagram doesn't support direct sharing via URL
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  }

  // Generate referral-specific viral messages
  createReferralMessage(referralCode: string, referralLink: string, variant: MessageVariant = 'emotional'): string {
    const variants = {
      emotional: `🌱 I'm transforming my farm with CropGenius AI and you can too!

🎉 Use my referral code: ${referralCode}
🎁 Get 10 FREE credits when you sign up
💪 Join me in the organic farming revolution!

${referralLink}

#OrganicFarming #CropGenius #SmartFarming #AI`,

      savings: `💰 I've saved over $500 this season with CropGenius!

🔥 Want to save money on your farm too?
🎁 Use code ${referralCode} for 10 FREE credits
📈 AI-powered recommendations that actually work

${referralLink}

#SaveMoney #OrganicFarming #CropGenius`,

      social_proof: `🏆 Join 50,000+ smart farmers already using CropGenius!

✨ I'm one of them and loving the results
🎁 Get 10 FREE credits with code: ${referralCode}
🚀 Don't get left behind in the farming revolution

${referralLink}

#SmartFarming #CropGenius #FarmingCommunity`,

      urgency: `⚡ LIMITED TIME: Get 10 FREE credits on CropGenius!

🔥 Use my exclusive code: ${referralCode}
⏰ Don't miss out on AI farming insights
💎 Join before everyone else discovers this

${referralLink}

#LimitedOffer #CropGenius #AIFarming`,

      achievement: `🏆 Just hit a new farming milestone with CropGenius!

🌟 My secret? AI-powered crop recommendations
🎁 Want to achieve the same? Use code: ${referralCode}
💪 Let's dominate farming together!

${referralLink}

#FarmingSuccess #CropGenius #Achievement`
    };

    return variants[variant];
  }

  // Generate referral success message
  createReferralSuccessMessage(referralStats: ReferralStats, referralCode: string): string {
    return `🔥 I'm now a REFERRAL MASTER on CropGenius!

👥 ${referralStats.count} farmers joined through me
💰 Earned ${referralStats.credits} credits from referrals
📈 ${referralStats.conversionRate}% success rate

Want to join my farming network?
🎁 Use code: ${referralCode} for 10 FREE credits

Join the elite farmers: cropgenius.app

#ReferralMaster #CropGenius #FarmingNetwork #Elite`;
  }

  // A/B testing for message variants
  getOptimalMessageVariant(): MessageVariant {
    // Simple A/B testing - in production, this would be based on performance data
    const variants: MessageVariant[] = ['emotional', 'savings', 'social_proof', 'urgency', 'achievement'];
    const weights = [0.3, 0.25, 0.2, 0.15, 0.1]; // Emotional performs best
    
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < variants.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        return variants[i];
      }
    }
    
    return 'emotional'; // fallback
  }

  // Track viral message performance
  async trackMessagePerformance(variant: MessageVariant, platform: string, userId: string): Promise<void> {
    try {
      // In production, this would send to analytics
      console.log(`Viral message shared: ${variant} on ${platform} by ${userId}`);
      
      // Could integrate with Supabase analytics table
      // await supabase.from('viral_shares').insert({
      //   user_id: userId,
      //   message_variant: variant,
      //   platform,
      //   timestamp: new Date()
      // });
    } catch (error) {
      console.error('Failed to track message performance:', error);
    }
  }

  // Copy to clipboard fallback
  async copyToClipboard(message: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(message);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}

export const viralEngine = ViralEngine.getInstance();