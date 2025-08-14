/**
 * 🔥 VIRAL CARD - ULTRA SIMPLE SHAREABLE CONTENT
 * Instagram-ready cards with maximum viral potential
 */

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { ViralShareButton } from './ViralShareButton';
import { Trophy, DollarSign, Zap } from 'lucide-react';
import { UserStats } from '../../services/OrganicGamificationEngine';
import { viralEngine } from '../../services/ViralEngine';

interface ViralCardProps {
  stats: UserStats;
  type: 'achievement' | 'milestone' | 'recipe';
  recipeName?: string;
  milestone?: string;
}

export const ViralCard: React.FC<ViralCardProps> = ({ 
  stats, 
  type, 
  recipeName, 
  milestone 
}) => {
  const getMessage = () => {
    switch (type) {
      case 'achievement':
        return viralEngine.createAchievementMessage(stats);
      case 'recipe':
        return viralEngine.createRecipeMessage(recipeName || 'Organic Recipe', 25);
      case 'milestone':
        return viralEngine.createMilestoneMessage(milestone || 'New Level!', stats.totalSavings);
      default:
        return viralEngine.createAchievementMessage(stats);
    }
  };

  const getCardStyle = () => {
    switch (type) {
      case 'achievement':
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300';
      case 'recipe':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300';
      case 'milestone':
        return 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300';
      default:
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-300';
    }
  };

  return (
    <Card className={`w-full ${getCardStyle()} shadow-lg`}>
      <CardContent className="p-6 text-center">
        {/* Icon */}
        <div className="mb-4">
          {type === 'achievement' && <Trophy className="h-16 w-16 mx-auto text-yellow-600" />}
          {type === 'recipe' && <Zap className="h-16 w-16 mx-auto text-green-600" />}
          {type === 'milestone' && <DollarSign className="h-16 w-16 mx-auto text-purple-600" />}
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="text-4xl mb-2">{stats.level.icon}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {type === 'achievement' && `${stats.level.name}!`}
            {type === 'recipe' && recipeName}
            {type === 'milestone' && milestone}
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">${stats.totalSavings}</div>
              <div className="text-xs text-gray-600">Saved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.streakDays}</div>
              <div className="text-xs text-gray-600">Days</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.completedActions}</div>
              <div className="text-xs text-gray-600">Actions</div>
            </div>
          </div>
        </div>

        {/* Viral Share Buttons */}
        <div className="flex gap-2 justify-center">
          <ViralShareButton message={getMessage()} type="whatsapp" />
          <ViralShareButton message={getMessage()} type="social" />
          <ViralShareButton message={getMessage()} type="copy" />
        </div>

        {/* Branding */}
        <div className="mt-4 text-xs text-gray-500">
          🌿 CropGenius - Organic Farming Revolution
        </div>
      </CardContent>
    </Card>
  );
};