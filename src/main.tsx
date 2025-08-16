import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import './index.css';
import App from './App';

const queryClient = new QueryClient();

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster />
  </QueryClientProvider>
);
