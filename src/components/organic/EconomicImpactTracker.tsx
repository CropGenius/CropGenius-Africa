/**
 * 🔥 ECONOMIC IMPACT TRACKER - ULTRA SIMPLE MONEY MOTIVATION
 * Show farmers exactly how much they're saving - pure dopamine
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { DollarSign, TrendingUp, Coins } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useSimpleAuthContext as useAuth } from '@/providers/SimpleAuthProvider';

interface EconomicStats {
  totalSavings: number;
  monthlyAverage: number;
  bestMonth: number;
}

export const EconomicImpactTracker: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<EconomicStats>({ totalSavings: 0, monthlyAverage: 0, bestMonth: 0 });

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('organic_superpowers_history')
        .select('cost_savings, completed_at')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (!data) return;

      const totalSavings = data.reduce((sum, item) => sum + (item.cost_savings || 0), 0);
      const monthlyAverage = totalSavings / Math.max(1, data.length / 30);
      const bestMonth = Math.max(...data.map(item => item.cost_savings || 0));

      setStats({ totalSavings, monthlyAverage, bestMonth });
    } catch (error) {
      console.error('Failed to load economic stats:', error);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">${stats.totalSavings}</div>
            <div className="text-xs text-gray-600">Total Saved</div>
          </div>
          
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">${Math.round(stats.monthlyAverage)}</div>
            <div className="text-xs text-gray-600">Monthly Avg</div>
          </div>
          
          <div className="text-center">
            <Coins className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-600">${stats.bestMonth}</div>
            <div className="text-xs text-gray-600">Best Action</div>
          </div>
        </div>
        

      </CardContent>
    </Card>
  );
};