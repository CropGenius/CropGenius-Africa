import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/providers/AuthProvider';

export interface Subscription {
  id: string;
  user_email: string;
  plan_type: 'monthly' | 'annual';
  status: 'active' | 'expired' | 'cancelled';
  activated_at: string;
  expires_at: string;
}

export interface UserCredits {
  id: string;
  user_email: string;
  credits: number;
}

export function useSubscription() {
  const { user } = useAuthContext();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    const fetchSubscriptionData = async () => {
      try {
        // Fetch subscription
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_email', user.email)
          .single();

        if (subData) {
          setSubscription(subData);
        }

        // Fetch credits
        const { data: creditsData } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_email', user.email)
          .single();

        if (creditsData) {
          setCredits(creditsData);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();

    // Subscribe to real-time updates
    const subscriptionChannel = supabase
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
            setSubscription(payload.new as Subscription);
          } else if (payload.eventType === 'DELETE') {
            setSubscription(null);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_email=eq.${user.email}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setCredits(payload.new as UserCredits);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscriptionChannel);
    };
  }, [user?.email]);

  const isActive = subscription?.status === 'active' && new Date(subscription.expires_at) > new Date();
  const isPro = isActive;
  const creditsRemaining = credits?.credits || 0;

  return {
    subscription,
    credits,
    loading,
    isActive,
    isPro,
    creditsRemaining,
    refresh: () => {
      if (user?.email) {
        setLoading(true);
        // Trigger refetch
      }
    }
  };
}