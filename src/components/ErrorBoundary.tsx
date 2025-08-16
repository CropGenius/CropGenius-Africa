import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    
    // Log specific React hook errors
    if (error.message.includes('useState') || error.message.includes('hooks')) {
      console.error('🔥 React hooks error detected. This might be due to:');
      console.error('1. Calling hooks outside React component');
      console.error('2. Circular dependency in imports');
      console.error('3. React version mismatch');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-md w-full mx-4 p-6 bg-background rounded-lg border shadow-lg">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-destructive mb-4">
                🚨 Application Error
              </h1>
              <p className="text-muted-foreground mb-4">
                CropGenius encountered an error and needs to reload.
              </p>
              <div className="bg-muted p-3 rounded text-sm text-left mb-4">
                <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
              >
                🔄 Reload CropGenius
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}