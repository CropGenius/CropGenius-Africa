-- Add missing irrigation_type column to fields table
-- This fixes the PGRST204 error when creating new fields

DO $$
BEGIN
    -- Check if irrigation_type column exists in fields table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fields' AND column_name = 'irrigation_type'
    ) THEN
        ALTER TABLE public.fields ADD COLUMN irrigation_type TEXT DEFAULT 'rain-fed';
    END IF;
    
    -- Check if size_unit column exists in fields table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fields' AND column_name = 'size_unit'
    ) THEN
        ALTER TABLE public.fields ADD COLUMN size_unit TEXT DEFAULT 'acres';
    END IF;
    
    -- Check if season column exists in fields table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fields' AND column_name = 'season'
    ) THEN
        ALTER TABLE public.fields ADD COLUMN season TEXT DEFAULT 'annual';
    END IF;
    
    -- Check if health_score column exists in fields table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fields' AND column_name = 'health_score'
    ) THEN
        ALTER TABLE public.fields ADD COLUMN health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100);
    END IF;
    
    -- Check if ndvi_value column exists in fields table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fields' AND column_name = 'ndvi_value'
    ) THEN
        ALTER TABLE public.fields ADD COLUMN ndvi_value DECIMAL(3,2) DEFAULT 0.5 CHECK (ndvi_value >= -1 AND ndvi_value <= 1);
    END IF;
    
    -- Check if location_description column exists in fields table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fields' AND column_name = 'location_description'
    ) THEN
        ALTER TABLE public.fields ADD COLUMN location_description TEXT;
    END IF;
END $$;

-- Add comments for the new columns
COMMENT ON COLUMN public.fields.irrigation_type IS 'Type of irrigation used (rain-fed, drip, sprinkler, etc.)';
COMMENT ON COLUMN public.fields.size_unit IS 'Unit of measurement for field size (acres, hectares, etc.)';
COMMENT ON COLUMN public.fields.season IS 'Current growing season for the field';
COMMENT ON COLUMN public.fields.health_score IS 'Overall health score from 0-100 based on satellite analysis';
COMMENT ON COLUMN public.fields.ndvi_value IS 'Normalized Difference Vegetation Index value from satellite imagery';
COMMENT ON COLUMN public.fields.location_description IS 'Human-readable description of the field location';

-- Update existing records with default values
UPDATE public.fields 
SET 
    irrigation_type = COALESCE(irrigation_type, 'rain-fed'),
    size_unit = COALESCE(size_unit, 'acres'),
    season = COALESCE(season, 'annual'),
    health_score = COALESCE(health_score, 100),
    ndvi_value = COALESCE(ndvi_value, 0.5)
WHERE irrigation_type IS NULL OR size_unit IS NULL OR season IS NULL OR health_score IS NULL OR ndvi_value IS NULL;