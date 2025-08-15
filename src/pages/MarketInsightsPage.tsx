import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import MarketIntelligenceBoard from '../components/MarketIntelligenceBoard';

const MarketInsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const isPro = useMemo(() => {
    try { return localStorage.getItem('plan_is_pro') === 'true'; } catch { return false; }
  }, []);

  if (!isPro) {
    return (
      <div className="container py-10 flex flex-col items-center text-center">
        <Shield className="h-10 w-10 text-amber-500 mb-2" />
        <h1 className="text-2xl font-semibold mb-1">Market Insights is a Pro feature</h1>
        <p className="text-gray-600 max-w-xl mb-4">
          Upgrade to Pro to unlock real-time market data, AI price trends, and buyer discovery tailored to your crops.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/upgrade')} className="bg-green-600 hover:bg-green-700">Upgrade to Pro</Button>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Smart Market Insights</h1>
        <p className="text-gray-600 mt-1">
          Access real-time market data, price trends, and AI-powered insights for your crops.
        </p>
      </div>
      <MarketIntelligenceBoard />
    </div>
  );
};

export default MarketInsightsPage;
