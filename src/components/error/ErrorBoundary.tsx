import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  componentStack: string
}

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  isolate?: boolean; // If true, prevents error from bubbling up
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update state so the next render shows the fallback UI
    return { 
      hasError: true, 
      error: error,
      errorInfo: null,
      errorId
    };
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state if resetOnPropsChange is enabled and props changed
    if (this.props.resetOnPropsChange && prevProps.children !== this.props.children) {
      if (this.state.hasError) {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          errorId: null,
          retryCount: 0
        });
      }
    }
  }

  componentWillUnmount() {
    // Clear any pending retry timeouts
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { errorId } = this.state;
    
    // Log the error to console with enhanced details
    console.error('❌ [ErrorBoundary] Uncaught error:', {
      errorId,
      error,
      errorInfo,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Enhanced error logging to local storage
    this.logErrorToStorage(error, errorInfo, errorId);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        console.error('Error in custom error handler:', handlerError);
      }
    }
    
    // Show contextual toast notification
    const isNetworkError = error.message.includes('fetch') || error.message.includes('network');
    const isChunkError = error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError');
    
    if (isNetworkError) {
      toast.error('Network Error', {
        description: 'Please check your internet connection and try again.'
      });
    } else if (isChunkError) {
      toast.error('Loading Error', {
        description: 'Please refresh the page to load the latest version.'
      });
    } else {
      toast.error('Something went wrong', {
        description: 'We encountered an unexpected error. Our team has been notified.'
      });
    }
    
    // Prevent error from bubbling up if isolate is enabled
    if (this.props.isolate) {
      // Stop error propagation
      return;
    }
  }

  private logErrorToStorage = (error: Error, errorInfo: ErrorInfo, errorId: string | null): void => {
    try {
      const errorLog = JSON.parse(localStorage.getItem('cropgenius_error_log') || '[]');
      
      const errorEntry = {
        id: errorId,
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount,
        userAgent: navigator.userAgent,
        url: window.location.href,
        props: this.props.children ? 'present' : 'none'
      };
      
      errorLog.push(errorEntry);
      
      // Keep only the last 20 errors
      if (errorLog.length > 20) {
        errorLog.shift();
      }
      
      localStorage.setItem('cropgenius_error_log', JSON.stringify(errorLog));
      
      // Also store in session storage for immediate debugging
      sessionStorage.setItem('cropgenius_last_error', JSON.stringify(errorEntry));
    } catch (storageError) {
      console.warn('Failed to log error to storage:', storageError);
    }
  }

  private copyErrorToClipboard = async (): Promise<void> => {
    if (!this.state.error || !this.state.errorInfo) return;
    
    const errorDetails = {
      id: this.state.errorId,
      timestamp: new Date().toISOString(),
      message: this.state.error.message,
      stack: this.state.error.stack,
      componentStack: this.state.errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      toast.success('Error details copied to clipboard');
    } catch (clipboardError) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = JSON.stringify(errorDetails, null, 2);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Error details copied to clipboard');
    }
  }

  handleReset = (): void => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));
  }

  handleAutoRetry = (): void => {
    const { retryCount } = this.state;
    
    // Only auto-retry up to 3 times
    if (retryCount < 3) {
      toast.info(`Retrying... (${retryCount + 1}/3)`);
      
      // Add delay before retry
      this.retryTimeoutId = setTimeout(() => {
        this.handleReset();
      }, 1000 * (retryCount + 1)); // Exponential backoff
    } else {
      toast.error('Maximum retry attempts reached');
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.handleReset}
            componentStack={this.state.errorInfo?.componentStack || ''}
          />
        );
      }
      
      const { error, errorInfo, errorId, retryCount } = this.state;
      const isNetworkError = error?.message.includes('fetch') || error?.message.includes('network');
      const isChunkError = error?.message.includes('Loading chunk') || error?.message.includes('ChunkLoadError');
      
      // Otherwise render the enhanced default error UI
      return (
        <div className="flex items-center justify-center min-h-[400px] p-6 bg-gray-50 rounded-lg border">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            
            {isNetworkError && (
              <p className="text-gray-600 mb-6">
                Network connection issue detected. Please check your internet connection and try again.
              </p>
            )}
            
            {isChunkError && (
              <p className="text-gray-600 mb-6">
                Failed to load application resources. Please refresh the page to get the latest version.
              </p>
            )}
            
            {!isNetworkError && !isChunkError && (
              <p className="text-gray-600 mb-6">
                We've encountered an unexpected error. Our team has been notified and is working on a fix.
              </p>
            )}
            
            {retryCount > 0 && (
              <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  Retry attempt: {retryCount}/3
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload page
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleReset} 
                  className="flex-1"
                  disabled={retryCount >= 3}
                >
                  Try again
                </Button>
              </div>
              
              {retryCount < 3 && (
                <Button 
                  variant="secondary" 
                  onClick={this.handleAutoRetry}
                  className="w-full"
                  size="sm"
                >
                  Auto retry ({3 - retryCount} attempts left)
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                onClick={this.copyErrorToClipboard}
                className="w-full"
                size="sm"
              >
                <Copy className="mr-2 h-3 w-3" />
                Copy error details
              </Button>
              
              <details className="text-left mt-4 text-sm border rounded-md p-2">
                <summary className="cursor-pointer text-gray-700 font-medium flex items-center">
                  <Bug className="mr-2 h-4 w-4" />
                  Technical details
                  {errorId && (
                    <span className="ml-auto text-xs text-gray-500 font-mono">
                      ID: {errorId.slice(-8)}
                    </span>
                  )}
                </summary>
                <div className="mt-2 space-y-2">
                  <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs font-semibold text-red-700 mb-1">Error Message:</p>
                    <p className="font-mono text-xs text-red-600">
                      {error?.message}
                    </p>
                  </div>
                  
                  {error?.stack && (
                    <div className="p-2 bg-gray-100 rounded-md overflow-auto max-h-[150px]">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Stack Trace:</p>
                      <p className="font-mono text-xs whitespace-pre-wrap text-gray-600">
                        {error.stack}
                      </p>
                    </div>
                  )}
                  
                  {errorInfo?.componentStack && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-md overflow-auto max-h-[150px]">
                      <p className="text-xs font-semibold text-blue-700 mb-1">Component Stack:</p>
                      <p className="font-mono text-xs whitespace-pre-wrap text-blue-600">
                        {errorInfo.componentStack}
                      </p>
                    </div>
                  )}
                  
                  <div className="p-2 bg-gray-50 border rounded-md">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Environment:</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><strong>URL:</strong> {window.location.href}</p>
                      <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                      <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
