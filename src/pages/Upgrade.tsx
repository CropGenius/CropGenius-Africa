import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Pricing } from '@/components/ui/pricing';
import { toast } from 'sonner';
import { useUserPlan } from '@/hooks/useUserPlan';
import { usePaymentPolling } from '@/hooks/usePaymentPolling';
import { useRouter } from '@/hooks/useRouter';

const Upgrade = () => {
  const { user } = useAuthContext();
  const { refetch: refetchUserPlan, isPro } = useUserPlan();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentTrackingId, setPaymentTrackingId] = useState<string | null>(null);

  // Payment polling for seamless verification
  const { isPolling, isVerifying, isVerified } = usePaymentPolling({
    orderTrackingId: paymentTrackingId || undefined,
    onSuccess: () => {
      toast.success('🎉 Payment successful! Welcome to CropGenius Pro!', {
        description: 'All Pro features are now unlocked. Redirecting to dashboard...'
      });
      
      setTimeout(() => {
        router.navigate('/dashboard');
      }, 2000);
    }
  });

  // Check URL for upgrade success and start verification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const upgradeStatus = urlParams.get('upgrade');
    const orderTrackingId = urlParams.get('order_tracking_id');
    
    if (upgradeStatus === 'success' && orderTrackingId) {
      setPaymentTrackingId(orderTrackingId);
      toast.loading('Verifying your payment...', {
        description: 'Please wait while we confirm your transaction.'
      });
    } else if (upgradeStatus === 'success') {
      toast.success('Welcome to CropGenius Pro!', {
        description: 'Your account has been upgraded successfully.'
      });
    }
    
    // Clean URL
    if (upgradeStatus) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Redirect if already Pro
  useEffect(() => {
    if (isPro && !isLoading) {
      toast.info('You are already a Pro member!', {
        description: 'Redirecting to your dashboard...'
      });
      setTimeout(() => router.navigate('/dashboard'), 1500);
    }
  }, [isPro, isLoading, router]);

  const handleUpgrade = async (plan: 'monthly' | 'annual') => {
    if (!user) {
      toast.error('Please log in to upgrade');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Initiating Pesapal payment for plan:', plan);

      const planType = plan === 'annual' ? 'pro_annual' : 'pro';
      
const { data, error } = await supabase.functions.invoke('pesapal-init-payment', {
        body: {
          plan_type: planType,
          redirect_url: `${window.location.origin}/upgrade?upgrade=success`
        }
      });

      if (error) {
        console.error('Pesapal initialization error:', error);
        throw new Error(error.message || 'Failed to initialize payment');
      }

      if (!data?.success || !data?.payment_link) {
        throw new Error(data?.error || 'Invalid payment response');
      }

      console.log('Pesapal payment link generated:', data.payment_link);

      // Store tracking ID for verification
      setPaymentTrackingId(data.order_tracking_id);
      
      // Open Pesapal payment page in new tab
      window.open(data.payment_link, '_blank');

      toast.success('Payment window opened! Complete your payment to activate Pro features.', {
        description: `Amount: KES ${data.amount} for CropGenius ${plan === 'annual' ? 'Pro Annual' : 'Pro'}`,
        action: {
          label: 'Verify Payment',
          onClick: () => setPaymentTrackingId(data.order_tracking_id)
        }
      });

    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Payment failed', {
        description: error instanceof Error ? error.message : 'Please try again or contact support'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Login Required</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Please log in to upgrade to CropGenius Pro.
          </p>
          <Button onClick={() => window.location.href = '/auth'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Pricing 
        monthlyPrice={999}
        annualPrice={9999}
        title="Unlock CropGenius Pro"
        description="Join 10,000+ farmers across Africa with 38% higher yields"
        onUpgrade={handleUpgrade}
        isLoading={isLoading || isPolling || isVerifying}
        loadingText={
          isVerifying ? 'Verifying payment...' :
          isPolling ? 'Checking payment status...' :
          'Processing...'
        }
      />
    </div>
  );
};

export default Upgrade;