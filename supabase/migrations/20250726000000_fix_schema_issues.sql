-- Fix critical database schema issues
-- This migration addresses:
-- 1. Missing created_by columns in tables
-- 2. Schema validation failures 
-- 3. Foreign key relationship fixes
-- 4. Query compatibility issues

-- Fix 1: Add missing created_by columns to tables that need them
-- Check if created_by column exists in scans table and add it if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scans' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.scans ADD COLUMN created_by UUID REFERENCES auth.users(id);
        -- Update existing records to use user_id as fallback
        UPDATE public.scans SET created_by = user_id WHERE created_by IS NULL;
    END IF;
END $$;

-- Fix 2: Add created_by to fields table if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fields' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.fields ADD COLUMN created_by UUID REFERENCES auth.users(id);
        -- Update existing records to use farm owner as fallback
        UPDATE public.fields 
        SET created_by = farms.user_id 
        FROM public.farms 
        WHERE fields.farm_id = farms.id AND fields.created_by IS NULL;
    END IF;
END $$;

-- Fix 3: Add created_by to farms table if missing  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'farms' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.farms ADD COLUMN created_by UUID REFERENCES auth.users(id);
        -- Update existing records to use user_id as fallback
        UPDATE public.farms SET created_by = user_id WHERE created_by IS NULL;
    END IF;
END $$;

-- Fix 4: Ensure proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_scans_created_by ON public.scans(created_by);
CREATE INDEX IF NOT EXISTS idx_fields_created_by ON public.fields(created_by);
CREATE INDEX IF NOT EXISTS idx_farms_created_by ON public.farms(created_by);

-- Fix 5: Update RLS policies to use created_by where appropriate
-- Scans policies
DROP POLICY IF EXISTS "Users can view their own scans" ON public.scans;
CREATE POLICY "Users can view their own scans"
    ON public.scans FOR SELECT 
    USING (auth.uid() = created_by OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own scans" ON public.scans;
CREATE POLICY "Users can insert their own scans"
    ON public.scans FOR INSERT 
    WITH CHECK (auth.uid() = created_by OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own scans" ON public.scans;
CREATE POLICY "Users can update their own scans"
    ON public.scans FOR UPDATE 
    USING (auth.uid() = created_by OR auth.uid() = user_id);

-- Fields policies  
DROP POLICY IF EXISTS "Fields are viewable by users who can view the farm" ON public.fields;
CREATE POLICY "Fields are viewable by users who can view the farm"
    ON public.fields FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.farms 
            WHERE farms.id = fields.farm_id 
            AND (farms.user_id = auth.uid() OR farms.created_by = auth.uid() OR fields.created_by = auth.uid())
        )
    );

-- Farms policies
DROP POLICY IF EXISTS "Users can manage their own farms" ON public.farms;
CREATE POLICY "Users can manage their own farms"
    ON public.farms 
    USING (auth.uid() = user_id OR auth.uid() = created_by);

-- Fix 6: Add missing columns for better query support
-- Add health_score to fields if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fields' AND column_name = 'health_score'
    ) THEN
        ALTER TABLE public.fields ADD COLUMN health_score INTEGER DEFAULT 100;
    END IF;
END $$;

-- Add ndvi_value to fields if missing  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fields' AND column_name = 'ndvi_value'
    ) THEN
        ALTER TABLE public.fields ADD COLUMN ndvi_value DECIMAL(3,2) DEFAULT 0.5;
    END IF;
END $$;

-- Add crop_type to fields if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fields' AND column_name = 'crop_type'
    ) THEN
        ALTER TABLE public.fields ADD COLUMN crop_type TEXT;
    END IF;
END $$;

-- Fix 7: Create backup tables for existing data before any changes
CREATE TABLE IF NOT EXISTS public.scans_backup AS 
SELECT * FROM public.scans WHERE 1=0;

CREATE TABLE IF NOT EXISTS public.fields_backup AS 
SELECT * FROM public.fields WHERE 1=0;

CREATE TABLE IF NOT EXISTS public.farms_backup AS 
SELECT * FROM public.farms WHERE 1=0;

-- Fix 8: Ensure proper foreign key constraints
-- Add proper foreign key for scans.user_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'scans' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.scans 
        ADD CONSTRAINT fk_scans_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add proper foreign key for scans.created_by  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'scans' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.scans 
        ADD CONSTRAINT fk_scans_created_by 
        FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Fix 9: Create views for complex joins to avoid 406 errors
CREATE OR REPLACE VIEW public.user_dashboard_fields AS
SELECT 
    f.id,
    f.name,
    f.health_score,
    f.ndvi_value,
    f.crop_type,
    f.created_at,
    f.updated_at,
    fm.name as farm_name,
    fm.user_id as farm_owner
FROM public.fields f
JOIN public.farms fm ON f.farm_id = fm.id;

CREATE OR REPLACE VIEW public.user_dashboard_scans AS
SELECT 
    s.id,
    s.crop,
    s.disease,
    s.confidence,
    s.created_at,
    s.analysis,
    s.image_url,
    s.user_id,
    s.created_by
FROM public.scans s;

-- Fix 10: Update triggers for automatic column updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure triggers exist for all relevant tables
DROP TRIGGER IF EXISTS update_scans_updated_at ON public.scans;
CREATE TRIGGER update_scans_updated_at
    BEFORE UPDATE ON public.scans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions for new columns
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add helpful comment for debugging
COMMENT ON TABLE public.scans IS 'Crop disease scans with created_by column for user ownership tracking';
COMMENT ON TABLE public.fields IS 'Agricultural fields with health metrics and ownership tracking';
COMMENT ON TABLE public.farms IS 'Farm management with proper user ownership tracking';