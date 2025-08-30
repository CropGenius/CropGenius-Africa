/**
 * 🔥💪 DAILY ORGANIC ACTION CARD - THE MONEY-MAKING ENGINE
 * The core UI component that displays AI-generated organic actions
 * PRODUCTION-READY | MOBILE-FIRST | WIRED TO BACKEND
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Zap, 
  Clock, 
  DollarSign, 
  Target, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Beaker,
  TrendingUp,
  Coins,
  ArrowRight,
  Star,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useSimpleAuthContext as useAuth } from '@/providers/SimpleAuthProvider';
import { directOrganicService } from '../../services/DirectOrganicService';
import { Database } from '../../integrations/supabase/types';

type OrganicAction = Database['public']['Tables']['organic_actions']['Row'];

interface DailyOrganicActionCardProps {
  onActionComplete?: (action: OrganicAction) => void;
  className?: string;
}

export const DailyOrganicActionCard: React.FC<DailyOrganicActionCardProps> = ({
  onActionComplete,
  className = ''
}) => {
  const { user } = useAuth();
  const [action, setAction] = useState<OrganicAction | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      loadDailyAction();
    }
  }, [user]);

  const loadDailyAction = async () => {
    if (!user) return;
    
    try {
      const dailyAction = await directOrganicService.getDailyOrganicAction(user.id);
      // Convert to database format
      const dbAction = {
        id: dailyAction.id,
        title: dailyAction.title,
        description: dailyAction.description,
        urgency: dailyAction.urgency,
        crop_type: 'Mixed Crops',
        field_name: 'Your Farm',
        time_to_results: dailyAction.expectedResults.timeToResults,
        why_now: dailyAction.description,
        money_saved: 0,
        yield_boost: dailyAction.expectedResults.yieldIncrease || 'Natural improvement',
        ingredients: dailyAction.ingredients.reduce((acc, ing) => {
          acc[ing.name] = ing.quantity;
          return acc;
        }, {} as Record<string, string>),
        steps: dailyAction.steps,
        completed: false,
        organic_score_points: 50
      };
      setAction(dbAction as any);
    } catch (error) {
      console.error('Failed to load daily action:', error);
    }
  };

  const handleCompleteAction = async () => {
    if (!action || !user) return;

    try {
      // Mark action as completed
      const updatedAction = { ...action, completed: true, completed_date: new Date().toISOString() };
      setAction(updatedAction);
      
      if (onActionComplete) {
        onActionComplete(updatedAction);
      }
      
    } catch (error) {
      console.error('Failed to complete action:', error);
    }
  };

  const handleGenerateNew = async () => {
    if (!user) return;

    try {
      const dailyAction = await directOrganicService.getDailyOrganicAction(user.id);
      // Convert to database format
      const dbAction = {
        id: dailyAction.id,
        title: dailyAction.title,
        description: dailyAction.description,
        urgency: dailyAction.urgency,
        crop_type: 'Mixed Crops',
        field_name: 'Your Farm',
        time_to_results: dailyAction.expectedResults.timeToResults,
        why_now: dailyAction.description,
        money_saved: 0,
        yield_boost: dailyAction.expectedResults.yieldIncrease || 'Natural improvement',
        ingredients: dailyAction.ingredients.reduce((acc, ing) => {
          acc[ing.name] = ing.quantity;
          return acc;
        }, {} as Record<string, string>),
        steps: dailyAction.steps,
        completed: false,
        organic_score_points: 50
      };
      setAction(dbAction as any);
    } catch (error) {
      console.error('Failed to generate new action:', error);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-red-400 bg-red-50';
      case 'medium': return 'border-yellow-400 bg-yellow-50';
      case 'low': return 'border-green-400 bg-green-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <Target className="h-4 w-4 text-green-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };



  if (!action) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="text-center py-8">
          <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 mb-4">No daily action available</p>
          <Button 
            onClick={handleGenerateNew}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            Generate Action
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${getUrgencyColor(action.urgency)} ${action.completed ? 'opacity-75' : ''} border-l-4 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getUrgencyIcon(action.urgency)}
              <CardTitle className="text-lg font-bold text-gray-900">
                {action.title}
              </CardTitle>
              {action.completed && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
            
            <p className="text-gray-700 mb-3">{action.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span>🌾 {action.crop_type}</span>
              <span>📍 {action.field_name}</span>
              <span>⏰ {action.time_to_results}</span>
            </div>
            
            <div className="bg-yellow-100 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-bold text-yellow-800">Why Act Now:</span>
              </div>
              <p className="text-yellow-700 text-sm">{action.why_now}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Action Details (Expandable) */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="w-full justify-between p-2 h-auto"
          >
            <span className="font-medium">
              {expanded ? 'Hide Details' : 'Show Recipe & Steps'}
            </span>
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {expanded && (
            <div className="mt-4 space-y-4">
              {/* Ingredients */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Beaker className="h-4 w-4" />
                  What You Need:
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(action.ingredients as Record<string, string> || {}).map(([ingredient, amount]) => (
                    <div key={ingredient} className="text-sm bg-white p-2 rounded border">
                      <span className="font-medium">{amount}</span> {ingredient.replace(/_/g, ' ')}
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  How To Make It:
                </h4>
                <ol className="space-y-2">
                  {(action.steps || []).map((step, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Impact */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Expected Results:
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700 font-medium">Yield Boost:</span>
                    <div className="text-green-800 font-bold">{action.yield_boost}</div>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Time to See Results:</span>
                    <div className="text-green-800 font-bold">{action.time_to_results}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!action.completed ? (
            <>
              <Button
                onClick={handleCompleteAction}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Done
              </Button>
              
              <Button
                onClick={handleGenerateNew}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Action
              </Button>
            </>
          ) : (
            <div className="flex-1 text-center py-2">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-bold">Action Completed!</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Great job! You earned {action.organic_score_points} organic points
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};