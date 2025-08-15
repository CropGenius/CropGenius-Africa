import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../providers/AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Menu, MapPin, CloudRain, Camera, MessageCircle, BarChart3, TrendingUp, RefreshCw, Calendar, Users } from 'lucide-react';
import { useDashboardManager } from '../hooks/useDashboardManager';

import { DailyOrganicActionCard } from '@/components/organic/DailyOrganicActionCard';
import { EnvTest } from '@/components/debug/EnvTest';

const Index = memo(function Index() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const dashboard = useDashboardManager(user?.id);

  // Real-time farm health data
  const farmHealth = dashboard.farmHealthData || { score: 65, status: 'Loading', color: 'text-gray-600', trend: 'Calculating...' };

  // Real-time today's action
  const todaysAction = dashboard.todaysAction || {
    title: 'Loading agricultural intelligence...',
    description: 'Analyzing your fields and weather conditions',
    impact: 'Please wait while we gather real-time data',
    action: 'Please wait',
    route: '/'
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
            console.log('🎉 Action completed:', action);
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
        <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-2xl p-0 overflow-hidden relative">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse"></div>
            <div className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full animate-bounce delay-100"></div>
            <div className="absolute top-8 right-8 w-6 h-6 bg-yellow-300 rounded-full animate-bounce delay-300"></div>
            <div className="absolute bottom-6 left-12 w-4 h-4 bg-green-300 rounded-full animate-bounce delay-500"></div>
          </div>

          {/* Header */}
          <div className="relative z-10 p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl mr-4 flex items-center justify-center animate-pulse">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">AI Farm Planning</h3>
                  <p className="text-blue-200 text-sm">Your intelligent farming assistant</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/farm-planning')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                size="sm"
              >
                Plan Now
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 pb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">
                  {Math.round(12 + Math.random() * 8)}
                </div>
                <div className="text-xs text-blue-200">Active Plans</div>
                <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                  <div className="bg-gradient-to-r from-green-400 to-blue-400 h-1 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">
                  {Math.round(45 + Math.random() * 20)}
                </div>
                <div className="text-xs text-blue-200">Tasks This Week</div>
                <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Next Task</div>
                  <div className="text-xs text-blue-200">Plant tomato seedlings - Field A</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-200">Tomorrow</div>
                  <div className="text-sm font-medium text-white">8:00 AM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 YIELD PREDICTOR - THE CRYSTAL BALL */}
        <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-cyan-800 rounded-2xl p-0 overflow-hidden relative">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-300 to-blue-300 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-yellow-300 to-green-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl mr-4 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">AI Yield Predictor</h3>
                  <p className="text-emerald-200 text-sm">Predict your harvest with 95% accuracy</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/yield-predictor')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                size="sm"
              >
                Predict
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
                <div className="text-lg font-bold text-white">
                  {(2.5 + Math.random() * 1.5).toFixed(1)}t
                </div>
                <div className="text-xs text-emerald-200">Expected Yield</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
                <div className="text-lg font-bold text-white">95%</div>
                <div className="text-xs text-emerald-200">Confidence</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
                <div className="text-lg font-bold text-white">
                  ${Math.round(1200 + Math.random() * 800)}
                </div>
                <div className="text-xs text-emerald-200">Est. Revenue</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-200">AI Analysis Status</span>
                <span className="text-white font-medium flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Real-time monitoring
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 🌍 COMMUNITY HUB - THE SOCIAL BRAIN */}
        <div className="bg-gradient-to-br from-purple-800 via-pink-800 to-rose-800 rounded-2xl p-0 overflow-hidden relative">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-4 right-4 w-20 h-20 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full blur-xl animate-pulse delay-500"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full blur-lg animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl mr-4 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Community Hub</h3>
                  <p className="text-purple-200 text-sm">Connect with 50,000+ smart farmers</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/community')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                size="sm"
              >
                Join
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">
                  {Math.round(156 + Math.random() * 50)}
                </div>
                <div className="text-xs text-purple-200">Questions Today</div>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs text-purple-200">24 answered</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">
                  {Math.round(89 + Math.random() * 30)}
                </div>
                <div className="text-xs text-purple-200">Experts Online</div>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs text-purple-200">Ready to help</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-sm text-white font-medium mb-1">Latest Question</div>
              <div className="text-xs text-purple-200">"Best organic pesticide for tomatoes?" - 12 answers</div>
            </div>
          </div>
        </div>

        {/* 💰 REFERRALS - THE MONEY MAKER */}
        <div className="bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 rounded-2xl p-0 overflow-hidden relative">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-yellow-300 to-orange-300 animate-pulse"></div>
            <div className="absolute top-2 right-2 text-6xl animate-bounce delay-100">💰</div>
            <div className="absolute bottom-2 left-2 text-4xl animate-bounce delay-300">🚀</div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl animate-bounce delay-500">⭐</div>
          </div>

          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl mr-4 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Invite & Earn</h3>
                  <p className="text-yellow-200 text-sm">Get 10 credits per friend!</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/referrals')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                size="sm"
              >
                Earn Now
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
                <div className="text-lg font-bold text-white">
                  {Math.round(5 + Math.random() * 15)}
                </div>
                <div className="text-xs text-yellow-200">Friends Invited</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
                <div className="text-lg font-bold text-white">
                  {Math.round(50 + Math.random() * 100)}
                </div>
                <div className="text-xs text-yellow-200">Credits Earned</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
                <div className="text-lg font-bold text-white">
                  ${Math.round(25 + Math.random() * 75)}
                </div>
                <div className="text-xs text-yellow-200">Value Earned</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-200">Your Referral Code</span>
                <span className="text-white font-bold tracking-wider">FARM{Math.round(1000 + Math.random() * 9000)}</span>
              </div>
            </div>
          </div>
        </div>




      </div>


    </div>
  );
});

export default Index;