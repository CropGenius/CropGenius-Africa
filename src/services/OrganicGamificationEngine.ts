/**
 * 🔥 ORGANIC GAMIFICATION ENGINE - ULTRA SIMPLE ADDICTION MECHANICS
 * Minimal code, maximum dopamine hits for farmers
 */

import { supabase } from '../integrations/supabase/client';

export interface OrganicLevel {
  level: number;
  name: string;
  icon: string;
  minScore: number;
  rewards: string[];
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedAt?: Date;
}

export interface UserStats {
  level: OrganicLevel;
  totalSavings: number;
  streakDays: number;
  completedActions: number;
  achievements: Achievement[];
}

class OrganicGamificationEngine {
  private static instance: OrganicGamificationEngine;
  
  static getInstance(): OrganicGamificationEngine {
    if (!this.instance) this.instance = new OrganicGamificationEngine();
    return this.instance;
  }

  private levels: OrganicLevel[] = [
    { level: 1, name: 'Organic Seedling', icon: '🌱', minScore: 0, rewards: ['Welcome Badge'] },
    { level: 2, name: 'Organic Farmer', icon: '🌾', minScore: 20, rewards: ['Farmer Badge', '$5 Bonus'] },
    { level: 3, name: 'Organic Pro', icon: '🏆', minScore: 40, rewards: ['Pro Badge', '$10 Bonus'] },
    { level: 4, name: 'Organic Expert', icon: '👑', minScore: 60, rewards: ['Expert Badge', '$20 Bonus'] },
    { level: 5, name: 'Organic Master', icon: '⚡', minScore: 80, rewards: ['Master Badge', '$50 Bonus'] }
  ];

  private achievements: Achievement[] = [
    { id: 'first_action', name: 'First Steps', icon: '👶', description: 'Complete your first organic action', earned: false },
    { id: 'week_streak', name: 'Week Warrior', icon: '🔥', description: '7 day streak', earned: false },
    { id: 'money_saver', name: 'Money Saver', icon: '💰', description: 'Save $100 total', earned: false },
    { id: 'recipe_master', name: 'Recipe Master', icon: '🧪', description: 'Try 10 recipes', earned: false },
    { id: 'organic_ready', name: 'Certification Ready', icon: '✅', description: 'Reach 80% organic score', earned: false }
  ];

  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Get user progress
      const { data: progress } = await supabase
        .from('organic_score_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      const score = progress?.[0]?.overall_score || 0;
      
      // Get completed actions
      const { data: actions } = await supabase
        .from('organic_superpowers_history')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true);

      const completedActions = actions?.length || 0;
      const totalSavings = actions?.reduce((sum, action) => sum + (action.cost_savings || 0), 0) || 0;

      // Calculate streak (simplified)
      const streakDays = Math.min(completedActions, 30); // Max 30 day streak

      // Determine level
      const level = this.levels.find(l => score >= l.minScore) || this.levels[0];

      // Check achievements
      const achievements = this.achievements.map(achievement => ({
        ...achievement,
        earned: this.checkAchievement(achievement.id, { completedActions, totalSavings, score, streakDays })
      }));

      return {
        level,
        totalSavings,
        streakDays,
        completedActions,
        achievements
      };
    } catch (error) {
      // Failed to get user stats, using defaults
      return {
        level: this.levels[0],
        totalSavings: 0,
        streakDays: 0,
        completedActions: 0,
        achievements: this.achievements
      };
    }
  }

  private checkAchievement(id: string, stats: any): boolean {
    switch (id) {
      case 'first_action': return stats.completedActions >= 1;
      case 'week_streak': return stats.streakDays >= 7;
      case 'money_saver': return stats.totalSavings >= 100;
      case 'recipe_master': return stats.completedActions >= 10;
      case 'organic_ready': return stats.score >= 80;
      default: return false;
    }
  }

  async recordAction(userId: string, actionType: string, savings: number): Promise<Achievement[]> {
    try {
      // Record the action
      await supabase
        .from('organic_superpowers_history')
        .insert({
          user_id: userId,
          superpower_id: `action_${Date.now()}`,
          title: actionType,
          cost_savings: savings,
          completed: true,
          completed_at: new Date().toISOString()
        });

      // Check for new achievements
      const stats = await this.getUserStats(userId);
      return stats.achievements.filter(a => a.earned);
    } catch (error) {
      // Failed to record action
      return [];
    }
  }
}

export const organicGamificationEngine = OrganicGamificationEngine.getInstance();