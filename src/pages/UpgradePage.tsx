import React, { useState } from 'react';
import { Pricing } from '@/components/ui/pricing';
import { useAuthContext } from '@/providers/AuthProvider';
import { createCropGeniusPayment, CROPGENIUS_PRICING } from '@/services/pesapal';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const UpgradePage = () => {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (plan: 'monthly' | 'annual') => {
    if (!user?.email) {
      toast.error('Please login to upgrade your account');
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


      {/* Pricing Component */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Pricing
          monthlyPrice={999}
          annualPrice={5999}
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