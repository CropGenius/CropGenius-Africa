/**
 * 🔥 LEVEL DISPLAY - ULTRA SIMPLE LEVEL PROGRESSION
 * Minimal code for maximum farmer ego boost
 */

import React from 'react';
import { OrganicLevel } from '../../services/OrganicGamificationEngine';

interface LevelDisplayProps {
  level: OrganicLevel;
  progress: number; // 0-100
}

export const LevelDisplay: React.FC<LevelDisplayProps> = ({ level, progress }) => {
  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
      <div className="text-3xl">{level.icon}</div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-800">{level.name}</h3>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">Level {level.level}</p>
      </div>
    </div>
  );
};