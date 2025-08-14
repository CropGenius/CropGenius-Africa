/**
 * 🔥 INTELLIGENCE DASHBOARD - ULTRA SIMPLE SMART FARMING HUB
 * Traditional wisdom + Weather intelligence + Market intelligence
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Brain, Cloud, TrendingUp, Leaf, DollarSign, Clock } from 'lucide-react';
import { ethnoScienceEngine, TraditionalPractice } from '../../services/EthnoScienceEngine';
import { weatherActionEngine, WeatherAction } from '../../services/WeatherActionEngine';
import { marketIntelligenceEngine, MarketOpportunity } from '../../services/MarketIntelligenceEngine';

interface IntelligenceDashboardProps {
  crop?: string;
  region?: string;
}

export const IntelligenceDashboard: React.FC<IntelligenceDashboardProps> = ({ 
  crop = 'tomatoes', 
  region = 'East Africa' 
}) => {
  const [traditionalPractices, setTraditionalPractices] = useState<TraditionalPractice[]>([]);
  const [weatherActions, setWeatherActions] = useState<WeatherAction[]>([]);
  const [marketOpportunities, setMarketOpportunities] = useState<MarketOpportunity[]>([]);

  useEffect(() => {
    loadIntelligence();
  }, [crop, region]);

  const loadIntelligence = () => {
    // Load traditional practices
    const practices = ethnoScienceEngine.getRecommendations(crop, region);
    setTraditionalPractices(practices);

    // Load weather actions (mock weather data)
    const actions = weatherActionEngine.getWeatherActions(28, 75, 5);
    setWeatherActions(actions);

    // Load market opportunities
    const opportunities = marketIntelligenceEngine.getTopOpportunities();
    setMarketOpportunities(opportunities);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Intelligence Dashboard
            </span>
          </CardTitle>
          <p className="text-gray-600">
            🧠 Ancient wisdom + Modern AI for maximum farming intelligence
          </p>
        </CardHeader>
      </Card>

      {/* Intelligence Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Traditional Wisdom */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Leaf className="h-5 w-5" />
              Ancient Wisdom
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {traditionalPractices.map(practice => (
                <div key={practice.id} className="p-3 bg-white rounded-lg shadow-sm">
                  <h4 className="font-bold text-gray-800 text-sm">{practice.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{practice.region}</p>
                  <p className="text-sm text-gray-700">{practice.practice}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {practice.effectiveness}% effective
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weather Intelligence */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Cloud className="h-5 w-5" />
              Weather Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weatherActions.map(action => (
                <div key={action.id} className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-800 text-sm">{action.action}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      action.urgency === 'high' ? 'bg-red-100 text-red-800' :
                      action.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {action.urgency.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mb-1">{action.weatherCondition}</p>
                  <p className="text-sm text-gray-700">{action.reason}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-600">{action.timing}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Intelligence */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <TrendingUp className="h-5 w-5" />
              Market Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketOpportunities.map((opportunity, index) => (
                <div key={index} className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-800 text-sm">{opportunity.crop}</h4>
                    <span className="text-lg font-bold text-green-600">
                      +${opportunity.profit}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{opportunity.action}</p>
                  <p className="text-xs text-gray-600">{opportunity.reason}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <DollarSign className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">Per 100kg profit</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800">🚀 Intelligence-Powered Actions</h3>
              <p className="text-sm text-gray-600">
                {traditionalPractices.length + weatherActions.length + marketOpportunities.length} smart recommendations ready
              </p>
            </div>
            <Button onClick={loadIntelligence} className="bg-purple-600 hover:bg-purple-700">
              <Brain className="h-4 w-4 mr-2" />
              Refresh Intelligence
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};