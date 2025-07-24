/**
 * 🚀 CROPGENIUS APP - Trillion-Dollar Entry Point
 * iPhone 20 Pro level app with glassmorphism magic + offline intelligence
 * 🛡️ ZERO ERROR TOLERANCE - NO PURPLE SCREENS EVER!
 */

import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import { setupOfflinePersistence, OfflineManager } from './lib/offlineStorage';
import AppRoutes from './AppRoutes';
import PKCEDebugDashboard from './components/auth/PKCEDebugDashboard';
import { CriticalErrorBoundary } from './components/error/EnhancedErrorBoundary';
import { CriticalErrorFallback } from './components/fallback/ErrorFallbacks';
import ProductionErrorBoundary from './components/error/ProductionErrorBoundary';
import { useErrorHandler } from './utils/errorHandling';
import { GlassmorphismProvider } from './components/ui/GlassmorphismProvider';
import ZeroErrorAppWrapper from './components/app/ZeroErrorAppWrapper';
import './App.css';

function App() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  
  useEffect(() => {
    // Setup offline persistence (safely)
    try {
      setupOfflinePersistence(queryClient);
      console.log('✅ [App] Offline persistence setup complete');
    } catch (error) {
      console.warn('Failed to setup offline persistence:', error);
    }
    
    // Setup offline manager
    const offlineManager = OfflineManager.getInstance();
    
    const unsubscribe = offlineManager.subscribe((isOnline) => {
      if (isOnline) {
        queryClient.refetchQueries();
        console.log('🟢 Back online - syncing data...');
      } else {
        console.log('🔴 Offline mode - using cached data');
      }
    });
    
    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      try {
        handleError(new Error(event.reason), { 
          context: 'unhandledPromiseRejection',
          component: 'App' 
        });
      } catch (handlerError) {
        console.error('Error in rejection handler:', handlerError);
      }
      event.preventDefault();
    };
    
    // Global error handler for JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global JavaScript error:', event.error);
      try {
        handleError(event.error || new Error(event.message), {
          context: 'globalJavaScriptError',
          component: 'App',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      } catch (handlerError) {
        console.error('Error in global error handler:', handlerError);
      }
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);
    
    return () => {
      try {
        unsubscribe();
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        window.removeEventListener('error', handleGlobalError);
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
    };
  }, [queryClient, handleError]);
  
  return (
    <ZeroErrorAppWrapper>
      <ProductionErrorBoundary>
        <CriticalErrorBoundary
          errorBoundaryId="app-root"
          fallback={(error, reset) => <CriticalErrorFallback error={error} reset={reset} />}
          onError={(error, errorInfo) => {
            console.error('Critical app error:', error, errorInfo);
            // Additional critical error handling can go here
          }}
        >
          <GlassmorphismProvider
            config={{
              enabled: true,
              intensity: 'medium',
              theme: 'auto'
            }}
          >
            <BrowserRouter>
              <div className="App min-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
                <AppRoutes />
                {/* 🔥 INFINITY IQ PKCE DEBUG DASHBOARD - DEVELOPMENT ONLY */}
                {process.env.NODE_ENV === 'development' && <PKCEDebugDashboard />}
              </div>
            </BrowserRouter>
          </GlassmorphismProvider>
        </CriticalErrorBoundary>
      </ProductionErrorBoundary>
    </ZeroErrorAppWrapper>
  );
}

export default App;