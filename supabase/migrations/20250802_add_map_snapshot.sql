-- Add map_snapshot column to fields table
-- This stores the map image captured when user clicks Continue in field creation wizard

DO $$
BEGIN
    -- Check if map_snapshot column exists in fields table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fields' AND column_name = 'map_snapshot'
    ) THEN
        ALTER TABLE public.fields ADD COLUMN map_snapshot TEXT;
    END IF;
END $$;

-- Add comment for the new column
COMMENT ON COLUMN public.fields.map_snapshot IS 'Base64 encoded map image captured during field creation';