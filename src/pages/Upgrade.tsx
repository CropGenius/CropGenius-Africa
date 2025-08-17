import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PesapalUpgrade } from '@/components/payment/PesapalUpgrade';
import { toast } from 'sonner';

const Upgrade = () => {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  // Check URL for upgrade success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('upgrade') === 'success') {
      toast.success('Welcome to CropGenius Pro!', {
        description: 'Your account has been upgraded successfully.'
      });
      
      // Clean URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleUpgrade = async (plan: 'monthly' | 'annual') => {
    if (!user) {
      toast.error('Please log in to upgrade');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Ensure IPN URL is registered
      console.log('Ensuring IPN URL is registered...');
      
      const { error: ipnError } = await supabase.functions.invoke('pesapal-register-ipn');
      
      if (ipnError) {
        console.error('IPN registration error:', ipnError);
        toast.error('Failed to initialize payment system', {
          description: 'IPN URL registration failed. Please try again.'
        });
        return;
      }

      // Step 2: Initialize payment with proper notification_id
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

      // Open Pesapal payment page in new tab
      window.open(data.payment_link, '_blank');

      toast.success('Payment window opened! Complete your payment to activate Pro features.', {
        description: `Amount: KES ${data.amount} for CropGenius ${plan === 'annual' ? 'Pro Annual' : 'Pro'}`
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
      <PesapalUpgrade />
    </div>
  );
};

export default Upgrade;