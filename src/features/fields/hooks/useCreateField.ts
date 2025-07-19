import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createField } from '@/services/fieldService';
import { Field, Boundary } from '@/types/field';
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/AuthProvider';
import { isOnline } from '@/utils/isOnline';

interface CreateFieldPayload {
  name: string;
  farm_id: string;
  boundary?: Boundary | null;
  location?: { lat: number; lng: number } | null;
  size?: number;
  size_unit?: string;
  crop_type?: string;
  soil_type?: string;
  irrigation_type?: string;
  location_description?: string;
  planting_date?: Date | null;
  [key: string]: any;
}

/**
 * Hook for creating a new field with proper error handling and offline support.
 */
export const useCreateField = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: async (payload: CreateFieldPayload) => {
      if (!user) {
        throw new Error('You must be logged in to create a field.');
      }

      if (!payload.farm_id) {
        throw new Error('Farm ID is required to create a field.');
      }

      // Log the field creation attempt
      console.log(`🌱 [useCreateField] Creating field "${payload.name}" for farm ${payload.farm_id}`);

      // Add user_id to the payload
      const fieldData = {
        ...payload,
        user_id: user.id,
      };

      // Check if we're online
      const online = isOnline();
      if (!online) {
        console.log("⚠️ [useCreateField] Creating field in offline mode");
      }

      // Create the field
      const { data, error } = await createField(fieldData as Omit<Field, 'id' | 'created_at' | 'updated_at'>);

      if (error) {
        console.error("❌ [useCreateField] Error creating field:", error);
        throw new Error(error);
      }

      if (!data) {
        console.error("❌ [useCreateField] No data returned from createField");
        throw new Error('Failed to create field. No data returned.');
      }

      console.log("✅ [useCreateField] Field created successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate fields query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      
      // Show success toast only if not already shown by the component
      if (data.id && !data.id.startsWith('offline-')) {
        toast.success('Field created successfully!', {
          description: `"${data.name}" has been added to your farm.`
        });
      }
    },
    onError: (err: Error) => {
      // Show error toast only if not already shown by the component
      toast.error('Failed to create field', { 
        description: err.message || 'An unknown error occurred'
      });
      
      console.error("❌ [useCreateField] Error in mutation:", err);
    },
  });
};