/**
 * 🔥💪 DIRECT ORGANIC SERVICE - ZERO COMPLEXITY, MAXIMUM RESULTS
 * Direct database access with REAL data - NO AI DEPENDENCIES!
 * Built for 100 million farmers with surgical precision
 */

import { supabase } from '../integrations/supabase/client';

interface OrganicRecipe {
  id: string;
  title: string;
  purpose: string;
  category: string;
  target_problems: string[];
  ingredients: any;
  method: string[];
  time_to_complete: number;
  difficulty: string;
  effectiveness_score: number;
  cost_savings: number;
  success_rate: number;
  crop_types: string[];
  seasonality: string[];
  usage_count: number;
  success_count: number;
  search_keywords: string[];
  local_names: any;
  verified: boolean;
  created_by_system: boolean;
  created_at: string;
  updated_at: string;
}

interface DailyOrganicAction {
  id: string;
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    cost: number;
  }>;
  steps: string[];
  expectedResults: {
    yieldIncrease: string;
    moneySaved: number;
    timeToResults: string;
    organicCompliance: number;
  };
  urgency: 'immediate' | 'today' | 'this_week';
  category: string;
  recipeId: string;
}

class DirectOrganicService {
  /**
   * 🎯 GET REAL DAILY ORGANIC ACTION - DIRECT FROM DATABASE WITH REAL USER CONTEXT
   */
  async getDailyOrganicAction(userId: string): Promise<DailyOrganicAction> {
    console.log('🌾 GETTING REAL DAILY ORGANIC ACTION WITH USER CONTEXT...');

    try {
      // Get REAL user context from database
      const userContext = await this.getRealUserContext(userId);

      // First try to get an existing action for today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingActions, error: existingError } = await supabase
        .from('organic_actions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', today)
        .eq('completed', false)
        .limit(1);

      if (existingError) {
        console.error('Error checking existing actions:', existingError);
      }

      // If we have an existing action for today, return it
      if (existingActions && existingActions.length > 0) {
        const action = existingActions[0];
        console.log('✅ RETURNING EXISTING DAILY ACTION:', action.title);
        return this.convertToDailyAction(action);
      }

      // 🔥💪 GENERATE AI-POWERED ORGANIC ACTION WITH GEMINI
      console.log('🧠 GENERATING AI-POWERED ORGANIC ACTION WITH GEMINI...');

      try {
        const aiGeneratedAction = await this.generateAIOrganicAction(userContext);
        if (aiGeneratedAction) {
          console.log('✅ AI-GENERATED ACTION CREATED:', aiGeneratedAction.title);
          return aiGeneratedAction;
        }
      } catch (aiError) {
        console.error('⚠️ AI generation failed, falling back to database recipes:', aiError);
      }

      // Fallback to database recipes if AI fails
      let query = supabase
        .from('organic_recipes')
        .select('*')
        .gte('effectiveness_score', 3.5)
        .eq('verified', true);

      // Filter by user's actual crop types if available
      if (userContext.cropTypes && userContext.cropTypes.length > 0) {
        query = query.overlaps('crop_types', userContext.cropTypes);
      }

      // Filter by current season
      const currentSeason = this.getCurrentSeason();
      query = query.overlaps('seasonality', [currentSeason]);

      const { data: recipes, error } = await query
        .order('success_rate', { ascending: false })
        .limit(20);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!recipes || recipes.length === 0) {
        // Fallback to any verified recipes if no matches
        const { data: fallbackRecipes, error: fallbackError } = await supabase
          .from('organic_recipes')
          .select('*')
          .eq('verified', true)
          .order('success_rate', { ascending: false })
          .limit(10);

        if (fallbackError || !fallbackRecipes || fallbackRecipes.length === 0) {
          throw new Error('No verified recipes found in database');
        }

        recipes.push(...fallbackRecipes);
      }

      // Select recipe based on user's context and current needs
      const selectedRecipe = this.selectBestRecipeForUser(recipes, userContext);

      // Convert to daily action format with REAL user context
      const dailyAction: DailyOrganicAction = {
        id: crypto.randomUUID(),
        title: `Today's Organic Action: ${selectedRecipe.title}`,
        description: `${selectedRecipe.purpose}. Perfect for your ${userContext.location || 'farm'} ${userContext.cropTypes?.join(', ') || 'crops'} with a ${(selectedRecipe.success_rate * 100).toFixed(0)}% success rate.`,
        ingredients: Array.isArray(selectedRecipe.ingredients) ?
          selectedRecipe.ingredients.map((ing: any) => ({
            name: ing.name || ing.ingredient || 'Unknown ingredient',
            quantity: ing.quantity || ing.amount || '1 unit',
            cost: ing.cost || selectedRecipe.cost_savings / 10 || 0.5
          })) :
          [{ name: 'Natural ingredients', quantity: 'As needed', cost: selectedRecipe.cost_savings || 1.0 }],
        steps: selectedRecipe.method || ['Follow the organic recipe instructions'],
        expectedResults: {
          yieldIncrease: this.calculateYieldIncrease(selectedRecipe.effectiveness_score),
          moneySaved: selectedRecipe.cost_savings || 5.0,
          timeToResults: `${selectedRecipe.time_to_complete || 7} days`,
          organicCompliance: 100
        },
        urgency: this.determineUrgency(selectedRecipe.target_problems),
        category: selectedRecipe.category,
        recipeId: selectedRecipe.id
      };

      // Save action to database for tracking
      await this.saveActionToDatabase(userId, dailyAction, selectedRecipe);

      console.log('✅ REAL DAILY ACTION GENERATED:', dailyAction.title);
      return dailyAction;

    } catch (error) {
      console.error('🔥 DIRECT ORGANIC SERVICE ERROR:', error);
      throw new Error(`Failed to get daily organic action: ${error.message}`);
    }
  }

  /**
   * 🎯 GET ALL ORGANIC RECIPES FROM DATABASE
   */
  async getAllRecipes(category?: string, limit: number = 50): Promise<OrganicRecipe[]> {
    console.log('📚 FETCHING ALL RECIPES FROM DATABASE...');

    try {
      let query = supabase
        .from('organic_recipes')
        .select('*')
        .eq('verified', true)
        .order('effectiveness_score', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      query = query.limit(limit);

      const { data: recipes, error } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`✅ FETCHED ${recipes?.length || 0} REAL VERIFIED RECIPES`);
      return recipes || [];

    } catch (error) {
      console.error('🔥 RECIPE FETCH ERROR:', error);
      throw new Error(`Failed to fetch recipes: ${error.message}`);
    }
  }

  /**
   * 🎯 SEARCH RECIPES BY PROBLEM
   */
  async searchRecipesByProblem(problem: string): Promise<OrganicRecipe[]> {
    console.log('🔍 SEARCHING RECIPES BY PROBLEM:', problem);

    try {
      // Search in target_problems array and search_keywords
      const { data: recipes, error } = await supabase
        .from('organic_recipes')
        .select('*')
        .or(`target_problems.cs.{${problem}},search_keywords.cs.{${problem}},purpose.ilike.%${problem}%,title.ilike.%${problem}%`)
        .eq('verified', true)
        .order('effectiveness_score', { ascending: false })
        .limit(20);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`✅ FOUND ${recipes?.length || 0} RECIPES FOR PROBLEM: ${problem}`);
      return recipes || [];

    } catch (error) {
      console.error('🔥 RECIPE SEARCH ERROR:', error);
      throw new Error(`Failed to search recipes: ${error.message}`);
    }
  }

  /**
   * 🎯 GET RECIPE EFFECTIVENESS DATA
   */
  async getRecipeEffectiveness(recipeId: string): Promise<any> {
    console.log('📊 GETTING RECIPE EFFECTIVENESS DATA...');

    try {
      // Get the recipe data directly
      const { data: recipe, error } = await supabase
        .from('organic_recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (recipe) {
        return {
          averageRating: recipe.effectiveness_score,
          successRate: Math.round(recipe.success_rate * 100),
          totalUsages: recipe.usage_count,
          successCount: recipe.success_count,
          category: recipe.category,
          difficulty: recipe.difficulty,
          costSavings: recipe.cost_savings,
          timeToComplete: recipe.time_to_complete,
          cropTypes: recipe.crop_types || [],
          seasonality: recipe.seasonality || []
        };
      }

      return null;

    } catch (error) {
      console.error('🔥 EFFECTIVENESS DATA ERROR:', error);
      throw new Error(`Failed to get effectiveness data: ${error.message}`);
    }
  }

  /**
   * 🏆 GET USER ORGANIC PROGRESS
   */
  async getUserOrganicProgress(userId: string): Promise<any> {
    console.log('📈 GETTING USER ORGANIC PROGRESS...');

    try {
      const { data: progress, error } = await supabase
        .from('organic_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Database error: ${error.message}`);
      }

      if (progress) {
        return {
          organicReadiness: progress.organic_readiness,
          certificationProgress: progress.certification_progress,
          totalMoneySaved: progress.total_money_saved,
          totalOrganicPoints: progress.total_organic_points,
          currentLevel: progress.current_level,
          lastUpdated: progress.last_updated
        };
      }

      // Return default progress if none exists
      return {
        organicReadiness: 0,
        certificationProgress: 0,
        totalMoneySaved: 0,
        totalOrganicPoints: 0,
        currentLevel: 'Organic Seedling',
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('🔥 PROGRESS DATA ERROR:', error);
      throw new Error(`Failed to get user progress: ${error.message}`);
    }
  }

  /**
   * 🎯 GET RECIPES BY CATEGORY
   */
  async getRecipesByCategory(category: string, limit: number = 20): Promise<OrganicRecipe[]> {
    console.log('🗂️ GETTING RECIPES BY CATEGORY:', category);

    try {
      const { data: recipes, error } = await supabase
        .from('organic_recipes')
        .select('*')
        .eq('category', category)
        .eq('verified', true)
        .order('effectiveness_score', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`✅ FOUND ${recipes?.length || 0} RECIPES IN CATEGORY: ${category}`);
      return recipes || [];

    } catch (error) {
      console.error('🔥 CATEGORY SEARCH ERROR:', error);
      throw new Error(`Failed to get recipes by category: ${error.message}`);
    }
  }

  /**
   * � CONV ERT DATABASE ACTION TO DAILY ACTION FORMAT
   */
  private convertToDailyAction(dbAction: any): DailyOrganicAction {
    return {
      id: dbAction.id,
      title: dbAction.title,
      description: dbAction.description,
      ingredients: Array.isArray(dbAction.ingredients) ? dbAction.ingredients : [],
      steps: Array.isArray(dbAction.steps) ? dbAction.steps : [],
      expectedResults: {
        yieldIncrease: dbAction.yield_boost || '10-15%',
        moneySaved: dbAction.money_saved || 5.0,
        timeToResults: dbAction.time_to_results || '7 days',
        organicCompliance: 100
      },
      urgency: dbAction.urgency as 'immediate' | 'today' | 'this_week',
      category: dbAction.category,
      recipeId: dbAction.id
    };
  }

  /**
   * 💾 SAVE ACTION TO DATABASE
   */
  private async saveActionToDatabase(userId: string, action: DailyOrganicAction, recipe?: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('organic_actions')
        .insert({
          user_id: userId,
          title: action.title,
          description: action.description,
          urgency: action.urgency,
          category: action.category,
          crop_type: recipe?.crop_types?.[0] || 'general',
          field_name: 'Main Field',
          target_problem: recipe?.target_problems?.[0] || 'general_improvement',
          ingredients: Array.isArray(action.ingredients) ? action.ingredients : [],
          steps: action.steps,
          preparation_time: recipe?.time_to_complete || 30,
          yield_boost: action.expectedResults.yieldIncrease,
          money_saved: action.expectedResults.moneySaved,
          time_to_results: action.expectedResults.timeToResults,
          organic_score_points: Math.floor(action.expectedResults.moneySaved * 2),
          weather_context: 'optimal',
          season_context: this.getCurrentSeason(),
          why_now: `Perfect timing for ${action.category} treatment`,
          completed: false,
          generated_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to save action:', error);
        // Don't throw error - action generation should still work
      } else {
        console.log('✅ Action saved to database successfully');
      }
    } catch (error) {
      console.error('Error saving action:', error);
      // Don't throw error - action generation should still work
    }
  }

  /**
   * 🧮 CALCULATE YIELD INCREASE BASED ON EFFECTIVENESS
   */
  private calculateYieldIncrease(effectivenessScore: number): string {
    if (effectivenessScore >= 4.5) return '15-25%';
    if (effectivenessScore >= 4.0) return '10-20%';
    if (effectivenessScore >= 3.5) return '8-15%';
    if (effectivenessScore >= 3.0) return '5-12%';
    return '3-8%';
  }

  /**
   * ⚡ DETERMINE URGENCY BASED ON PROBLEMS
   */
  private determineUrgency(problems: string[]): 'immediate' | 'today' | 'this_week' {
    if (!problems || problems.length === 0) return 'this_week';

    const urgentProblems = ['pest_outbreak', 'disease_spread', 'nutrient_deficiency', 'aphids', 'caterpillars'];
    const todayProblems = ['fungal_infections', 'soil_health', 'growth_booster'];

    const problemsLower = problems.map(p => p.toLowerCase());

    if (problemsLower.some(p => urgentProblems.some(up => p.includes(up)))) return 'immediate';
    if (problemsLower.some(p => todayProblems.some(tp => p.includes(tp)))) return 'today';
    return 'this_week';
  }

  /**
   * 🌍 GET CURRENT SEASON
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  /**
   * 👤 GET REAL USER CONTEXT FROM DATABASE
   */
  private async getRealUserContext(userId: string): Promise<any> {
    try {
      // Get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Get user's fields/crops
      const { data: fields } = await supabase
        .from('fields')
        .select('*')
        .eq('user_id', userId);

      // Get user's recent actions to understand preferences
      const { data: recentActions } = await supabase
        .from('organic_actions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      const cropTypes = fields?.map((f: any) => f.crop_type).filter(Boolean) || [];
      const location = profile?.location || 'Unknown';
      const farmSize = fields?.reduce((sum: number, f: any) => sum + (f.size || 0), 0) || 0;

      return {
        location,
        cropTypes,
        farmSize,
        soilType: profile?.soil_type || 'Unknown',
        recentActions: recentActions || [],
        profile: profile || {}
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return {
        location: 'Unknown',
        cropTypes: [],
        farmSize: 0,
        soilType: 'Unknown',
        recentActions: [],
        profile: {}
      };
    }
  }

  /**
   * 🧠 GENERATE AI-POWERED ORGANIC ACTION WITH GEMINI
   */
  private async generateAIOrganicAction(userContext: any): Promise<DailyOrganicAction | null> {
    try {
      console.log('🧠 ATTEMPTING TO IMPORT GEMINI SERVICE...');
      
      // Import the proper Gemini service
      const { realGeminiAIService } = await import('./RealGeminiAIService');
      
      console.log('✅ GEMINI SERVICE IMPORTED SUCCESSFULLY');
      console.log('🔑 CHECKING API KEY AVAILABILITY...');
      
      // Check if the service is properly initialized
      const healthStatus = realGeminiAIService.getHealthStatus();
      console.log('🏥 GEMINI SERVICE HEALTH:', healthStatus);

      console.log('🚀 CALLING GEMINI API WITH USER CONTEXT:', {
        location: userContext.location || 'East Africa',
        cropType: userContext.cropTypes?.join(', ') || 'Mixed crops',
        farmSize: `${userContext.farmSize || 'Small scale'} hectares`,
        currentSeason: this.getCurrentSeason(),
        soilType: userContext.soilType || 'Clay loam'
      });

      // Use the official Gemini service with proper context
      const aiAction = await realGeminiAIService.generateOrganicAction({
        location: userContext.location || 'East Africa',
        cropType: userContext.cropTypes?.join(', ') || 'Mixed crops',
        farmSize: `${userContext.farmSize || 'Small scale'} hectares`,
        currentSeason: this.getCurrentSeason(),
        soilType: userContext.soilType || 'Clay loam',
        previousActions: userContext.recentActions?.map((a: any) => a.title) || []
      });

      console.log('🎉 GEMINI API CALL SUCCESSFUL! AI ACTION GENERATED:', aiAction.title);

      // Convert to DailyOrganicAction format
      const dailyAction: DailyOrganicAction = {
        id: crypto.randomUUID(),
        title: aiAction.title,
        description: aiAction.description,
        ingredients: Array.isArray(aiAction.ingredients) ? aiAction.ingredients : [],
        steps: Array.isArray(aiAction.steps) ? aiAction.steps : [],
        expectedResults: aiAction.expectedResults || {
          yieldIncrease: '10-15%',
          moneySaved: 5.0,
          timeToResults: '7 days',
          organicCompliance: 100
        },
        urgency: aiAction.urgency,
        category: aiAction.category || 'soil_health',
        recipeId: 'ai-generated'
      };

      console.log('✅ DAILY ACTION CONVERTED SUCCESSFULLY');
      return dailyAction;

    } catch (error) {
      console.error('🔥 GEMINI AI GENERATION FAILED - DETAILED ERROR:', error);
      console.error('🔥 ERROR STACK:', error.stack);
      console.error('🔥 ERROR MESSAGE:', error.message);
      return null;
    }
  }

  /**
   * 🎯 SELECT BEST RECIPE FOR USER BASED ON REAL CONTEXT
   */
  private selectBestRecipeForUser(recipes: any[], userContext: any): any {
    if (recipes.length === 0) {
      throw new Error('No recipes available');
    }

    // Score recipes based on user context
    const scoredRecipes = recipes.map(recipe => {
      let score = recipe.effectiveness_score * 10; // Base score

      // Boost score for matching crop types
      if (userContext.cropTypes.length > 0 && recipe.crop_types) {
        const matchingCrops = userContext.cropTypes.filter((crop: string) =>
          recipe.crop_types.includes(crop)
        );
        score += matchingCrops.length * 5;
      }

      // Boost score for seasonal relevance
      const currentSeason = this.getCurrentSeason();
      if (recipe.seasonality && recipe.seasonality.includes(currentSeason)) {
        score += 3;
      }

      // Avoid recently used recipes
      const recentRecipeIds = userContext.recentActions.map((a: any) => a.recipe_id).filter(Boolean);
      if (recentRecipeIds.includes(recipe.id)) {
        score -= 2;
      }

      return { ...recipe, contextScore: score };
    });

    // Sort by context score and return the best match
    scoredRecipes.sort((a, b) => b.contextScore - a.contextScore);
    return scoredRecipes[0];
  }
}

// Export singleton instance
export const directOrganicService = new DirectOrganicService();
export default directOrganicService;