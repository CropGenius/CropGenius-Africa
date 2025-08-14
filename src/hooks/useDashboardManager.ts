/**
 * 🎯 DASHBOARD MANAGER HOOK - FLAWLESS SIMPLICITY
 * Seamless integration between DashboardDataManager and React components
 * BULLETPROOF - No error handling cancer, just works
 */

import { useState, useEffect, useCallback } from 'react';
import { dashboardDataManager, DashboardState } from '@/services/DashboardDataManager';
import { personalizationEngine } from '@/services/PersonalizationEngine';

export const useDashboardManager = (userId?: string) => {
  const [state, setState] = useState<DashboardState>(dashboardDataManager.getState());
  const [greeting, setGreeting] = useState<string>('Loading...');
  const [todaysAction, setTodaysAction] = useState<any>(null);
  const [farmHealthData, setFarmHealthData] = useState<any>(null);

  // Subscribe to dashboard state changes
  useEffect(() => {
    const unsubscribe = dashboardDataManager.subscribe((newState) => {
      setState(newState);
      
      // Update personalized content when state changes
      if (newState.user) {
        setGreeting(personalizationEngine.generateGreeting(newState.user));
      }
      
      if (newState.weather || newState.fields.length > 0) {
        setTodaysAction(personalizationEngine.generateTodaysAction(newState.weather, newState.fields));
        setFarmHealthData(personalizationEngine.calculateFarmHealth(newState.fields, newState.weather));
      }
    });

    return unsubscribe;
  }, []);

  // Initialize dashboard when userId is available
  useEffect(() => {
    if (userId && !state.user) {
      dashboardDataManager.initializeDashboard(userId);
    }
  }, [userId, state.user]);

  // Refresh data function - BULLETPROOF
  const refreshData = useCallback(async () => {
    await dashboardDataManager.refreshAllData();
  }, []);

  // Get time-based greeting
  const getTimeBasedGreeting = useCallback(() => {
    return personalizationEngine.generateGreeting(state.user);
  }, [state.user]);

  return {
    // Core state
    ...state,
    
    // Personalized content
    greeting,
    todaysAction,
    farmHealthData,
    
    // Actions
    refreshData,
    getTimeBasedGreeting,
    
    // Computed values
    hasFields: state.fields.length > 0,
    totalFields: state.fields.length,
    locationName: state.location?.city || state.location?.address || 'Loading location...',
    weatherSummary: state.weather ? 
      `${Math.round(state.weather.temperatureCelsius)}°C ${state.weather.weatherDescription}` : 
      'Loading weather...',
    
    // Status flags
    isInitialized: !!state.user && !!state.location,
    hasWeatherData: !!state.weather,
    hasLocationData: !!state.location
  };
};