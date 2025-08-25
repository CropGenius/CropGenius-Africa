import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import AuthProvider from '@/providers/AuthProvider';
import Protected from '@/components/Protected';
import Auth from '@/pages/Auth';
import OAuthCallback from '@/pages/OAuthCallback';
import OnboardingPage from '@/pages/OnboardingPage';
import Index from '@/pages/Index';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <Protected>
                  <Index />
                </Protected>
              }
            />
            <Route
              path="/onboarding"
              element={
                <Protected>
                  <OnboardingPage />
                </Protected>
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
