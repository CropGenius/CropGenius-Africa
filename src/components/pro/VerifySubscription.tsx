import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export function VerifySubscription() {
  const { user, refreshSession } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const verifySubscriptionStatus = async () => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'Please log in to verify your subscription status',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Check user_subscriptions table
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_email', user.email)
        .single();

      if (subData && subData.status === 'active' && new Date(subData.expires_at) > new Date()) {
        localStorage.setItem('plan_is_pro', 'true');
        toast({
          title: 'Success!',
          description: 'Your subscription is active. Pro features are now enabled!',
        });
        
        // Force UI refresh
        await refreshSession();
        window.location.reload();
        return;
      }

      // Check payments table as fallback
      const { data: paymentData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_email', user.email)
        .eq('status', 'COMPLETED')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (paymentData) {
        // Create a subscription record if payment exists but subscription doesn't
        const planType = paymentData.amount >= 5000 ? 'annual' : 'monthly';
        const expiryDays = planType === 'annual' ? 365 : 30;
        
        await supabase
          .from('user_subscriptions')
          .upsert({
            user_email: user.email,
            plan_type: planType,
            status: 'active',
            activated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
          });

        localStorage.setItem('plan_is_pro', 'true');
        toast({
          title: 'Success!',
          description: 'Your subscription has been restored. Pro features are now enabled!',
        });
        
        // Force UI refresh
        await refreshSession();
        window.location.reload();
        return;
      }

      toast({
        title: 'No active subscription found',
        description: 'You don\'t appear to have an active subscription. Please upgrade to access Pro features.',
        variant: 'destructive'
      });

    } catch (error) {
      console.error('Error verifying subscription:', error);
      toast({
        title: 'Verification failed',
        description: 'An error occurred while verifying your subscription. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={verifySubscriptionStatus} 
      disabled={loading}
      variant="outline"
      size="sm"
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Verifying...
        </>
      ) : (
        'Verify Subscription Status'
      )}
    </Button>
  );
}

export default VerifySubscription;