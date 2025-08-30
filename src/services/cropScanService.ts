/**
 * 🔬 CROP SCAN SERVICE
 * Handles all crop scanning database operations
 * Enforces service boundary - UI components must use this, never direct DB calls
 */

import { supabase } from '@/integrations/supabase/client';

export interface CropScanData {
  user_id: string;
  crop_type: string;
  disease_name: string;
  scientific_name: string;
  confidence_score: number;
  severity: string;
  affected_area_percentage?: number;
  location_lat?: number;
  location_lng?: number;
  location_country?: string;
  symptoms?: string[];
  immediate_actions?: string[];
  preventive_measures?: string[];
  organic_solutions?: string[];
  inorganic_solutions?: string[];
  recommended_products?: string[];
  yield_loss_percentage?: number;
  revenue_loss_usd?: number;
  treatment_cost_usd?: number;
  recovery_timeline?: string;
  spread_risk?: string;
  source_api?: string;
  result_data?: any;
}

export interface ExpertReviewData {
  user_id: string;
  disease_name: string;
  confidence?: number;
  severity: string;
  status: 'pending' | 'reviewed' | 'rejected';
  created_at?: string;
  crop_type?: string;
  field_conditions?: string;
  farmer_notes?: string;
  image_url?: string;
}

/**
 * Save crop scan results to database
 */
export const saveCropScan = async (scanData: CropScanData): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('crop_scans')
      .insert(scanData);

    if (error) {
      console.error('❌ Failed to save crop scan:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Crop scan service error:', error);
    return { success: false, error: 'Failed to save crop scan' };
  }
};

/**
 * Request expert review for crop scan
 */
export const requestExpertReview = async (reviewData: ExpertReviewData): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('expert_reviews')
      .insert(reviewData);

    if (error) {
      console.error('❌ Failed to request expert review:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Expert review service error:', error);
    return { success: false, error: 'Failed to request expert review' };
  }
};

/**
 * Get current user (auth helper for services)
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('❌ Auth error:', error);
    return null;
  }
  return user;
};