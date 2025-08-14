/**
 * 🧠 TODAY'S AI FARM PLAN - INFINITY IQ UI COMPONENT
 * The most beautiful farming interface ever created for 100 million farmers
 * CLEAN GREEN DESIGN + SUPABASE BACKEND = REAL MAGIC ✨
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Beaker, TrendingUp, Brain, ChevronRight } from 'lucide-react';
import { TaskStatus, TaskType, TaskPriority, GeniusTask } from '@/types/geniusTask';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface TodaysGeniusTasksProps {
  userId: string;
  onTaskComplete?: (taskId: string) => void;
  onTaskSkip?: (taskId: string, reason: string) => void;
}

// 🎯 TASK PRIORITIZATION ALGORITHM - INFINITY IQ LOGIC
const prioritizeTasks = (tasks: GeniusTask[]): GeniusTask[] => {
  return tasks
    .filter(task => task.status === TaskStatus.PENDING)
    .sort((a, b) => {
      // Critical tasks first
      if (a.priority === TaskPriority.CRITICAL && b.priority !== TaskPriority.CRITICAL) return -1;
      if (b.priority === TaskPriority.CRITICAL && a.priority !== TaskPriority.CRITICAL) return 1;
      
      // Then by FPSI impact points
      return b.fpsiImpactPoints - a.fpsiImpactPoints;
    })
    .slice(0, 3); // Only show top 3 tasks
};

// 🎨 TASK ICON MAPPING - BEAUTIFUL VISUAL DESIGN
const getTaskIcon = (task: GeniusTask) => {
  switch (task.type) {
    case TaskType.WEATHER_RESPONSE:
    case TaskType.IRRIGATION:
      return Calendar;
    case TaskType.PEST_CONTROL:
    case TaskType.DISEASE_PREVENTION:
      return Beaker;
    case TaskType.MARKET_OPPORTUNITY:
    case TaskType.HARVESTING:
      return TrendingUp;
    default:
      return Calendar;
  }
};

// 🔥 NO MORE FALLBACK TASKS - ONLY REAL INTELLIGENT TASKS!

export const TodaysGeniusTasks: React.FC<TodaysGeniusTasksProps> = ({
  userId,
  onTaskComplete,
  onTaskSkip
}) => {
  const navigate = useNavigate();

  // Use the powerful useDailyTasks hook - INFINITY IQ INTEGRATION
  const {
    tasks,
    isLoading,
    isRefreshing,
    error,
    completedCount,
    totalFpsiPoints,
    completionRate,
    refreshTasks,
    completeTask,
    skipTask
  } = useDailyTasks(userId);

  const handleTaskComplete = async (taskId: string) => {
    // 🔥 INSTANT UI UPDATE WITH STRIKETHROUGH + CHECKMARK!
    await completeTask(taskId, {
      completedAt: new Date(),
      actualDuration: 30,
      difficultyRating: 3,
      effectivenessRating: 4
    });

    // Just call parent callback - NO CELEBRATION OVERLAY!
    onTaskComplete?.(taskId);
  };

  const handleTaskSkip = async (taskId: string, reason: string) => {
    // 🔥 NO ERROR CANCER - JUST SKIP THE TASK!
    await skipTask(taskId, reason);
    
    // Call parent callback
    onTaskSkip?.(taskId, reason);
  };

  // 🔥 ALWAYS SHOW REAL TASKS - NO PLACEHOLDERS FOR 100 MILLION FARMERS!
  const displayTasks = tasks.length > 0 ? prioritizeTasks(tasks) : [];
  
  // If no real tasks, generate them immediately
  React.useEffect(() => {
    if (tasks.length === 0 && !isLoading && userId) {
      refreshTasks();
    }
  }, [tasks.length, isLoading, userId, refreshTasks]);

  // Loading state - Beautiful green shimmer
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <Brain className="h-6 w-6 mr-2" />
              Today's AI Farm Plan
            </h3>
            <p className="text-green-100 text-sm mt-1">
              Based on your soil, weather & market conditions
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-green-800/50 rounded-xl p-4 animate-pulse">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-green-700 rounded mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-green-700 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-green-700 rounded w-1/2"></div>
                </div>
                <div className="w-6 h-6 bg-green-700 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white relative overflow-hidden">
      {/* Header with Brain Icon */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center">
            <Brain className="h-6 w-6 mr-2" />
            Today's AI Farm Plan
          </h3>
          <p className="text-green-100 text-sm mt-1">
            Based on your soil, weather & market conditions
          </p>
        </div>
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
          <Brain className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Task Items - REAL DATA WITH PROPER COMPLETION STATES */}
      <div className="space-y-3 mb-4">
        <AnimatePresence>
          {displayTasks.map((task, index) => {
            const TaskIcon = getTaskIcon(task);
            const isCompleted = task.status === TaskStatus.COMPLETED;
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isCompleted ? 0.8 : 1, 
                  y: 0,
                  scale: isCompleted ? 0.98 : 1
                }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`
                  bg-green-800/50 rounded-xl p-4 flex items-center transition-all duration-300 cursor-pointer relative
                  ${isCompleted ? '' : 'hover:bg-green-800/70 hover:scale-[1.02]'}
                `}
                onClick={() => !isCompleted && handleTaskComplete(task.id)}
              >
                {/* Strikethrough line for completed tasks */}
                {isCompleted && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute left-4 right-4 h-0.5 bg-white/80 rounded-full z-10"
                    style={{ top: '50%', transform: 'translateY(-50%)' }}
                  />
                )}
                
                <div className={`w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4 ${isCompleted ? 'opacity-60' : ''}`}>
                  <TaskIcon className="h-5 w-5 text-white" />
                </div>
                
                <div className="flex-1">
                  <motion.p 
                    className={`text-white font-medium text-sm leading-tight transition-all duration-300 ${isCompleted ? 'opacity-70' : ''}`}
                    animate={isCompleted ? { opacity: 0.7 } : { opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {task.title}
                  </motion.p>
                </div>
                
                {/* Completion checkbox with checkmark */}
                <motion.div 
                  className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ml-4 transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-white border-white' 
                      : 'border-white/40 hover:border-white/60'
                  }`}
                  animate={isCompleted ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {isCompleted && (
                    <motion.svg
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        duration: 0.5, 
                        ease: "backOut",
                        delay: 0.2 
                      }}
                      className="w-3 h-3 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Show message if no real tasks yet */}
        {displayTasks.length === 0 && !isLoading && (
          <div className="bg-green-800/30 rounded-xl p-4 text-center">
            <Brain className="h-8 w-8 text-white/60 mx-auto mb-2" />
            <p className="text-white/80 text-sm">
              Generating your personalized AI farm plan...
            </p>
          </div>
        )}
      </div>

      {/* View Full Plan Button */}
      <Button
        variant="ghost"
        className="w-full bg-green-800/30 hover:bg-green-800/50 text-white border-0 rounded-xl py-3 mt-2"
        onClick={() => navigate('/task-manager')}
      >
        <span className="font-medium">View full AI farm plan</span>
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>


    </div>
  );
};