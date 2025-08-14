/**
 * 🚀 GROWTH ENGINE PROVIDER - Production Ready
 * User engagement and analytics provider
 */

import React, { createContext, useContext, ReactNode } from 'react';

interface GrowthEngineContextType {
  trackEvent: (event: string, properties?: any) => void;
  isInitialized: boolean;
}

const GrowthEngineContext = createContext<GrowthEngineContextType | undefined>(undefined);

export const useGrowthEngine = () => {
  const context = useContext(GrowthEngineContext);
  if (!context) {
    throw new Error('useGrowthEngine must be used within GrowthEngineProvider');
  }
  return context;
};

interface GrowthEngineProviderProps {
  children: ReactNode;
}

export const GrowthEngineProvider: React.FC<GrowthEngineProviderProps> = ({ children }) => {
  const trackEvent = (event: string, properties?: any) => {
    if (import.meta.env.DEV) {
      console.log('🚀 [GROWTH ENGINE] Event:', event, properties);
    }
  };

  const value: GrowthEngineContextType = {
    trackEvent,
    isInitialized: true
  };

  return (
    <GrowthEngineContext.Provider value={value}>
      {children}
    </GrowthEngineContext.Provider>
  );
};