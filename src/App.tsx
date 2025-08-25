import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import AuthProvider from '@/providers/AuthProvider';
import { SubscriptionProvider } from '@/providers/SubscriptionProvider'; // Import SubscriptionProvider
import AppRoutes from '@/AppRoutes';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider> {/* Add SubscriptionProvider */}
          <Router>
            <AppRoutes />
            <Toaster />
          </Router>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
