/**
 * 🎉 TASK CELEBRATION - DOPAMINE HITS FOR FARMERS
 * Beautiful celebration animations when tasks are completed
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Zap, TrendingUp, X } from 'lucide-react';
import { GeniusTask, CelebrationLevel } from '@/types/geniusTask';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TaskCelebrationProps {
  task?: GeniusTask | null;
  isVisible: boolean;
  onComplete: () => void;
}

const CELEBRATION_CONFIGS = {
  small: {
    duration: 2000,
    particles: 10,
    colors: ['#10B981', '#34D399', '#6EE7B7'],
    scale: 1.1
  },
  medium: {
    duration: 3000,
    particles: 20,
    colors: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
    scale: 1.2
  },
  large: {
    duration: 4000,
    particles: 30,
    colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#EDE9FE'],
    scale: 1.3
  },
  epic: {
    duration: 5000,
    particles: 50,
    colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#FEF3C7'],
    scale: 1.5
  }
};

export const TaskCelebration: React.FC<TaskCelebrationProps> = ({ task, isVisible, onComplete }) => {
  // 🔥 BULLETPROOF: Always have a valid task and celebration level
  const safeTask = task || {
    id: 'default',
    title: 'Task Completed!',
    fpsiImpactPoints: 15,
    expectedImpact: { fpsiPoints: 15, yieldImpact: 5, costImpact: 0, riskReduction: 10, timeWindow: 1, sustainabilityScore: 7 },
    celebrationLevel: 'medium' as any
  };

  const celebrationLevel = (safeTask.celebrationLevel && CELEBRATION_CONFIGS[safeTask.celebrationLevel as keyof typeof CELEBRATION_CONFIGS]) 
    ? safeTask.celebrationLevel as keyof typeof CELEBRATION_CONFIGS
    : 'medium';
  
  const config = CELEBRATION_CONFIGS[celebrationLevel];

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onComplete, config.duration);
      return () => clearTimeout(timer);
    }
  }, [config.duration, onComplete, isVisible]);

  if (!isVisible) return null;

  // Generate confetti particles
  const particles = Array.from({ length: config.particles }, (_, i) => ({
    id: i,
    color: config.colors[i % config.colors.length],
    delay: Math.random() * 0.5,
    x: Math.random() * 100,
    rotation: Math.random() * 360
  }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onComplete}
      >
        {/* Confetti Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: particle.color,
              left: `${particle.x}%`,
              top: '20%'
            }}
            initial={{ 
              y: -100, 
              opacity: 0, 
              rotate: 0,
              scale: 0 
            }}
            animate={{ 
              y: window.innerHeight + 100, 
              opacity: [0, 1, 1, 0], 
              rotate: particle.rotation,
              scale: [0, 1, 1, 0]
            }}
            transition={{ 
              duration: 3,
              delay: particle.delay,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Celebration Card */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: config.scale, rotate: 0 }}
          exit={{ scale: 0, rotate: 10 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="w-80 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-2xl">
            <CardContent className="p-6 text-center relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={onComplete}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-gray-900 mb-2"
              >
                Task Completed! 🎉
              </motion.h3>

              {/* Task Title */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-700 mb-4 font-medium"
              >
                {safeTask.title}
              </motion.p>

              {/* Rewards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg p-4 mb-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Zap className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-lg font-bold text-green-600">
                        +{safeTask.fpsiImpactPoints || 15}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">FPSI Points</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-lg font-bold text-blue-600">
                        +{safeTask.expectedImpact?.yieldImpact || 5}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">Yield Impact</div>
                  </div>
                </div>
              </motion.div>

              {/* Motivational Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-gray-600"
              >
                {celebrationLevel === 'epic' && "🌟 Outstanding work! You're mastering your farm!"}
                {celebrationLevel === 'large' && "💪 Excellent progress! Your farm is thriving!"}
                {celebrationLevel === 'medium' && "✨ Great job! Every task makes a difference!"}
                {celebrationLevel === 'small' && "👍 Well done! Keep up the good work!"}
              </motion.div>

              {/* Progress Indicator */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.7, duration: 1 }}
                className="mt-4 h-1 bg-green-200 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};