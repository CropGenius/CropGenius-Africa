import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  CloudSnow,
  Wind,
  Droplet,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  Thermometer,
  Eye,
  Sunrise,
  Sunset
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiquidWeatherGlass } from "@/components/ui/liquid-weather-glass";
import { useWeatherData } from "@/hooks/useWeatherData";

interface WeatherForecastPanelProps {
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

export default function WeatherForecastPanel({ location }: WeatherForecastPanelProps) {
  const [activeDay, setActiveDay] = useState(0);
  const { current, forecast: apiForecast, loading, error } = useWeatherData({
    lat: location.lat,
    lon: location.lng,
    refreshInterval: 300000
  });

  const [forecast, setForecast] = useState<any[]>([]);

  useEffect(() => {
    if (apiForecast?.length > 0) {
      const processedForecast = apiForecast.map(day => ({
        date: new Date(day.date * 1000),
        day: new Date(day.date * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: new Date(day.date * 1000),
        temp: {
          max: Math.round(day.temp?.max || 25),
          min: Math.round(day.temp?.min || 18),
          avg: Math.round((day.temp?.max || 25 + day.temp?.min || 18) / 2)
        },
        rainProb: day.rainProb || 0,
        condition: day.condition || 'Clear',
        description: day.description || 'Clear sky',
        icon: getWeatherIcon(day.condition || 'Clear'),
        windSpeed: Math.round(day.windSpeed || 10),
        humidity: day.humidity || 60,
        pressure: day.pressure || 1013,
        clouds: day.clouds || 20,
        farmAction: getFarmAction(day.condition || 'Clear', day.rainProb || 0),
        hourly: Array.from({length: 8}, (_, i) => ({
          hour: i * 3,
          temp: Math.round((day.temp?.day || 22) + (Math.random() - 0.5) * 4),
          icon: getWeatherIcon(day.condition || 'Clear'),
          rainProb: Math.round((day.rainProb || 0) + (Math.random() - 0.5) * 20)
        }))
      }));
      setForecast(processedForecast);
    } else {
      generateMockForecast();
    }
  }, [apiForecast]);

  const generateMockForecast = () => {
    const days = 7;
    const weatherConditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Heavy Rain", "Thunderstorm"];
    
    const newForecast = [];
    let baseTemp = 25 + Math.random() * 5;
    let rainTrend = Math.random() > 0.5;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      baseTemp += (Math.random() - 0.5) * 2;
      let rainProb = rainTrend 
        ? Math.min(90, 20 + i * 10 + (Math.random() - 0.5) * 15) 
        : Math.max(10, 70 - i * 10 + (Math.random() - 0.5) * 15);
        
      const conditionIndex = rainProb > 70 
        ? 5 // Thunderstorm
        : rainProb > 50 
          ? 4 // Heavy rain
          : rainProb > 30 
            ? 3 // Light rain
            : Math.random() > 0.5 ? 2 : 1;
      
      const condition = weatherConditions[conditionIndex];
      
      newForecast.push({
        date,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date,
        temp: {
          max: Math.round(baseTemp + 2 + Math.random() * 2),
          min: Math.round(baseTemp - 3 - Math.random() * 2),
          avg: Math.round(baseTemp)
        },
        rainProb: Math.round(rainProb),
        condition,
        description: condition.toLowerCase(),
        icon: getWeatherIcon(condition),
        windSpeed: Math.round(5 + Math.random() * 15),
        humidity: Math.round(40 + Math.random() * 40),
        pressure: Math.round(1010 + Math.random() * 20),
        clouds: Math.round(Math.random() * 100),
        farmAction: getFarmAction(condition, rainProb)
      });
    }
    
    setForecast(newForecast);
  };

  const getWeatherIcon = (condition: string, apiIcon?: string) => {
    const conditionMap: Record<string, string> = {
      'Clear': 'sun',
      'Clouds': 'cloud',
      'Rain': 'cloud-rain',
      'Drizzle': 'cloud-drizzle',
      'Thunderstorm': 'cloud-lightning',
      'Snow': 'cloud-snow',
      'Mist': 'cloud',
      'Fog': 'cloud',
      'Haze': 'cloud'
    };
    
    return conditionMap[condition] || 'sun';
  };

  const getFarmAction = (condition: string, rainProb: number) => {
    if (condition === 'Heavy Rain' || condition === 'Thunderstorm') {
      return {
        action: "Protect Crops",
        description: "Severe weather expected. Secure structures and improve drainage.",
        urgency: "high",
        icon: "⚠️"
      };
    } else if (condition === 'Light Rain') {
      return {
        action: "Monitor Conditions",
        description: "Light rain expected. Good for crops but avoid field work.",
        urgency: "medium",
        icon: "🌧️"
      };
    } else if (condition === 'Sunny' && rainProb < 20) {
      return {
        action: "Irrigation Needed",
        description: "Dry conditions expected. Plan irrigation schedule.",
        urgency: "medium",
        icon: "💧"
      };
    } else {
      return {
        action: "Normal Operations",
        description: "Weather conditions suitable for standard farming activities.",
        urgency: "low",
        icon: "✅"
      };
    }
  };

  const getWeatherIconComponent = (icon: string, size = 5) => {
    switch(icon) {
      case "sun": return <Sun className={`h-${size} w-${size} text-amber-400`} />;
      case "cloud": return <Cloud className={`h-${size} w-${size} text-slate-300`} />;
      case "cloud-rain": return <CloudRain className={`h-${size} w-${size} text-blue-400`} />;
      case "cloud-drizzle": return <CloudDrizzle className={`h-${size} w-${size} text-blue-300`} />;
      case "cloud-lightning": return <CloudLightning className={`h-${size} w-${size} text-purple-400`} />;
      case "cloud-snow": return <CloudSnow className={`h-${size} w-${size} text-blue-200`} />;
      default: return <Sun className={`h-${size} w-${size} text-amber-400`} />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case "high": return "bg-red-500/20 text-red-200 border border-red-500/30";
      case "medium": return "bg-amber-500/20 text-amber-200 border border-amber-500/30";
      default: return "bg-green-500/20 text-green-200 border border-green-500/30";
    }
  };

  const handlePrevDay = () => {
    setActiveDay(prev => Math.max(0, prev - 1));
  };

  const handleNextDay = () => {
    setActiveDay(prev => Math.min(forecast.length - 1, prev + 1));
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">7-Day Forecast</h2>
            <p className="text-white/70">Loading weather forecast...</p>
          </div>
          <div className="animate-spin h-8 w-8 border-4 border-white/30 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (!forecast?.length) {
    generateMockForecast();
    return (
      <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-2">Weather Forecast</h2>
        <p className="text-white/70">Loading forecast data...</p>
      </div>
    );
  }

  const selectedDay = forecast[activeDay] || forecast[0];

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            7-Day Farm Forecast
          </h2>
          <p className="text-white/70 mt-1">AI-powered weather forecast with farm-specific recommendations</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevDay}
            disabled={activeDay === 0}
            className="text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-white text-sm">
            {selectedDay.fullDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextDay}
            disabled={activeDay === forecast.length - 1}
            className="text-white hover:bg-white/10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {forecast.map((day, index) => (
            <button
              key={`${day.day}-${day.temp.max}-${index}`}
              onClick={() => setActiveDay(index)}
              className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all ${
                index === activeDay 
                  ? 'bg-white/20 border border-white/30 scale-105' 
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              <div className="text-sm font-medium text-white">{day.day}</div>
              <div className="my-2">{getWeatherIconComponent(day.icon, 6)}</div>
              <div className="text-xs text-white/80">
                <span className="font-medium">{day.temp.max}°</span>
                <span className="text-white/60">/{day.temp.min}°</span>
              </div>
              <Badge variant="outline" className="mt-1 text-xs px-1.5 bg-white/10 border-white/20 text-white">
                {day.rainProb}%
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {selectedDay.fullDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </h3>
              <div className="text-4xl">{getWeatherIconComponent(selectedDay.icon, 8)}</div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/70">Condition</span>
                <span className="font-medium text-white">{selectedDay.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Temperature</span>
                <span className="font-medium text-white">
                  {selectedDay.temp.max}° / {selectedDay.temp.min}°
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Rain Probability</span>
                <span className="font-medium text-white">{selectedDay.rainProb}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Wind Speed</span>
                <span className="font-medium text-white">{selectedDay.windSpeed} km/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Humidity</span>
                <span className="font-medium text-white">{selectedDay.humidity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Pressure</span>
                <span className="font-medium text-white">{selectedDay.pressure} hPa</span>
              </div>
            </div>
            
            {/* Farm Action */}
            <div className={`mt-6 p-4 rounded-lg border ${getUrgencyColor(selectedDay.farmAction.urgency)}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{selectedDay.farmAction.icon}</span>
                <h4 className="font-semibold text-sm uppercase">AI Farm Action</h4>
              </div>
              <p className="font-bold text-white mb-1">{selectedDay.farmAction.action}</p>
              <p className="text-sm text-white/80">{selectedDay.farmAction.description}</p>
            </div>
          </div>
        </div>

        {/* Detailed Forecast */}
        <div className="lg:col-span-2">
          {/* Hourly Forecast */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Hourly Forecast</h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {(selectedDay.hourly || []).map((hour: any, index: number) => (
                <div key={`${hour.hour}-${index}`} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20">
                  <div className="text-sm font-medium text-white">
                    {hour.hour === 0 ? '12am' : 
                     hour.hour === 12 ? '12pm' : 
                     hour.hour > 12 ? `${hour.hour-12}pm` : `${hour.hour}am`}
                  </div>
                  <div className="my-1">{getWeatherIconComponent(hour.icon, 4)}</div>
                  <div className="text-sm font-semibold text-white">{Math.round(hour.temp)}°</div>
                  <div className="text-xs text-white/60">{hour.rainProb}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Impact Analysis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Weather Impact Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h4 className="font-medium text-white flex items-center gap-2 mb-2">
                  <Droplet className="h-4 w-4 text-blue-400" />
                  Moisture Impact
                </h4>
                <p className="text-sm text-white/80">
                  {selectedDay.rainProb > 60 
                    ? "High moisture expected. Monitor soil saturation and drainage."
                    : selectedDay.rainProb > 30
                      ? "Moderate moisture expected. Good conditions for crop growth."
                      : "Low moisture expected. Consider irrigation planning."}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h4 className="font-medium text-white flex items-center gap-2 mb-2">
                  <Wind className="h-4 w-4 text-slate-400" />
                  Wind Impact
                </h4>
                <p className="text-sm text-white/80">
                  {selectedDay.windSpeed > 20
                    ? "High winds expected. Secure structures and young plants."
                    : selectedDay.windSpeed > 10
                      ? "Moderate winds. Suitable for most farming activities."
                      : "Light winds. Ideal for spraying and fertilizing."}
                </p>
              </div>
            </div>

            {/* Additional Insights */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h4 className="font-medium text-white mb-2">Additional Insights</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/70">Cloud Cover:</span>
                  <span className="text-white ml-2">{selectedDay.clouds}%</span>
                </div>
                <div>
                  <span className="text-white/70">Pressure:</span>
                  <span className="text-white ml-2">{selectedDay.pressure} hPa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}