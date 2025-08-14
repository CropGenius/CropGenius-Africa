
/**
 * 🌦️ WEATHER INTELLIGENCE WIDGET - Farming-Focused Forecasts
 * Agricultural weather insights with actionable recommendations
 */

import React, { useState, useEffect } from 'react';
import { useWeatherData } from '@/hooks/useWeatherData';
import { supabase } from '@/integrations/supabase/client';
import { Field } from '@/types/field';

export const WeatherSummaryWidget = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [userField, setUserField] = useState<Field | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user's primary field for personalized weather
  useEffect(() => {
    const loadUserField = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthenticated(false);
        return;
      }
      
      setIsAuthenticated(true);
      const { data } = await supabase
        .from('fields')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (data && data.length > 0) {
        setUserField(data[0]);
      }
    };
    loadUserField();
  }, []);

  // Use user's field location or default agricultural region
  const { current, forecast, loading, error } = useWeatherData({
    lat: userField?.latitude || userField?.location?.coordinates?.[1] || -0.2827,
    lon: userField?.longitude || userField?.location?.coordinates?.[0] || 34.7519,
    refreshInterval: 300000
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return null;
  }

  // Generate REAL agricultural insights based on weather conditions and field data
  const generateFarmingInsights = () => {
    if (!current) return { 
      irrigationNeeded: null, 
      plantingConditions: 'unknown', 
      pestRisk: 'unknown', 
      recommendations: ['Weather data unavailable - check connection'] 
    };

    const temp = current.temperature;
    const humidity = current.humidity;
    const windSpeed = current.windSpeed;
    const fieldName = userField?.name || 'your field';
    const fieldSize = userField?.size ? `${userField.size} ${userField.size_unit}` : '';

    // Enhanced agricultural intelligence with field context
    const irrigationNeeded = temp > 30 && humidity < 40;

    let plantingConditions = 'poor';
    if (temp >= 18 && temp <= 28 && humidity >= 50 && humidity <= 80) {
      plantingConditions = 'excellent';
    } else if (temp >= 15 && temp <= 32 && humidity >= 40) {
      plantingConditions = 'good';
    } else if (temp >= 10 && temp <= 35) {
      plantingConditions = 'fair';
    }

    let pestRisk = 'low';
    if (humidity > 80 && temp > 20) {
      pestRisk = 'high';
    } else if (humidity > 70 && temp > 25) {
      pestRisk = 'medium';
    }

    const recommendations = [];
    
    if (irrigationNeeded) {
      recommendations.push(`💧 Irrigation recommended for ${fieldName}${fieldSize ? ` (${fieldSize})` : ''} - ${temp}°C with ${humidity}% humidity`);
    }
    
    if (pestRisk === 'high') {
      recommendations.push(`🐛 High fungal disease risk at ${fieldName} - ${humidity}% humidity creates ideal conditions`);
    }
    
    if (plantingConditions === 'excellent') {
      recommendations.push(`🌱 Perfect planting conditions at ${fieldName} - optimal temperature and humidity`);
    }
    
    if (windSpeed > 15) {
      recommendations.push(`💨 Strong winds (${windSpeed}km/h) - secure structures and delay spraying at ${fieldName}`);
    }
    
    if (temp > 35) {
      recommendations.push(`🌡️ Heat stress alert for ${fieldName} - provide shade and increase irrigation`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push(`✅ Normal conditions at ${fieldName} - continue regular farming activities`);
    }

    return { irrigationNeeded, plantingConditions, pestRisk, recommendations };
  };

  const farmingInsights = generateFarmingInsights();

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('rain')) return '🌧️';
    if (lower.includes('cloud')) return '☁️';
    if (lower.includes('sun') || lower.includes('clear')) return '☀️';
    if (lower.includes('storm')) return '⛈️';
    return '🌤️';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Field Context Header */}
      {userField && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌾</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">{userField.name}</p>
              <p className="text-xs text-gray-600">
                {userField.size} {userField.size_unit} • Weather Intelligence
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="flex bg-gray-50">
        {[
          { key: 'current', label: 'Current', icon: '🌡️' },
          { key: 'forecast', label: 'Forecast', icon: '📅' },
          { key: 'insights', label: 'Insights', icon: '🧠' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-3 px-2 text-sm font-medium transition-all ${activeTab === tab.key
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* Current Weather */}
        {activeTab === 'current' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-2">{getWeatherIcon(current?.condition || '')}</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">
                {Math.round(current?.temperature || 0)}°C
              </h3>
              <p className="text-gray-600">{current?.condition || 'Loading...'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">💧</div>
                <p className="text-sm text-gray-600">Humidity</p>
                <p className="text-lg font-bold text-blue-600">{Math.round(current?.humidity || 0)}%</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">💨</div>
                <p className="text-sm text-gray-600">Wind Speed</p>
                <p className="text-lg font-bold text-green-600">{Math.round(current?.windSpeed || 0)} km/h</p>
              </div>
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {activeTab === 'forecast' && (
          <div className="space-y-3">
            {forecast?.slice(0, 5).map((day, index) => (
              <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getWeatherIcon(day.condition)}</span>
                  <div>
                    <p className="font-medium text-gray-800">
                      {index === 0 ? 'Today' : new Date(day.date * 1000).toLocaleDateString('en', { weekday: 'short' })}
                    </p>
                    <p className="text-sm text-gray-600">{day.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{Math.round(day.temp.max)}°/{Math.round(day.temp.min)}°</p>
                  <p className="text-sm text-blue-600">{Math.round(day.rainProb)}% rain</p>
                </div>
              </div>
            )) || (
                <div className="text-center py-4 text-gray-500">
                  <p>Forecast data loading...</p>
                </div>
              )}
          </div>
        )}

        {/* Farming Insights */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            {/* Status Indicators */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center ${farmingInsights.irrigationNeeded ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                  <span className="text-2xl">💧</span>
                </div>
                <p className="text-xs text-gray-600">Irrigation</p>
                <p className={`text-sm font-bold ${farmingInsights.irrigationNeeded ? 'text-red-600' : 'text-green-600'
                  }`}>
                  {farmingInsights.irrigationNeeded ? 'Needed' : 'Not Needed'}
                </p>
              </div>

              <div className="text-center">
                <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center ${farmingInsights.plantingConditions === 'excellent' ? 'bg-green-100' :
                    farmingInsights.plantingConditions === 'good' ? 'bg-blue-100' :
                      farmingInsights.plantingConditions === 'fair' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                  <span className="text-2xl">🌱</span>
                </div>
                <p className="text-xs text-gray-600">Planting</p>
                <p className={`text-sm font-bold ${farmingInsights.plantingConditions === 'excellent' ? 'text-green-600' :
                    farmingInsights.plantingConditions === 'good' ? 'text-blue-600' :
                      farmingInsights.plantingConditions === 'fair' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                  {farmingInsights.plantingConditions}
                </p>
              </div>

              <div className="text-center">
                <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center ${farmingInsights.pestRisk === 'high' ? 'bg-red-100' :
                    farmingInsights.pestRisk === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                  <span className="text-2xl">🐛</span>
                </div>
                <p className="text-xs text-gray-600">Pest Risk</p>
                <p className={`text-sm font-bold ${farmingInsights.pestRisk === 'high' ? 'text-red-600' :
                    farmingInsights.pestRisk === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                  {farmingInsights.pestRisk}
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
              <h4 className="font-bold text-gray-800 mb-3">🎯 This Week's Recommendations</h4>
              <div className="space-y-2">
                {farmingInsights.recommendations.length > 0 ? farmingInsights.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{rec}</p>
                  </div>
                )) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">Analyzing weather conditions for recommendations...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};