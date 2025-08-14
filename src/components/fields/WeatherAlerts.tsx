import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, Droplets, Wind, Sun } from 'lucide-react';
import { useWeatherData } from '@/hooks/useWeatherData';

const WeatherAlerts: React.FC = () => {
  const { current } = useWeatherData({
    lat: -1.2921,
    lon: 36.8219,
    refreshInterval: 300000
  });

  if (!current) return null;

  // CRITICAL DECISIONS
  const sprayDecision = () => {
    const rainProb = current.rainProb || (current.humidity > 80 ? 60 : 20);
    if (current.windSpeed > 15) return { action: "NO SPRAY", reason: "High winds", color: "red", icon: Wind };
    if (rainProb > 30) return { action: "NO SPRAY", reason: "Rain expected", color: "red", icon: Droplets };
    if (current.windSpeed < 8) return { action: "SPRAY NOW", reason: "Perfect conditions", color: "green", icon: CheckCircle };
    return { action: "CAUTION", reason: "Marginal winds", color: "yellow", icon: AlertTriangle };
  };

  const irrigationDecision = () => {
    if (current.humidity < 40) return { action: "IRRIGATE", reason: "Low humidity", color: "blue", icon: Droplets };
    if (current.humidity > 80) return { action: "HOLD", reason: "High humidity", color: "green", icon: CheckCircle };
    return { action: "MONITOR", reason: "Normal humidity", color: "gray", icon: Clock };
  };

  const harvestAlert = () => {
    const rainProb = current.rainProb || (current.humidity > 80 ? 60 : 20);
    if (rainProb > 60) return { action: "HARVEST TODAY", reason: "Storm incoming", color: "red", icon: AlertTriangle };
    if (current.windSpeed > 20) return { action: "HARVEST TODAY", reason: "High winds", color: "red", icon: AlertTriangle };
    return { action: "CONDITIONS GOOD", reason: "Safe to harvest", color: "green", icon: CheckCircle };
  };

  const spray = sprayDecision();
  const irrigate = irrigationDecision();
  const harvest = harvestAlert();
  
  // Calculate rain probability for display
  const rainProb = current.humidity > 80 ? 60 : 20;

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">🧠 AI Farm Intelligence</h3>
        <p className="text-sm text-gray-600">Real-time decisions based on current weather</p>
      </div>

      <Card className={`border-l-4 ${
        spray.color === 'red' ? 'border-red-500 bg-red-50' :
        spray.color === 'green' ? 'border-green-500 bg-green-50' :
        'border-yellow-500 bg-yellow-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <spray.icon className={`h-6 w-6 ${
              spray.color === 'red' ? 'text-red-600' :
              spray.color === 'green' ? 'text-green-600' :
              'text-yellow-600'
            }`} />
            <div className="flex-1">
              <p className={`text-lg font-bold ${
                spray.color === 'red' ? 'text-red-800' :
                spray.color === 'green' ? 'text-green-800' :
                'text-yellow-800'
              }`}>{spray.action}</p>
              <p className="text-sm text-gray-600">{spray.reason}</p>
              <div className="text-xs text-gray-500 mt-1">
                Wind: {current.windSpeed}km/h • Humidity: {current.humidity}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`border-l-4 ${
        irrigate.color === 'blue' ? 'border-blue-500 bg-blue-50' :
        irrigate.color === 'green' ? 'border-green-500 bg-green-50' :
        'border-gray-500 bg-gray-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <irrigate.icon className={`h-6 w-6 ${
              irrigate.color === 'blue' ? 'text-blue-600' :
              irrigate.color === 'green' ? 'text-green-600' :
              'text-gray-600'
            }`} />
            <div className="flex-1">
              <p className={`text-lg font-bold ${
                irrigate.color === 'blue' ? 'text-blue-800' :
                irrigate.color === 'green' ? 'text-green-800' :
                'text-gray-800'
              }`}>{irrigate.action}</p>
              <p className="text-sm text-gray-600">{irrigate.reason}</p>
              <div className="text-xs text-gray-500 mt-1">
                Temperature: {current.temperature}°C • Humidity: {current.humidity}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`border-l-4 ${
        harvest.color === 'red' ? 'border-red-500 bg-red-50' :
        'border-green-500 bg-green-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <harvest.icon className={`h-6 w-6 ${
              harvest.color === 'red' ? 'text-red-600' : 'text-green-600'
            }`} />
            <div className="flex-1">
              <p className={`text-lg font-bold ${
                harvest.color === 'red' ? 'text-red-800' : 'text-green-800'
              }`}>{harvest.action}</p>
              <p className="text-sm text-gray-600">{harvest.reason}</p>
              <div className="text-xs text-gray-500 mt-1">
                Wind: {current.windSpeed}km/h • Rain Risk: {rainProb}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">
          ⚡ Powered by CropGenius AI • Updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default WeatherAlerts;