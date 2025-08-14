/**
 * 🌤️ UNIFIED WEATHER DATA HOOK - Single Source of Truth
 * Production-ready weather hook using UnifiedWeatherService
 */

import { useState, useEffect } from 'react';
import { weatherService, WeatherData, WeatherForecast } from '@/services/UnifiedWeatherService';
import { geolocationService } from '@/services/GeolocationService';

export interface UseWeatherDataProps {
  lat?: number;
  lon?: number;
  units?: 'metric' | 'imperial';
  refreshInterval?: number;
}

export interface UseWeatherDataReturn {
  current: WeatherData | null;
  forecast: WeatherForecast[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  dataSource?: 'api' | 'cache' | 'demo';
}

export function useWeatherData({
  lat,
  lon,
  units = 'metric',
  refreshInterval = 300000 // 5 minutes
}: UseWeatherDataProps): UseWeatherDataReturn {
  const [current, setCurrent] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'cache' | 'demo'>('demo');

  const fetchWeatherData = async () => {
    let finalLat = lat;
    let finalLon = lon;

    // No coordinates? Get user's REAL location
    if (!lat || !lon) {
      console.log('🌍 No coordinates provided, getting real user location...');
      const location = await geolocationService.getCurrentLocation();
      finalLat = location.lat;
      finalLon = location.lon;
      console.log(`🌍 Using ${location.source} location: ${finalLat}, ${finalLon}`);
    }

    console.log(`🌤️ Fetching REAL weather for ${finalLat}, ${finalLon}`);
    setLoading(true);
    setError(null); // Clear any previous errors

    // This NEVER fails - the service always returns data
    const weatherData = await weatherService.getWeatherByCoordinates(finalLat!, finalLon!);
    
    console.log('🎯 Weather data received:', {
      current: weatherData.current ? 'YES' : 'NO',
      forecast: weatherData.forecast ? weatherData.forecast.length : 0,
      dataSource: weatherData.dataSource
    });
    
    setCurrent(weatherData.current);
    setForecast(weatherData.forecast);
    setDataSource(weatherData.dataSource);
    setLoading(false);
    
    console.log(`✅ Weather data loaded from ${weatherData.dataSource}`);
  };

  useEffect(() => {
    fetchWeatherData();

    // Set up refresh interval
    const interval = setInterval(() => {
      fetchWeatherData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [lat, lon, units, refreshInterval]);

  const refetch = () => {
    // Clear cache for this location using UnifiedWeatherService
    weatherService.clearCache(lat, lon);
    fetchWeatherData();
  };

  return {
    current,
    forecast,
    loading,
    error,
    refetch,
    dataSource
  };
}