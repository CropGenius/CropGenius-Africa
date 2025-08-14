import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

// Simple working app
function WorkingApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          🌾 CropGenius - Working!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">✅ React</h3>
            <p className="text-gray-600">Working perfectly</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">✅ Tailwind</h3>
            <p className="text-gray-600">Styles loading</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">✅ Vite</h3>
            <p className="text-gray-600">Build system working</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🔧 Next</h3>
            <p className="text-gray-600">Add providers step by step</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🚀 Ready for 100M Farmers</h2>
          <p className="text-gray-600 mb-4">
            The basic React app is working. Now we can add providers one by one to identify the issue.
          </p>
          
          <div className="space-y-2">
            <p>✅ React DOM rendering</p>
            <p>✅ CSS styles loading</p>
            <p>✅ JavaScript execution</p>
            <p>⏳ Adding Supabase provider...</p>
            <p>⏳ Adding Auth provider...</p>
            <p>⏳ Adding routing...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <WorkingApp />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);

console.log('🎉 CropGenius working app rendered successfully!');