/**
 * 🧠 USE FIELD INTELLIGENCE HOOK - UI INTELLIGENCE BRIDGE
 * React hook for field intelligence agent integration
 * INFINITY IQ DESIGN - Real-time, reactive, bulletproof
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldIntelligenceAgent, FieldAnalysisData, SatelliteIntelligence } from '@/agents/FieldIntelligenceAgent';
import { AgentContext, AgentResponse, ActionableRecommendation } from '@/agents/SuperIntelligenceAgent';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface FieldIntelligenceState {
  isAnalyzing: boolean;
  intelligence: SatelliteIntelligence | null;
  recommendations: ActionableRecommendation[];
  confidence: number;
  error: string | null;
  lastUpdated: Date | null;
}

export interface UseFieldIntelligenceOptions {
  fieldId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  priority?: 'low' | 'medium' | 'high' | 'emergency';
}

export interface UseFieldIntelligenceReturn {
  // State
  state: FieldIntelligenceState;
  
  // Actions
  analyzeField: () => Promise<void>;
  refreshAnalysis: () => Promise<void>;
  provideFeedback: (recommendationId: string, rating: number, implemented: boolean, outcome?: 'positive' | 'negative' | 'neutral', comments?: string) => Promise<void>;
  
  // Data
  fieldAnalysis: FieldAnalysisData | null;
  precisionAgriculture: any | null;
  alerts: any[];
  variableRateZones: any[];
  
  // Utilities
  isHealthy: boolean;
  needsAttention: boolean;
  criticalAlerts: any[];
}

/**
 * USE FIELD INTELLIGENCE - Main hook for field intelligence integration
 */
export function useFieldIntelligence(options: UseFieldIntelligenceOptions): UseFieldIntelligenceReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [state, setState] = useState<FieldIntelligenceState>({
    isAnalyzing: false,
    intelligence: null,
    recommendations: [],
    confidence: 0,
    error: null,
    lastUpdated: null
  });

  // Query key for caching
  const queryKey = ['field-intelligence', options.fieldId, user?.id];

  // Field intelligence query
  const {
    data: intelligenceResponse,
    isLoading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey,
    queryFn: () => executeFieldAnalysis(options.fieldId, user?.id || '', options.priority || 'medium'),
    enabled: !!user?.id && !!options.fieldId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: options.autoRefresh ? (options.refreshInterval || 30000) : false,
    retry: 2,
    retryDelay: 3000
  });

  // Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: (priority: string) => executeFieldAnalysis(options.fieldId, user?.id || '', priority),
    onMutate: () => {
      setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    },
    onSuccess: (response) => {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        intelligence: response.data || null,
        recommendations: response.recommendations,
        confidence: response.confidence.value,
        lastUpdated: new Date(),
        error: null
      }));
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey });
      
      toast.success('Field analysis completed', {
        description: `Confidence: ${(response.confidence.value * 100).toFixed(1)}%`
      });
    },
    onError: (error: Error) => {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error.message
      }));
      
      toast.error('Field analysis failed', {
        description: error.message
      });
    }
  });

  // Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async (params: {
      recommendationId: string;
      rating: number;
      implemented: boolean;
      outcome?: 'positive' | 'negative' | 'neutral';
      comments?: string;
    }) => {
      await fieldIntelligenceAgent.learn({
        recommendationId: params.recommendationId,
        rating: params.rating,
        implemented: params.implemented,
        outcome: params.outcome,
        comments: params.comments,
        timestamp: new Date()
      });
    },
    onSuccess: () => {
      toast.success('Feedback submitted', {
        description: 'Thank you for helping improve our recommendations'
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to submit feedback', {
        description: error.message
      });
    }
  });

  // Update state when query data changes
  useEffect(() => {
    if (intelligenceResponse && !isLoading) {
      setState(prev => ({
        ...prev,
        intelligence: intelligenceResponse.data || null,
        recommendations: intelligenceResponse.recommendations,
        confidence: intelligenceResponse.confidence.value,
        lastUpdated: new Date(),
        error: null
      }));
    }
  }, [intelligenceResponse, isLoading]);

  // Update error state
  useEffect(() => {
    if (queryError) {
      setState(prev => ({
        ...prev,
        error: queryError.message,
        isAnalyzing: false
      }));
    }
  }, [queryError]);

  // Actions
  const analyzeField = useCallback(async () => {
    if (!user?.id || !options.fieldId) {
      toast.error('Authentication required for field analysis');
      return;
    }
    
    await analysisMutation.mutateAsync(options.priority || 'medium');
  }, [user?.id, options.fieldId, options.priority, analysisMutation]);

  const refreshAnalysis = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const provideFeedback = useCallback(async (
    recommendationId: string,
    rating: number,
    implemented: boolean,
    outcome?: 'positive' | 'negative' | 'neutral',
    comments?: string
  ) => {
    await feedbackMutation.mutateAsync({
      recommendationId,
      rating,
      implemented,
      outcome,
      comments
    });
  }, [feedbackMutation]);

  // Computed values
  const fieldAnalysis = state.intelligence?.fieldAnalysis || null;
  const precisionAgriculture = state.intelligence?.precisionAgriculture || null;
  const alerts = precisionAgriculture?.alerts || [];
  const variableRateZones = precisionAgriculture?.variableRateZones || [];
  
  const isHealthy = fieldAnalysis ? fieldAnalysis.fieldHealth > 0.7 : false;
  const needsAttention = fieldAnalysis ? fieldAnalysis.fieldHealth < 0.5 || fieldAnalysis.moistureStress === 'high' || fieldAnalysis.moistureStress === 'critical' : false;
  const criticalAlerts = alerts.filter((alert: any) => alert.severity === 'critical');

  return {
    // State
    state: {
      ...state,
      isAnalyzing: isLoading || state.isAnalyzing
    },
    
    // Actions
    analyzeField,
    refreshAnalysis,
    provideFeedback,
    
    // Data
    fieldAnalysis,
    precisionAgriculture,
    alerts,
    variableRateZones,
    
    // Utilities
    isHealthy,
    needsAttention,
    criticalAlerts
  };
}

