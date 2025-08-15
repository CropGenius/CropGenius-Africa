import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  CreditCard,
  Users,
  Calendar,
  MessageSquare,
  HelpCircle,
  Settings,
  Wifi,
  Scan,
  TrendingUp,
  BarChart3,
  Target,
  Sparkles
} from 'lucide-react';

import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

const More = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [userStats, setUserStats] = useState({ credits: 0, farms: 0, scans: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      // Get user credits
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      // Get user farms count
      const { count: farmsCount } = await supabase
        .from('farms')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get user scans count
      const { count: scansCount } = await supabase
        .from('crop_scans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setUserStats({
        credits: profile?.credits || 0,
        farms: farmsCount || 0,
        scans: scansCount || 0
      });
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      icon: User,
      label: 'Profile & Settings',
      path: '/settings',
      description: 'Manage your account',
      category: 'account'
    },
    {
      icon: CreditCard,
      label: 'Credit Balance',
      path: '/credits',
      description: `${userStats.credits} credits available`,
      category: 'account',
      badge: userStats.credits > 0 ? userStats.credits.toString() : undefined
    },
    {
      icon: Calendar,
      label: 'Farm Planning',
      path: '/farm-planning',
      description: 'AI-powered farm plans',
      category: 'farming',
      isNew: true
    },
    {
      icon: MessageSquare,
      label: 'Community Hub',
      path: '/community',
      description: 'Connect with farmers',
      category: 'social',
      isNew: true
    },
    {
      icon: Scan,
      label: 'Crop Disease Detection',
      path: '/crop-disease-detection',
      description: 'AI disease diagnosis',
      category: 'farming',
      badge: userStats.scans > 0 ? `${userStats.scans} scans` : undefined
    },
    {
      icon: TrendingUp,
      label: 'Yield Predictor',
      path: '/yield-predictor',
      description: 'Predict your harvest',
      category: 'farming'
    },
    {
      icon: BarChart3,
      label: 'Market Insights',
      path: '/market-insights',
      description: 'Real-time market data',
      category: 'market'
    },
    {
      icon: Target,
      label: 'Mission Control',
      path: '/mission-control',
      description: 'Farm management hub',
      category: 'farming'
    },
    {
      icon: Users,
      label: 'Referrals',
      path: '/referrals',
      description: 'Invite friends & earn',
      category: 'account'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      path: '/help',
      description: 'Get assistance',
      category: 'support'
    }
  ];

  const categories = {
    farming: { label: 'Farming Tools', icon: Sparkles, color: 'text-green-600' },
    market: { label: 'Market Intelligence', icon: BarChart3, color: 'text-blue-600' },
    social: { label: 'Community', icon: Users, color: 'text-purple-600' },
    account: { label: 'Account', icon: User, color: 'text-gray-600' },
    support: { label: 'Support', icon: HelpCircle, color: 'text-orange-600' }
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">More Options</h1>
        <p className="text-gray-600 mt-1">Explore all CropGenius features</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => {
            const categoryInfo = categories[category as keyof typeof categories];
            return (
              <div key={category}>
                <div className="flex items-center mb-3">
                  <categoryInfo.icon className={`h-5 w-5 mr-2 ${categoryInfo.color}`} />
                  <h2 className="text-lg font-semibold text-gray-800">{categoryInfo.label}</h2>
                </div>
                <div className="space-y-3">
                  {items.map(({ icon: Icon, label, path, description, badge, isNew }) => (
                    <Card
                      key={path}
                      className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                      onClick={() => navigate(path)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm border">
                              <Icon className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{label}</span>
                                {isNew && (
                                  <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5">
                                    New
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-0.5">{description}</p>
                            </div>
                          </div>
                          {badge && (
                            <Badge variant="outline" className="text-xs">
                              {badge}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}


    </div>
  );
};

export default More;