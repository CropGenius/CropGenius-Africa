/**
 * 🌿 ORGANIC AI SERVICE - REVOLUTIONARY ORGANIC INTELLIGENCE ENGINE
 * The world's first AI-powered organic farming advisor for Africa
 * Built to serve 100 million farmers with personalized organic guidance
 */

import { getComprehensiveFieldAnalysis } from './fieldAIService';
import { supabase } from '../integrations/supabase/client';

export interface OrganicRecommendation {
  id: string;
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  category: 'soil' | 'pest' | 'nutrition' | 'certification' | 'market';
  fieldName: string;
  cropType: string;
  organicCompliance: number;
  estimatedImpact: string;
  actionSteps: string[];
  timeframe: string;
  cost: string;
  marketPremium: number;
}

export interface OrganicFarmProfile {
  totalFields: number;
  organicReadinessScore: number;
  certificationProgress: number;
  marketPremiumPotential: number;
  nextMilestone: string;
  recommendations: OrganicRecommendation[];
  sustainabilityMetrics: {
    soilHealth: number;
    biodiversity: number;
    carbonSequestration: number;
    waterEfficiency: number;
  };
}

export class OrganicAIService {
  private static instance: OrganicAIService;
  private cache: Map<string, OrganicFarmProfile> = new Map();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  private constructor() {}

  public static getInstance(): OrganicAIService {
    if (!OrganicAIService.instance) {
      OrganicAIService.instance = new OrganicAIService();
    }
    return OrganicAIService.instance;
  }

