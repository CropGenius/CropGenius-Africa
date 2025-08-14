/**
 * 🔥 HOMEBREW ARSENAL SERVICE - DIY ORGANIC RECIPE MATCHER
 * Matches farmers with perfect organic recipes based on crops and issues
 * Built to weaponize traditional knowledge for 100M farmers
 */

import { supabase } from '../integrations/supabase/client';

export interface HomebrewRecipe {
  id: string;
  name: string;
  category: 'pesticide' | 'fertilizer' | 'soil_amendment' | 'growth_enhancer';
  targetCrops: string[];
  targetIssues: string[];
  ingredients: Record<string, string>;
  instructions: string[];
  preparationTime: number; // minutes
  applicationMethod: string;
  frequency: string;
  shelfLife: number; // days
  effectivenessRating: number;
  costPerLiter: number;
  organicCompliance: number;
  safetyNotes: string[];
  scientificBasis: string;
  userRatings: any;
  verified: boolean;
}

export interface RecipeMatch {
  recipe: HomebrewRecipe;
  matchScore: number;
  relevanceReason: string;
  costSavings: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

export interface RecipeSearchCriteria {
  crop?: string;
  issues?: string[];
  category?: string;
  maxPreparationTime?: number;
  maxCost?: number;
  minEffectiveness?: number;
}

export class HomebrewArsenalService {
  private static instance: HomebrewArsenalService;
  private cache: Map<string, HomebrewRecipe[]> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  private constructor() {}

  public static getInstance(): HomebrewArsenalService {
    if (!HomebrewArsenalService.instance) {
      HomebrewArsenalService.instance = new HomebrewArsenalService();
    }
    return HomebrewArsenalService.instance;
  }

