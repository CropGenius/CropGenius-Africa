import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const fetchFieldIntel = async (fieldId: string) => {
  if (!fieldId) return null;

  const { data, error } = await supabase
    .from('field_intel')
    .select('satellite_health, last_scanned')
    .eq('field_id', fieldId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const useFieldIntel = (fieldId: string) => {
  return useQuery({
    queryKey: ['fieldIntel', fieldId],
    queryFn: () => fetchFieldIntel(fieldId),
    enabled: !!fieldId,
  });
};
