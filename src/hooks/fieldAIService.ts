import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CropRecommendation {
  id: string;
  name: string;
  confidence: number;
  yieldEstimate: number;
  profitPotential: number;
  growthDays: number;
  waterRequirement: 'low' | 'medium' | 'high';
  soilCompatibility: number;
  diseaseResistance: number;
  tags: string[];
  icon: string;
}

export interface UseCropRecommendationsResult {
  recommendations: CropRecommendation[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCropRecommendations(
  fieldId: string | null,
  options?: { limit?: number }
): UseCropRecommendationsResult {
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecommendations = async () => {
    if (!fieldId) {
      setRecommendations([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First get field data to understand soil, climate, etc.
      const { data: fieldData, error: fieldError } = await supabase
        .from('fields')
        .select(`
          *,
          farms!inner(location, climate_zone),
          soil_data(*)
        `)
        .eq('id', fieldId)
        .single();

      if (fieldError) throw new Error(`Failed to fetch field data: ${fieldError.message}`);
      if (!fieldData) throw new Error('Field not found');

      // Then fetch recommendations from our AI service
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .functions.invoke('crop-recommendations', {
          body: {
            fieldId,
            soilData: fieldData.soil_data,
            location: fieldData.farms.location,
            climateZone: fieldData.farms.climate_zone,
            limit: options?.limit || 5
          }
        });

      if (recommendationsError) throw new Error(`Failed to get recommendations: ${recommendationsError.message}`);

      setRecommendations(recommendationsData);
    } catch (err) {
      console.error('Error fetching crop recommendations:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch crop recommendations'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [fieldId]);

  return {
    recommendations,
    isLoading,
    error,
    refetch: fetchRecommendations
  };
}

export default useCropRecommendations;