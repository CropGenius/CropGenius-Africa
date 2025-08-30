import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuthContext } from '@/providers/SimpleAuthProvider';

export interface Subscription {
  id: string;
  user_email: string;
  plan_type: 'monthly' | 'annual';
  status: 'active' | 'expired' | 'cancelled';
  activated_at: string;
  expires_at: string;
}

export function useSubscription() {
  const { user } = useSimpleAuthContext();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      localStorage.removeItem('plan_is_pro'); // Ensure non-logged in users don't have pro status
      return;
    }

    const fetchSubscription = async () => {
      try {
        // Try user_subscriptions table first (used by Pesapal)
        const { data: subData, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_email', user.email)
          .single();

        if (subData) {
          console.log('Found subscription in user_subscriptions:', subData);
          setSubscription(subData);
          
          // Update local storage based on active status
          const isActive = subData.status === 'active' && new Date(subData.expires_at) > new Date();
          localStorage.setItem('plan_is_pro', isActive ? 'true' : 'false');
          return;
        }

        // If not found, try user_plans table (may be used by legacy or alternate payment systems)
        if (subError) {
          const { data: planData } = await supabase
            .from('user_plans')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

          if (planData) {
            console.log('Found subscription in user_plans:', planData);
            // Convert to subscription format
            const mappedSub = {
              id: planData.id,
              user_email: user.email,
              plan_type: planData.plan_type === 'pro' ? 'annual' : 'monthly',
              status: planData.is_active ? 'active' : 'expired',
              activated_at: planData.subscription_start_date || new Date().toISOString(),
              expires_at: planData.subscription_end_date || new Date().toISOString()
            };
            setSubscription(mappedSub);
            
            // Update local storage
            const isActive = planData.is_active && 
              (!planData.subscription_end_date || new Date(planData.subscription_end_date) > new Date());
            localStorage.setItem('plan_is_pro', isActive ? 'true' : 'false');
            return;
          }
        }

        // No subscription found in either table
        localStorage.setItem('plan_is_pro', 'false');
      } catch (error) {
        console.error('Error fetching subscription:', error);
        localStorage.setItem('plan_is_pro', 'false');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_email=eq.${user.email}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newSub = payload.new as Subscription;
            setSubscription(newSub);
            
            // Sync localStorage with subscription state
            const isActive = newSub.status === 'active' && new Date(newSub.expires_at) > new Date();
            localStorage.setItem('plan_is_pro', isActive ? 'true' : 'false');
            console.log('Subscription updated via realtime:', newSub, 'isActive:', isActive);
          } else if (payload.eventType === 'DELETE') {
            setSubscription(null);
            localStorage.setItem('plan_is_pro', 'false');
            console.log('Subscription deleted');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email]);

  const isActive = subscription?.status === 'active' && new Date(subscription.expires_at) > new Date();
  const isPro = isActive;
  
  // Sync localStorage with current state if it doesn't match
  useEffect(() => {
    const currentStoredValue = localStorage.getItem('plan_is_pro');
    if (currentStoredValue !== (isPro ? 'true' : 'false')) {
      localStorage.setItem('plan_is_pro', isPro ? 'true' : 'false');
    }
  }, [isPro]);

  return {
    subscription,
    loading,
    isActive,
    isPro
  };
}