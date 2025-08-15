import React, { useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  CheckCircle, 
  Smartphone, 
  CreditCard, 
  QrCode, 
  Banknote,
  Shield,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface FlutterwaveUpgradeProps {
  onUpgradeStart?: () => void;
  onUpgradeComplete?: () => void;
}

export const FlutterwaveUpgrade: React.FC<FlutterwaveUpgradeProps> = ({
  onUpgradeStart,
  onUpgradeComplete
}) => {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'pro_annual'>('pro');

  const plans = {
    pro: {
      id: 'pro',
      name: 'CropGenius Pro',
      price: 999,
      originalPrice: 1999,
      period: 'month',
      description: 'Perfect for growing farms',
      savings: 'Save 50%',
      features: [
        'Unlimited crop disease scans',
        'AI-powered yield predictions',
        'Hyperlocal weather forecasts',
        'Premium market intelligence',
        'WhatsApp notifications',
        'Offline mode access',
        'Priority customer support',
        'Advanced farm analytics'
      ]
    },
    pro_annual: {
      id: 'pro_annual',
      name: 'CropGenius Pro Annual',
      price: 9999,
      originalPrice: 23988,
      period: 'year',
      description: 'Best value for serious farmers',
      savings: 'Save 58%',
      features: [
        'Everything in Pro',
        '2 months FREE (14 months total)',
        'Free soil testing kit',
        'Personal farm advisor calls',
        'Export assistance',
        'Bulk pricing for cooperatives',
        'Custom integration support',
        'Premium mobile app features'
      ]
    }
  };

  const paymentMethods = [
    { icon: Smartphone, name: 'M-Pesa', description: 'Most popular in Kenya' },
    { icon: CreditCard, name: 'Cards', description: 'Visa, Mastercard' },
    { icon: Banknote, name: 'Bank Transfer', description: 'Direct banking' },
    { icon: QrCode, name: 'QR Code', description: 'Quick scan payment' }
  ];

  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Please log in to upgrade');
      return;
    }

    setIsLoading(true);
    onUpgradeStart?.();

    try {
      console.log('Initiating Flutterwave payment for plan:', selectedPlan);

      const { data, error } = await supabase.functions.invoke('flutterwave-init-payment', {
        body: {
          plan_type: selectedPlan,
          redirect_url: `${window.location.origin}/dashboard?upgrade=success`
        }
      });

      if (error) {
        console.error('Flutterwave initialization error:', error);
        throw new Error(error.message || 'Failed to initialize payment');
      }

      if (!data?.success || !data?.payment_link) {
        throw new Error(data?.error || 'Invalid payment response');
      }

      console.log('Flutterwave payment link generated:', data.payment_link);

      // Open Flutterwave payment page in new tab
      window.open(data.payment_link, '_blank');

      toast.success('Payment window opened! Complete your payment to activate Pro features.', {
        description: `Amount: KES ${data.amount} for ${plans[selectedPlan].name}`
      });

      onUpgradeComplete?.();

    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Payment failed', {
        description: error instanceof Error ? error.message : 'Please try again or contact support'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlan = plans[selectedPlan];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2 rounded-full mb-4">
          <Zap className="h-5 w-5" />
          <span className="font-semibold">Upgrade to Pro</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Unlock Advanced Farming Intelligence
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Join thousands of successful farmers across Africa who increased their yields by 38% with CropGenius Pro
        </p>
      </div>

      {/* Plan Selection */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {Object.entries(plans).map(([key, plan]) => (
          <Card 
            key={key}
            className={`cursor-pointer transition-all ${
              selectedPlan === key 
                ? 'ring-2 ring-green-500 shadow-lg scale-105' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedPlan(key as 'pro' | 'pro_annual')}
          >
            <CardHeader className="text-center">
              <div className="flex justify-between items-start mb-2">
                <Badge variant={key === 'pro_annual' ? 'default' : 'secondary'}>
                  {plan.savings}
                </Badge>
                {selectedPlan === key && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </div>
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">{plan.description}</p>
              <div className="mt-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold text-green-600">
                    KES {plan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500">/ {plan.period}</span>
                </div>
                <div className="text-sm text-gray-500 line-through">
                  KES {plan.originalPrice.toLocaleString()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
                {plan.features.length > 4 && (
                  <li className="text-sm text-gray-500 ml-6">
                    +{plan.features.length - 4} more features
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Methods */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Secure Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {paymentMethods.map((method, index) => (
              <div key={index} className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <method.icon className="h-8 w-8 text-green-600 mb-2" />
                <div className="font-medium text-sm">{method.name}</div>
                <div className="text-xs text-gray-500">{method.description}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
            Powered by Flutterwave - Trusted by 290,000+ businesses across Africa
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">38% Higher Yields</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Average yield increase reported by Pro users
          </p>
        </div>
        <div className="text-center">
          <Clock className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Save 15 Hours/Week</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            AI automation reduces manual farm management
          </p>
        </div>
        <div className="text-center">
          <Users className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">10,000+ Farmers</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Join our growing community of successful farmers
          </p>
        </div>
      </div>

      {/* Upgrade Button */}
      <div className="text-center">
        <Button
          onClick={handleUpgrade}
          disabled={isLoading}
          size="lg"
          className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white px-8 py-4 text-lg font-semibold"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              Upgrade to {currentPlan.name}
            </>
          )}
        </Button>
        
        <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <div>💯 30-day money-back guarantee</div>
          <div>🔒 Secure payment processing by Flutterwave</div>
          <div>📱 Instant activation after payment</div>
        </div>
      </div>
    </div>
  );
};