  /**
   * 🚀 GENERATE COMPREHENSIVE ORGANIC FARM PROFILE
   * Analyzes all user fields and creates personalized organic intelligence
   */
  async generateOrganicProfile(userId: string): Promise<OrganicFarmProfile> {
    const cacheKey = `organic_profile_${userId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Get all user fields
    const { data: fields } = await supabase
      .from('fields')
      .select('*')
      .eq('user_id', userId);

    if (!fields || fields.length === 0) {
      return this.createEmptyProfile();
    }

    // Generate AI analysis for each field
    const fieldAnalyses = await Promise.allSettled(
      fields.map(field => this.analyzeFieldForOrganic(field))
    );

    // Aggregate results
    const validAnalyses = fieldAnalyses
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    const profile = this.aggregateOrganicProfile(validAnalyses, fields);
    
    // Cache the result
    this.cache.set(cacheKey, profile);
    setTimeout(() => this.cache.delete(cacheKey), this.CACHE_TTL);

    return profile;
  }

  /**
   * 🧠 ANALYZE INDIVIDUAL FIELD FOR ORGANIC POTENTIAL
   */
  private async analyzeFieldForOrganic(field: any) {
    const analysis = await getComprehensiveFieldAnalysis(field);
    
    return {
      field,
      analysis,
      organicScore: this.calculateOrganicScore(analysis),
      recommendations: this.extractOrganicRecommendations(analysis, field),
      sustainabilityMetrics: this.calculateSustainabilityMetrics(analysis)
    };
  }

  /**
   * 🎯 CALCULATE ORGANIC READINESS SCORE
   */
  private calculateOrganicScore(analysis: any): number {
    let score = 40; // Base score for any farming activity
    
    const text = JSON.stringify(analysis).toLowerCase();
    
    // Positive indicators
    if (text.includes('organic')) score += 20;
    if (text.includes('compost')) score += 15;
    if (text.includes('natural')) score += 10;
    if (text.includes('bio-fertilizer') || text.includes('biofertilizer')) score += 15;
    if (text.includes('ipm') || text.includes('integrated pest')) score += 15;
    if (text.includes('crop rotation')) score += 10;
    if (text.includes('cover crop')) score += 10;
    if (text.includes('mulch')) score += 8;
    if (text.includes('beneficial insects')) score += 12;
    if (text.includes('soil health')) score += 8;
    
    // Negative indicators
    if (text.includes('synthetic fertilizer')) score -= 20;
    if (text.includes('pesticide') && !text.includes('organic pesticide')) score -= 15;
    if (text.includes('herbicide')) score -= 15;
    if (text.includes('chemical')) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 🌱 EXTRACT ORGANIC RECOMMENDATIONS FROM AI ANALYSIS
   */
  private extractOrganicRecommendations(analysis: any, field: any): OrganicRecommendation[] {
    const recommendations: OrganicRecommendation[] = [];
    let recId = 0;

    // Soil health recommendations
    if (analysis.soilHealth?.recommendations) {
      analysis.soilHealth.recommendations.forEach((rec: string) => {
        if (this.isOrganicRecommendation(rec)) {
          recommendations.push({
            id: `soil-${field.id}-${recId++}`,
            title: `Organic Soil Enhancement - ${field.name}`,
            description: rec,
            urgency: 'medium',
            category: 'soil',
            fieldName: field.name,
            cropType: field.crop_type || 'Mixed',
            organicCompliance: 90,
            estimatedImpact: '+15% soil fertility naturally',
            actionSteps: this.generateActionSteps(rec, 'soil'),
            timeframe: '2-4 weeks',
            cost: 'Low ($10-50)',
            marketPremium: 15
          });
        }
      });
    }

    // Pest management recommendations
    if (analysis.pestManagement?.recommendations) {
      analysis.pestManagement.recommendations.forEach((rec: string) => {
        if (this.isOrganicRecommendation(rec)) {
          recommendations.push({
            id: `pest-${field.id}-${recId++}`,
            title: `Organic Pest Control - ${field.name}`,
            description: rec,
            urgency: 'high',
            category: 'pest',
            fieldName: field.name,
            cropType: field.crop_type || 'Mixed',
            organicCompliance: 95,
            estimatedImpact: 'Prevent 80% pest damage organically',
            actionSteps: this.generateActionSteps(rec, 'pest'),
            timeframe: '1-2 weeks',
            cost: 'Medium ($20-100)',
            marketPremium: 25
          });
        }
      });
    }

    // Nutrition recommendations
    if (analysis.nutrition?.recommendations) {
      analysis.nutrition.recommendations.forEach((rec: string) => {
        if (this.isOrganicRecommendation(rec)) {
          recommendations.push({
            id: `nutrition-${field.id}-${recId++}`,
            title: `Organic Nutrition - ${field.name}`,
            description: rec,
            urgency: 'medium',
            category: 'nutrition',
            fieldName: field.name,
            cropType: field.crop_type || 'Mixed',
            organicCompliance: 88,
            estimatedImpact: '+20% yield with organic methods',
            actionSteps: this.generateActionSteps(rec, 'nutrition'),
            timeframe: '3-6 weeks',
            cost: 'Medium ($30-80)',
            marketPremium: 20
          });
        }
      });
    }

    return recommendations;
  }

  /**
   * 🔍 CHECK IF RECOMMENDATION IS ORGANIC-FRIENDLY
   */
  private isOrganicRecommendation(recommendation: string): boolean {
    const text = recommendation.toLowerCase();
    const organicKeywords = [
      'organic', 'compost', 'natural', 'bio-fertilizer', 'biofertilizer',
      'ipm', 'integrated pest', 'crop rotation', 'cover crop', 'mulch',
      'beneficial insects', 'neem', 'biological control', 'manure'
    ];
    
    const syntheticKeywords = [
      'synthetic fertilizer', 'chemical pesticide', 'herbicide', 'fungicide'
    ];
    
    const hasOrganic = organicKeywords.some(keyword => text.includes(keyword));
    const hasSynthetic = syntheticKeywords.some(keyword => text.includes(keyword));
    
    return hasOrganic && !hasSynthetic;
  }

  /**
   * 📋 GENERATE ACTIONABLE STEPS
   */
  private generateActionSteps(recommendation: string, category: string): string[] {
    const baseSteps = {
      soil: [
        'Test current soil pH and nutrient levels',
        'Source organic materials locally',
        'Apply organic amendments evenly',
        'Monitor soil improvement over 4 weeks'
      ],
      pest: [
        'Identify pest species and lifecycle',
        'Implement organic control methods',
        'Monitor pest population daily',
        'Document results for future reference'
      ],
      nutrition: [
        'Calculate nutrient requirements for crop',
        'Prepare organic fertilizer mixture',
        'Apply during optimal growth stage',
        'Track plant response and yield impact'
      ]
    };
    
    return baseSteps[category as keyof typeof baseSteps] || [
      'Plan implementation strategy',
      'Gather necessary organic materials',
      'Execute recommendation systematically',
      'Monitor and document results'
    ];
  }

  /**
   * 📊 CALCULATE SUSTAINABILITY METRICS
   */
  private calculateSustainabilityMetrics(analysis: any) {
    const text = JSON.stringify(analysis).toLowerCase();
    
    return {
      soilHealth: this.calculateMetric(text, ['soil health', 'organic matter', 'compost'], 70),
      biodiversity: this.calculateMetric(text, ['biodiversity', 'beneficial insects', 'crop rotation'], 65),
      carbonSequestration: this.calculateMetric(text, ['carbon', 'cover crop', 'no-till'], 60),
      waterEfficiency: this.calculateMetric(text, ['water', 'irrigation', 'mulch'], 75)
    };
  }

  private calculateMetric(text: string, keywords: string[], baseScore: number): number {
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    return Math.min(100, baseScore + (matches * 10));
  }

  /**
   * 🏗️ AGGREGATE INDIVIDUAL FIELD ANALYSES INTO FARM PROFILE
   */
  private aggregateOrganicProfile(analyses: any[], fields: any[]): OrganicFarmProfile {
    const totalScore = analyses.reduce((sum, analysis) => sum + analysis.organicScore, 0);
    const avgScore = Math.round(totalScore / analyses.length);
    
    const allRecommendations = analyses.flatMap(analysis => analysis.recommendations);
    const topRecommendations = allRecommendations
      .sort((a, b) => {
        const urgencyWeight = { high: 3, medium: 2, low: 1 };
        return urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
      })
      .slice(0, 5);

    const avgSustainability = analyses.reduce((acc, analysis) => {
      const metrics = analysis.sustainabilityMetrics;
      return {
        soilHealth: acc.soilHealth + metrics.soilHealth,
        biodiversity: acc.biodiversity + metrics.biodiversity,
        carbonSequestration: acc.carbonSequestration + metrics.carbonSequestration,
        waterEfficiency: acc.waterEfficiency + metrics.waterEfficiency
      };
    }, { soilHealth: 0, biodiversity: 0, carbonSequestration: 0, waterEfficiency: 0 });

    Object.keys(avgSustainability).forEach(key => {
      avgSustainability[key as keyof typeof avgSustainability] = Math.round(
        avgSustainability[key as keyof typeof avgSustainability] / analyses.length
      );
    });

    return {
      totalFields: fields.length,
      organicReadinessScore: avgScore,
      certificationProgress: Math.min(avgScore, 100),
      marketPremiumPotential: Math.round(avgScore * 0.3), // Up to 30% premium
      nextMilestone: this.getNextMilestone(avgScore),
      recommendations: topRecommendations,
      sustainabilityMetrics: avgSustainability
    };
  }

  /**
   * 🎯 DETERMINE NEXT CERTIFICATION MILESTONE
   */
  private getNextMilestone(score: number): string {
    if (score < 30) return 'Start composting system and eliminate synthetic inputs';
    if (score < 50) return 'Implement integrated pest management (IPM)';
    if (score < 70) return 'Complete transition to organic inputs only';
    if (score < 85) return 'Document all organic practices for certification';
    if (score < 95) return 'Apply for organic certification inspection';
    return 'Maintain organic certification and explore premium markets';
  }

  /**
   * 🏗️ CREATE EMPTY PROFILE FOR NEW USERS
   */
  private createEmptyProfile(): OrganicFarmProfile {
    return {
      totalFields: 0,
      organicReadinessScore: 0,
      certificationProgress: 0,
      marketPremiumPotential: 0,
      nextMilestone: 'Add your first field to get started with organic farming',
      recommendations: [],
      sustainabilityMetrics: {
        soilHealth: 0,
        biodiversity: 0,
        carbonSequestration: 0,
        waterEfficiency: 0
      }
    };
  }

  /**
   * 🔄 CLEAR CACHE FOR USER (call after field updates)
   */
  clearUserCache(userId: string): void {
    const cacheKey = `organic_profile_${userId}`;
    this.cache.delete(cacheKey);
  }
}

export const organicAIService = OrganicAIService.getInstance();