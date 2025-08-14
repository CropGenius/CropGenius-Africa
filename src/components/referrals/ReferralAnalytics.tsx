import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Users,
  Target,
  Globe,
  Calendar,
  Award,
  Zap,
  Crown,
  BarChart3,
  PieChart,
  Activity,
  Share2,
  DollarSign,
  Trophy,
  Star,
  Flame,
  Rocket
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReferralAnalyticsData {
  totalReferrals: number;
  conversionRate: number;
  viralCoefficient: number;
  totalCreditsEarned: number;
  clickThroughRate: number;
  topPerformingPlatform: string;
  geographicDistribution: { country: string; count: number }[];
  timeBasedTrends: { date: string; referrals: number; conversions: number }[];
  messageVariantsPerformance: { variant: string; shares: number; conversions: number }[];
  achievements: {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
    rewardCredits: number;
  }[];
  leaderboardPosition: number;
  isPremium: boolean;
  fraudScore: number;
  suspiciousActivity: number;
  premiumBonuses: number;
}

interface ReferralAnalyticsProps {
  userId: string;
  isPremium: boolean;
}

export default function ReferralAnalytics({ userId, isPremium }: ReferralAnalyticsProps) {
  const [analytics, setAnalytics] = useState<ReferralAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [userId, selectedTimeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const now = new Date();
      const startDate = selectedTimeRange === 'all' ? null : 
        new Date(now.getTime() - (selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000);
      
      // Load referral statistics
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId)
        .gte('created_at', startDate?.toISOString() || '1970-01-01')
        .order('created_at', { ascending: false });
      
      if (referralsError) throw referralsError;
      
      // Load achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('referral_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });
      
      if (achievementsError && achievementsError.code !== 'PGRST116') {
        console.error('Achievements error:', achievementsError);
      }
      
      // Load leaderboard position
      const { data: leaderboard, error: leaderboardError } = await supabase
        .from('referral_leaderboard')
        .select('*')
        .eq('user_id', userId)
        .eq('rank_category', 'overall')
        .single();
      
      if (leaderboardError && leaderboardError.code !== 'PGRST116') {
        console.error('Leaderboard error:', leaderboardError);
      }
      
      // Load viral shares data
      const { data: viralShares, error: viralSharesError } = await supabase
        .from('viral_shares')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate?.toISOString() || '1970-01-01');
      
      if (viralSharesError && viralSharesError.code !== 'PGRST116') {
        console.error('Viral shares error:', viralSharesError);
      }
      
      // Load premium bonuses
      const { data: premiumBonuses, error: premiumBonusesError } = await supabase
        .from('premium_referral_bonuses')
        .select('*')
        .eq('user_id', userId);
      
      if (premiumBonusesError && premiumBonusesError.code !== 'PGRST116') {
        console.error('Premium bonuses error:', premiumBonusesError);
      }
      
      // Process analytics data
      const totalReferrals = referrals?.length || 0;
      const successfulReferrals = referrals?.filter(r => r.reward_issued && !r.suspicious_activity).length || 0;
      const conversionRate = totalReferrals > 0 ? (successfulReferrals / totalReferrals) * 100 : 0;
      
      const totalShares = viralShares?.length || 0;
      const totalClicks = viralShares?.reduce((sum, share) => sum + (share.click_count || 0), 0) || 0;
      const clickThroughRate = totalShares > 0 ? (totalClicks / totalShares) * 100 : 0;
      
      const viralCoefficient = totalReferrals > 0 ? successfulReferrals / totalReferrals : 0;
      
      // Calculate credits earned
      const baseCredits = successfulReferrals * 10;
      const premiumBonusCredits = referrals?.filter(r => r.premium_bonus_issued).length * 5 || 0;
      const milestoneCredits = achievements?.reduce((sum, ach) => sum + ach.reward_credits, 0) || 0;
      const totalCreditsEarned = baseCredits + premiumBonusCredits + milestoneCredits;
      
      // Top performing platform
      const platformCounts = viralShares?.reduce((acc, share) => {
        acc[share.platform] = (acc[share.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const topPerformingPlatform = Object.entries(platformCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'whatsapp';
      
      // Message variants performance
      const variantPerformance = viralShares?.reduce((acc, share) => {
        const variant = share.message_variant;
        if (!acc[variant]) {
          acc[variant] = { shares: 0, conversions: 0 };
        }
        acc[variant].shares += 1;
        acc[variant].conversions += share.conversion_count || 0;
        return acc;
      }, {} as Record<string, { shares: number; conversions: number }>) || {};
      
      const messageVariantsPerformance = Object.entries(variantPerformance)
        .map(([variant, data]) => ({ variant, ...data }));
      
      // Time-based trends (simplified)
      const timeBasedTrends = referrals?.reduce((acc, referral) => {
        const date = new Date(referral.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { referrals: 0, conversions: 0 };
        }
        acc[date].referrals += 1;
        if (referral.reward_issued && !referral.suspicious_activity) {
          acc[date].conversions += 1;
        }
        return acc;
      }, {} as Record<string, { referrals: number; conversions: number }>) || {};
      
      const timeBasedTrendsArray = Object.entries(timeBasedTrends)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      // Calculate fraud metrics
      const fraudScore = referrals?.reduce((sum, r) => sum + (r.fraud_score || 0), 0) / Math.max(totalReferrals, 1) || 0;
      const suspiciousActivity = referrals?.filter(r => r.suspicious_activity).length || 0;
      const premiumBonusesCount = premiumBonuses?.length || 0;
      
      setAnalytics({
        totalReferrals,
        conversionRate,
        viralCoefficient,
        totalCreditsEarned,
        clickThroughRate,
        topPerformingPlatform,
        geographicDistribution: [], // Would need IP geolocation data
        timeBasedTrends: timeBasedTrendsArray,
        messageVariantsPerformance,
        achievements: achievements?.map(ach => ({
          id: ach.achievement_id,
          name: ach.achievement_name,
          description: ach.achievement_description,
          icon: ach.achievement_icon,
          earnedAt: ach.earned_at,
          rewardCredits: ach.reward_credits
        })) || [],
        leaderboardPosition: leaderboard?.rank_position || 0,
        isPremium,
        fraudScore,
        suspiciousActivity,
        premiumBonuses: premiumBonusesCount
      });
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const PremiumUpgradePrompt = () => (
    <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
      <CardContent className="p-6 text-center">
        <Crown className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
        <h3 className="text-xl font-bold mb-2">Unlock Advanced Referral Analytics</h3>
        <p className="mb-4 text-purple-100">
          Get detailed insights, conversion tracking, geographic distribution, and premium-only features!
        </p>
        <Button className="bg-white text-purple-600 hover:bg-purple-50">
          Upgrade to Premium
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Start referring friends to see your analytics!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Referral Analytics
          {isPremium && <Crown className="h-5 w-5 text-yellow-500" />}
        </h2>
        
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange(range)}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalReferrals}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-green-600">{analytics.conversionRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Credits Earned</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.totalCreditsEarned}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Viral Coefficient</p>
                <p className="text-3xl font-bold text-orange-600">{analytics.viralCoefficient.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Features */}
      {!isPremium ? (
        <PremiumUpgradePrompt />
      ) : (
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Click-Through Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {analytics.clickThroughRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">
                    Average industry rate: 2-5%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Top Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 mb-2 capitalize">
                    {analytics.topPerformingPlatform}
                  </div>
                  <p className="text-sm text-gray-600">
                    Your most effective sharing channel
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Message Variants Performance */}
            {analytics.messageVariantsPerformance.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Message Variants Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.messageVariantsPerformance.map((variant) => (
                      <div key={variant.variant} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium capitalize">{variant.variant}</p>
                          <p className="text-sm text-gray-600">
                            {variant.shares} shares • {variant.conversions} conversions
                          </p>
                        </div>
                        <Badge variant="outline">
                          {variant.shares > 0 ? ((variant.conversions / variant.shares) * 100).toFixed(1) : 0}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Fraud Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 mb-2">
                    {analytics.fraudScore.toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Lower is better (0-100 scale)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5" />
                    Suspicious Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600 mb-2">
                    {analytics.suspiciousActivity}
                  </div>
                  <p className="text-sm text-gray-600">
                    Flagged referrals
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Premium Bonuses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {analytics.premiumBonuses}
                  </div>
                  <p className="text-sm text-gray-600">
                    Extra rewards earned
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="channels" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Channel Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Channel analytics coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.achievements.map((achievement) => (
                <Card key={achievement.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{achievement.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-500 text-white">
                            +{achievement.rewardCredits} credits
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(achievement.earnedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {analytics.achievements.length === 0 && (
                <Card className="col-span-2">
                  <CardContent className="p-6 text-center">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
                    <p className="text-gray-600">Start referring friends to unlock achievements!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Your Leaderboard Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    #{analytics.leaderboardPosition || 'Unranked'}
                  </div>
                  <p className="text-gray-600">
                    {analytics.leaderboardPosition 
                      ? `You're in the top referrers!` 
                      : 'Start referring to get ranked!'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}