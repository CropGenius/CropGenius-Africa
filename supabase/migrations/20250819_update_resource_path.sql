-- PURPOSE: Ensure the resource row points to the actual uploaded file path (no folders).
-- SAFE: Idempotent upsert by slug.

UPDATE public.resources
SET
  path = 'The_Ultimate_Organic_Farming_Guide.pdf',
  bucket = 'resources',
  is_public = true,
  is_active = true,
  is_featured = true,
  updated_at = now()
WHERE slug = 'ultimate-organic-farming-guide';