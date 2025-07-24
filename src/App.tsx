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
import { useErrorHandler } from './utils/errorHandling';
import { GlassmorphismProvider } from './components/ui/GlassmorphismProvider';
import ZeroErrorAppWrapper from './components/app/ZeroErrorAppWrapper';
import './App.css';

function App() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  
  useEffect(() => {
    // Setup offline persistence
    setupOfflinePersistence(queryClient);
    
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
      handleError(new Error(event.reason), { 
        context: 'unhandledPromiseRejection',
        component: 'App' 
      });
      event.preventDefault();
    };
    
    // Global error handler for JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global JavaScript error:', event.error);
      handleError(event.error || new Error(event.message), {
        context: 'globalJavaScriptError',
        component: 'App',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);
    
    return () => {
      unsubscribe();
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, [queryClient, handleError]);
  
  return (
    <ZeroErrorAppWrapper>
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
    </ZeroErrorAppWrapper>
  );
}

export default App;