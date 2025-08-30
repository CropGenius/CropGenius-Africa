import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuthContext } from '@/providers/SimpleAuthProvider';

const fetchFarms = async (userId: string) => {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data;
};

export const useUserFarms = () => {
  const { user } = useSimpleAuthContext();
  return useQuery({
    queryKey: ['farms', user?.id],
    queryFn: () => fetchFarms(user!.id),
    enabled: !!user,
  });
};

const createFarm = async (farm: { name: string; location: string; user_id: string }) => {
    const { data, error } = await supabase.from('farms').insert(farm).single();
    if (error) throw new Error(error.message);
    return data;
};

export const useCreateFarm = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createFarm,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['farms'] });
        },
    });
};
