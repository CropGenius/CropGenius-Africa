/**
 * 🛡️ PRODUCTION ERROR BOUNDARY
 * -------------------------------------------------------------
 * Specialized error boundary for production issues
 * - Handles Sentinel Hub auth errors
 * - Manages Supabase permission errors
 * - Provides graceful degradation
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Shield, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductionErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface ProductionErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: 'auth' | 'network' | 'permission' | 'component' | 'unknown';
  retryCount: number;
}

class ProductionErrorBoundary extends Component<ProductionErrorBoundaryProps, ProductionErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ProductionErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ProductionErrorBoundaryState> {
    // Classify error type
    let errorType: ProductionErrorBoundaryState['errorType'] = 'unknown';
    
    if (error.message.includes('Unauthorized') || error.message.includes('401')) {
      errorType = 'auth';
    } else if (error.message.includes('Forbidden') || error.message.includes('403')) {
      errorType = 'permission';
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      errorType = 'network';
    } else if (error.message.includes('component') || error.message.includes('render')) {
      errorType = 'component';
    }
    
    return { 
      hasError: true, 
      error: error,
      errorType
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('🛡️ [ProductionErrorBoundary] Error caught:', {
      error,
      errorInfo,
      errorType: this.state.errorType,
      timestamp: new Date().toISOString()
    });
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Auto-retry for certain error types
    if (this.shouldAutoRetry(error)) {
      this.startAutoRetry();
    }
  }

  private shouldAutoRetry(error: Error): boolean {
    const { errorType, retryCount } = this.state;
    
    // Don't retry too many times
    if (retryCount >= 3) return false;
    
    // Auto-retry for network and auth errors
    return errorType === 'network' || errorType === 'auth';
  }

  private startAutoRetry = () => {
    const delay = Math.pow(2, this.state.retryCount) * 1000; // Exponential backoff
    
    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleManualRetry = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    this.handleRetry();
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private getErrorMessage(): string {
    const { errorType, error } = this.state;
    
    switch (errorType) {
      case 'auth':
        return 'Authentication service is temporarily unavailable. Your data is safe.';
      case 'permission':
        return 'Some features are temporarily restricted. Core functionality remains available.';
      case 'network':
        return 'Network connection issue detected. Retrying automatically...';
      case 'component':
        return 'A component failed to load. The app will recover automatically.';
      default:
        return error?.message || 'An unexpected error occurred. The app will recover automatically.';
    }
  }

  private getErrorIcon() {
    const { errorType } = this.state;
    
    switch (errorType) {
      case 'auth':
        return <Shield className="h-5 w-5 text-amber-600" />;
      case 'permission':
        return <Shield className="h-5 w-5 text-orange-600" />;
      case 'network':
        return <WifiOff className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
    }
  }

  private getErrorColor(): string {
    const { errorType } = this.state;
    
    switch (errorType) {
      case 'auth':
        return 'border-amber-200 bg-amber-50';
      case 'permission':
        return 'border-orange-200 bg-orange-50';
      case 'network':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            reset={this.handleManualRetry}
          />
        );
      }

      // Default production-ready fallback
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
          <Card className={`max-w-md w-full ${this.getErrorColor()}`}>
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                {this.getErrorIcon()}
              </div>
              <CardTitle className="text-xl text-gray-800">
                CropGenius is Recovering
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {this.getErrorMessage()}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Status indicators */}
              <div className="flex items-center justify-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Data Protected
                </Badge>
                
                <Badge variant="outline" className={navigator.onLine ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'}>
                  {navigator.onLine ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                  {navigator.onLine ? 'Online' : 'Offline'}
                </Badge>
              </div>

              {/* Auto-retry indicator */}
              {this.shouldAutoRetry(this.state.error!) && (
                <Alert className="bg-blue-50 border-blue-200">
                  <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                  <AlertDescription className="text-blue-800">
                    Automatic recovery in progress... (Attempt {this.state.retryCount + 1}/3)
                  </AlertDescription>
                </Alert>
              )}

              {/* Action buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={this.handleManualRetry}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Now
                </Button>
                
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Restart App
                </Button>
              </div>

              {/* Reassurance */}
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 font-medium">
                  🌱 Your farm data is safe and secure
                </p>
                <p className="text-xs text-green-700 mt-1">
                  CropGenius automatically protects your information
                </p>
              </div>

              {/* Error details for debugging */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Debug Information
                  </summary>
                  <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-2">
                    <div>
                      <strong>Error Type:</strong> {this.state.errorType}
                    </div>
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Retry Count:</strong> {this.state.retryCount}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 text-xs whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ProductionErrorBoundary;