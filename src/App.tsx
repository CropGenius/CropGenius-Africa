import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import AuthProvider from '@/providers/AuthProvider';
import Protected from '@/components/Protected';
import Auth from '@/pages/Auth';
import OAuthCallback from '@/pages/OAuthCallback';
import OnboardingPage from '@/pages/OnboardingPage';
import Index from '@/pages/Index';
import Fields from '@/pages/Fields';
import Weather from '@/pages/Weather';
import Scan from '@/pages/Scan';
import Chat from '@/pages/Chat';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Tasks from '@/pages/Tasks';
import More from '@/pages/More';
import ManageFields from '@/pages/ManageFields';
import FieldDetail from '@/pages/FieldDetail';
import Alerts from '@/pages/Alerts';
import TaskManager from '@/pages/TaskManager';
import Community from '@/pages/Community';
import { QuestionsPage } from '@/pages/QuestionsPage';
import { QuestionDetailPage } from '@/pages/QuestionDetailPage';
import FarmPlanningPage from '@/pages/FarmPlanningPage';
import CropDiseaseDetectionPage from '@/pages/CropDiseaseDetectionPage';
import YieldPredictor from '@/pages/YieldPredictor';
import MarketInsightsPage from '@/pages/MarketInsightsPage';
import MissionControlPage from '@/pages/MissionControlPage';
import UpgradePage from '@/pages/UpgradePage';
import AddCrop from '@/pages/AddCrop';
import ReferralsPage from '@/pages/ReferralsPage';
import JoinPage from '@/pages/JoinPage';
import PaymentCallback from '@/pages/PaymentCallback';
import SubscriptionSettings from '@/components/pro/SubscriptionSettings';

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
