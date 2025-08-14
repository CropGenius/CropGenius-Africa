/**
 * 🔥 SOCIAL SHARE CARD - ULTRA SIMPLE VIRAL SHARING
 * One-tap sharing for maximum viral spread
 */

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { UserStats } from '../../services/OrganicGamificationEngine';
import { ViralShareButton } from './ViralShareButton';
import { viralEngine } from '../../services/ViralEngine';

interface SocialShareCardProps {
  stats: UserStats;
}

export const SocialShareCard: React.FC<SocialShareCardProps> = ({ stats }) => {
  const shareAchievement = async () => {
    const text = `🌿 I'm now a ${stats.level.name} ${stats.level.icon} on CropGenius!

💰 Saved: $${stats.totalSavings}
🔥 Streak: ${stats.streakDays} days  
🏆 Actions: ${stats.completedActions}

Join me in organic farming! #OrganicFarming #CropGenius`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'My Organic Journey', text });
      } else {
        await navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
      }
    } catch (error) {
      console.log('Share failed:', error);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">{stats.level.icon}</div>
          <div>
            <h3 className="font-bold text-gray-800">{stats.level.name}</h3>
            <p className="text-sm text-gray-600">${stats.totalSavings} saved • {stats.streakDays} day streak</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <ViralShareButton 
            message={viralEngine.createAchievementMessage(stats)}
            type="whatsapp"
            className="flex-1"
          />
          <ViralShareButton 
            message={viralEngine.createAchievementMessage(stats)}
            type="social"
            size="default"
          />
        </div>
      </CardContent>
    </Card>
  );
};