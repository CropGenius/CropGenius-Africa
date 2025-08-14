import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentWeather } from '@/agents/WeatherAgent';
import { analyzeField } from '@/intelligence/fieldIntelligence';

export const useDashboardData = (userId?: string) => {
  return useQuery({
    queryKey: ['dashboardData', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Get real user fields
      const { data: fields } = await supabase
        .from('fields')
        .select('*')
        .eq('user_id', userId);
      
      // Get real weather for Kakamega, Kenya
      let weather = null;
      try {
        weather = await getCurrentWeather(0.2827, 34.7519, undefined, false, userId);
      } catch (error) {
        console.warn('Weather fetch failed:', error);
      }
      
      // Calculate real farm health from field analysis
      let farmHealth = 65; // Default
      if (fields && fields.length > 0) {
        const healthScores = [];
        for (const field of fields) {
          if (field.boundary?.coordinates?.length > 2) {
            try {
              const analysis = await analyzeField(field.boundary.coordinates, userId);
              healthScores.push(analysis.fieldHealth * 100);
            } catch (error) {
              healthScores.push(65); // Fallback
            }
          }
        }
        if (healthScores.length > 0) {
          farmHealth = Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length);
        }
      }
      
      return {
        totalFields: fields?.length || 0,
        farmHealth,
        fields: fields || [],
        weather,
        location: 'Kakamega, Kenya'
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