  /**
   * 🎯 FIND PERFECT RECIPES FOR CROP AND ISSUES
   * Matches recipes based on crop type and specific problems
   */
  async findMatchingRecipes(crop: string, issues: string[]): Promise<RecipeMatch[]> {
    const cacheKey = `recipes_${crop}_${issues.join('_')}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return this.scoreAndRankRecipes(cached, crop, issues);
    }

    try {
      // Get all verified recipes
      const { data: recipes, error } = await supabase
        .from('homebrew_recipes')
        .select('*')
        .eq('verified', true)
        .order('effectiveness_rating', { ascending: false });

      if (error) throw error;

      const homebrewRecipes: HomebrewRecipe[] = recipes.map(this.mapToHomebrewRecipe);
      
      // Cache results
      this.cache.set(cacheKey, homebrewRecipes);
      setTimeout(() => this.cache.delete(cacheKey), this.CACHE_TTL);

      return this.scoreAndRankRecipes(homebrewRecipes, crop, issues);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      return [];
    }
  }

  /**
   * 🔍 SEARCH RECIPES BY CRITERIA
   */
  async searchRecipes(criteria: RecipeSearchCriteria): Promise<HomebrewRecipe[]> {
    try {
      let query = supabase
        .from('homebrew_recipes')
        .select('*')
        .eq('verified', true);

      // Apply filters
      if (criteria.category) {
        query = query.eq('category', criteria.category);
      }

      if (criteria.maxPreparationTime) {
        query = query.lte('preparation_time', criteria.maxPreparationTime);
      }

      if (criteria.maxCost) {
        query = query.lte('cost_per_liter', criteria.maxCost);
      }

      if (criteria.minEffectiveness) {
        query = query.gte('effectiveness_rating', criteria.minEffectiveness);
      }

      // Apply crop filter if specified
      if (criteria.crop) {
        query = query.contains('target_crops', [criteria.crop]);
      }

      // Apply issues filter if specified
      if (criteria.issues && criteria.issues.length > 0) {
        query = query.overlaps('target_issues', criteria.issues);
      }

      const { data: recipes, error } = await query.order('effectiveness_rating', { ascending: false });

      if (error) throw error;

      return recipes.map(this.mapToHomebrewRecipe);
    } catch (error) {
      console.error('Failed to search recipes:', error);
      return [];
    }
  }

  /**
   * 📊 GET RECIPE BY ID
   */
  async getRecipeById(recipeId: string): Promise<HomebrewRecipe | null> {
    try {
      const { data: recipe, error } = await supabase
        .from('homebrew_recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error) throw error;

      return this.mapToHomebrewRecipe(recipe);
    } catch (error) {
      console.error('Failed to fetch recipe:', error);
      return null;
    }
  }

  /**
   * ⭐ RATE RECIPE
   */
  async rateRecipe(recipeId: string, userId: string, rating: {
    rating: number;
    effectiveness: number;
    easeOfUse: number;
    costEffectiveness: number;
    feedbackText?: string;
    wouldRecommend: boolean;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('recipe_user_feedback')
        .upsert({
          recipe_id: recipeId,
          user_id: userId,
          ...rating,
          feedback_text: rating.feedbackText
        });

      if (error) throw error;

      // Update recipe average ratings
      await this.updateRecipeAverageRating(recipeId);

      return true;
    } catch (error) {
      console.error('Failed to rate recipe:', error);
      return false;
    }
  }

  /**
   * 🏆 GET TOP RECIPES BY CATEGORY
   */
  async getTopRecipesByCategory(category: string, limit: number = 10): Promise<HomebrewRecipe[]> {
    try {
      const { data: recipes, error } = await supabase
        .from('homebrew_recipes')
        .select('*')
        .eq('category', category)
        .eq('verified', true)
        .order('effectiveness_rating', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return recipes.map(this.mapToHomebrewRecipe);
    } catch (error) {
      console.error('Failed to fetch top recipes:', error);
      return [];
    }
  }

  /**
   * 🎯 SCORE AND RANK RECIPES
   * Calculates match score based on crop relevance and issue targeting
   */
  private scoreAndRankRecipes(recipes: HomebrewRecipe[], crop: string, issues: string[]): RecipeMatch[] {
    const matches: RecipeMatch[] = recipes.map(recipe => {
      let matchScore = 0;
      let relevanceReasons: string[] = [];

      // Crop relevance (40% of score)
      const cropMatch = recipe.targetCrops.includes(crop) || recipe.targetCrops.includes('all crops');
      if (cropMatch) {
        matchScore += 40;
        relevanceReasons.push(`Perfect for ${crop}`);
      } else {
        // Partial match for crop family
        const cropFamily = this.getCropFamily(crop);
        const familyMatch = recipe.targetCrops.some(targetCrop => 
          this.getCropFamily(targetCrop) === cropFamily
        );
        if (familyMatch) {
          matchScore += 20;
          relevanceReasons.push(`Good for ${cropFamily} family`);
        }
      }

      // Issue relevance (40% of score)
      const issueMatches = issues.filter(issue => 
        recipe.targetIssues.some(targetIssue => 
          targetIssue.toLowerCase().includes(issue.toLowerCase()) ||
          issue.toLowerCase().includes(targetIssue.toLowerCase())
        )
      );
      
      if (issueMatches.length > 0) {
        matchScore += (issueMatches.length / issues.length) * 40;
        relevanceReasons.push(`Targets ${issueMatches.join(', ')}`);
      }

      // Effectiveness bonus (10% of score)
      matchScore += recipe.effectivenessRating * 2;

      // Organic compliance bonus (10% of score)
      matchScore += recipe.organicCompliance / 10;

      const costSavings = this.calculateCostSavings(recipe);
      const difficultyLevel = this.calculateDifficulty(recipe);

      return {
        recipe,
        matchScore,
        relevanceReason: relevanceReasons.join(' • '),
        costSavings,
        difficultyLevel
      };
    });

    // Sort by match score descending
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Return top 10 matches
  }

  /**
   * 🌾 GET CROP FAMILY
   */
  private getCropFamily(crop: string): string {
    const cropFamilies: Record<string, string> = {
      'tomato': 'nightshade',
      'pepper': 'nightshade',
      'eggplant': 'nightshade',
      'potato': 'nightshade',
      'cabbage': 'brassica',
      'kale': 'brassica',
      'broccoli': 'brassica',
      'cauliflower': 'brassica',
      'maize': 'grass',
      'sorghum': 'grass',
      'millet': 'grass',
      'rice': 'grass',
      'beans': 'legume',
      'peas': 'legume',
      'groundnuts': 'legume'
    };

    return cropFamilies[crop.toLowerCase()] || 'other';
  }

  /**
   * 💰 CALCULATE COST SAVINGS
   */
  private calculateCostSavings(recipe: HomebrewRecipe): number {
    // Estimate savings compared to commercial alternatives
    const commercialCosts: Record<string, number> = {
      'pesticide': 25,
      'fertilizer': 15,
      'soil_amendment': 20,
      'growth_enhancer': 30
    };

    const commercialCost = commercialCosts[recipe.category] || 20;
    return Math.round(commercialCost - recipe.costPerLiter);
  }

  /**
   * 🎯 CALCULATE DIFFICULTY LEVEL
   */
  private calculateDifficulty(recipe: HomebrewRecipe): 'easy' | 'medium' | 'hard' {
    let difficultyScore = 0;

    // Preparation time factor
    if (recipe.preparationTime > 1440) difficultyScore += 2; // > 24 hours
    else if (recipe.preparationTime > 60) difficultyScore += 1; // > 1 hour

    // Ingredient complexity
    const ingredientCount = Object.keys(recipe.ingredients).length;
    if (ingredientCount > 5) difficultyScore += 1;

    // Instruction complexity
    if (recipe.instructions.length > 6) difficultyScore += 1;

    // Safety considerations
    if (recipe.safetyNotes.length > 2) difficultyScore += 1;

    if (difficultyScore <= 1) return 'easy';
    if (difficultyScore <= 3) return 'medium';
    return 'hard';
  }

  /**
   * 📊 UPDATE RECIPE AVERAGE RATING
   */
  private async updateRecipeAverageRating(recipeId: string): Promise<void> {
    try {
      const { data: ratings, error } = await supabase
        .from('recipe_user_feedback')
        .select('rating, effectiveness, ease_of_use, cost_effectiveness')
        .eq('recipe_id', recipeId);

      if (error || !ratings || ratings.length === 0) return;

      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      const avgEffectiveness = ratings.reduce((sum, r) => sum + r.effectiveness, 0) / ratings.length;
      const avgEaseOfUse = ratings.reduce((sum, r) => sum + r.ease_of_use, 0) / ratings.length;
      const avgCostEffectiveness = ratings.reduce((sum, r) => sum + r.cost_effectiveness, 0) / ratings.length;

      const userRatings = {
        average_rating: Math.round(avgRating * 10) / 10,
        total_reviews: ratings.length,
        effectiveness: Math.round(avgEffectiveness * 10) / 10,
        ease_of_use: Math.round(avgEaseOfUse * 10) / 10,
        cost_effectiveness: Math.round(avgCostEffectiveness * 10) / 10
      };

      await supabase
        .from('homebrew_recipes')
        .update({ 
          user_ratings: userRatings,
          effectiveness_rating: avgEffectiveness
        })
        .eq('id', recipeId);

    } catch (error) {
      console.error('Failed to update recipe rating:', error);
    }
  }

  /**
   * 🗺️ MAP DATABASE RECORD TO HOMEBREW RECIPE
   */
  private mapToHomebrewRecipe(record: any): HomebrewRecipe {
    return {
      id: record.id,
      name: record.name,
      category: record.category,
      targetCrops: record.target_crops || [],
      targetIssues: record.target_issues || [],
      ingredients: record.ingredients || {},
      instructions: record.instructions || [],
      preparationTime: record.preparation_time || 0,
      applicationMethod: record.application_method || '',
      frequency: record.frequency || '',
      shelfLife: record.shelf_life || 0,
      effectivenessRating: record.effectiveness_rating || 0,
      costPerLiter: record.cost_per_liter || 0,
      organicCompliance: record.organic_compliance || 100,
      safetyNotes: record.safety_notes || [],
      scientificBasis: record.scientific_basis || '',
      userRatings: record.user_ratings || {},
      verified: record.verified || false
    };
  }

  /**
   * 🔄 CLEAR CACHE
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const homebrewArsenalService = HomebrewArsenalService.getInstance();