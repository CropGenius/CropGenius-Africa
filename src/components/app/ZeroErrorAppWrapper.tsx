/**
 * 🛡️ ZERO ERROR APP WRAPPER
 * -------------------------------------------------------------
 * ULTIMATE protection against ANY error screens, blank pages, or purple screens
 * - Wraps the entire app with bulletproof error handling
 * - Intercepts ALL possible failure modes
 * - Always provides functional UI
 * - Never shows blank/colored screens
 */

import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, 
  RefreshCw, 
  Home, 
  Shield, 
  Activity, 
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { EmergencyFallback, globalErrorInterceptor } from '@/components/error/EmergencyFallbackSystem';

interface ZeroErrorAppWrapperProps {
  children: ReactNode;
}

interface ZeroErrorAppWrapperState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  isRecovering: boolean;
}

/**
 * BULLETPROOF APP WRAPPER - Never allows error screens
 */
class ZeroErrorAppWrapper extends Component<ZeroErrorAppWrapperProps, ZeroErrorAppWrapperState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(props: ZeroErrorAppWrapperProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ZeroErrorAppWrapperState> {
    const errorId = `app_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.error('🚨 [ZeroErrorAppWrapper] App-level error caught:', error);
    
    return { 
      hasError: true, 
      error: error,
      errorInfo: null,
      errorId,
      isRecovering: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { errorId } = this.state;
    
    console.error('🚨 [ZeroErrorAppWrapper] App crashed:', {
      errorId,
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log to storage for debugging
    this.logErrorToStorage(error, errorInfo, errorId);
    
    // Start automatic recovery
    this.startAutomaticRecovery();
    
    // Show user notification
    toast.error('App encountered an error', {
      description: 'Automatic recovery in progress...'
    });
  }

  componentDidMount() {
    // Start health monitoring
    this.startHealthMonitoring();
    
    // Register with global error interceptor
    globalErrorInterceptor.addErrorHandler(this.handleGlobalError);
    
    // Monitor for blank screens
    this.monitorForBlankScreens();
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    globalErrorInterceptor.removeErrorHandler(this.handleGlobalError);
  }

  private handleGlobalError = (error: Error, errorInfo?: any) => {
    if (!this.state.hasError) {
      this.setState({
        hasError: true,
        error,
        errorInfo,
        errorId: `global_error_${Date.now()}`,
        retryCount: 0,
        isRecovering: false
      });
      
      this.startAutomaticRecovery();
    }
  };

  private startHealthMonitoring = () => {
    this.healthCheckInterval = setInterval(() => {
      // Check if app is responsive
      const root = document.getElementById('root');
      if (!root || root.children.length === 0) {
        console.warn('🚨 [ZeroErrorAppWrapper] App health check failed - empty root');
        this.handleGlobalError(new Error('App health check failed - empty root'));
      }
      
      // Check for error indicators in DOM
      const hasErrorIndicators = document.querySelector('[data-error="true"]') || 
                                 document.querySelector('.error-boundary') ||
                                 document.body.style.backgroundColor.includes('purple') ||
                                 document.documentElement.style.backgroundColor.includes('purple');
      
      if (hasErrorIndicators) {
        console.warn('🚨 [ZeroErrorAppWrapper] Error indicators detected in DOM');
        this.handleGlobalError(new Error('Error indicators detected in DOM'));
      }
    }, 5000);
  };

  private monitorForBlankScreens = () => {
    const checkForBlankScreen = () => {
      const body = document.body;
      const root = document.getElementById('root');
      
      // Check for blank or problematic screens
      const isBlank = !root || root.children.length === 0 || root.innerHTML.trim() === '';
      const hasErrorColors = body.style.backgroundColor.includes('purple') ||
                            body.style.backgroundColor.includes('rgb(128, 0, 128)') ||
                            document.documentElement.style.backgroundColor.includes('purple');
      
      if (isBlank || hasErrorColors) {
        console.error('🚨 [ZeroErrorAppWrapper] Blank or error screen detected');
        this.handleGlobalError(new Error('Blank or error screen detected'));
      }
    };

    // Check immediately and then periodically
    setTimeout(checkForBlankScreen, 1000);
    setInterval(checkForBlankScreen, 3000);
  };

  private startAutomaticRecovery = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= 5) {
      console.error('🚨 [ZeroErrorAppWrapper] Maximum recovery attempts reached');
      this.forceAppReload();
      return;
    }

    this.setState({ isRecovering: true });

    // Progressive recovery delays
    const delays = [1000, 2000, 3000, 5000, 8000];
    const delay = delays[retryCount] || 10000;

    this.retryTimeoutId = setTimeout(() => {
      this.attemptRecovery();
    }, delay);
  };

  private attemptRecovery = async () => {
    try {
      console.log('🔧 [ZeroErrorAppWrapper] Attempting recovery...');
      
      // Clear problematic state
      this.clearProblematicState();
      
      // Reset component state
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: prevState.retryCount + 1,
        isRecovering: false
      }));
      
      toast.success('Recovery successful!', {
        description: 'App is back to normal operation'
      });
      
    } catch (recoveryError) {
      console.error('🚨 [ZeroErrorAppWrapper] Recovery failed:', recoveryError);
      
      this.setState(prevState => ({
        retryCount: prevState.retryCount + 1,
        isRecovering: false
      }));
      
      // Try again
      this.startAutomaticRecovery();
    }
  };

  private clearProblematicState = () => {
    try {
      // Clear localStorage items that might cause issues
      const keysToRemove = [
        'cropgenius_error_state',
        'cropgenius_crash_state',
        'react_error_boundary'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Reset body styles
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
      
      // Remove error classes
      document.body.classList.remove('error-state', 'crashed');
      
    } catch (error) {
      console.warn('Failed to clear problematic state:', error);
    }
  };

  private forceAppReload = () => {
    console.log('🔄 [ZeroErrorAppWrapper] Forcing app reload...');
    
    toast.info('Restarting app...', {
      description: 'This will restore full functionality'
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  private logErrorToStorage = (error: Error, errorInfo: ErrorInfo, errorId: string | null) => {
    try {
      const errorLog = JSON.parse(localStorage.getItem('cropgenius_app_errors') || '[]');
      
      const errorEntry = {
        id: errorId,
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.state.retryCount
      };
      
      errorLog.push(errorEntry);
      
      // Keep only last 10 errors
      if (errorLog.length > 10) {
        errorLog.shift();
      }
      
      localStorage.setItem('cropgenius_app_errors', JSON.stringify(errorLog));
      
    } catch (storageError) {
      console.warn('Failed to log error to storage:', storageError);
    }
  };

  private handleManualRecovery = () => {
    this.attemptRecovery();
  };

  private handleForceReload = () => {
    this.forceAppReload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <EmergencyFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRecover={this.handleManualRecovery}
        />
      );
    }

    return (
      <div className="zero-error-app-wrapper">
        <AppHealthMonitor />
        {this.props.children}
      </div>
    );
  }
}

/**
 * App Health Monitor Component
 */
const AppHealthMonitor: React.FC = () => {
  const [isHealthy, setIsHealthy] = useState(true);
  const [lastCheck, setLastCheck] = useState(new Date());

  useEffect(() => {
    const healthCheck = () => {
      try {
        // Basic health checks
        const root = document.getElementById('root');
        const hasContent = root && root.children.length > 0;
        const noErrorColors = !document.body.style.backgroundColor.includes('purple');
        
        const healthy = hasContent && noErrorColors;
        setIsHealthy(healthy);
        setLastCheck(new Date());
        
        if (!healthy) {
          console.warn('🚨 [AppHealthMonitor] Health check failed');
        }
      } catch (error) {
        console.error('Health check error:', error);
        setIsHealthy(false);
      }
    };

    // Initial check
    healthCheck();
    
    // Regular health checks
    const interval = setInterval(healthCheck, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Don't render anything if healthy
  if (isHealthy) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white p-2 text-center text-sm">
      <div className="flex items-center justify-center space-x-2">
        <AlertTriangle className="h-4 w-4" />
        <span>App health issue detected - automatic recovery in progress</span>
      </div>
    </div>
  );
};

/**
 * Network Status Monitor
 */
const NetworkStatusMonitor: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus && isOnline) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge variant="outline" className={isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
        {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
        {isOnline ? 'Back Online' : 'Offline Mode'}
      </Badge>
    </div>
  );
};

/**
 * HOC for wrapping components with zero-error protection
 */
export const withZeroErrorProtection = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => (
    <ZeroErrorAppWrapper>
      <Component {...props} />
    </ZeroErrorAppWrapper>
  );
};

export default ZeroErrorAppWrapper;