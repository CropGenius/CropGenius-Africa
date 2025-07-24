/**
 * 🚀💪 INFINITY GOD MODE FRONTEND PERFORMANCE HOOK
 * -------------------------------------------------------------
 * PRODUCTION-READY React hook for frontend performance monitoring
 * Built for 100 million African farmers with military-grade precision!
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  frontendPerformanceAnalyzer, 
  FrontendPerformanceMetrics,
  trackComponentRender,
  getPerformanceMetrics,
  getPerformanceSummary
} from '@/utils/frontendPerformanceAnalyzer';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

interface UseFrontendPerformanceReturn {
  // Performance metrics
  metrics: FrontendPerformanceMetrics | null;
  isLoading: boolean;
  error: Error | null;
  
  // Performance summary
  summary: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  
  // Monitoring controls
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearData: () => void;
  
  // Manual tracking
  trackRender: (componentName: string, renderTime: number, props?: any, state?: any) => void;
  
  // Utilities
  refreshMetrics: () => Promise<void>;
  exportMetrics: () => void;
}

/**
 * 🔥 INFINITY GOD MODE FRONTEND PERFORMANCE HOOK
 * Real-time performance monitoring with React integration
 */
export function useFrontendPerformance(): UseFrontendPerformanceReturn {
  const { user } = useAuthContext();
  
  // 🚀 STATE MANAGEMENT
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [summary, setSummary] = useState({
    score: 100,
    issues: [],
    recommendations: []
  });

  // 🔥 PERFORMANCE METRICS QUERY
  const {
    data: metrics,
    isLoading,
    error,
    refetch: refreshMetrics
  } = useQuery({
    queryKey: ['frontend-performance-metrics'],
    queryFn: async () => {
      return await getPerformanceMetrics();
    },
    enabled: !!user?.id && isMonitoring,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 2
  });

  // 🚀 UPDATE SUMMARY WHEN METRICS CHANGE
  useEffect(() => {
    if (metrics) {
      const newSummary = getPerformanceSummary();
      setSummary(newSummary);
      
      // Show performance warnings
      if (newSummary.score < 70) {
        toast.warning('Performance issues detected', {
          description: `Performance score: ${newSummary.score}/100`
        });
      }
    }
  }, [metrics]);

  // 🔥 START MONITORING
  const startMonitoring = useCallback(() => {
    frontendPerformanceAnalyzer.startMonitoring();
    setIsMonitoring(true);
    toast.success('Performance monitoring started');
  }, []);

  // 🚀 STOP MONITORING
  const stopMonitoring = useCallback(() => {
    frontendPerformanceAnalyzer.stopMonitoring();
    setIsMonitoring(false);
    toast.info('Performance monitoring stopped');
  }, []);

  // 🔥 CLEAR DATA
  const clearData = useCallback(() => {
    frontendPerformanceAnalyzer.clearData();
    setSummary({
      score: 100,
      issues: [],
      recommendations: []
    });
    toast.info('Performance data cleared');
  }, []);

  // 🚀 TRACK COMPONENT RENDER
  const trackRender = useCallback((componentName: string, renderTime: number, props?: any, state?: any) => {
    trackComponentRender(componentName, renderTime, props, state);
  }, []);

  // 🔥 EXPORT METRICS
  const exportMetrics = useCallback(() => {
    if (metrics) {
      const dataStr = JSON.stringify(metrics, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `frontend-performance-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success('Performance metrics exported');
    }
  }, [metrics]);

  return {
    // Performance metrics
    metrics: metrics || null,
    isLoading,
    error: error as Error | null,
    
    // Performance summary
    summary,
    
    // Monitoring controls
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearData,
    
    // Manual tracking
    trackRender,
    
    // Utilities
    refreshMetrics,
    exportMetrics
  };
}