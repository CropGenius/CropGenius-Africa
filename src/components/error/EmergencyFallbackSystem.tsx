/**
 * 🚨 EMERGENCY FALLBACK SYSTEM
 * -------------------------------------------------------------
 * ZERO-TOLERANCE system for blank pages, purple screens, or any error displays
 * - Intercepts ALL possible error states
 * - Provides immediate fallback UI
 * - Never shows blank/colored screens
 * - Always keeps the app functional
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  RefreshCw, 
  Home, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  Activity,
  Shield,
  Zap,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface EmergencyFallbackProps {
  error?: Error | null;
  errorInfo?: any;
  children?: React.ReactNode;
  onRecover?: () => void;
}

/**
 * EMERGENCY FALLBACK - Never shows blank/purple screens
 */
export const EmergencyFallback: React.FC<EmergencyFallbackProps> = ({
  error,
  errorInfo,
  onRecover
}) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-recovery mechanism
  const handleRecovery = useCallback(async () => {
    if (recoveryAttempts >= 3) {
      toast.error('Maximum recovery attempts reached. Redirecting to home...');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      return;
    }

    setIsRecovering(true);
    setRecoveryAttempts(prev => prev + 1);

    try {
      // Clear any problematic state
      localStorage.removeItem('cropgenius_error_state');
      sessionStorage.clear();
      
      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onRecover) {
        onRecover();
      } else {
        // Force page reload as last resort
        window.location.reload();
      }
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
      // Force redirect to home
      window.location.href = '/';
    } finally {
      setIsRecovering(false);
    }
  }, [recoveryAttempts, onRecover]);

  // Auto-recovery on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (recoveryAttempts === 0) {
        handleRecovery();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [handleRecovery, recoveryAttempts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-green-200 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              CropGenius Recovery
            </CardTitle>
            <p className="text-gray-600 mt-2">
              We're getting things back on track for you
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Status indicators */}
            <div className="flex items-center justify-center space-x-4">
              <Badge variant="outline" className={isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Shield className="h-3 w-3 mr-1" />
                Protected
              </Badge>
            </div>

            {/* Recovery status */}
            <div className="text-center">
              {isRecovering ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-blue-600 font-medium">
                      Recovering... (Attempt {recoveryAttempts}/3)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(recoveryAttempts / 3) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">
                      System Ready
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Error details (if any) */}
            {error && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Technical Details
                </summary>
                <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                  <p><strong>Error:</strong> {error.message}</p>
                  <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
                  {errorInfo && (
                    <p><strong>Component:</strong> {errorInfo.componentStack?.split('\n')[1]?.trim()}</p>
                  )}
                </div>
              </details>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleRecovery}
                disabled={isRecovering}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                size="lg"
              >
                {isRecovering ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Recovering...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Recover Now
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>

            {/* Reassurance message */}
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-800 font-medium">
                Your farm data is safe and secure
              </p>
              <p className="text-xs text-green-700 mt-1">
                CropGenius automatically protects your information
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

/**
 * GLOBAL ERROR INTERCEPTOR - Catches ALL errors before they can show blank screens
 */
export class GlobalErrorInterceptor {
  private static instance: GlobalErrorInterceptor;
  private errorHandlers: Set<(error: Error, errorInfo?: any) => void> = new Set();
  private isActive = false;

  static getInstance(): GlobalErrorInterceptor {
    if (!GlobalErrorInterceptor.instance) {
      GlobalErrorInterceptor.instance = new GlobalErrorInterceptor();
    }
    return GlobalErrorInterceptor.instance;
  }

  activate(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 [EmergencyFallback] Unhandled promise rejection:', event.reason);
      this.handleError(new Error(event.reason?.message || 'Unhandled promise rejection'));
      event.preventDefault();
    });

    // Catch JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('🚨 [EmergencyFallback] JavaScript error:', event.error);
      this.handleError(event.error || new Error(event.message));
      event.preventDefault();
    });

    // Catch React errors (additional safety net)
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('React') || message.includes('component') || message.includes('render')) {
        this.handleError(new Error(message));
      }
      originalConsoleError.apply(console, args);
    };

    // Monitor for blank/colored screens
    this.monitorForBlankScreens();
    
    console.log('🛡️ [EmergencyFallback] Global error interceptor activated');
  }

  private monitorForBlankScreens(): void {
    const checkForBlankScreen = () => {
      const body = document.body;
      const html = document.documentElement;
      
      // Check if page is essentially blank or has problematic styling
      const hasMinimalContent = body.children.length < 2;
      const hasErrorColors = window.getComputedStyle(body).backgroundColor.includes('rgb(139, 69, 19)') || // Brown
                            window.getComputedStyle(body).backgroundColor.includes('rgb(128, 0, 128)') || // Purple
                            window.getComputedStyle(html).backgroundColor.includes('rgb(139, 69, 19)') ||
                            window.getComputedStyle(html).backgroundColor.includes('rgb(128, 0, 128)');
      
      if (hasMinimalContent || hasErrorColors) {
        console.warn('🚨 [EmergencyFallback] Blank or error screen detected');
        this.handleError(new Error('Blank or error screen detected'));
      }
    };

    // Check immediately and then periodically
    setTimeout(checkForBlankScreen, 1000);
    setInterval(checkForBlankScreen, 5000);
  }

  addErrorHandler(handler: (error: Error, errorInfo?: any) => void): void {
    this.errorHandlers.add(handler);
  }

  removeErrorHandler(handler: (error: Error, errorInfo?: any) => void): void {
    this.errorHandlers.delete(handler);
  }

  private handleError(error: Error, errorInfo?: any): void {
    // Store error state
    localStorage.setItem('cropgenius_error_state', JSON.stringify({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }));

    // Notify all handlers
    this.errorHandlers.forEach(handler => {
      try {
        handler(error, errorInfo);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });

    // If no handlers or they all fail, show emergency fallback
    if (this.errorHandlers.size === 0) {
      this.showEmergencyFallback(error, errorInfo);
    }
  }

  private showEmergencyFallback(error: Error, errorInfo?: any): void {
    // Clear the page and show emergency fallback
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = '';
      
      // Create emergency fallback
      const fallbackContainer = document.createElement('div');
      root.appendChild(fallbackContainer);
      
      // This would need to be rendered with React, but as a last resort:
      fallbackContainer.innerHTML = `
        <div style="min-height: 100vh; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); display: flex; align-items: center; justify-content: center; padding: 1rem; font-family: system-ui, -apple-system, sans-serif;">
          <div style="background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 400px; text-align: center;">
            <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
              <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/></svg>
            </div>
            <h1 style="font-size: 1.5rem; font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;">CropGenius Recovery</h1>
            <p style="color: #6b7280; margin-bottom: 1.5rem;">We're getting things back on track</p>
            <button onclick="window.location.reload()" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; cursor: pointer; width: 100%; margin-bottom: 0.5rem;">
              Recover Now
            </button>
            <button onclick="window.location.href='/'" style="background: transparent; color: #6b7280; border: 1px solid #d1d5db; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; width: 100%;">
              Go to Dashboard
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Auto-activate the global error interceptor
const globalErrorInterceptor = GlobalErrorInterceptor.getInstance();
globalErrorInterceptor.activate();

export { globalErrorInterceptor };

/**
 * React Hook for emergency fallback
 */
export const useEmergencyFallback = () => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: Error) => {
      setError(error);
      setHasError(true);
    };

    globalErrorInterceptor.addErrorHandler(handleError);

    return () => {
      globalErrorInterceptor.removeErrorHandler(handleError);
    };
  }, []);

  const recover = useCallback(() => {
    setHasError(false);
    setError(null);
    localStorage.removeItem('cropgenius_error_state');
  }, []);

  return { hasError, error, recover };
};

export default EmergencyFallback;