/**
 * 🔥 ACHIEVEMENT BADGE - ULTRA SIMPLE DOPAMINE HIT
 * Minimal code for maximum addiction
 */

import React from 'react';
import { Achievement } from '../../services/OrganicGamificationEngine';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  size = 'md' 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm', 
    lg: 'w-16 h-16 text-base'
  };

  return (
    <div 
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
        achievement.earned 
          ? 'bg-yellow-100 text-yellow-800 shadow-lg animate-pulse' 
          : 'bg-gray-100 text-gray-400'
      }`}
      title={achievement.description}
    >
      <span className="text-lg">{achievement.icon}</span>
    </div>
  );
};