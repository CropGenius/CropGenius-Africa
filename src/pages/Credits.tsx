import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useBackendFeatures } from '@/hooks/useBackendFeatures';
import { CreditCard, Plus, History, Gift, Zap, Coins, Crown, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';


const Credits = () => {
  const { user } = useAuthContext();
  const { activateAllFeatures } = useBackendFeatures();
  const navigate = useNavigate();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [userPlan, setUserPlan] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadCredits();
      loadUserPlan();
    }
  }, [user]);

  const loadCredits = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user!.id)
      .single();
    
    setCredits(data?.credits || 0);
    setLoading(false);
  };

  const loadUserPlan = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_user_plan', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error fetching user plan:', error);
        return;
      }

      if (data && data.length > 0) {
        setUserPlan(data[0]);
      }
    } catch (error) {
      console.error('Error in loadUserPlan:', error);
    }
  };

  const handleActivateFeatures = async () => {
    setActivating(true);
    await activateAllFeatures();
    toast.success('All features activated!', {
      description: '1000 credits added to your account'
    });
    await loadCredits();
    setActivating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Credit Balance</h1>
        <p className="text-gray-600 mt-1">Manage your CropGenius credits</p>
      </div>

      {/* Current Balance */}
      <Card className="mb-6 bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Current Balance</p>
              <p className="text-3xl font-bold">{loading ? '...' : credits}</p>
              <p className="text-green-100 text-sm">Credits Available</p>
            </div>
            <Coins className="h-12 w-12 text-green-200" />
          </div>
        </CardContent>
      </Card>

      {/* Pro Upgrade Banner */}
      {!userPlan?.is_active && (
        <Card className="mb-6 bg-gradient-to-r from-green-600 to-emerald-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Crown className="h-12 w-12 text-yellow-300" />
                <div>
                  <h3 className="text-xl font-bold mb-1">Upgrade to CropGenius Pro</h3>
                  <p className="text-green-100 text-sm mb-2">
                    Unlimited credits + Premium AI features
                  </p>
                  <div className="text-sm text-green-100">
                    ✨ From KES 999/month • Save 58% with annual plan
                  </div>
                </div>
              </div>
              <Button
                onClick={() => navigate('/upgrade')}
                className="bg-white text-green-600 hover:bg-gray-100 font-semibold"
              >
                Upgrade Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="space-y-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Free Credit Boost
            </CardTitle>
            <CardDescription>
              Get 1000 free credits and unlock all premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleActivateFeatures}
              disabled={activating}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
            >
              {activating ? 'Activating...' : 'Activate Now'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-600" />
              Referral Bonus
            </CardTitle>
            <CardDescription>
              Earn 100 credits for each farmer you refer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Invite Friends
            </Button>
          </CardContent>
        </Card>
      </div>

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
            <Badge variant="outline">5 credits</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">AI Farm Plan</span>
            <Badge variant="outline">10 credits</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Yield Prediction</span>
            <Badge variant="outline">15 credits</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Market Intelligence</span>
            <Badge variant="outline">3 credits</Badge>
          </div>
        </CardContent>
      </Card>


    </div>
  );
};

export default Credits;