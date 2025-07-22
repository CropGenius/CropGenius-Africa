/**
 * 🔥 CROPGENIUS ENHANCED ERROR BOUNDARY SYSTEM
 * Production-ready error boundaries for 100 million farmers
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { errorLogger } from '@/services/errorLogger';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  errorBoundaryId?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Enhanced Error Boundary Component
 */
export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error to service
    errorLogger.logError(error, {
      componentStack: errorInfo.componentStack,
      boundaryId: this.props.errorBoundaryId || 'unknown',
      severity: this.props.severity || 'medium'
    });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    toast.error('Component Error', {
      description: 'An error occurred in the application. The issue has been logged.'
    });
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, showDetails = false } = this.props;

    if (hasError && error) {
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.resetErrorBoundary);
        }
        return fallback;
      }

      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Component Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-red-700">
              <p>Something went wrong in this component.</p>
              {showDetails && (
                <div className="mt-2 p-2 bg-red-100 rounded overflow-auto max-h-32 text-xs font-mono">
                  {error.message}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.resetErrorBoundary}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return children;
  }
}

/**
 * Critical Error Boundary
 */
export const CriticalErrorBoundary: React.FC<Omit<Props, 'severity'>> = (props) => (
  <EnhancedErrorBoundary {...props} severity="critical" />
);

/**
 * Page Error Boundary
 */
export const PageErrorBoundary: React.FC<Omit<Props, 'severity' | 'fallback'>> = ({ children, ...props }) => (
  <EnhancedErrorBoundary 
    {...props} 
    severity="high"
    fallback={(error, reset) => (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <div className="text-red-500 mb-4">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Page Error</h2>
        <p className="text-muted-foreground mb-4 text-center max-w-md">
          We encountered a problem loading this page. Our team has been notified.
        </p>
        <Button onClick={reset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reload Page
        </Button>
      </div>
    )}
  >
    {children}
  </EnhancedErrorBoundary>
);

/**
 * Widget Error Boundary
 */
export const WidgetErrorBoundary: React.FC<Omit<Props, 'severity'>> = (props) => (
  <EnhancedErrorBoundary {...props} severity="medium" />
);

export default EnhancedErrorBoundary;