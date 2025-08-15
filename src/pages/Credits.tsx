import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Plus, History, Gift, Zap, Coins, Crown, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';


interface UserPlan {
  plan_type: string;
  status: string;
  billing_cycle: string;
  current_period_end: string | null;
  is_active: boolean;
}

const Credits = () => {
  const { user } = useAuthContext();
  const [credits, setCredits] = useState(0);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load credits
      const { data: profileData } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user!.id)
        .single();
      
      setCredits(profileData?.credits || 0);

      // Load user plan
      const { data: planData, error: planError } = await supabase.rpc('get_user_plan', {
        user_uuid: user!.id
      });

      if (planError) {
        console.error('Error loading plan:', planError);
      } else if (planData && planData.length > 0) {
        setUserPlan(planData[0]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToFro = async (planType: 'pro' | 'pro_annual') => {
    if (!user) return;
    
    setUpgrading(true);
    try {
      // Initialize Flutterwave payment
      const { data, error } = await supabase.functions.invoke('flutterwave-init-payment', {
        body: {
          plan_type: planType,
          redirect_url: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      // Redirect to Flutterwave payment page
      window.open(data.payment_link, '_blank');
      
      toast.success('Redirecting to secure payment...', {
        description: `${planType === 'pro_annual' ? 'Annual' : 'Monthly'} Pro plan - KES ${data.amount}`
      });

    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Upgrade failed', {
        description: error.message || 'Please try again'
      });
    } finally {
      setUpgrading(false);
    }
  };

  const isPro = userPlan?.is_active;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isPro ? 'Pro Account' : 'Upgrade to Pro'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isPro ? 'Manage your CropGenius Pro subscription' : 'Unlock unlimited farming superpowers'}
        </p>
      </div>

      {/* Current Plan Status */}
      <Card className={`mb-6 ${isPro ? 'bg-gradient-to-r from-green-500 to-blue-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'} text-white`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {isPro ? <Crown className="h-6 w-6" /> : <Coins className="h-6 w-6" />}
                <p className="text-lg font-semibold">
                  {isPro ? 'CropGenius Pro' : 'Free Plan'}
                </p>
                {isPro && (
                  <Badge className="bg-white/20 text-white border-0">
                    {userPlan?.billing_cycle === 'yearly' ? 'Annual' : 'Monthly'}
                  </Badge>
                )}
              </div>
              <p className="text-3xl font-bold">{loading ? '...' : credits}</p>
              <p className="text-green-100 text-sm">Credits Available</p>
              {isPro && userPlan?.current_period_end && (
                <p className="text-xs text-white/80 mt-2">
                  Renews {new Date(userPlan.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
            {isPro ? (
              <CheckCircle className="h-12 w-12 text-green-200" />
            ) : (
              <Coins className="h-12 w-12 text-gray-200" />
            )}
          </div>
        </CardContent>
      </Card>

      {!isPro && (
        <>
          {/* Upgrade Options */}
          <div className="grid gap-4 mb-6">
            {/* Monthly Pro */}
            <Card className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-yellow-800">
                      <Crown className="h-5 w-5" />
                      CropGenius Pro Monthly
                    </CardTitle>
                    <CardDescription className="text-yellow-700">
                      Full access to all premium features
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-yellow-800">KES 999</div>
                    <div className="text-sm text-yellow-600">/month</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Unlimited AI scans</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>M-Pesa payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Premium insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Priority support</span>
                  </div>
                </div>
                <Button 
                  onClick={() => handleUpgradeToFro('pro')}
                  disabled={upgrading}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                >
                  {upgrading ? 'Processing...' : 'Upgrade Monthly'}
                </Button>
              </CardContent>
            </Card>

            {/* Annual Pro */}
            <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 relative">
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Save 17%
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <Crown className="h-5 w-5" />
                      CropGenius Pro Annual
                    </CardTitle>
                    <CardDescription className="text-green-700">
                      Best value - 2 months free!
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-800">KES 9,999</div>
                    <div className="text-sm text-green-600">/year</div>
                    <div className="text-xs text-green-500 line-through">KES 11,988</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Everything in Monthly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>2 months FREE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Annual insights report</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Dedicated support</span>
                  </div>
                </div>
                <Button 
                  onClick={() => handleUpgradeToFro('pro_annual')}
                  disabled={upgrading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {upgrading ? 'Processing...' : 'Upgrade Annual'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Secure Payment Options
              </CardTitle>
              <CardDescription>
                Powered by Flutterwave - trusted by millions across Africa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    📱
                  </div>
                  <div>
                    <div className="font-medium">Mobile Money</div>
                    <div className="text-gray-500">M-Pesa, Airtel Money</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    💳
                  </div>
                  <div>
                    <div className="font-medium">Cards</div>
                    <div className="text-gray-500">Visa, Mastercard</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    🏦
                  </div>
                  <div>
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-gray-500">Direct bank payment</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    📊
                  </div>
                  <div>
                    <div className="font-medium">QR Code</div>
                    <div className="text-gray-500">Scan & pay</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Credit Usage */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            How Credits Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Crop Disease Scan</span>
            <Badge variant="outline">{isPro ? 'FREE' : '5 credits'}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">AI Farm Plan</span>
            <Badge variant="outline">{isPro ? 'FREE' : '10 credits'}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Yield Prediction</span>
            <Badge variant="outline">{isPro ? 'FREE' : '15 credits'}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Market Intelligence</span>
            <Badge variant="outline">{isPro ? 'FREE' : '3 credits'}</Badge>
          </div>
        </CardContent>
      </Card>

      {!isPro && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-600" />
              Earn Free Credits
            </CardTitle>
            <CardDescription>
              Refer farmers and earn 100 credits each
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Share with Friends
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Credits;