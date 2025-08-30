import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSimpleAuthContext } from './providers/SimpleAuthProvider';
import { Navigate } from 'react-router-dom';
import { MobileLayout } from './components/mobile/MobileLayout';
import { OrbitalLoader } from './components/ui/orbital-loader';

import SimpleAuthPage from './pages/SimpleAuthPage';
import Index from './pages/Index';
import Fields from './pages/Fields';
import Weather from './pages/Weather';
import Scan from './pages/Scan';
import Chat from './pages/Chat';

import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import OnboardingPage from './pages/OnboardingPage';
import OAuthCallback from './pages/OAuthCallback';
import Tasks from './pages/Tasks';
import More from './pages/More';
import ManageFields from './pages/ManageFields';
import FieldDetail from './pages/FieldDetail';
import Alerts from './pages/Alerts';
import TaskManager from './pages/TaskManager';
import Community from './pages/Community';
import { QuestionsPage } from './pages/QuestionsPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import FarmPlanningPage from './pages/FarmPlanningPage';
import CropDiseaseDetectionPage from './pages/CropDiseaseDetectionPage';
import YieldPredictor from './pages/YieldPredictor';
import MarketInsightsPage from './pages/MarketInsightsPage';
import MissionControlPage from './pages/MissionControlPage';
import UpgradePage from './pages/UpgradePage';
import AddCrop from './pages/AddCrop';
import ReferralsPage from './pages/ReferralsPage';
import JoinPage from './pages/JoinPage';
import PaymentCallback from './pages/PaymentCallback';
import PasswordResetPage from './pages/PasswordResetPage';
import SubscriptionSettings from './components/pro/SubscriptionSettings';

function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useSimpleAuthContext();
  
  if (isLoading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <OrbitalLoader message="Loading CropGenius..." />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  
  return <MobileLayout>{children}</MobileLayout>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<SimpleAuthPage />} />
      <Route path="/auth/reset-password" element={<PasswordResetPage />} />
      <Route path="/join" element={<JoinPage />} />

      <Route path="/onboarding" element={<OnboardingPage />} />
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Protected><Index /></Protected>} />
      <Route path="/fields" element={<Protected><Fields /></Protected>} />
      <Route path="/fields/:id" element={<Protected><FieldDetail /></Protected>} />
      <Route path="/fields/:id/crops/add" element={<Protected><AddCrop /></Protected>} />
      <Route path="/fields/:id/activity" element={<Protected><FieldDetail /></Protected>} />
      <Route path="/weather" element={<Protected><Weather /></Protected>} />
      <Route path="/scan" element={<Protected><Scan /></Protected>} />
      <Route path="/chat" element={<Protected><Chat /></Protected>} />

      <Route path="/settings" element={<Protected><Settings /></Protected>} />
      <Route path="/tasks" element={<Protected><Tasks /></Protected>} />
      <Route path="/more" element={<Protected><More /></Protected>} />
      <Route path="/manage-fields" element={<Protected><ManageFields /></Protected>} />
      <Route path="/alerts" element={<Protected><Alerts /></Protected>} />
      <Route path="/task-manager" element={<Protected><TaskManager /></Protected>} />
      <Route path="/community" element={<Protected><QuestionsPage /></Protected>} />
      <Route path="/community/questions/:questionId" element={<Protected><QuestionDetailPage /></Protected>} />
      <Route path="/community/legacy" element={<Protected><Community /></Protected>} />
      <Route path="/farm-planning" element={<Protected><FarmPlanningPage /></Protected>} />
      <Route path="/crop-disease-detection" element={<Protected><CropDiseaseDetectionPage /></Protected>} />
      <Route path="/yield-predictor" element={<Protected><YieldPredictor /></Protected>} />
      <Route path="/market-insights" element={<Protected><MarketInsightsPage /></Protected>} />
      <Route path="/mission-control" element={<Protected><MissionControlPage /></Protected>} />
      <Route path="/upgrade" element={<Protected><UpgradePage /></Protected>} />
      <Route path="/payment-callback" element={<PaymentCallback />} />
      <Route path="/referrals" element={<Protected><ReferralsPage /></Protected>} />
      <Route path="/subscription-settings" element={<Protected><SubscriptionSettings /></Protected>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}