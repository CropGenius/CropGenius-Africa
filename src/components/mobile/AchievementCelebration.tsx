/**
 * 🏆 ACHIEVEMENT CELEBRATION - Production Ready
 * Gamification celebration animations
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementCelebrationProps {
  achievement: Achievement | null;
  onComplete: () => void;
}

export const AchievementCelebration: React.FC<AchievementCelebrationProps> = ({
  achievement,
  onComplete
}) => {
  if (!achievement) return null;

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onComplete}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          className={`bg-gradient-to-br ${getRarityColor(achievement.rarity)} p-6 rounded-2xl shadow-2xl text-white text-center max-w-sm mx-4`}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl mb-4"
          >
            {achievement.icon}
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-2">Achievement Unlocked!</h2>
          <h3 className="text-xl font-semibold mb-2">{achievement.title}</h3>
          <p className="text-sm opacity-90">{achievement.description}</p>
          
          <div className="flex justify-center mt-4 space-x-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Star className="h-4 w-4 fill-current" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};