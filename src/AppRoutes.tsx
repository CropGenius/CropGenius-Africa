/**
 * 🔥💪 CROPGENIUS APP ROUTES - INFINITY GOD MODE ACTIVATED!
 * Production-ready routing with intelligent layout orchestration
 * Automatically serves perfect layouts for 100M farmers across all devices
 */

import { Routes, Route } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import { ProtectedRoute } from './components/ProtectedRoute';

// 🚀 LAYOUT ORCHESTRATOR - THE GENIUS MOVE
import { LayoutOrchestrator } from './components/layout/LayoutOrchestrator';
import { MobileLayout } from './components/mobile/MobileLayout';

// 🔥 PAGE IMPORTS
import Auth from './pages/Auth';
import Index from './pages/Index';
import Fields from './pages/Fields';
import Weather from './pages/Weather';
import Scan from './pages/Scan';
import Chat from './pages/Chat';
import Market from './pages/Market';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import OnboardingPage from './pages/OnboardingPage';
import OAuthCallback from './pages/OAuthCallback';
import FieldDetail from './pages/FieldDetail';
import ManageFields from './pages/ManageFields';
import FarmPlanningPage from './pages/FarmPlanningPage';
import MarketInsightsPage from './pages/MarketInsightsPage';
import MissionControlPage from './pages/MissionControlPage';
import YieldPredictor from './pages/YieldPredictor';
import Community from './pages/Community';
import Farms from './pages/Farms';
import DiseaseDetection from './pages/DiseaseDetection';
import { SuperDashboard } from './components/SuperDashboard';
import { BackendDashboard } from './pages/BackendDashboard';

/**
 * 🔥 INFINITY GOD MODE APP ROUTES
 * Intelligent routing with automatic layout orchestration
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* 🚨 AUTH ROUTES - NO LAYOUT WRAPPER */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      
      {/* 🚀 MAIN APP ROUTES - WITH INTELLIGENT LAYOUT ORCHESTRATION */}
      <Route path="/" element={
        <ProtectedRoute>
          <LayoutOrchestrator enableLayoutSwitcher={process.env.NODE_ENV === 'development'}>
            <Index />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      <Route path="/farms" element={
        <ProtectedRoute>
          <LayoutOrchestrator enableLayoutSwitcher={process.env.NODE_ENV === 'development'}>
            <Farms />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      <Route path="/fields" element={
        <ProtectedRoute>
          <LayoutOrchestrator enableLayoutSwitcher={process.env.NODE_ENV === 'development'}>
            <Fields />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      <Route path="/fields/:id" element={
        <ProtectedRoute>
          <LayoutOrchestrator enableLayoutSwitcher={process.env.NODE_ENV === 'development'}>
            <FieldDetail />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      <Route path="/manage-fields" element={
        <ProtectedRoute>
          <LayoutOrchestrator enableLayoutSwitcher={process.env.NODE_ENV === 'development'}>
            <ManageFields />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      <Route path="/weather" element={
        <ProtectedRoute>
          <LayoutOrchestrator enableLayoutSwitcher={process.env.NODE_ENV === 'development'}>
            <Weather />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      <Route path="/scan" element={
        <ProtectedRoute>
          <LayoutOrchestrator enableLayoutSwitcher={process.env.NODE_ENV === 'development'}>
            <Scan />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      <Route path="/disease-detection" element={
        <ProtectedRoute>
          <LayoutOrchestrator enableLayoutSwitcher={process.env.NODE_ENV === 'development'}>
            <DiseaseDetection />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      <Route path="/chat" element={
        <ProtectedRoute>
          <LayoutOrchestrator enableLayoutSwitcher={process.env.NODE_ENV === 'development'}>
            <Chat />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      <Route path="/market" element={
        <ProtectedRoute>
          <LayoutOrchestrator enableLayoutSwitcher={process.env.NODE_ENV === 'development'}>
            <Market />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      <Route path="/market-insights" element={
        <ProtectedRoute>
          <LayoutOrchestrator enableLayoutSwitcher={process.env.NODE_ENV === 'development'}>
            <MarketInsightsPage />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      <Route path="/farm-planning" element={
        <ProtectedRoute>
          <LayoutOrchestrator enableLayoutSwitcher={process.env.NODE_ENV === 'development'}>
            <FarmPlanningPage />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      <Route path="/mission-control" element={
        <ProtectedRoute>
          <LayoutOrchestrator enableLayoutSwitcher={process.env.NODE_ENV === 'development'}>
            <MissionControlPage />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      <Route path="/yield-predictor" element={
        <ProtectedRoute>
          <LayoutOrchestrator enableLayoutSwitcher={process.env.NODE_ENV === 'development'}>
            <YieldPredictor />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      <Route path="/community" element={
        <ProtectedRoute>
          <LayoutOrchestrator enableLayoutSwitcher={process.env.NODE_ENV === 'development'}>
            <Community />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <LayoutOrchestrator enableLayoutSwitcher={process.env.NODE_ENV === 'development'}>
            <Settings />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      {/* 🔥 SPECIAL ROUTES - ADMIN/DEBUG */}
      <Route path="/super" element={
        <ProtectedRoute>
          <LayoutOrchestrator 
            enableLayoutSwitcher={true}
            forceLayout="desktop"
          >
            <SuperDashboard />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      <Route path="/backend" element={
        <ProtectedRoute>
          <LayoutOrchestrator 
            enableLayoutSwitcher={true}
            forceLayout="desktop"
          >
            <BackendDashboard />
          </LayoutOrchestrator>
        </ProtectedRoute>
      } />
      
      {/* 🚨 404 NOT FOUND */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}