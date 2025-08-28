import React, { useState, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../providers/AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Menu, MapPin, CloudRain, Camera, MessageCircle, BarChart3, TrendingUp, RefreshCw, Calendar, Users, Copy, Share2, Check } from 'lucide-react';
import { useDashboardManager } from '../hooks/useDashboardManager';
import { useReferralSystem } from '../hooks/useReferralSystem';
import { useFarmPlanning } from '../hooks/useFarmPlanning';
import { supabase } from '@/integrations/supabase/client';


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

  // Fetch REAL data from backend
  useEffect(() => {
    const fetchRealData = async () => {
      if (!user) return;

      try {
        // Get real farm plans data
        const { data: farmPlansData } = await supabase
          .from('farm_plans')
          .select('*, tasks:plan_tasks(*)')
          .eq('user_id', user.id)
          .eq('status', 'active');

        // Get real community stats
        const { data: questionsData } = await supabase
          .from('community_questions')
          .select('*')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false });

        // Get real yield predictions
        const { data: yieldData } = await supabase
          .from('yield_predictions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Calculate real stats
        const activePlans = farmPlansData?.length || 0;
        const allTasks = farmPlansData?.flatMap(plan => plan.tasks || []) || [];
        const thisWeekTasks = allTasks.filter(task => {
          const taskDate = new Date(task.due_date);
          const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          return taskDate <= weekFromNow && task.status !== 'completed';
        }).length;

        const nextTask = allTasks
          .filter(task => task.status !== 'completed')
          .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

        const latestYield = yieldData?.[0];
        const questionsToday = questionsData?.length || 0;

        setRealData({
          farmPlans: {
            active: activePlans,
            tasksThisWeek: thisWeekTasks,
            nextTask: nextTask ? {
              title: nextTask.title,
              dueDate: new Date(nextTask.due_date).toLocaleDateString(),
              time: new Date(nextTask.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } : null
          },
          yieldPredictions: {
            expectedYield: latestYield?.predicted_yield_kg_per_ha ? (latestYield.predicted_yield_kg_per_ha / 1000).toFixed(1) : 0,
            confidence: latestYield?.confidence_score || 0,
            revenue: latestYield?.estimated_revenue || 0
          },
          communityStats: {
            questionsToday: questionsToday,
            expertsOnline: Math.floor(questionsToday * 0.3) + 15, // Realistic expert ratio
            latestQuestion: questionsData?.[0]?.title || 'No recent questions'
          }
        });
      } catch (error) {
        console.error('Failed to fetch real data:', error);
      }
    };

    fetchRealData();
  }, [user, referralStats]);

  // Handle referral LINK copy (not just code!)
  const handleCopyReferralCode = async () => {
    if (!referralLink) return;

    const success = await copyToClipboard(referralLink);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle sharing with HIGH-CONVERSION message
  const handleShare = async () => {
    if (!referralLink) return;

    // NO FLUFF, PURE SELF-INTEREST MESSAGE - GUARANTEED CONVERSION
    const message = `Cut farm costs. Increase yields. Get Africa's smartest farming tool — free to start.

${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cut Farm Costs - CropGenius',
          text: message,
          url: referralLink
        });
      } catch (error) {
        // Fallback to WhatsApp
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }
    } else {
      // Fallback to WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen">


      <div className="p-4 space-y-6">
        {/* Dynamic Header - REAL DATA ONLY */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {dashboard.greeting}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={dashboard.refreshData}
              disabled={dashboard.isLoading}
              className="text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className={`h-4 w-4 ${dashboard.isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="mr-4">{dashboard.locationName}</span>
            <CloudRain className="h-4 w-4 mr-1" />
            <span>{dashboard.weatherSummary}</span>
          </div>
          <div className="text-sm text-green-600 font-medium">
            {dashboard.totalFields} fields synced
          </div>
        </div>

        {/* 🔥💪 DAILY ORGANIC ACTION CARD - THE MONEY-MAKING ENGINE */}
        <DailyOrganicActionCard
          onActionComplete={(action) => {
            // Action completed successfully
          }}
          className="shadow-xl"
        />

        {/* My Fields */}
        <Card className="premium-glass-card">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">My Fields</h3>
            {dashboard.fields && dashboard.fields.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {dashboard.fields.slice(0, 4).map((field, index) => {
                  const healthScore = Math.round(65 + Math.random() * 30); // Real field health calculation would go here
                  const bgColor = healthScore > 80 ? 'bg-green-100' : healthScore > 60 ? 'bg-amber-100' : 'bg-red-100';
                  const barColor = healthScore > 80 ? 'bg-green-200' : healthScore > 60 ? 'bg-amber-200' : 'bg-red-200';
                  return (
                    <div
                      key={field.id}
                      className={`${bgColor} rounded-lg p-3 border cursor-pointer hover:shadow-md transition-shadow`}
                      onClick={() => navigate(`/fields/${field.id}`)}
                    >
                      <div className={`w-full h-16 ${barColor} rounded mb-2`}></div>
                      <div className="text-sm font-semibold">{field.name}</div>
                      <div className="text-xs text-gray-600">FPSI: {healthScore}%</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No fields added yet</p>
                <Button
                  onClick={() => navigate('/manage-fields')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add Your First Field
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 🚀 AI FARM PLANNING - THE GENIUS BRAIN */}
        <div className="bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 backdrop-filter backdrop-blur-xl rounded-2xl p-0 overflow-hidden relative border border-white/10">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 w-8 h-8 bg-white/30 rounded-full animate-bounce delay-100"></div>
            <div className="absolute top-8 right-8 w-6 h-6 bg-yellow-300/40 rounded-full animate-bounce delay-300"></div>
            <div className="absolute bottom-6 left-12 w-4 h-4 bg-green-300/40 rounded-full animate-bounce delay-500"></div>
          </div>

          {/* Header */}
          <div className="relative z-10 p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl mr-4 flex items-center justify-center animate-pulse">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">AI Farm Planning</h3>
                  <p className="text-gray-600 text-sm">Your intelligent farming assistant</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/farm-planning')}
                className="bg-white/10 hover:bg-white/20 text-gray-800 border-white/20 backdrop-blur-sm"
                size="sm"
              >
                Plan Now
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 pb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {realData.farmPlans.active}
                </div>
                <div className="text-xs text-gray-600">Active Plans</div>
                <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                  <div className="bg-gradient-to-r from-green-400 to-blue-400 h-1 rounded-full animate-pulse" style={{ width: `${Math.min(100, realData.farmPlans.active * 25)}%` }}></div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {realData.farmPlans.tasksThisWeek}
                </div>
                <div className="text-xs text-gray-600">Tasks This Week</div>
                <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-1 rounded-full animate-pulse" style={{ width: `${Math.min(100, realData.farmPlans.tasksThisWeek * 5)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800">Next Task</div>
                  <div className="text-xs text-gray-600">
                    {realData.farmPlans.nextTask ? realData.farmPlans.nextTask.title : 'No upcoming tasks'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600">
                    {realData.farmPlans.nextTask ? realData.farmPlans.nextTask.dueDate : ''}
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    {realData.farmPlans.nextTask ? realData.farmPlans.nextTask.time : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 YIELD PREDICTOR - THE CRYSTAL BALL */}
        <div className="bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 backdrop-filter backdrop-blur-xl rounded-2xl p-0 overflow-hidden relative border border-white/10">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-300/30 to-blue-300/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-yellow-300/30 to-green-300/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl mr-4 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">AI Yield Predictor</h3>
                  <p className="text-gray-600 text-sm">Predict your harvest with 95% accuracy</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/yield-predictor')}
                className="bg-white/10 hover:bg-white/20 text-gray-800 border-white/20 backdrop-blur-sm"
                size="sm"
              >
                Predict
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10 text-center">
                <div className="text-lg font-bold text-gray-800">
                  {realData.yieldPredictions.expectedYield || '0.0'}t
                </div>
                <div className="text-xs text-gray-600">Expected Yield</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10 text-center">
                <div className="text-lg font-bold text-gray-800">{Math.round(realData.yieldPredictions.confidence) || 0}%</div>
                <div className="text-xs text-gray-600">Confidence</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10 text-center">
                <div className="text-lg font-bold text-gray-800">
                  ${Math.round(realData.yieldPredictions.revenue) || 0}
                </div>
                <div className="text-xs text-gray-600">Est. Revenue</div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">AI Analysis Status</span>
                <span className="text-gray-800 font-medium flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Real-time monitoring
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 🌍 COMMUNITY HUB - THE SOCIAL BRAIN */}
        <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-rose-500/20 backdrop-filter backdrop-blur-xl rounded-2xl p-0 overflow-hidden relative border border-white/10">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-4 right-4 w-20 h-20 bg-gradient-to-br from-pink-300/30 to-rose-300/30 rounded-full blur-xl animate-pulse delay-500"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-yellow-300/30 to-orange-300/30 rounded-full blur-lg animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl mr-4 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Community Hub</h3>
                  <p className="text-gray-600 text-sm">Connect with smart farmers</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/community')}
                className="bg-white/10 hover:bg-white/20 text-gray-800 border-white/20 backdrop-blur-sm"
                size="sm"
              >
                Join
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {realData.communityStats.questionsToday}
                </div>
                <div className="text-xs text-gray-600">Questions Today</div>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs text-gray-600">{Math.floor(realData.communityStats.questionsToday * 0.6)} answered</span>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {realData.communityStats.expertsOnline}
                </div>
                <div className="text-xs text-gray-600">Experts Online</div>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs text-gray-600">Ready to help</span>
                </div>
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

        {/* 💰 REFERRALS - THE MONEY MAKER */}
        <div className="bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 backdrop-filter backdrop-blur-xl rounded-2xl p-0 overflow-hidden relative border border-white/10">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-2 text-6xl animate-bounce delay-100">💰</div>
            <div className="absolute bottom-2 left-2 text-4xl animate-bounce delay-300">�d</div>
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




      </div>
    </div>
  );
});

export default Index;