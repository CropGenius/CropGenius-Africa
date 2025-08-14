-- Add missing columns to fields table for production deployment
-- This fixes the 400 Bad Request: "Could not find column" errors

ALTER TABLE public.fields 
ADD COLUMN IF NOT EXISTS soil_type TEXT DEFAULT 'loamy',
ADD COLUMN IF NOT EXISTS irrigation_type TEXT DEFAULT 'rainfed',
ADD COLUMN IF NOT EXISTS crop_type TEXT DEFAULT 'mixed',
ADD COLUMN IF NOT EXISTS season TEXT DEFAULT '2024',
ADD COLUMN IF NOT EXISTS farm_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fields_soil_type ON public.fields(soil_type);
CREATE INDEX IF NOT EXISTS idx_fields_crop_type ON public.fields(crop_type);
CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON public.fields(farm_id);

-- Update existing records with default values
UPDATE public.fields 
SET soil_type = 'loamy', 
    irrigation_type = 'rainfed', 
    crop_type = 'mixed', 
    season = '2024'
WHERE soil_type IS NULL;