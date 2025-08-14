import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReferralStats {
  count: number;
  credits: number;
  conversionRate: number;
  totalClicks: number;
}

interface ReferralRecord {
  id: string;
  referred_id: string;
  created_at: string;
  rewarded_at: string | null;
  reward_issued: boolean;
}

export const useReferralSystem = () => {
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [referralStats, setReferralStats] = useState<ReferralStats>({ 
    count: 0, 
    credits: 0, 
    conversionRate: 0, 
    totalClicks: 0 
  });
  const [referralHistory, setReferralHistory] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeReferralSystem();
  }, []);

  const initializeReferralSystem = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await generateReferralCode();
      await loadReferralStats();
      await loadReferralHistory();
    } catch (err) {
      console.error('Failed to initialize referral system:', err);
      setError('Failed to load referral data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const code = user.id.slice(0, 8).toUpperCase();
      const link = `${window.location.origin}/join?ref=${code}`;
      
      setReferralCode(code);
      setReferralLink(link);
    } catch (err) {
      console.error('Failed to generate referral code:', err);
      throw new Error('Failed to generate referral code');
    }
  };

  const loadReferralStats = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);

      if (error) throw error;

      const count = data?.length || 0;
      const credits = count * 10; // 10 credits per referral
      
      // Calculate conversion rate (mock for now - would need click tracking)
      const conversionRate = count > 0 ? Math.min(100, (count / Math.max(count + 5, 10)) * 100) : 0;
      
      setReferralStats({
        count,
        credits,
        conversionRate: Math.round(conversionRate),
        totalClicks: count * 3 // Mock data - would track actual clicks
      });
    } catch (err) {
      console.error('Failed to load referral stats:', err);
      throw new Error('Failed to load referral statistics');
    }
  };

  const loadReferralHistory = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('referrals')
        .select('id, referred_id, created_at, rewarded_at, reward_issued')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReferralHistory(data || []);
    } catch (err) {
      console.error('Failed to load referral history:', err);
      // Don't throw here as history is not critical
    }
  };

  const processReferral = async (referredUserId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('referral-credit', {
        body: { referrerId: user.id, referredId: referredUserId }
      });

      if (error) throw error;

      toast.success('🎉 Referral processed successfully!', {
        description: 'Both you and your friend received 10 credits!'
      });

      // Refresh data
      await loadReferralStats();
      await loadReferralHistory();
      
      return data;
    } catch (err) {
      console.error('Failed to process referral:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process referral';
      setError(errorMessage);
      toast.error('Failed to process referral', {
        description: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const shareToWhatsApp = (customMessage?: string) => {
    const message = customMessage || `🌿 Join me on CropGenius - the AI farming revolution!

🚀 Get 10 FREE credits when you sign up with my referral code: ${referralCode}

💰 Save money on organic farming
🌱 Get AI-powered crop recommendations  
📱 Join thousands of successful farmers

Download now: ${referralLink}

#OrganicFarming #CropGenius #SmartFarming`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  };

  const refreshData = async () => {
    await initializeReferralSystem();
  };

  return {
    referralCode,
    referralLink,
    referralStats,
    referralHistory,
    loading,
    error,
    processReferral,
    shareToWhatsApp,
    copyToClipboard,
    refreshData
  };
};