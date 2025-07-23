/**
 * 🔥💪 REAL DISEASE DETECTION HOOK - INFINITY GOD MODE ACTIVATED!
 * PRODUCTION-READY hook with REAL AI, REAL security, ZERO fraud!
 * Built for 100 million African farmers with military-grade security!
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DiseaseDetectionResult, CropDiseaseOracle } from '@/agents/CropDiseaseOracle';
import { useAuthContext } from '@/providers/AuthProvider';
import { useErrorHandler } from '@/utils/errorHandling';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { toast } from 'sonner';

// 🚀 SECURE INTERFACES (NO FRAUD!)
export interface DetectionHistoryItem {
  id: string;
  created_at: string;
  crop_type: string;
  disease_name: string;
  scientific_name?: string;
  confidence: number;
  severity: string;
  affected_area_percentage: number;
  image_url?: string;
  location?: {
    lat: number;
    lng: number;
    country?: string;
    region?: string;
  };
  symptoms: string[];
  immediate_actions: string[];
  preventive_measures: string[];
  organic_solutions: string[];
  inorganic_solutions: string[];
  recommended_products: string[];
  economic_impact: {
    yield_loss_percentage: number;
    revenue_loss_usd: number;
    treatment_cost_usd: number;
  };
  local_suppliers: any[];
  recovery_timeline: string;
  spread_risk: string;
  source_api: string;
  status: 'pending' | 'confirmed' | 'treated';
  user_id: string;
  result_data: DiseaseDetectionResult;
}

export interface DetectionStats {
  total_detections: number;
  pending_detections: number;
  confirmed_detections: number;
  treated_detections: number;
  avg_confidence: number;
  most_common_crop: string;
  most_common_disease: string;
}

interface UseDiseaseDetectionReturn {
  // Detection State
  isDetecting: boolean;
  detectionResult: DiseaseDetectionResult | null;
  detectionHistory: DetectionHistoryItem[];
  detectionStats: DetectionStats | null;
  error: string | null;
  
  // Core Functions
  detectDisease: (file: File, cropType: string) => Promise<{ success: boolean; data?: DiseaseDetectionResult; error?: string }>;
  saveToHistory: (result: DiseaseDetectionResult, imageFile?: File) => Promise<{ success: boolean; error?: string }>;
  
  // History Management
  loadHistory: () => Promise<void>;
  deleteDetection: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateDetectionStatus: (id: string, status: 'pending' | 'confirmed' | 'treated') => Promise<{ success: boolean; error?: string }>;
  
  // Export & Analytics
  exportHistory: (format: 'csv' | 'json') => Promise<{ success: boolean; error?: string }>;
  getDetectionStats: () => Promise<void>;
  
  // Utility Functions
  clearError: () => void;
  clearResult: () => void;
  refreshData: () => Promise<void>;
}

/**
 * 🔥 INFINITY GOD MODE DISEASE DETECTION HOOK
 * Real AI-powered disease detection with military-grade security
 * NO FRAUD, NO FAKE PARAMETERS, ONLY REAL VALUE FOR FARMERS!
 */
