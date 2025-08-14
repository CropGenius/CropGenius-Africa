import { useAuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const { isAuthenticated, user, isLoading, signInWithGoogle } = useAuthContext();
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !checkingOnboarding) {
      setCheckingOnboarding(true);

      supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          setNeedsOnboarding(!data?.onboarding_completed);
          setCheckingOnboarding(false);
        })
        .catch(() => {
          setNeedsOnboarding(true);
          setCheckingOnboarding(false);
        });
    }
  }, [isAuthenticated, user, checkingOnboarding]);

  if (isLoading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={needsOnboarding ? "/onboarding" : "/dashboard"} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🌾</span>
          </div>
          <CardTitle className="text-3xl font-bold text-green-600 mb-2">
            CropGenius
          </CardTitle>
          <p className="text-gray-600 font-medium">Agricultural Intelligence Platform</p>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
            onClick={signInWithGoogle}
          >
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}