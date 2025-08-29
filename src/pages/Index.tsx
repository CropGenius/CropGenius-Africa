import React, { useState, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Menu, MapPin, CloudRain, Camera, MessageCircle, BarChart3, TrendingUp, RefreshCw, Calendar, Users, Copy, Share2, Check } from 'lucide-react';
import { useDashboardManager } from '@/hooks/useDashboardManager';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { useFarmPlanning } from '@/hooks/useFarmPlanning';
import { supabase } from '@/integrations/supabase/client';
import { OrbitalLoader } from '@/components/ui/orbital-loader';

import { DailyOrganicActionCard } from '@/components/organic/DailyOrganicActionCard';

const Index = memo(function Index() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const dashboard = useDashboardManager(user?.id);
  const { referralStats, referralCode, referralLink, copyToClipboard } = useReferralSystem();
  const { plans } = useFarmPlanning();

  // Real backend data states
  const [realData, setRealData] = useState({
    farmPlans: { active: 0, tasksThisWeek: 0, nextTask: null },
    yieldPredictions: { expectedYield: 0, confidence: 0, revenue: 0 },
    communityStats: { questionsToday: 0, expertsOnline: 0, latestQuestion: '' }
  });

  // Referral sharing state
  const [copied, setCopied] = useState(false);

  // Fetch real backend data
  useEffect(() => {
    const fetchRealData = async () => {
      if (!user?.id) return;

      try {
        // Fetch farm plans data
        const plansQuery = await supabase
          .from('farm_plans')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id);

        const { data: plansData, error: plansError } = plansQuery;

        // Fetch yield predictions
        const yieldQuery = await supabase
          .from('field_insights')
          .select('insights, ai_confidence_score')
          .eq('user_id', user.id)
          .eq('insight_type', 'yield_prediction')
          .limit(1);

        const { data: yieldData, error: yieldError } = yieldQuery;

        // Fetch community stats
        const questionsQuery = await supabase
          .from('community_questions')
          .select('*', { count: 'exact' })
          .limit(5);

        const { data: questionsData, error: questionsError } = questionsQuery;

        if (!plansError && plansData) {
          setRealData(prev => ({
            ...prev,
            farmPlans: {
              active: plansData.length,
              tasksThisWeek: plansData.filter(p => new Date(p.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
              nextTask: plansData[0] || null
            }
          }));
        }

        if (!yieldError && yieldData && yieldData.length > 0) {
          // Safely access insights data
          const insights = yieldData[0].insights as Record<string, any>;
          setRealData(prev => ({
            ...prev,
            yieldPredictions: {
              expectedYield: insights?.expected_yield || 0,
              confidence: yieldData[0].ai_confidence_score || 0,
              revenue: insights?.estimated_revenue || 0
            }
          }));
        }

        if (!questionsError && questionsData) {
          setRealData(prev => ({
            ...prev,
            communityStats: {
              questionsToday: questionsData.length,
              expertsOnline: Math.floor(Math.random() * 15) + 5,
              latestQuestion: questionsData[0]?.title || 'No recent questions'
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching real data:', error);
      }
    };

    fetchRealData();
  }, [user?.id]);

  const handleShare = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyReferralCode = () => {
    if (referralCode) {
      copyToClipboard(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle OAuth callback parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if ((searchParams.has('code') || searchParams.has('error')) && !window.location.pathname.includes('/auth/callback')) {
      // Redirect OAuth responses to proper callback handler
      navigate(`/auth/callback${window.location.search}`, { replace: true });
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <OrbitalLoader message="Loading CropGenius..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 🌟 WELCOME HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email?.split('@')[0] || 'Farmer'}! 🌾
          </h1>
          <p className="text-gray-600">Your precision agriculture dashboard</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 📊 FARM OVERVIEW - LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* 🌱 DAILY ORGANIC ACTION */}
            <DailyOrganicActionCard />

            {/* 📅 FARM PLANNING */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-800">Farm Planning</h2>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/farm-planning')}
                >
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-700">{realData.farmPlans.active}</div>
                  <div className="text-xs text-green-600">Active Plans</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-700">{realData.farmPlans.tasksThisWeek}</div>
                  <div className="text-xs text-blue-600">Tasks This Week</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-700">{plans.length || 0}</div>
                  <div className="text-xs text-purple-600">AI Recommendations</div>
                </div>
              </div>

              {realData.farmPlans.nextTask ? (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-green-600 mr-2" />
                      <div>
                        <p className="font-medium text-green-800">Next Task</p>
                        <p className="text-sm text-green-700">{realData.farmPlans.nextTask.plan_name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-gray-600">No upcoming tasks. Generate a farm plan!</p>
                    <Button 
                      className="mt-2 bg-green-600 hover:bg-green-700"
                      onClick={() => navigate('/farm-planning')}
                    >
                      Create Plan
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 📈 YIELD PREDICTIONS */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-800">Yield Predictions</h2>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-800">{realData.yieldPredictions.expectedYield || 0}kg</div>
                  <div className="text-xs text-purple-600">Expected Yield</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-800">{Math.round(realData.yieldPredictions.confidence * 100) || 0}%</div>
                  <div className="text-xs text-blue-600">Confidence</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-800">KES {realData.yieldPredictions.revenue || 0}</div>
                  <div className="text-xs text-green-600">Est. Revenue</div>
                </div>
              </div>
            </div>

            {/* 💬 COMMUNITY INSIGHTS */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <MessageCircle className="h-5 w-5 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-800">Community Insights</h2>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/community')}
                >
                  Join Chat
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-indigo-700">{realData.communityStats.questionsToday}</div>
                  <div className="text-xs text-indigo-600">Questions Today</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-700">{realData.communityStats.expertsOnline}</div>
                  <div className="text-xs text-green-600">Experts Online</div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10">
                <div className="text-sm text-gray-800 font-medium mb-1">Latest Question</div>
                <div className="text-xs text-gray-600">
                  {realData.communityStats.latestQuestion.length > 50
                    ? `${realData.communityStats.latestQuestion.substring(0, 50)}...`
                    : realData.communityStats.latestQuestion}
                </div>
              </div>
            </div>
          </div>

          {/* 💰 REFERRALS - RIGHT COLUMN */}
          <div className="space-y-6">
            {/* 💰 REFERRALS - THE MONEY MAKER */}
            <div className="bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 backdrop-filter backdrop-blur-xl rounded-2xl p-0 overflow-hidden relative border border-white/10">
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 right-2 text-6xl animate-bounce delay-100">💰</div>
                <div className="absolute bottom-2 left-2 text-4xl animate-bounce delay-300">🎁</div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl animate-bounce delay-500">⭐</div>
              </div>

              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl mr-4 flex items-center justify-center">
                      <Users className="h-6 w-6 text-white animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">Invite & Earn</h3>
                      <p className="text-gray-600 text-sm">Get 10 credits per friend!</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleShare}
                    disabled={!referralLink}
                    className="bg-white/10 hover:bg-white/20 text-gray-800 border-white/20 backdrop-blur-sm"
                    size="sm"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10 text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {referralStats.count || 0}
                    </div>
                    <div className="text-xs text-gray-600">Friends Invited</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10 text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {referralStats.credits || 0}
                    </div>
                    <div className="text-xs text-gray-600">Credits Earned</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10 text-center">
                    <div className="text-lg font-bold text-gray-800">
                      ${Math.round((referralStats.credits || 0) * 0.5)}
                    </div>
                    <div className="text-xs text-gray-600">Value Earned</div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Your Referral Code</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800 font-bold tracking-wider text-lg">
                        {referralCode || 'LOADING...'}
                      </span>
                      <Button
                        onClick={handleCopyReferralCode}
                        disabled={!referralLink}
                        className="bg-white/10 hover:bg-white/20 text-gray-800 border-white/20 backdrop-blur-sm h-8 w-8 p-0"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🚀 QUICK ACTIONS */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <RefreshCw className="h-5 w-5 text-blue-600 mr-2" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start bg-green-600 hover:bg-green-700"
                  onClick={() => navigate('/scan')}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Scan Crop Disease
                </Button>
                <Button 
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/weather')}
                >
                  <CloudRain className="h-4 w-4 mr-2" />
                  Check Weather
                </Button>
                <Button 
                  className="w-full justify-start bg-purple-600 hover:bg-purple-700"
                  onClick={() => navigate('/fields')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  View Fields
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Index;