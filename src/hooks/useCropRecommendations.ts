import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedCropRecommendation {
    id: string;
    name: string;
    confidence: number;
    aiReasoning: string;
    waterNeeds: 'Low' | 'Medium' | 'High';
    sunExposure: 'Full Sun' | 'Partial Shade' | 'Full Shade';
    temperature: string;
    growingSeason: string[];
    marketOutlook?: {
      pricetrend: 'rising' | 'falling' | 'stable';
      currentPrice: number;
      demandLevel: 'high' | 'medium' | 'low';
    };
    diseaseRisk?: {
      level: 'high' | 'medium' | 'low';
      commonDiseases: string[];
    };
    economicViability?: {
        profitabilityScore: number;
    };
    expectedYield?: {
        min: number;
        max: number;
        unit: string;
    };
    compatibility?: string[];
    plantingWindow?: {
        optimal: string;
    };
  }

export interface FarmContext {
    userId: string;
    farmId: string;
}

const fetchCropRecommendations = async (fieldId: string, farmContext: FarmContext) => {
  if (!fieldId || !farmContext.userId) return null;

  const { data, error } = await supabase.functions.invoke('crop-recommendations', {
    body: { fieldId, farmContext },
  });

  if (error) throw new Error(error.message);
  return data as EnhancedCropRecommendation[];
};

export const useCropRecommendations = (fieldId: string, farmContext: FarmContext, options: { enabled: boolean; staleTime: number; refetchInterval: number; }) => {
  return useQuery({
    queryKey: ['cropRecommendations', fieldId],
    queryFn: () => fetchCropRecommendations(fieldId, farmContext),
    ...options
  });
};
