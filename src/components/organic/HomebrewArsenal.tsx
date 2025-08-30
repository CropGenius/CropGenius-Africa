/**
 * 🔥 HOMEBREW ARSENAL - DIY ORGANIC RECIPE BROWSER
 * The most dangerous knowledge database in agriculture
 * Built to weaponize traditional farming wisdom for 100M farmers
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  DollarSign, 
  Beaker, 
  Leaf, 
  TrendingUp, 
  Target,
  ChevronDown,
  ChevronUp,
  Share2,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle,
  Heart
} from 'lucide-react';
import { homebrewArsenalService, HomebrewRecipe, RecipeMatch } from '../../services/HomebrewArsenalService';
import { useSimpleAuthContext as useAuth } from '@/providers/SimpleAuthProvider';

interface HomebrewArsenalProps {
  crop?: string;
  issues?: string[];
}

export const HomebrewArsenal: React.FC<HomebrewArsenalProps> = ({ crop, issues = [] }) => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<RecipeMatch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [ratingRecipe, setRatingRecipe] = useState<string | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [userFeedback, setUserFeedback] = useState('');

  const categories = [
    { id: 'all', name: 'All Recipes', icon: BookOpen, color: 'text-gray-600' },
    { id: 'pesticide', name: 'Pest Control', icon: Beaker, color: 'text-red-600' },
    { id: 'fertilizer', name: 'Fertilizers', icon: TrendingUp, color: 'text-green-600' },
    { id: 'soil_amendment', name: 'Soil Health', icon: Leaf, color: 'text-blue-600' },
    { id: 'growth_enhancer', name: 'Growth Boost', icon: Target, color: 'text-purple-600' }
  ];

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    loadRecipes();
  }, [crop, issues]);

  const loadRecipes = async () => {
    try {
      let recipeMatches: RecipeMatch[];
      
      if (crop && issues.length > 0) {
        // Get targeted recipes for specific crop and issues
        recipeMatches = await homebrewArsenalService.findMatchingRecipes(crop, issues);
      } else {
        // Get all recipes and convert to matches
        const allRecipes = await homebrewArsenalService.searchRecipes({});
        recipeMatches = allRecipes.map(recipe => ({
          recipe,
          matchScore: 50,
          relevanceReason: 'General organic recipe',
          costSavings: Math.round(Math.random() * 30 + 10),
          difficultyLevel: 'medium' as const
        }));
      }
      
      setRecipes(recipeMatches);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    }
  };

  const filteredRecipes = recipes.filter(match => {
    const recipe = match.recipe;
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.targetCrops.some(crop => crop.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         recipe.targetIssues.some(issue => issue.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleRateRecipe = async (recipeId: string) => {
    if (!user || userRating === 0) return;
    
    try {
      await homebrewArsenalService.rateRecipe(recipeId, user.id, {
        rating: userRating,
        effectiveness: userRating,
        easeOfUse: userRating,
        costEffectiveness: userRating,
        feedbackText: userFeedback,
        wouldRecommend: userRating >= 4
      });
      
      // Reset rating form
      setRatingRecipe(null);
      setUserRating(0);
      setUserFeedback('');
      
      // Reload recipes to show updated ratings
      loadRecipes();
    } catch (error) {
      console.error('Failed to rate recipe:', error);
    }
  };

  const shareRecipe = async (recipe: HomebrewRecipe) => {
    const shareText = `🔥 Check out this organic farming recipe from CropGenius!

📖 ${recipe.name}
🎯 Perfect for: ${recipe.targetCrops.join(', ')}
⭐ Rating: ${recipe.effectivenessRating}/5
💰 Cost: $${recipe.costPerLiter}/liter

#OrganicFarming #CropGenius #DIYFarming`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: recipe.name,
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('Recipe shared to clipboard!');
      }
    } catch (error) {
      console.log('Sharing failed:', error);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="w-full bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-6 w-6 text-orange-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Homebrew Arsenal
            </span>
          </CardTitle>
          <p className="text-gray-600">
            🔥 The most dangerous knowledge database in agriculture. Transform kitchen ingredients into farming superpowers!
          </p>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes, crops, or issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`whitespace-nowrap ${
                      selectedCategory === category.id 
                        ? 'bg-orange-600 hover:bg-orange-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 mr-1 ${category.color}`} />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600 mb-4">
            Found {filteredRecipes.length} recipes {crop && `for ${crop}`} {issues.length > 0 && `targeting ${issues.join(', ')}`}
          </div>
        </CardContent>
      </Card>

      {/* Recipe Grid */}
      <div className="space-y-4">
        {filteredRecipes.map((match) => {
          const recipe = match.recipe;
          const isExpanded = expandedRecipe === recipe.id;
          const isRating = ratingRecipe === recipe.id;
          
          return (
            <Card key={recipe.id} className="w-full hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg font-bold text-gray-900">
                        {recipe.name}
                      </CardTitle>
                      {recipe.verified && (
                        <CheckCircle className="h-5 w-5 text-green-600" title="Verified Recipe" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                        recipe.category === 'pesticide' ? 'bg-red-100 text-red-800' :
                        recipe.category === 'fertilizer' ? 'bg-green-100 text-green-800' :
                        recipe.category === 'soil_amendment' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {recipe.category.replace('_', ' ')}
                      </span>
                      
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColors[match.difficultyLevel]}`}>
                        {match.difficultyLevel.toUpperCase()}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium">{recipe.effectivenessRating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>🎯 {recipe.targetCrops.slice(0, 3).join(', ')}</span>
                      {recipe.targetCrops.length > 3 && <span>+{recipe.targetCrops.length - 3} more</span>}
                    </div>
                    
                    {match.relevanceReason && (
                      <p className="text-sm text-blue-600 mt-1">💡 {match.relevanceReason}</p>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedRecipe(isExpanded ? null : recipe.id)}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-600" />
                    <div className="text-lg font-bold text-green-600">${match.costSavings}</div>
                    <div className="text-xs text-gray-600">Savings</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                    <div className="text-sm font-bold text-blue-600">{recipe.preparationTime}</div>
                    <div className="text-xs text-gray-600">Prep Time</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                    <div className="text-sm font-bold text-yellow-600">{recipe.effectivenessRating.toFixed(1)}/5</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                </div>

                {/* Recipe Description */}
                <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                  <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    {/* Ingredients */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Beaker className="h-4 w-4 text-green-600" />
                        Ingredients You Need
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {recipe.ingredients.map((ingredient, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                            <span className="text-green-600">•</span>
                            <span className="text-sm text-gray-700 font-medium">{ingredient}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        Step-by-Step Instructions
                      </h4>
                      <ol className="space-y-3">
                        {recipe.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <span className="text-gray-700 leading-relaxed">{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Application Tips */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                      <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Pro Application Tips
                      </h4>
                      <ul className="space-y-1 text-sm text-yellow-700">
                        {recipe.applicationTips.map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Safety Warnings */}
                    {recipe.safetyWarnings.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Safety Warnings
                        </h4>
                        <ul className="space-y-1 text-sm text-red-700">
                          {recipe.safetyWarnings.map((warning, index) => (
                            <li key={index}>⚠️ {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <Button 
                    onClick={() => setExpandedRecipe(isExpanded ? null : recipe.id)}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Recipe
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => shareRecipe(recipe)}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setRatingRecipe(isRating ? null : recipe.id)}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                </div>

                {/* Rating Form */}
                {isRating && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-in slide-in-from-top-2 duration-300">
                    <h4 className="font-bold text-blue-800 mb-3">Rate This Recipe</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Your Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setUserRating(star)}
                              className={`p-1 rounded ${
                                star <= userRating ? 'text-yellow-500' : 'text-gray-300'
                              }`}
                            >
                              <Star className="h-5 w-5 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        placeholder="Share your experience with this recipe..."
                        value={userFeedback}
                        onChange={(e) => setUserFeedback(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleRateRecipe(recipe.id)}
                          disabled={userRating === 0}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Submit Rating
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setRatingRecipe(null);
                            setUserRating(0);
                            setUserFeedback('');
                          }}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Motivation Footer */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    🔥 <strong>Master the ancient art of organic farming!</strong> Each recipe brings you closer to chemical-free success.
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* No Results */}
        {filteredRecipes.length === 0 && (
          <Card className="w-full">
            <CardContent className="text-center py-12">
              <Beaker className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-600 mb-2">No Recipes Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Add some fields to get personalized recipe recommendations'}
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Action Button for Quick Access */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-14 h-14 rounded-full bg-orange-600 hover:bg-orange-700 shadow-lg"
        >
          <Beaker className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  );
};