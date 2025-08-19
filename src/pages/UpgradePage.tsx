import React, { useState } from 'react';
import { Pricing } from '@/components/ui/pricing';
import { useAuthContext } from '@/providers/AuthProvider';
import { createCropGeniusPayment, CROPGENIUS_PRICING } from '@/services/pesapal';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const UpgradePage = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (plan: 'monthly' | 'annual') => {
    if (!user?.email) {
      toast.error('Please login to upgrade your account');
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    
    try {
      // Trigger success confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
      });

      const paymentResponse = await createCropGeniusPayment(
        plan,
        user.email,
        user.user_metadata?.phone || undefined,
        user.user_metadata?.first_name || undefined,
        user.user_metadata?.last_name || undefined
      );

      toast.success('Redirecting to secure payment...', {
        description: 'You will be redirected to Pesapal to complete your payment',
      });

      // Redirect to Pesapal payment page
      window.open(paymentResponse.redirect_url, '_blank');
      
    } catch (error) {
      console.error('Payment initialization failed:', error);
      toast.error('Payment initialization failed', {
        description: 'Please try again or contact support if the issue persists',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="container max-w-6xl pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Upgrade to CropGenius Pro</h1>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center space-y-4 mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            🚀 Transform Your Farming with AI Intelligence
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Join thousands of farmers already using CropGenius Pro to increase yields, 
            reduce costs, and make data-driven decisions that boost profitability.
          </p>
        </motion.div>

        {/* Success Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border">
            <div className="text-3xl font-bold text-green-600 mb-2">+40%</div>
            <div className="text-sm text-muted-foreground">Average Yield Increase</div>
          </div>
          <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border">
            <div className="text-3xl font-bold text-blue-600 mb-2">-25%</div>
            <div className="text-sm text-muted-foreground">Reduced Input Costs</div>
          </div>
          <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border">
            <div className="text-3xl font-bold text-purple-600 mb-2">10k+</div>
            <div className="text-sm text-muted-foreground">Satisfied Farmers</div>
          </div>
        </motion.div>
      </div>

      {/* Pricing Component */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Pricing
          monthlyPrice={CROPGENIUS_PRICING.monthly.price}
          annualPrice={CROPGENIUS_PRICING.annual.discounted}
          title="Choose Your CropGenius Pro Plan"
          description="Get unlimited access to all AI-powered farming tools and features"
          onUpgrade={handleUpgrade}
        />
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="container max-w-4xl py-16 text-center"
      >
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border">
          <h3 className="text-2xl font-bold mb-4">
            🌾 Ready to revolutionize your farming?
          </h3>
          <p className="text-muted-foreground mb-6">
            Join the AI farming revolution and start seeing results from day one. 
            Secure payment powered by Pesapal.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>✅ Secure payment</span>
            <span>•</span>
            <span>✅ Instant activation</span>
            <span>•</span>
            <span>✅ Money-back guarantee</span>
          </div>
        </div>
      </motion.div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-8 shadow-xl text-center max-w-sm"
          >
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="font-semibold mb-2">Initializing Payment...</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we prepare your secure payment
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UpgradePage;