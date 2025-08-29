/**
 * 🎮 GAMIFICATION ENGINE - Production Ready
 * Engagement system for farmers
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface GamificationResult {
  pointsEarned: number;
  newAchievements: Achievement[];
  totalPoints: number;
  level: number;
}

class GamificationEngine {
  private achievements: Achievement[] = [
    {
      id: 'first_login',
      title: 'Welcome Farmer!',
      description: 'Logged in for the first time',
      icon: '🌱',
      rarity: 'common',
      points: 10,
      unlocked: false
    },
    {
      id: 'daily_login',
      title: 'Daily Dedication',
      description: 'Logged in daily for a week',
      icon: '📅',
      rarity: 'rare',
      points: 50,
      unlocked: false
    },
    {
      id: 'first_scan',
      title: 'AI Explorer',
      description: 'Completed your first crop scan',
      icon: '📸',
      rarity: 'common',
      points: 20,
      unlocked: false
    }
  ];

  private userStats = {
    totalPoints: 0,
    level: 1,
    loginStreak: 0,
    lastLogin: null as string | null,
    scansCompleted: 0,
    fieldsAdded: 0
  };

  async trackAction(action: string): Promise<GamificationResult> {
    const pointsEarned = this.getPointsForAction(action);
    const newAchievements: Achievement[] = [];

    // Update stats
    this.updateStats(action);

    // Check for new achievements
    this.achievements.forEach(achievement => {
      if (!achievement.unlocked && this.checkAchievementCondition(achievement.id)) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        newAchievements.push(achievement);
        this.userStats.totalPoints += achievement.points;
      }
    });

    this.userStats.totalPoints += pointsEarned;
    this.userStats.level = Math.floor(this.userStats.totalPoints / 100) + 1;

    return {
      pointsEarned,
      newAchievements,
      totalPoints: this.userStats.totalPoints,
      level: this.userStats.level
    };
  }

  private getPointsForAction(action: string): number {
    const pointMap: Record<string, number> = {
      'daily_login': 5,
      'crop_scan': 10,
      'field_added': 15,
      'weather_check': 3,
      'market_check': 3,
      'navigate_to_scan': 1
    };

    return pointMap[action] || 0;
  }

  private updateStats(action: string) {
    switch (action) {
      case 'daily_login': {
        const today = new Date().toDateString();
        if (this.userStats.lastLogin !== today) {
          this.userStats.loginStreak++;
          this.userStats.lastLogin = today;
        }
        break;
      }
      case 'crop_scan':
        this.userStats.scansCompleted++;
        break;
      case 'field_added':
        this.userStats.fieldsAdded++;
        break;
    }
  }

  private checkAchievementCondition(achievementId: string): boolean {
    switch (achievementId) {
      case 'first_login':
        return this.userStats.loginStreak >= 1;
      case 'daily_login':
        return this.userStats.loginStreak >= 7;
      case 'first_scan':
        return this.userStats.scansCompleted >= 1;
      default:
        return false;
    }
  }

  getStats() {
    return { ...this.userStats };
  }

  getAchievements() {
    return [...this.achievements];
  }
}

const gamificationEngine = new GamificationEngine();

export const useGamification = () => {
  const trackAction = (action: string) => gamificationEngine.trackAction(action);
  const getStats = () => gamificationEngine.getStats();
  const getAchievements = () => gamificationEngine.getAchievements();

  return {
    trackAction,
    getStats,
    getAchievements
  };
};