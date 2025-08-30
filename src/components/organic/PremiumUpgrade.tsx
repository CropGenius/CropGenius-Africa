/**
 * 🔥 PREMIUM UPGRADE - ULTRA SIMPLE IRRESISTIBLE OFFER
 * BioCert Pro upgrade with maximum conversion
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Crown, Zap, CheckCircle, DollarSign, TrendingUp, Star } from 'lucide-react';
import { premiumEngine, PremiumFeature } from '../../services/PremiumEngine';
import { useSimpleAuthContext as useAuth } from '@/providers/SimpleAuthProvider';

interface PremiumUpgradeProps {
  feature?: string;
  onUpgrade?: () => void;
}

export const PremiumUpgrade: React.FC<PremiumUpgradeProps> = ({ feature, onUpgrade }) => {
  const { user } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  
  const features = premiumEngine.getFeatures();
  const roi = premiumEngine.calculateROI();

  const handleUpgrade = async () => {
    if (!user) return;
    
    setUpgrading(true);
    try {
      // Simulate upgrade process
      await new Promise(resolve => setTimeout(resolve, 2000));
      premiumEngine.upgradeToPremium(user.id);
      
      if (onUpgrade) onUpgrade();
      
      // Show success message
      alert('🎉 Welcome to BioCert Pro! You now have access to all premium features!');
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <Card className="w-full bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-yellow-300 shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <Crown className="h-16 w-16 text-yellow-600 animate-bounce" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          Upgrade to BioCert Pro
        </CardTitle>
        <p className="text-gray-600">
          🚀 Unlock unlimited organic superpowers and save $500+ monthly!
        </p>
      </CardHeader>
      
      <CardContent>
        {/* ROI Highlight */}
        <div className="bg-green-100 rounded-lg p-4 mb-6 text-center border-2 border-green-300">
          <div className="text-3xl font-bold text-green-600 mb-2">{roi.roi}% ROI</div>
          <div className="text-sm text-green-700">
            Pay ${roi.investment}/year • Save ${roi.returns}/year
          </div>
          <div className="text-xs text-green-600 mt-1">
            💰 Net profit: ${roi.returns - roi.investment}/year
          </div>
        </div>

        {/* Pricing */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-gray-800 mb-2">
            $9.99<span className="text-lg text-gray-600">/month</span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="line-through">$19.99</span> • 50% OFF Limited Time!
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {features.filter(f => f.isPremium).map(feature => (
            <div key={feature.id} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-bold text-gray-800 text-sm">{feature.name}</div>
                <div className="text-xs text-gray-600">{feature.description}</div>
              </div>
              <div className="text-xs font-bold text-green-600">{feature.value}</div>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
            ))}
          </div>
          <div className="text-sm font-bold text-blue-800">4.9/5 from 10,000+ farmers</div>
          <div className="text-xs text-blue-600">"BioCert Pro increased my profits by 300%!" - John K.</div>
        </div>

        {/* Upgrade Button */}
        <Button 
          onClick={handleUpgrade}
          disabled={upgrading}
          className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-4 text-lg shadow-lg"
        >
          {upgrading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Upgrading...
            </>
          ) : (
            <>
              <Crown className="h-5 w-5 mr-2" />
              Upgrade to BioCert Pro
            </>
          )}
        </Button>

        {/* Guarantee */}
        <div className="text-center mt-4">
          <div className="text-sm font-bold text-gray-800">💯 30-Day Money-Back Guarantee</div>
          <div className="text-xs text-gray-600">
            If you don't save at least $100 in your first month, get a full refund no questions asked!
          </div>
        </div>

        {/* Urgency */}
        <div className="bg-red-100 rounded-lg p-3 mt-4 text-center border border-red-300">
          <div className="text-sm font-bold text-red-800">⏰ Limited Time: 50% OFF</div>
          <div className="text-xs text-red-600">Only 48 hours left at this price!</div>
        </div>
      </CardContent>
    </Card>
  );
};