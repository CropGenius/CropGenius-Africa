/**
 * 🔥💪 WEATHER INTELLIGENCE DASHBOARD - INFINITY GOD MODE ACTIVATED!
 * REAL weather intelligence with REAL APIs and REAL agricultural insights
 * Built for 100 million African farmers with ZERO tolerance for fake data!
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplet,
  ThermometerSun,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  RefreshCw,
  Zap,
  Leaf,
  Tractor,
  Target,
  Activity,
  BarChart3,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  Info,
  Eye,
  Download,
  Share2
} from 'lucide-react';

// 🚀 PRODUCTION-READY COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// 🔥 REAL WEATHER INTELLIGENCE ENGINE
import { WeatherIntelligenceEngine } from '@/services/weatherIntelligence';
import { useAuthContext } from '@/providers/AuthProvider';
import { useErrorHandler } from '@/utils/errorHandling';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { PageErrorBoundary, WidgetErrorBoundary } from '@/components/error/EnhancedErrorBoundary';
import { OfflineWrapper } from '@/components/offline/OfflineWrapper';

interface WeatherIntelligenceDashboardProps {
  location?: { lat: number; lng: number; name?: string };
  cropTypes?: string[];
  onLocationChange?: (location: { lat: number; lng: number }) => void;
  className?: string;
}

interface WeatherState {
  forecast: any[];
  farmingInsights: any;
  alerts: string[];
  yieldPredictions: any[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * 🔥 INFINITY GOD MODE WEATHER INTELLIGENCE DASHBOARD
 * Real weather intelligence with military-grade accuracy
 */