/**
 * EXECUTE FIELD ANALYSIS - Core analysis execution
 */
async function executeFieldAnalysis(
  fieldId: string,
  userId: string,
  priority: string
): Promise<AgentResponse<SatelliteIntelligence>> {
  if (!fieldId || !userId) {
    throw new Error('Field ID and User ID are required for analysis');
  }

  const context: AgentContext = {
    userId,
    fieldId,
    location: { lat: 0, lng: 0 }, // Will be fetched from field data
    timestamp: new Date(),
    sessionId: `field-analysis-${Date.now()}`,
    priority: priority as any,
    metadata: {
      source: 'field-intelligence-hook',
      version: '1.0.0'
    }
  };

  return await fieldIntelligenceAgent.process(context);
}

/**
 * USE FIELD INTELLIGENCE SUMMARY - Lightweight hook for dashboard display
 */
export function useFieldIntelligenceSummary(fieldId: string) {
  const { state, fieldAnalysis, isHealthy, needsAttention, criticalAlerts } = useFieldIntelligence({
    fieldId,
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute
    priority: 'low'
  });

  return {
    isLoading: state.isAnalyzing,
    healthScore: fieldAnalysis?.fieldHealth || 0,
    ndviValue: fieldAnalysis?.ndviValue || 0,
    moistureStress: fieldAnalysis?.moistureStress || 'unknown',
    isHealthy,
    needsAttention,
    criticalAlertsCount: criticalAlerts.length,
    lastUpdated: state.lastUpdated,
    confidence: state.confidence
  };
}

/**
 * USE FIELD RECOMMENDATIONS - Hook for recommendation display
 */
export function useFieldRecommendations(fieldId: string) {
  const { state, analyzeField } = useFieldIntelligence({
    fieldId,
    priority: 'medium'
  });

  const immediateActions = state.recommendations.filter(r => r.category === 'immediate');
  const shortTermPlanning = state.recommendations.filter(r => r.category === 'short_term');
  const longTermStrategy = state.recommendations.filter(r => r.category === 'long_term');

  return {
    isLoading: state.isAnalyzing,
    recommendations: state.recommendations,
    immediateActions,
    shortTermPlanning,
    longTermStrategy,
    totalRecommendations: state.recommendations.length,
    highPriorityCount: state.recommendations.filter(r => r.priority === 'high' || r.priority === 'critical').length,
    refreshRecommendations: analyzeField,
    confidence: state.confidence
  };
}