import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCreateField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      // Remove auth requirement - allow guest users
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || `guest_${Date.now()}`;

      const { data, error } = await supabase
        .from('fields')
        .insert([{ ...payload, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      toast.success('Field created');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create field');
    },
  });
};