import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Gift, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';

export default function JoinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const referralCode = searchParams.get('ref');
  const [isStored, setIsStored] = useState(false);

  useEffect(() => {
    if (referralCode) {
      // Store referral code in localStorage for signup attribution
      localStorage.setItem('referralCode', referralCode);
      localStorage.setItem('referralTimestamp', new Date().toISOString());
      setIsStored(true);
      
      toast.success('🎉 Referral code applied!', {
        description: 'You\'ll get 10 FREE credits when you sign up!'
      });
    }
  }, [referralCode]);

  const handleSignUp = () => {
    navigate('/auth');
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  if (!referralCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <div className="text-orange-600 mb-4">
              <Zap className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-orange-800 mb-2">Invalid Referral Link</h2>
            <p className="text-orange-600 mb-4">
              This referral link appears to be invalid or expired. You can still join CropGenius!
            </p>
            <Button onClick={handleSignUp} className="w-full bg-orange-600 hover:bg-orange-700">
              Join CropGenius
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full shadow-lg">
              <Heart className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Welcome to CropGenius!
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            🎉 You've been invited by a farming friend!
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg">
              <Gift className="h-5 w-5 mr-2" />
              Referral Code: {referralCode}
            </Badge>
            {isStored && (
              <CheckCircle className="h-6 w-6 text-green-600" />
            )}
          </div>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-green-500 p-3 rounded-full w-fit mx-auto mb-4">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">10 FREE Credits</h3>
              <p className="text-green-700">
                Get started with 10 premium credits when you sign up - that's $10 worth of AI farming insights!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-500 p-3 rounded-full w-fit mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-800 mb-2">AI-Powered Insights</h3>
              <p className="text-blue-700">
                Get personalized crop recommendations, disease detection, and yield predictions powered by advanced AI.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-500 p-3 rounded-full w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-800 mb-2">Join 50,000+ Farmers</h3>
              <p className="text-purple-700">
                Connect with a thriving community of smart farmers sharing knowledge and growing together.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main CTA Card */}
        <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-2xl mb-8">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold mb-2">
              Ready to Transform Your Farm?
            </CardTitle>
            <p className="text-green-100 text-lg">
              Join thousands of farmers already saving money and increasing yields with AI
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-white/20 p-6 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Star className="h-6 w-6 text-yellow-300" />
                <span className="text-xl font-semibold">Your friend gets 10 credits too!</span>
                <Star className="h-6 w-6 text-yellow-300" />
              </div>
              <p className="text-green-100">
                When you sign up, both you and your friend receive rewards. It's a win-win!
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button 
                onClick={handleSignUp}
                size="lg"
                className="flex-1 bg-white text-green-600 hover:bg-green-50 font-bold text-lg py-6"
              >
                Sign Up & Get Credits
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <Button 
                onClick={handleLogin}
                size="lg"
                variant="outline"
                className="flex-1 border-white text-white hover:bg-white/10 font-bold text-lg py-6"
              >
                Already a Member?
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white border-gray-200 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                What You Get Instantly
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  AI crop disease detection
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Personalized farming recommendations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Weather-based alerts and insights
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Market price intelligence
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Community of expert farmers
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Success Stories
              </h3>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800 italic mb-2">
                    "Increased my tomato yield by 40% using CropGenius recommendations!"
                  </p>
                  <p className="text-xs text-green-600 font-semibold">- Sarah K., Kenya</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 italic mb-2">
                    "Saved $500 this season with AI-powered disease prevention."
                  </p>
                  <p className="text-xs text-blue-600 font-semibold">- James M., Nigeria</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p className="mb-2">
            🌱 Join the organic farming revolution today
          </p>
          <p className="text-sm">
            Your referral code <strong>{referralCode}</strong> is ready to unlock your free credits!
          </p>
        </div>

      </div>
    </div>
  );
}