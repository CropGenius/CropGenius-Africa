import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { useAuth } from '@/hooks/useAuth';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Gift, 
  Copy, 
  Share2, 
  Trophy, 
  Zap,
  TrendingUp,
  Star,
  MessageCircle,
  Check,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { viralEngine } from '@/services/ViralEngine';
import ReferralAnalytics from '@/components/referrals/ReferralAnalytics';

export default function ReferralsPage() {
  const { referralCode, referralStats, referralLink, loading, error } = useReferralSystem();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  const navigate = useNavigate();
  
  // Check if user is premium (simplified check)
  const isPremium = useMemo(() => {
    try { return localStorage.getItem('plan_is_pro') === 'true'; } catch { return false; }
  }, []);

  // Redirect to upgrade if not premium
  useEffect(() => {
    if (!isPremium) {
      navigate('/upgrade');
    }
  }, [isPremium, navigate]);

  // Don't render anything if not premium (will redirect)
  if (!isPremium) return null;

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied to clipboard!', {
        description: 'Share it with your farming friends to earn rewards'
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareToWhatsApp = () => {
    const variant = viralEngine.getOptimalMessageVariant();
    const message = viralEngine.createReferralMessage(referralCode, referralLink, variant);
    viralEngine.shareToWhatsApp(message);
    viralEngine.trackMessagePerformance(variant, 'whatsapp', 'current-user');
  };

  const shareToSocial = async () => {
    const variant = viralEngine.getOptimalMessageVariant();
    const message = viralEngine.createReferralMessage(referralCode, referralLink, variant);
    
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: 'Join CropGenius - AI Farming Revolution',
          text: message,
          url: referralLink
        });
        viralEngine.trackMessagePerformance(variant, 'native-share', 'current-user');
      } catch (error) {
        viralEngine.shareToWhatsApp(message);
        viralEngine.trackMessagePerformance(variant, 'whatsapp-fallback', 'current-user');
      }
    } else {
      viralEngine.shareToSocial('twitter', message);
      viralEngine.trackMessagePerformance(variant, 'twitter', 'current-user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 pb-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 pb-20 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <div className="text-red-600 mb-4">
                <Zap className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-xl font-bold text-red-800 mb-2">Oops! Something went wrong</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="destructive">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Invite Friends & Earn Rewards
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Share CropGenius with your farming friends and both of you get 10 FREE credits! 
            Help build the world's largest community of smart farmers.
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="referrals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="referrals" className="space-y-6">

        {/* Referral Code Card */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-green-800">
              <Gift className="h-6 w-6" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-white p-6 rounded-xl border-2 border-green-300 shadow-inner">
              <div className="text-4xl font-bold text-green-700 mb-2 tracking-wider">
                {referralCode}
              </div>
              <div className="text-sm text-green-600 mb-4">
                Share this code or use the link below
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-700 break-all">
                {referralLink}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={copyReferralLink}
                variant="outline"
                className="flex-1 sm:flex-none border-green-300 text-green-700 hover:bg-green-50"
              >
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              
              <Button 
                onClick={shareToWhatsApp}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Share on WhatsApp
              </Button>
              
              <Button 
                onClick={shareToSocial}
                variant="outline"
                className="flex-1 sm:flex-none border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Social
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-500 p-3 rounded-full w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-700 mb-1">
                {referralStats.count}
              </div>
              <div className="text-blue-600 font-medium">Friends Invited</div>
              <div className="text-xs text-blue-500 mt-1">
                Keep sharing to grow your network!
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-500 p-3 rounded-full w-fit mx-auto mb-4">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-purple-700 mb-1">
                {referralStats.credits}
              </div>
              <div className="text-purple-600 font-medium">Credits Earned</div>
              <div className="text-xs text-purple-500 mt-1">
                10 credits per successful referral
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6 text-center">
              <div className="bg-orange-500 p-3 rounded-full w-fit mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-orange-700 mb-1">
                {referralStats.count > 0 ? Math.round((referralStats.count / (referralStats.count + 5)) * 100) : 0}%
              </div>
              <div className="text-orange-600 font-medium">Success Rate</div>
              <div className="text-xs text-orange-500 mt-1">
                Your referral conversion rate
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Badges */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Star className="h-6 w-6" />
              Referral Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`text-center p-4 rounded-lg border-2 ${referralStats.count >= 1 ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'}`}>
                <div className="text-2xl mb-2">🌱</div>
                <div className="font-semibold text-sm">First Friend</div>
                <Badge variant={referralStats.count >= 1 ? "default" : "secondary"} className="mt-1">
                  {referralStats.count >= 1 ? "Earned!" : "0/1"}
                </Badge>
              </div>
              
              <div className={`text-center p-4 rounded-lg border-2 ${referralStats.count >= 5 ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'}`}>
                <div className="text-2xl mb-2">🤝</div>
                <div className="font-semibold text-sm">Connector</div>
                <Badge variant={referralStats.count >= 5 ? "default" : "secondary"} className="mt-1">
                  {referralStats.count >= 5 ? "Earned!" : `${referralStats.count}/5`}
                </Badge>
              </div>
              
              <div className={`text-center p-4 rounded-lg border-2 ${referralStats.count >= 10 ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'}`}>
                <div className="text-2xl mb-2">📢</div>
                <div className="font-semibold text-sm">Influencer</div>
                <Badge variant={referralStats.count >= 10 ? "default" : "secondary"} className="mt-1">
                  {referralStats.count >= 10 ? "Earned!" : `${referralStats.count}/10`}
                </Badge>
              </div>
              
              <div className={`text-center p-4 rounded-lg border-2 ${referralStats.count >= 25 ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'}`}>
                <div className="text-2xl mb-2">🏆</div>
                <div className="font-semibold text-sm">Viral Master</div>
                <Badge variant={referralStats.count >= 25 ? "default" : "secondary"} className="mt-1">
                  {referralStats.count >= 25 ? "Earned!" : `${referralStats.count}/25`}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-800">How Referrals Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Share2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Share Your Code</h3>
                <p className="text-sm text-gray-600">
                  Share your referral code or link with farming friends via WhatsApp, social media, or direct message.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Friend Signs Up</h3>
                <p className="text-sm text-gray-600">
                  When your friend signs up using your code, they get 10 FREE credits to start their farming journey.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Gift className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. You Both Win</h3>
                <p className="text-sm text-gray-600">
                  You earn 10 credits as a reward, and your friend gets started with premium features. Everyone wins!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {user?.id && (
              <ReferralAnalytics 
                userId={user.id} 
                isPremium={isPremium}
              />
            )}
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}