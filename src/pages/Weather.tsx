
/**
 * 🔥💪 WEATHER PAGE - INFINITY GOD MODE ACTIVATED!
 * REAL weather intelligence with REAL APIs and REAL agricultural insights
 * Built for 100 million African farmers with ZERO tolerance for fake data!
 */

import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import {
  Cloud,
  MapPin,
  RefreshCw,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  WifiOff
} from "lucide-react";

// 🚀 PRODUCTION-READY COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';

// 🔥 REAL WEATHER COMPONENTS
import WeatherIntelligenceDashboard from '@/components/weather/WeatherIntelligenceDashboard';
import { WeatherIntelligenceWidget } from '@/components/mobile/WeatherIntelligenceWidget';

// 🚀 INFINITY IQ HOOKS AND SERVICES
import { useWeather } from '@/hooks/useWeather';
import { useAuthContext } from '@/providers/AuthProvider';
import { useErrorHandler } from '@/utils/errorHandling';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { PageErrorBoundary, WidgetErrorBoundary } from '@/components/error/EnhancedErrorBoundary';
import { OfflineWrapper } from '@/components/offline/OfflineWrapper';


/**
 * 🔥 INFINITY GOD MODE WEATHER PAGE
 * Real weather intelligence with military-grade accuracy
 */
const Weather: React.FC = () => {
  const { user } = useAuthContext();
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  
  // 🚀 REAL WEATHER HOOK
  const {
    weather,
    isLoading,
    error,
    loadWeather,
    refreshWeather,
    clearError
  } = useWeather();

  // 🔥 STATE MANAGEMENT
  const [location, setLocation] = useState({ 
    lat: -1.2921, 
    lng: 36.8219, 
    name: "Nairobi, Kenya" 
  });
  const [cropTypes, setCropTypes] = useState(['maize', 'beans', 'tomato']);
  const [refreshing, setRefreshing] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // 🚀 GET USER LOCATION
  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported', {
        description: 'Your browser does not support location services'
      });
      return;
    }

    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: "Your Location"
        };
        
        setLocation(newLocation);
        await loadWeather(newLocation, cropTypes);
        setLocationLoading(false);
        
        toast.success('Location updated!', {
          description: 'Weather data loaded for your current location'
        });
      },
      (error) => {
        setLocationLoading(false);
        handleError(error, { 
          component: 'Weather',
          operation: 'getUserLocation' 
        });
        
        toast.error('Location access denied', {
          description: 'Using default location instead'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // 🔥 REFRESH WEATHER DATA
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshWeather();
    setRefreshing(false);
  };

  // 🚀 LOAD INITIAL DATA
  useEffect(() => {
    if (user) {
      loadWeather(location, cropTypes);
    }
  }, [user, loadWeather]);

  // 🔥 AUTO-REFRESH EVERY 30 MINUTES
  useEffect(() => {
    if (!user || !isOnline) return;

    const interval = setInterval(() => {
      refreshWeather();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [user, isOnline, refreshWeather]);

  return (
    <PageErrorBoundary errorBoundaryId="weather-page">
      <div className="container py-6 space-y-6">
        
        {/* 🔥 HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              Weather Intelligence
            </h1>
            <p className="text-muted-foreground mt-1">
              Real AI-powered weather intelligence for optimized farming decisions
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Badge variant="outline" className="flex items-center gap-1 py-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {location.name}
            </Badge>
            
            <Badge variant="outline" className={isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
            
            <Button
              onClick={getUserLocation}
              disabled={locationLoading}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <MapPin className={`h-4 w-4 ${locationLoading ? 'animate-pulse' : ''}`} />
              {locationLoading ? 'Locating...' : 'Use My Location'}
            </Button>
            
            <Button
              onClick={handleRefresh}
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

        {/* 🚀 ERROR STATE */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Weather Data Error</AlertTitle>
            <AlertDescription>
              {error}
              <Button
                onClick={clearError}
                variant="outline"
                size="sm"
                className="mt-2 mr-2"
              >
                Dismiss
              </Button>
              <Button
                onClick={() => loadWeather(location, cropTypes)}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 🔥 LOADING STATE */}
        {isLoading && (
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

        {/* 🚀 OFFLINE WRAPPER */}
        <OfflineWrapper 
          fallback={
            <Alert>
              <WifiOff className="h-4 w-4" />
              <AlertTitle>Offline Mode</AlertTitle>
              <AlertDescription>
                Weather intelligence requires an internet connection. Showing cached data if available.
              </AlertDescription>
            </Alert>
          }
        >
          {/* 🔥 WEATHER INTELLIGENCE WIDGET */}
          <WidgetErrorBoundary errorBoundaryId="weather-intelligence-widget">
            <WeatherIntelligenceWidget />
          </WidgetErrorBoundary>

          {/* 🚀 MAIN WEATHER DASHBOARD */}
          <WidgetErrorBoundary errorBoundaryId="weather-intelligence-dashboard">
            <WeatherIntelligenceDashboard
              location={location}
              cropTypes={cropTypes}
              onLocationChange={(newLocation) => {
                setLocation(newLocation);
                loadWeather(newLocation, cropTypes);
              }}
            />
          </WidgetErrorBoundary>
        </OfflineWrapper>
      </div>
    </PageErrorBoundary>
  );
};

export default Weather;
