import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCreateField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error('Please sign in to create fields');
      }

      // Check if user is pro
      const isPro = localStorage.getItem('plan_is_pro') === 'true';
      
      if (!isPro) {
        // For free users, check field count limitation (1 field max)
        const { data: existingFields, error: countError } = await supabase
          .from('fields')
          .select('id')
          .eq('user_id', user.id);
          
        if (countError) throw countError;
        
        if (existingFields && existingFields.length >= 1) {
          throw new Error('Free users can only create 1 field. Upgrade to Pro for unlimited fields.');
        }
      }

      const { data, error } = await supabase
        .from('fields')
        .insert([{ ...payload, user_id: user.id }])
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