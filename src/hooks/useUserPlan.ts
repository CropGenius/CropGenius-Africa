import { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface UserPlan {
  plan_type: string;
  status: string;
  billing_cycle: string;
  current_period_end: string | null;
  is_active: boolean;
}

export const useUserPlan = () => {
  const { user } = useAuthContext();
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserPlan();
    }
  }, [user]);

  const loadUserPlan = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_plan', {
        user_uuid: user!.id
      });

      if (error) {
        console.error('Error loading plan:', error);
      } else if (data && data.length > 0) {
        setUserPlan(data[0]);
      }
    } catch (error) {
      console.error('Error in loadUserPlan:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPro = userPlan?.is_active || false;

  return {
    userPlan,
    isPro,
    loading,
    refetch: loadUserPlan
  };
};