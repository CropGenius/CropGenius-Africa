import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlutterwaveUpgrade } from '@/components/payment/FlutterwaveUpgrade';
import { 
  CreditCard, 
  Crown, 
  Calendar, 
  Check, 
  RefreshCw,
  Zap,
  Gift
} from 'lucide-react';
import { toast } from 'sonner';

interface UserPlan {
  plan_type: string;
  status: string;
  billing_cycle: string;
  current_period_end: string | null;
  is_active: boolean;
}

const Upgrade = () => {
  const { user } = useAuthContext();
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserPlan = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Call the get_user_plan function
      const { data, error } = await supabase.rpc('get_user_plan', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error fetching user plan:', error);
        toast.error('Failed to load plan information');
        return;
      }

      if (data && data.length > 0) {
        setUserPlan(data[0]);
      } else {
        // Default to free plan
        setUserPlan({
          plan_type: 'free',
          status: 'active',
          billing_cycle: 'monthly',
          current_period_end: null,
          is_active: false
        });
      }
    } catch (error) {
      console.error('Error in loadUserPlan:', error);
      toast.error('Failed to load plan information');
    } finally {
      setLoading(false);
    }
  };

  const refreshPlanStatus = async () => {
    setRefreshing(true);
    await loadUserPlan();
    setRefreshing(false);
    toast.success('Plan status refreshed');
  };

  useEffect(() => {
    loadUserPlan();
  }, [user]);

  // Check URL for upgrade success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('upgrade') === 'success') {
      toast.success('Welcome to CropGenius Pro!', {
        description: 'Your account has been upgraded successfully.'
      });
      
      // Clean URL
      window.history.replaceState(null, '', window.location.pathname);
      
      // Refresh plan status
      setTimeout(() => {
        refreshPlanStatus();
      }, 2000);
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-bold mb-2">Login Required</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please log in to view your subscription details.
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your plan...</p>
        </div>
      </div>
    );
  }

  if (showUpgrade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 pb-20">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowUpgrade(false)}
            className="mb-4"
          >
            ← Back to Plan Details
          </Button>
        </div>
        <FlutterwaveUpgrade 
          onUpgradeComplete={() => {
            setShowUpgrade(false);
            refreshPlanStatus();
          }}
        />
      </div>
    );
  }

  const isPro = userPlan?.is_active;
  const planEndDate = userPlan?.current_period_end ? new Date(userPlan.current_period_end) : null;
  const isExpiringSoon = planEndDate ? planEndDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Plan</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your CropGenius subscription</p>
          </div>
          <Button
            variant="outline"
            onClick={refreshPlanStatus}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Current Plan Status */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isPro ? (
                  <Crown className="h-8 w-8 text-yellow-600" />
                ) : (
                  <Gift className="h-8 w-8 text-blue-600" />
                )}
                <div>
                  <CardTitle className="text-xl">
                    {isPro ? 'CropGenius Pro' : 'Free Plan'}
                  </CardTitle>
                  <CardDescription>
                    {isPro ? 'Premium farming intelligence' : 'Basic farming tools'}
                  </CardDescription>
                </div>
              </div>
              <Badge 
                variant={isPro ? 'default' : 'secondary'}
                className={isPro ? 'bg-green-600' : ''}
              >
                {userPlan?.status?.toUpperCase() || 'ACTIVE'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPro && planEndDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  Renews on {planEndDate.toLocaleDateString()}
                </span>
                {isExpiringSoon && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Expires Soon
                  </Badge>
                )}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">
                  {isPro ? 'Pro Features Included:' : 'With Pro You Get:'}
                </h3>
                <ul className="space-y-2">
                  {[
                    'Unlimited crop disease scans',
                    'AI-powered yield predictions',
                    'Hyperlocal weather forecasts',
                    'Premium market intelligence',
                    'WhatsApp notifications',
                    'Offline mode access',
                    'Priority customer support',
                    'Advanced farm analytics'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className={`h-4 w-4 ${isPro ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className={isPro ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                {!isPro ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-6 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-center">
                      <Zap className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                        Upgrade to Pro
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-400 mb-4">
                        Join 10,000+ farmers with 38% higher yields
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="text-2xl font-bold text-green-600">
                          From KES 999/month
                        </div>
                        <div className="text-sm text-green-600">
                          Save 58% with annual plan
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowUpgrade(true)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade Now
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="text-center">
                      <Crown className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                        You're Pro!
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-4">
                        Enjoying all premium features
                      </p>
                      {planEndDate && (
                        <div className="text-sm text-yellow-600">
                          Billing cycle: {userPlan?.billing_cycle || 'monthly'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Payment history will appear here</p>
              <p className="text-sm">Powered by Flutterwave</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upgrade;