export const WeatherIntelligenceDashboard: React.FC<WeatherIntelligenceDashboardProps> = ({
  location = { lat: -1.2921, lng: 36.8219, name: 'Nairobi, Kenya' },
  cropTypes = ['maize', 'beans', 'tomato'],
  onLocationChange,
  className = ''
}) => {
  const { user } = useAuthContext();
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();

  // 🚀 STATE MANAGEMENT
  const [weather, setWeather] = useState<WeatherState>({
    forecast: [],
    farmingInsights: null,
    alerts: [],
    yieldPredictions: [],
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [weatherEngine] = useState(() => new WeatherIntelligenceEngine());

  // 🔥 LOAD REAL WEATHER DATA
  const loadWeatherData = useCallback(async (showLoading = true) => {
    if (!isOnline) {
      setWeather(prev => ({
        ...prev,
        error: 'Internet connection required for weather data',
        isLoading: false
      }));
      return;
    }

    try {
      if (showLoading) {
        setWeather(prev => ({ ...prev, isLoading: true, error: null }));
      }

      // 🚀 REAL API CALL - NO FAKE DATA!
      const weatherData = await weatherEngine.getFarmingForecast(location, cropTypes);

      setWeather({
        forecast: weatherData.forecast,
        farmingInsights: weatherData.farmingInsights,
        alerts: weatherData.alerts,
        yieldPredictions: weatherData.yieldPredictions,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      });

      if (!showLoading) {
        toast.success('Weather data updated!', {
          description: 'Latest agricultural intelligence loaded'
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load weather data';

      setWeather(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      handleError(error as Error, {
        component: 'WeatherIntelligenceDashboard',
        operation: 'loadWeatherData',
        location,
        cropTypes
      });

      toast.error('Weather Update Failed', {
        description: errorMessage
      });
    }
  }, [location, cropTypes, isOnline, weatherEngine, handleError]);

  // 🚀 REFRESH WEATHER DATA
  const refreshWeatherData = useCallback(async () => {
    setRefreshing(true);
    await loadWeatherData(false);
    setRefreshing(false);
  }, [loadWeatherData]);

  // 🔥 LOAD DATA ON MOUNT AND LOCATION CHANGE
  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  // 🚀 AUTO-REFRESH EVERY 30 MINUTES
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline) {
        refreshWeatherData();
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [refreshWeatherData, isOnline]);

  // 🔥 GET WEATHER ICON
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
      case 'sunny': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'clouds':
      case 'cloudy': return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'rain':
      case 'drizzle': return <CloudRain className="h-6 w-6 text-blue-500" />;
      default: return <Cloud className="h-6 w-6 text-gray-500" />;
    }
  };

  // 🚀 GET ALERT SEVERITY COLOR
  const getAlertSeverity = (alert: string) => {
    if (alert.includes('CRITICAL') || alert.includes('URGENT')) return 'destructive';
    if (alert.includes('ALERT') || alert.includes('WARNING')) return 'default';
    return 'secondary';
  };

  // 🔥 FORMAT DATE
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // 🚀 FORMAT TIME
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PageErrorBoundary errorBoundaryId="weather-intelligence-dashboard">
      <div className={`space-y-6 ${className}`}>

        {/* 🔥 HEADER */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Cloud className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Weather Intelligence</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {location.name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                    {weather.lastUpdated && (
                      <>
                        <span>•</span>
                        <span>Updated {formatTime(weather.lastUpdated)}</span>
                      </>
                    )}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                  {isOnline ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Offline
                    </>
                  )}
                </Badge>

                <Button
                  onClick={refreshWeatherData}
                  disabled={refreshing || !isOnline}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Updating...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 🚀 ERROR STATE */}
        {weather.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Weather Data Error</AlertTitle>
            <AlertDescription>
              {weather.error}
              <Button
                onClick={() => loadWeatherData()}
                variant="outline"
                size="sm"
                className="mt-2 gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 🔥 LOADING STATE */}
        {weather.isLoading && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-2">Loading Weather Intelligence</h3>
              <p className="text-muted-foreground">
                Analyzing hyperlocal conditions and agricultural impacts...
              </p>
            </CardContent>
          </Card>
        )}

        {/* 🚀 WEATHER ALERTS */}
        {weather.alerts.length > 0 && !weather.isLoading && (
          <div className="space-y-3">
            {weather.alerts.map((alert, index) => (
              <Alert key={index} variant={getAlertSeverity(alert)}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Weather Alert</AlertTitle>
                <AlertDescription>{alert}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* 🔥 MAIN CONTENT */}
        {!weather.isLoading && !weather.error && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
              <TabsTrigger value="insights">Farm Insights</TabsTrigger>
              <TabsTrigger value="yield">Yield Predictions</TabsTrigger>
            </TabsList>

            {/* 🚀 OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-4">

              {/* Current Weather */}
              {weather.forecast.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <ThermometerSun className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Temperature</p>
                          <p className="text-2xl font-bold">
                            {Math.round((weather.forecast[0].temperature.min + weather.forecast[0].temperature.max) / 2)}°C
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Droplet className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Humidity</p>
                          <p className="text-2xl font-bold">{weather.forecast[0].humidity}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <CloudRain className="h-5 w-5 text-cyan-600" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Rainfall</p>
                          <p className="text-2xl font-bold">{Math.round(weather.forecast[0].rainfall)}mm</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Wind className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Wind Speed</p>
                          <p className="text-2xl font-bold">{Math.round(weather.forecast[0].windSpeed)}m/s</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Quick Insights */}
              {weather.farmingInsights && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-green-600" />
                        Soil Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {weather.farmingInsights.soilConditions && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Moisture Level</span>
                            <Badge variant="outline">
                              {weather.farmingInsights.soilConditions.moisture}%
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Temperature</span>
                            <Badge variant="outline">
                              {weather.farmingInsights.soilConditions.temperature}°C
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Workability</span>
                            <Badge
                              variant="outline"
                              className={
                                weather.farmingInsights.soilConditions.workability === 'excellent' ? 'bg-green-50 text-green-700 border-green-200' :
                                  weather.farmingInsights.soilConditions.workability === 'good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    weather.farmingInsights.soilConditions.workability === 'fair' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                      'bg-red-50 text-red-700 border-red-200'
                              }
                            >
                              {weather.farmingInsights.soilConditions.workability.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-600" />
                        Pest Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {weather.farmingInsights.pestRisk && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Risk Level</span>
                            <Badge
                              variant="outline"
                              className={
                                weather.farmingInsights.pestRisk.level === 'low' ? 'bg-green-50 text-green-700 border-green-200' :
                                  weather.farmingInsights.pestRisk.level === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    weather.farmingInsights.pestRisk.level === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                      'bg-red-50 text-red-700 border-red-200'
                              }
                            >
                              {weather.farmingInsights.pestRisk.level.toUpperCase()}
                            </Badge>
                          </div>
                          {weather.farmingInsights.pestRisk.pests.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Potential Pests:</p>
                              <div className="flex flex-wrap gap-1">
                                {weather.farmingInsights.pestRisk.pests.slice(0, 3).map((pest: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {pest}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* 🔥 FORECAST TAB */}
            <TabsContent value="forecast" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {weather.forecast.map((day, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 text-center">
                      <p className="font-medium text-sm mb-2">{formatDate(day.date)}</p>
                      <div className="mb-3">
                        {getWeatherIcon(day.condition)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-bold">
                          {Math.round(day.temperature.max)}° / {Math.round(day.temperature.min)}°
                        </p>
                        <p className="text-xs text-muted-foreground">{day.condition}</p>
                        <div className="flex items-center justify-center space-x-1 text-xs text-blue-600">
                          <Droplet className="h-3 w-3" />
                          <span>{Math.round(day.rainfall)}mm</span>
                        </div>
                        <div className="flex items-center justify-center space-x-1 text-xs text-gray-600">
                          <Wind className="h-3 w-3" />
                          <span>{Math.round(day.windSpeed)}m/s</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* 🚀 FARM INSIGHTS TAB */}
            <TabsContent value="insights" className="space-y-4">
              {weather.farmingInsights && (
                <div className="space-y-6">

                  {/* Planting Recommendations */}
                  {weather.farmingInsights.plantingRecommendations?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <Leaf className="h-5 w-5 text-green-600" />
                          Planting Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {weather.farmingInsights.plantingRecommendations.map((rec: any, index: number) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{rec.crop}</h4>
                                <Badge variant="outline">
                                  {rec.confidence}% confidence
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{rec.reasoning}</p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>Optimal Date: {formatDate(rec.optimalDate)}</span>
                                <span>•</span>
                                <span>Soil: {rec.soilCondition}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Irrigation Schedule */}
                  {weather.farmingInsights.irrigationSchedule && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <Droplet className="h-5 w-5 text-blue-600" />
                          Irrigation Schedule
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Next Irrigation</p>
                            <p className="font-semibold">{weather.farmingInsights.irrigationSchedule.nextIrrigation}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Amount Needed</p>
                            <p className="font-semibold">{weather.farmingInsights.irrigationSchedule.amount}mm</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Frequency</p>
                            <p className="font-semibold">{weather.farmingInsights.irrigationSchedule.frequency}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Method</p>
                            <p className="font-semibold">{weather.farmingInsights.irrigationSchedule.method}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Field Work Windows */}
                  {weather.farmingInsights.fieldWorkWindows?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <Tractor className="h-5 w-5 text-orange-600" />
                          Field Work Opportunities
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {weather.farmingInsights.fieldWorkWindows.slice(0, 5).map((window: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{window.activity}</p>
                                <p className="text-xs text-muted-foreground">{window.conditions}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="mb-1">
                                  Priority {window.priority}/10
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(window.window.start)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* 🔥 YIELD PREDICTIONS TAB */}
            <TabsContent value="yield" className="space-y-4">
              {weather.yieldPredictions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weather.yieldPredictions.map((prediction, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg capitalize">{prediction.crop}</CardTitle>
                          <Badge variant="outline">
                            {prediction.confidence}% confidence
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-center">
                            <p className="text-3xl font-bold text-green-600">
                              {prediction.estimatedYield.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">kg/hectare</p>
                          </div>

                          <div className="flex items-center justify-center">
                            <Badge
                              variant="outline"
                              className={
                                prediction.weatherImpact > 0 ? 'bg-green-50 text-green-700 border-green-200' :
                                  prediction.weatherImpact < 0 ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-gray-50 text-gray-700 border-gray-200'
                              }
                            >
                              {prediction.weatherImpact > 0 ? '+' : ''}{prediction.weatherImpact}% weather impact
                            </Badge>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-2">Key Factors:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {prediction.factors.slice(0, 3).map((factor: string, factorIndex: number) => (
                                <li key={factorIndex}>• {factor}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Yield Predictions Available</h3>
                    <p className="text-muted-foreground">
                      Yield predictions will appear here once weather analysis is complete
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* 🚀 ACTION BUTTONS */}
        {!weather.isLoading && !weather.error && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Insights
                </Button>
                <Button variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  View Historical Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageErrorBoundary>
  );
};

export default WeatherIntelligenceDashboard;