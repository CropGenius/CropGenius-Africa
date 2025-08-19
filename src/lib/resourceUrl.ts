import type { SupabaseClient } from '@supabase/supabase-js';

export function buildPublicUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string
) {
  // supabase-js v2: deterministic public URL (no network call)
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}