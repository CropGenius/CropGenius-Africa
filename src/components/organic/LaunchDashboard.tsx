/**
 * 🔥 LAUNCH DASHBOARD - ULTRA SIMPLE BILLION-DOLLAR MISSION CONTROL
 * Monitor the Organic Intelligence Weapon deployment
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Rocket, 
  Users, 
  DollarSign, 
  Globe, 
  TrendingUp, 
  Target,
  Zap,
  Trophy,
  Share2,
  CheckCircle
} from 'lucide-react';
import { launchEngine } from '../../services/LaunchEngine';

export const LaunchDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState(launchEngine.getLaunchMetrics());
  const [milestones, setMilestones] = useState(launchEngine.getLaunchMilestones());
  const [projection, setProjection] = useState(launchEngine.projectGrowth(12));
  const [readiness, setReadiness] = useState(launchEngine.getLaunchReadiness());

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(launchEngine.getLaunchMetrics());
      setMilestones(launchEngine.getLaunchMilestones());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLaunch = () => {
    const announcement = launchEngine.generateLaunchAnnouncement();
    
    // Copy to clipboard for sharing
    navigator.clipboard.writeText(announcement);
    alert('🚀 LAUNCH ANNOUNCEMENT COPIED! Share everywhere!');
  };

  const completedMilestones = milestones.filter(m => m.achieved).length;
  const totalMilestones = milestones.length;

  return (
    <div className="space-y-6">
      {/* Launch Header */}
      <Card className="bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 border-orange-300 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Rocket className="h-20 w-20 text-orange-600 animate-bounce" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            ORGANIC INTELLIGENCE WEAPON
          </CardTitle>
          <p className="text-xl text-gray-700 font-bold">
            🎯 MISSION: Transform 100M Farmers Into Organic Masters
          </p>
          <div className="mt-4">
            <div className="text-4xl font-bold text-green-600 mb-2">{readiness}%</div>
            <div className="text-sm text-gray-600">Launch Readiness</div>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
              <div 
                className="bg-green-600 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${readiness}%` }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Real-Time Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">{metrics.totalUsers.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Total Farmers</div>
            <div className="text-xs text-green-600 mt-1">+{launchEngine.getGrowthRate()}% monthly</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">${(metrics.revenue / 1000).toFixed(0)}K</div>
            <div className="text-xs text-gray-600">Monthly Revenue</div>
            <div className="text-xs text-blue-600 mt-1">${(metrics.revenue * 12 / 1000).toFixed(0)}K ARR</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">${(metrics.savings / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-gray-600">Farmer Savings</div>
            <div className="text-xs text-green-600 mt-1">$500 avg/farmer</div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">{metrics.countries}</div>
            <div className="text-xs text-gray-600">Countries</div>
            <div className="text-xs text-blue-600 mt-1">{metrics.languages} languages</div>
          </CardContent>
        </Card>
      </div>

      {/* Launch Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Launch Milestones ({completedMilestones}/{totalMilestones})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map(milestone => (
              <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {milestone.achieved ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                  )}
                  <div>
                    <div className="font-bold text-gray-800">{milestone.name}</div>
                    <div className="text-sm text-gray-600">{milestone.reward}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-800">
                    {milestone.current.toLocaleString()} / {milestone.target.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {Math.round((milestone.current / milestone.target) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 12-Month Projection */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            12-Month Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{(projection.totalUsers / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-gray-600">Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">${(projection.revenue * 12 / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-gray-600">ARR</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">${(projection.savings / 1000000).toFixed(0)}M</div>
              <div className="text-sm text-gray-600">Farmer Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{projection.countries}</div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Launch Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-6 text-center">
            <Rocket className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Ready to Launch!</h3>
            <p className="text-gray-600 mb-4">
              All systems operational. Deploy to 100M farmers now!
            </p>
            <Button 
              onClick={handleLaunch}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6"
            >
              <Rocket className="h-5 w-5 mr-2" />
              LAUNCH NOW!
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <Share2 className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Viral Launch</h3>
            <p className="text-gray-600 mb-4">
              Share the revolution with farmers worldwide!
            </p>
            <div className="space-y-2">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Share2 className="h-4 w-4 mr-2" />
                WhatsApp Farmers
              </Button>
              <Button variant="outline" className="w-full">
                <Globe className="h-4 w-4 mr-2" />
                Social Media Blast
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300">
        <CardContent className="text-center py-8">
          <Zap className="h-16 w-16 mx-auto mb-4 text-yellow-600 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🎉 THE ORGANIC INTELLIGENCE WEAPON IS OPERATIONAL! 🎉
          </h2>
          <p className="text-gray-700 text-lg mb-4">
            Ready to transform 100M farmers into organic masters and generate billions in value!
          </p>
          <div className="text-sm text-gray-600">
            💰 Projected Impact: $10B+ farmer savings • $1B+ company valuation • 100M+ lives transformed
          </div>
        </CardContent>
      </Card>
    </div>
  );
};