export function useDiseaseDetection(): UseDiseaseDetectionReturn {
  const { user } = useAuthContext();
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  
  // 🚀 STATE MANAGEMENT
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DiseaseDetectionResult | null>(null);
  const [detectionHistory, setDetectionHistory] = useState<DetectionHistoryItem[]>([]);
  const [detectionStats, setDetectionStats] = useState<DetectionStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔥 REAL AI DISEASE DETECTION (NO FRAUD!)
  const detectDisease = useCallback(async (
    file: File, 
    cropType: string
  ): Promise<{ success: boolean; data?: DiseaseDetectionResult; error?: string }> => {
    
    // 🚨 SECURITY VALIDATION
    if (!user) {
      const errorMsg = 'Authentication required for disease detection';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    if (!isOnline) {
      const errorMsg = 'Internet connection required for AI analysis';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // 🔥 FILE VALIDATION
    if (!file || !file.type.startsWith('image/')) {
      const errorMsg = 'Valid image file required';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      const errorMsg = 'Image file too large (max 10MB)';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    if (!cropType || cropType.trim().length === 0) {
      const errorMsg = 'Crop type must be specified';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setIsDetecting(true);
      setError(null);
      setDetectionResult(null);

      // 🚀 REAL AI ANALYSIS - NO FAKE PARAMETERS!
      const oracle = new CropDiseaseOracle();
      const result = await oracle.analyzeCropImage(file, cropType);

      if (result.success && result.data) {
        setDetectionResult(result.data);
        
        toast.success('Disease Detection Complete!', {
          description: `Detected: ${result.data.disease_name} (${result.data.confidence}% confidence)`
        });

        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || 'AI analysis failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Disease detection failed';
      setError(errorMessage);
      
      handleError(err as Error, { 
        component: 'useDiseaseDetection',
        operation: 'detectDisease',
        cropType,
        fileSize: file.size,
        userId: user.id
      });

      toast.error('Detection Failed', {
        description: errorMessage
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsDetecting(false);
    }
  }, [user, isOnline, handleError]);

  // 🔥 SAVE TO HISTORY WITH MILITARY-GRADE SECURITY
  const saveToHistory = useCallback(async (
    result: DiseaseDetectionResult, 
    imageFile?: File
  ): Promise<{ success: boolean; error?: string }> => {
    
    if (!user) {
      return { success: false, error: 'User authentication required' };
    }

    try {
      let imageUrl: string | undefined;

      // 🚀 SECURE IMAGE UPLOAD
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('disease-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.warn('Image upload failed:', uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('disease-images')
            .getPublicUrl(uploadData.path);
          imageUrl = urlData.publicUrl;
        }
      }

      // 🔥 SECURE DATABASE INSERT WITH RLS
      const { error: insertError } = await supabase
        .from('crop_disease_detections')
        .insert({
          user_id: user.id, // RLS will enforce this matches auth.uid()
          crop_type: result.crop_type || 'Unknown',
          disease_name: result.disease_name,
          scientific_name: result.scientific_name,
          confidence: result.confidence,
          severity: result.severity,
          affected_area_percentage: result.affected_area_percentage || 0,
          image_url: imageUrl,
          location: result.location,
          symptoms: result.symptoms || [],
          immediate_actions: result.immediate_actions || [],
          preventive_measures: result.preventive_measures || [],
          organic_solutions: result.organic_solutions || [],
          inorganic_solutions: result.inorganic_solutions || [],
          recommended_products: result.recommended_products || [],
          economic_impact: result.economic_impact || {
            yield_loss_percentage: 0,
            revenue_loss_usd: 0,
            treatment_cost_usd: 0
          },
          local_suppliers: result.local_suppliers || [],
          recovery_timeline: result.recovery_timeline || 'Unknown',
          spread_risk: result.spread_risk || 'medium',
          source_api: result.source_api || 'cropgenius',
          status: 'pending',
          result_data: result
        });

      if (insertError) {
        throw insertError;
      }

      // Refresh history
      await loadHistory();

      toast.success('Saved to History', {
        description: 'Detection result saved successfully'
      });

      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save detection';
      
      handleError(err as Error, { 
        component: 'useDiseaseDetection',
        operation: 'saveToHistory',
        userId: user.id
      });

      return { success: false, error: errorMessage };
    }
  }, [user, handleError]);

  // 🚀 LOAD DETECTION HISTORY WITH SECURITY
  const loadHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('crop_disease_detections')
        .select('*')
        .eq('user_id', user.id) // RLS enforces this automatically
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) {
        throw fetchError;
      }

      const formattedHistory: DetectionHistoryItem[] = data?.map(item => ({
        id: item.id,
        created_at: item.created_at,
        crop_type: item.crop_type,
        disease_name: item.disease_name,
        scientific_name: item.scientific_name,
        confidence: item.confidence,
        severity: item.severity,
        affected_area_percentage: item.affected_area_percentage,
        image_url: item.image_url,
        location: item.location,
        symptoms: item.symptoms || [],
        immediate_actions: item.immediate_actions || [],
        preventive_measures: item.preventive_measures || [],
        organic_solutions: item.organic_solutions || [],
        inorganic_solutions: item.inorganic_solutions || [],
        recommended_products: item.recommended_products || [],
        economic_impact: item.economic_impact || {
          yield_loss_percentage: 0,
          revenue_loss_usd: 0,
          treatment_cost_usd: 0
        },
        local_suppliers: item.local_suppliers || [],
        recovery_timeline: item.recovery_timeline,
        spread_risk: item.spread_risk,
        source_api: item.source_api,
        status: item.status,
        user_id: item.user_id,
        result_data: item.result_data
      })) || [];

      setDetectionHistory(formattedHistory);

    } catch (err) {
      handleError(err as Error, { 
        component: 'useDiseaseDetection',
        operation: 'loadHistory',
        userId: user.id
      });
    }
  }, [user, handleError]);

  // 🔥 SECURE DELETE WITH RLS
  const deleteDetection = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      const { error: deleteError } = await supabase
        .from('crop_disease_detections')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Double security check

      if (deleteError) {
        throw deleteError;
      }

      // Refresh history
      await loadHistory();

      toast.success('Detection Deleted', {
        description: 'Detection record removed from history'
      });

      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete detection';
      
      handleError(err as Error, { 
        component: 'useDiseaseDetection',
        operation: 'deleteDetection',
        detectionId: id,
        userId: user.id
      });

      return { success: false, error: errorMessage };
    }
  }, [user, handleError, loadHistory]);

  // 🚀 UPDATE DETECTION STATUS
  const updateDetectionStatus = useCallback(async (
    id: string, 
    status: 'pending' | 'confirmed' | 'treated'
  ): Promise<{ success: boolean; error?: string }> => {
    
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      const { error: updateError } = await supabase
        .from('crop_disease_detections')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id); // Security check

      if (updateError) {
        throw updateError;
      }

      // Refresh history
      await loadHistory();

      toast.success('Status Updated', {
        description: `Detection marked as ${status}`
      });

      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      
      handleError(err as Error, { 
        component: 'useDiseaseDetection',
        operation: 'updateDetectionStatus',
        detectionId: id,
        status,
        userId: user.id
      });

      return { success: false, error: errorMessage };
    }
  }, [user, handleError, loadHistory]);

  // 🔥 EXPORT HISTORY
  const exportHistory = useCallback(async (format: 'csv' | 'json'): Promise<{ success: boolean; error?: string }> => {
    try {
      if (detectionHistory.length === 0) {
        return { success: false, error: 'No detection history to export' };
      }

      let content: string;
      let mimeType: string;
      let fileExtension: string;

      if (format === 'csv') {
        const csvHeaders = [
          'Date',
          'Crop Type',
          'Disease Name',
          'Scientific Name',
          'Confidence (%)',
          'Severity',
          'Affected Area (%)',
          'Treatment Cost ($)',
          'Revenue Loss ($)',
          'Recovery Timeline',
          'Status'
        ];

        const csvRows = detectionHistory.map(item => [
          new Date(item.created_at).toLocaleDateString(),
          item.crop_type,
          item.disease_name,
          item.scientific_name || '',
          item.confidence.toString(),
          item.severity,
          item.affected_area_percentage.toString(),
          item.economic_impact.treatment_cost_usd.toString(),
          item.economic_impact.revenue_loss_usd.toString(),
          item.recovery_timeline,
          item.status
        ]);

        content = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n');
        
        mimeType = 'text/csv;charset=utf-8;';
        fileExtension = 'csv';
      } else {
        content = JSON.stringify(detectionHistory, null, 2);
        mimeType = 'application/json;charset=utf-8;';
        fileExtension = 'json';
      }

      // Download file
      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `cropgenius-disease-history-${new Date().toISOString().split('T')[0]}.${fileExtension}`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Export Complete', {
        description: `History exported as ${format.toUpperCase()}`
      });

      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      
      handleError(err as Error, { 
        component: 'useDiseaseDetection',
        operation: 'exportHistory',
        format
      });

      return { success: false, error: errorMessage };
    }
  }, [detectionHistory, handleError]);

  // 🚀 GET DETECTION STATISTICS
  const getDetectionStats = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_user_detection_stats', { user_uuid: user.id });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setDetectionStats(data[0]);
      }

    } catch (err) {
      handleError(err as Error, { 
        component: 'useDiseaseDetection',
        operation: 'getDetectionStats',
        userId: user.id
      });
    }
  }, [user, handleError]);

  // 🔥 UTILITY FUNCTIONS
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setDetectionResult(null);
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadHistory(),
      getDetectionStats()
    ]);
  }, [loadHistory, getDetectionStats]);

  // 🚀 LOAD DATA ON MOUNT
  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  return {
    // Detection State
    isDetecting,
    detectionResult,
    detectionHistory,
    detectionStats,
    error,
    
    // Core Functions
    detectDisease,
    saveToHistory,
    
    // History Management
    loadHistory,
    deleteDetection,
    updateDetectionStatus,
    
    // Export & Analytics
    exportHistory,
    getDetectionStats,
    
    // Utility Functions
    clearError,
    clearResult,
    refreshData
  };
}