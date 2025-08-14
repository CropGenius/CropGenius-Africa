/**
 * 🌾 CROPGENIUS - PRODUCTION-READY CROP MANAGEMENT SERVICE
 * ========================================================
 * INFINITY-LEVEL service connecting frontend to crop_records Edge Function API
 * Built for 100 million African farmers! 🚀
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Crop Record interface matching the backend API
export interface CropRecord {
  id?: string;
  field_id: string;
  crop_type: string;
  planting_date: string;
  expected_harvest_date: string;
  actual_harvest_date?: string | null;
  status: 'planning' | 'growing' | 'harvested' | 'failed';
  area_planted: number;
  expected_yield?: number | null;
  actual_yield?: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CropRecordWithField extends CropRecord {
  fields?: {
    name: string;
    location: any;
  };
}

export interface CreateCropRecordData {
  field_id: string;
  crop_type: string;
  planting_date: string;
  expected_harvest_date: string;
  status: 'planning' | 'growing' | 'harvested' | 'failed';
  area_planted: number;
  expected_yield?: number;
  actual_yield?: number;
  notes?: string;
}

export interface UpdateCropRecordData extends Partial<CreateCropRecordData> {
  actual_harvest_date?: string;
}

// Available crop types for African farmers
export const CROP_TYPES = [
  { value: 'maize', label: 'Maize (Corn)', icon: '🌽' },
  { value: 'beans', label: 'Beans', icon: '🫘' },
  { value: 'rice', label: 'Rice', icon: '🌾' },
  { value: 'cassava', label: 'Cassava', icon: '🍠' },
  { value: 'sweet_potato', label: 'Sweet Potato', icon: '🍠' },
  { value: 'tomato', label: 'Tomato', icon: '🍅' },
  { value: 'onion', label: 'Onion', icon: '🧅' },
  { value: 'cabbage', label: 'Cabbage', icon: '🥬' },
  { value: 'carrot', label: 'Carrot', icon: '🥕' },
  { value: 'potato', label: 'Potato', icon: '🥔' },
  { value: 'wheat', label: 'Wheat', icon: '🌾' },
  { value: 'sorghum', label: 'Sorghum', icon: '🌾' },
  { value: 'millet', label: 'Millet', icon: '🌾' },
  { value: 'groundnuts', label: 'Groundnuts', icon: '🥜' },
  { value: 'sunflower', label: 'Sunflower', icon: '🌻' },
  { value: 'cotton', label: 'Cotton', icon: '🌱' },
  { value: 'coffee', label: 'Coffee', icon: '☕' },
  { value: 'tea', label: 'Tea', icon: '🍃' },
  { value: 'banana', label: 'Banana', icon: '🍌' },
  { value: 'avocado', label: 'Avocado', icon: '🥑' },
];

export const CROP_STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning', color: 'bg-blue-100 text-blue-800' },
  { value: 'growing', label: 'Growing', color: 'bg-green-100 text-green-800' },
  { value: 'harvested', label: 'Harvested', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
];

/**
 * Get all crop records for a user
 */
export const getCropRecords = async (fieldId?: string): Promise<CropRecordWithField[]> => {
  try {
    let query = supabase
      .from('crop_records')
      .select(`
        *,
        fields (
          name,
          location
        )
      `);

    if (fieldId) {
      query = query.eq('field_id', fieldId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching crop records:', error);
    toast.error('Failed to load crops', {
      description: error.message || 'Please try again later'
    });
    return [];
  }
};

/**
 * Get a single crop record by ID
 */
export const getCropRecord = async (id: string): Promise<CropRecord | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/crop-records/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch crop record');
    }

    return result.data;
  } catch (error: any) {
    console.error('Error fetching crop record:', error);
    toast.error('Failed to load crop', {
      description: error.message || 'Please try again later'
    });
    return null;
  }
};

/**
 * Create a new crop record
 */
export const createCropRecord = async (data: CreateCropRecordData): Promise<CropRecord | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: result, error } = await supabase
      .from('crop_records')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success('Crop added successfully! 🌱', {
      description: `${data.crop_type} has been added to your field`
    });

    return result;
  } catch (error: any) {
    console.error('Error creating crop record:', error);
    toast.error('Failed to add crop', {
      description: error.message || 'Please check your input and try again'
    });
    return null;
  }
};

/**
 * Update an existing crop record
 */
export const updateCropRecord = async (id: string, data: UpdateCropRecordData): Promise<CropRecord | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/crop-records/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to update crop record');
    }

    toast.success('Crop updated successfully! ✅', {
      description: 'Your crop information has been saved'
    });

    return result.data;
  } catch (error: any) {
    console.error('Error updating crop record:', error);
    toast.error('Failed to update crop', {
      description: error.message || 'Please try again later'
    });
    return null;
  }
};

/**
 * Delete a crop record
 */
export const deleteCropRecord = async (id: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/crop-records/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to delete crop record');
    }

    toast.success('Crop removed successfully', {
      description: 'The crop has been removed from your field'
    });

    return true;
  } catch (error: any) {
    console.error('Error deleting crop record:', error);
    toast.error('Failed to remove crop', {
      description: error.message || 'Please try again later'
    });
    return false;
  }
};

/**
 * Get crop type info by value
 */
export const getCropTypeInfo = (cropType: string) => {
  return CROP_TYPES.find(crop => crop.value === cropType) || {
    value: cropType,
    label: cropType.charAt(0).toUpperCase() + cropType.slice(1),
    icon: '🌱'
  };
};

/**
 * Get crop status info by value
 */
export const getCropStatusInfo = (status: string) => {
  return CROP_STATUS_OPTIONS.find(s => s.value === status) || {
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
    color: 'bg-gray-100 text-gray-800'
  };
};

/**
 * Calculate days until harvest
 */
export const getDaysUntilHarvest = (expectedHarvestDate: string): number => {
  const today = new Date();
  const harvestDate = new Date(expectedHarvestDate);
  const diffTime = harvestDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate crop age in days
 */
export const getCropAge = (plantingDate: string): number => {
  const today = new Date();
  const planted = new Date(plantingDate);
  const diffTime = today.getTime() - planted.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};