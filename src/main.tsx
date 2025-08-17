import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';

import './index.css';
import App from './App';

const queryClient = new QueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('🚀 [MAIN] Starting React app...');
console.log('🚀 [MAIN] Root element:', rootElement);

const root = createRoot(rootElement);
console.log('🚀 [MAIN] Root created, rendering app...');

// Top-level error boundary to avoid white-screen and surface meaningful errors
class ErrorBoundary extends React.Component<React.PropsWithChildren, { hasError: boolean; message?: string }> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // Minimal logging; avoid exposing sensitive data
    console.error('[ErrorBoundary] Caught error', { error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
          <h1>Something went wrong.</h1>
          <p>{this.state.message}</p>
          <p>Try a hard refresh (Ctrl/Cmd+Shift+R). If the issue persists, please report it.</p>
        </div>
      );
    }
    return this.props.children as React.ReactNode;
  }
}



root.render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
      <SonnerToaster />
    </QueryClientProvider>
  </ErrorBoundary>
);

console.log('🚀 [MAIN] App rendered!');

// Service worker registration temporarily disabled for debugging
// registerServiceWorker();
