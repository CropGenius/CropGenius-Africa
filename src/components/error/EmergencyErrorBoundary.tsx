/**
 * 🚨 EMERGENCY ERROR BOUNDARY - LAST LINE OF DEFENSE
 * Catches critical component errors that could crash the entire app
 */

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

export class EmergencyErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substring(2)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substring(2)}`
    });

    // Log to console for debugging
    console.error('🚨 [EMERGENCY ERROR BOUNDARY] Critical error caught:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Try to report error to error logging service
    try {
      if (window.navigator.onLine) {
        // Send error report
        fetch('/api/error-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            errorId: this.state.errorId,
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
          })
        }).catch(() => {
          // Silent fail - don't cause more errors
        });
      }
    } catch (reportError) {
      // Silent fail - don't cause more errors
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-red-200 p-8 text-center">
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Unexpected Error
              </h1>
              <p className="text-gray-600 text-sm">
                {this.props.fallbackMessage || 
                 'CropGenius encountered an unexpected error. Our team has been notified and is working on a fix.'}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">What you can try:</h3>
              <ul className="text-sm text-gray-600 text-left space-y-1">
                <li>• Refresh the page</li>
                <li>• Try again later</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Reload Page
              </button>
            </div>

            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Technical Details
              </summary>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs">
                <div className="mb-2">
                  <strong>Error ID:</strong><br />
                  <code className="bg-white px-1 py-0.5 rounded text-red-600">
                    {this.state.errorId}
                  </code>
                </div>
                <div className="mb-2">
                  <strong>Type:</strong><br />
                  <span className="text-gray-600">unknown</span>
                </div>
                <div>
                  <strong>Message:</strong><br />
                  <span className="text-gray-600">
                    {this.state.error?.message || 'No message available'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                If this problem persists, please contact our support team with Error ID: 
                <code className="bg-gray-100 px-1 py-0.5 rounded ml-1">
                  {this.state.errorId}
                </code>
              </p>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EmergencyErrorBoundary;