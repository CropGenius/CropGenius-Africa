/**
 * 🌦️ WEATHER INTELLIGENCE WIDGET - Farming-Focused Forecasts
 * Agricultural weather insights with actionable recommendations
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWeatherForecast } from '@/hooks/useBackendIntelligence';
import { WeatherWidgetLoader, ErrorState, EmptyState } from './LoadingStates';

interface WeatherData {
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    rainChance: number;
    icon: string;
  }>;
  farmingInsights: {
    irrigationNeeded: boolean;
    plantingConditions: 'excellent' | 'good' | 'fair' | 'poor';
    pestRisk: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
}

export const WeatherIntelligenceWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'forecast' | 'insights'>('current');
  
  // Backend Intelligence Hook
  const { data: weatherResponse, isLoading, error, refetch } = useWeatherForecast(-1.286389, 36.817223);
  
  // Transform backend data
  const weatherData = useMemo(() => {
    if (!weatherResponse?.data) return null;
    
    const { current, forecast, insights } = weatherResponse.data;
    
    return {
      current: {
        temperature: Math.round(current.temperatureCelsius),
        condition: current.weatherDescription,
        humidity: current.humidityPercent,
        windSpeed: Math.round(current.windSpeedMps * 3.6), // Convert m/s to km/h
        icon: getWeatherIcon(current.weatherMain)
      },
      forecast: forecast.list?.slice(0, 5).map((item: any, index: number) => ({
        day: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : new Date(item.timestamp).toLocaleDateString('en', { weekday: 'short' }),
        high: Math.round(item.temperatureCelsius),
        low: Math.round(item.temperatureCelsius - 5), // Approximate low
        condition: item.weatherDescription,
        rainChance: Math.round((item.rainLastHourMm || 0) * 10),
        icon: getWeatherIcon(item.weatherMain)
      })) || [],
      farmingInsights: {
        irrigationNeeded: insights.irrigation_needed || false,
        plantingConditions: insights.planting_conditions || 'good',
        pestRisk: insights.pest_disease_risk || 'low',
        recommendations: insights.alerts || [
          'Weather data updated',
          'Monitor conditions regularly',
          'Check back for updates'
        ]
      }
    };
  }, [weatherResponse]);
  
  // Helper function to get weather icons
  const getWeatherIcon = (condition: string) => {
    const icons: Record<string, string> = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '🌨️',
      'Mist': '🌫️'
    };
    return icons[condition] || '⛅';
  };

  if (isLoading) {
    return <WeatherWidgetLoader />;
  }
  
  if (error) {
    return (
      <ErrorState
        message="Failed to load weather data. Check your connection."
        onRetry={() => refetch()}
        icon="🌦️"
      />
    );
  }
  
  if (!weatherData) {
    return (
      <EmptyState
        title="Weather Unavailable"
        description="Weather data is currently unavailable for your location."
        actionLabel="🔄 Retry"
        onAction={() => refetch()}
        icon="🌤️"
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
            className={`flex-1 py-3 px-2 text-sm font-medium transition-all ${
              activeTab === tab.key
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
        {activeTab === 'current' && weatherData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center">
              <div className="text-6xl mb-2">{weatherData.current.icon}</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">
                {weatherData.current.temperature}°C
              </h3>
              <p className="text-gray-600">{weatherData.current.condition}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">💧</div>
                <p className="text-sm text-gray-600">Humidity</p>
                <p className="text-lg font-bold text-blue-600">{weatherData.current.humidity}%</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">💨</div>
                <p className="text-sm text-gray-600">Wind Speed</p>
                <p className="text-lg font-bold text-green-600">{weatherData.current.windSpeed} km/h</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 5-Day Forecast */}
        {activeTab === 'forecast' && weatherData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {weatherData.forecast.map((day, index) => (
              <div key={day.day} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{day.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800">{day.day}</p>
                    <p className="text-sm text-gray-600">{day.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{day.high}°/{day.low}°</p>
                  <p className="text-sm text-blue-600">{day.rainChance}% rain</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Farming Insights */}
        {activeTab === 'insights' && weatherData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Status Indicators */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                  weatherData.farmingInsights.irrigationNeeded ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  <span className="text-2xl">💧</span>
                </div>
                <p className="text-xs text-gray-600">Irrigation</p>
                <p className={`text-sm font-bold ${
                  weatherData.farmingInsights.irrigationNeeded ? 'text-red-600' : 'text-green-600'
                }`}>
                  {weatherData.farmingInsights.irrigationNeeded ? 'Needed' : 'Not Needed'}
                </p>
              </div>

              <div className="text-center">
                <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                  weatherData.farmingInsights.plantingConditions === 'excellent' ? 'bg-green-100' :
                  weatherData.farmingInsights.plantingConditions === 'good' ? 'bg-blue-100' :
                  weatherData.farmingInsights.plantingConditions === 'fair' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <span className="text-2xl">🌱</span>
                </div>
                <p className="text-xs text-gray-600">Planting</p>
                <p className={`text-sm font-bold ${
                  weatherData.farmingInsights.plantingConditions === 'excellent' ? 'text-green-600' :
                  weatherData.farmingInsights.plantingConditions === 'good' ? 'text-blue-600' :
                  weatherData.farmingInsights.plantingConditions === 'fair' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {weatherData.farmingInsights.plantingConditions}
                </p>
              </div>

              <div className="text-center">
                <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                  weatherData.farmingInsights.pestRisk === 'high' ? 'bg-red-100' :
                  weatherData.farmingInsights.pestRisk === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <span className="text-2xl">🐛</span>
                </div>
                <p className="text-xs text-gray-600">Pest Risk</p>
                <p className={`text-sm font-bold ${
                  weatherData.farmingInsights.pestRisk === 'high' ? 'text-red-600' :
                  weatherData.farmingInsights.pestRisk === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {weatherData.farmingInsights.pestRisk}
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
              <h4 className="font-bold text-gray-800 mb-3">🎯 This Week's Recommendations</h4>
              <div className="space-y-2">
                {weatherData.farmingInsights.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};