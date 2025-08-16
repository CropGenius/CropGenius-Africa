import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketIntelligenceBoard from '../components/MarketIntelligenceBoard';

const MarketInsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const isPro = useMemo(() => {
    try { return localStorage.getItem('plan_is_pro') === 'true'; } catch { return false; }
  }, []);

  useEffect(() => {
    if (!isPro) {
      navigate('/upgrade');
    }
  }, [isPro, navigate]);
  if (!isPro) return null;

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
