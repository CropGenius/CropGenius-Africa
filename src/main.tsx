import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
// import { registerServiceWorker } from './utils/serviceWorker';


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



root.render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster />
    <SonnerToaster />
  </QueryClientProvider>
);

console.log('🚀 [MAIN] App rendered!');

// Service worker registration temporarily disabled for debugging
// registerServiceWorker();
