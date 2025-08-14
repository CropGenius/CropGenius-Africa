/**
 * 🔥 DAILY SUPERPOWER CARD - ADDICTION-LEVEL ENGAGEMENT COMPONENT
 * Individual organic farming superpower with gamified completion tracking
 * Built to make farmers feel like agricultural gods
 */

import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import {
  Award, Calendar, Clock, DollarSign, Leaf, MapPin, TrendingUp,
  Zap, CheckCircle, Star, Share2, BookOpen, Timer
} from 'lucide-react';
import { OrganicSuperpower } from '../../services/OrganicIntelligenceEngine';

interface DailySuperpowerCardProps {
  superpower: OrganicSuperpower;
  isCompleted: boolean;
  onComplete: (actionId: string) => void;
  onSchedule?: (actionId: string) => void;
  onShare?: (superpower: OrganicSuperpower) => void;
}

export const DailySuperpowerCard: React.FC<DailySuperpowerCardProps> = ({
  superpower,
  isCompleted,
  onComplete,
  onSchedule,
  onShare
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleComplete = () => {
    setShowCelebration(true);
    onComplete(superpower.id);

    // Hide celebration after 2 seconds
    setTimeout(() => setShowCelebration(false), 2000);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-red-400 bg-red-50';
      case 'medium': return 'border-yellow-400 bg-yellow-50';
      case 'low': return 'border-blue-400 bg-blue-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pest_control': return '🐛';
      case 'soil_health': return '🌱';
      case 'nutrition': return '🍃';
      case 'water_management': return '💧';
      default: return '🌿';
    }
  };

  return (
    <Card className={`relative transition-all duration-300 hover:shadow-xl border-l-4 ${isCompleted
        ? 'bg-green-50 border-green-400 opacity-90'
        : getUrgencyColor(superpower.urgency)
      } ${showCelebration ? 'animate-pulse' : ''}`}>

      {/* Completion Badge */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg z-10">
          <CheckCircle className="h-5 w-5" />
        </div>
      )}

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center z-20">
          <div className="text-center">
            <Star className="h-12 w-12 text-yellow-500 mx-auto mb-2 animate-spin" />
            <p className="text-green-800 font-bold">Superpower Activated! 🎉</p>
          </div>
        </div>
      )}

      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">{getCategoryIcon(superpower.category)}</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  {superpower.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyBadge(superpower.urgency)}`}>
                    {superpower.urgency.toUpperCase()} PRIORITY
                  </span>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>{superpower.fieldName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">{superpower.description}</p>
        </div>

        {/* Impact Metrics - Always Visible */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className="font-bold text-green-600 text-lg">${superpower.costSavings}</div>
            <div className="text-xs text-gray-600">You Save</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <Timer className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="font-bold text-blue-600 text-sm">{superpower.impactMetrics.timeToResults}</div>
            <div className="text-xs text-gray-600">Results</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <TrendingUp className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <div className="font-bold text-purple-600 text-sm">{superpower.impactMetrics.effectiveness}</div>
            <div className="text-xs text-gray-600">Effectiveness</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <Leaf className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className="font-bold text-green-600 text-lg">{superpower.impactMetrics.organicCompliance}%</div>
            <div className="text-xs text-gray-600">Organic</div>
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            {/* Ingredients */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                🧪 <span>Kitchen Ingredients</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {superpower.ingredients.map((ingredient, index) => (
                  <div key={index} className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-center hover:bg-gray-50 transition-colors">
                    {ingredient}
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                📋 <span>Step-by-Step Instructions</span>
              </h4>
              <div className="space-y-2">
                {superpower.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Category:</span>
                  <span className="bg-white px-2 py-1 rounded border text-gray-800">
                    {superpower.category.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Crop:</span>
                  <span className="bg-white px-2 py-1 rounded border text-gray-800">
                    {superpower.cropType}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Ready to activate</span>
            </div>
          </div>

          <div className="flex gap-2">
            {onShare && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShare(superpower)}
                className="text-gray-600 hover:text-gray-800"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            )}

            {onSchedule && !isCompleted && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSchedule(superpower.id)}
                className="text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Schedule
              </Button>
            )}

            {!isCompleted && (
              <Button
                size="sm"
                onClick={handleComplete}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Zap className="h-4 w-4 mr-1" />
                Activate Superpower!
              </Button>
            )}

            {isCompleted && (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <CheckCircle className="h-4 w-4" />
                <span>Superpower Activated!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};