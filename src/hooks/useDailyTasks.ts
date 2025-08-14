/**
 * 🎯 USE DAILY TASKS HOOK - REACT INTEGRATION FOR GENIUS TASKS
 * Seamless React integration with Supabase backend - REAL MAGIC ✨
 */

import { useState, useEffect, useCallback } from 'react';
import { GeniusTask, TaskCompletionData, TaskFeedback } from '@/types/geniusTask';
import { dailyTaskManager } from '@/services/DailyTaskManager';
import { supabase } from '@/integrations/supabase/client';

interface UseDailyTasksReturn {
  tasks: GeniusTask[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  completedCount: number;
  totalFpsiPoints: number;
  completionRate: number;
  
  // Actions
  loadTasks: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  completeTask: (taskId: string, completionData?: TaskCompletionData) => Promise<void>;
  skipTask: (taskId: string, reason: string) => Promise<void>;
  submitFeedback: (taskId: string, feedback: TaskFeedback) => Promise<void>;
}

export const useDailyTasks = (userId?: string): UseDailyTasksReturn => {
  const [tasks, setTasks] = useState<GeniusTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tasks function - NO ERROR CANCER!
  const loadTasks = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    
    const dailyTasks = await dailyTaskManager.getTodaysTasks(userId);
    
    // If no tasks exist, generate them
    if (dailyTasks.length === 0) {
      const generatedTasks = await dailyTaskManager.generateDailyTasks(userId);
      setTasks(generatedTasks);
    } else {
      setTasks(dailyTasks);
    }
    
    setIsLoading(false);
  }, [userId]);

  // Refresh tasks function - NO ERROR CANCER!
  const refreshTasks = useCallback(async () => {
    if (!userId) return;

    setIsRefreshing(true);
    setError(null);
    
    const refreshedTasks = await dailyTaskManager.refreshTasks(userId);
    setTasks(refreshedTasks);
    
    setIsRefreshing(false);
  }, [userId]);

  // Complete task function - NO ERROR CANCER!
  const completeTask = useCallback(async (taskId: string, completionData?: TaskCompletionData) => {
    await dailyTaskManager.completeTask(taskId, completionData);
    
    // Update local state optimistically
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed' as any, completedAt: new Date(), completionData }
        : task
    ));
  }, []);

  // Skip task function - NO ERROR CANCER!
  const skipTask = useCallback(async (taskId: string, reason: string) => {
    await dailyTaskManager.skipTask(taskId, reason);
    
    // Update local state optimistically
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'skipped' as any, skipReason: reason }
        : task
    ));
  }, []);

  // Submit feedback function - NO ERROR CANCER!
  const submitFeedback = useCallback(async (taskId: string, feedback: TaskFeedback) => {
    await dailyTaskManager.submitTaskFeedback(taskId, feedback);
  }, []);

  // Load tasks when userId changes
  useEffect(() => {
    if (userId) {
      loadTasks();
    }
  }, [userId, loadTasks]);

  // Set up real-time subscriptions for task updates
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel('daily-tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_genius_tasks',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔄 Real-time task update:', payload);
          
          // Reload tasks when changes occur
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, loadTasks]);

  // Calculate metrics
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const completedCount = completedTasks.length;
  const totalFpsiPoints = completedTasks.reduce((sum, task) => sum + task.fpsiImpactPoints, 0);
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return {
    tasks,
    isLoading,
    isRefreshing,
    error,
    completedCount,
    totalFpsiPoints,
    completionRate,
    
    // Actions
    loadTasks,
    refreshTasks,
    completeTask,
    skipTask,
    submitFeedback
  };
};