-- Fix foreign key relationships and join issues
-- This addresses 406 errors and complex join problems

-- Fix 1: Ensure all foreign key relationships are properly defined
-- Fields table foreign keys
DO $$
BEGIN
    -- Add user_id to fields if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fields' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.fields ADD COLUMN user_id UUID REFERENCES auth.users(id);
        -- Update existing records
        UPDATE public.fields 
        SET user_id = farms.user_id 
        FROM public.farms 
        WHERE fields.farm_id = farms.id AND fields.user_id IS NULL;
    END IF;
END $$;

-- Fix 2: Create proper indexes for join performance
CREATE INDEX IF NOT EXISTS idx_fields_user_id ON public.fields(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_user_id ON public.yield_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_health_snapshots_user_id ON public.farm_health_snapshots(user_id);

-- Fix 3: Create materialized views for complex joins to prevent 406 errors
CREATE MATERIALIZED VIEW IF NOT EXISTS public.user_fields_overview AS
SELECT 
    f.id,
    f.name,
    f.size,
    f.size_unit,
    f.crop_type,
    f.soil_type,
    f.irrigation_type,
    f.location_description,
    f.season,
    f.created_at,
    f.updated_at,
    f.user_id,
    f.farm_id,
    fm.name as farm_name,
    fm.location as farm_location,
    COALESCE(f.health_score, 100) as health_score,
    COALESCE(f.ndvi_value, 0.5) as ndvi_value,
    COALESCE(f.crop_type, 'Unknown') as crop_type_normalized
FROM public.fields f
LEFT JOIN public.farms fm ON f.farm_id = fm.id;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.user_scans_overview AS
SELECT 
    s.id,
    s.crop,
    s.disease,
    s.confidence,
    s.severity,
    s.status,
    s.economic_impact,
    s.created_at,
    s.updated_at,
    s.user_id,
    s.field_id,
    f.name as field_name,
    f.crop_type,
    fm.name as farm_name
FROM public.scans s
LEFT JOIN public.fields f ON s.field_id = f.id
LEFT JOIN public.farms fm ON f.farm_id = fm.id;

-- Fix 4: Create optimized query views for dashboard
CREATE OR REPLACE VIEW public.dashboard_fields AS
SELECT 
    f.id,
    f.name,
    COALESCE(f.health_score, 100) as health_score,
    COALESCE(f.ndvi_value, 0.5) as ndvi_value,
    COALESCE(f.crop_type, 'Unknown') as crop_type,
    f.created_at,
    f.updated_at,
    f.user_id,
    f.farm_id,
    COUNT(s.id) as scan_count,
    MAX(s.created_at) as last_scan_date
FROM public.fields f
LEFT JOIN public.scans s ON f.id = s.field_id AND s.user_id = f.user_id
GROUP BY f.id, f.name, f.health_score, f.ndvi_value, f.crop_type, f.created_at, f.updated_at, f.user_id, f.farm_id;

CREATE OR REPLACE VIEW public.dashboard_scans AS
SELECT 
    s.id,
    s.crop,
    s.disease,
    s.confidence,
    s.severity,
    s.created_at,
    s.user_id,
    s.field_id,
    f.name as field_name,
    fm.name as farm_name,
    CASE 
        WHEN s.confidence >= 0.8 THEN 'High'
        WHEN s.confidence >= 0.6 THEN 'Medium'
        ELSE 'Low'
    END as confidence_level
FROM public.scans s
LEFT JOIN public.fields f ON s.field_id = f.id
LEFT JOIN public.farms fm ON f.farm_id = fm.id;

-- Fix 5: Add missing tables that queries expect
-- Create alerts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('weather', 'disease', 'market', 'task', 'system')),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create farm_health_snapshots table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.farm_health_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
    field_count INTEGER NOT NULL DEFAULT 0,
    average_ndvi DECIMAL(3,2) DEFAULT 0.5,
    risk_factors JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix 6: Ensure proper column types for compatibility
-- Add analysis column to scans if missing (JSONB for complex data)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scans' AND column_name = 'analysis'
    ) THEN
        ALTER TABLE public.scans ADD COLUMN analysis JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add image_url column to scans if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scans' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.scans ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Fix 7: Create indexes for JSONB columns for better query performance
CREATE INDEX IF NOT EXISTS idx_scans_analysis ON public.scans USING GIN (analysis);
CREATE INDEX IF NOT EXISTS idx_alerts_metadata ON public.alerts USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_farm_health_risk_factors ON public.farm_health_snapshots USING GIN (risk_factors);

-- Fix 8: Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_user_overviews()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_fields_overview;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_scans_overview;
END;
$$ LANGUAGE plpgsql;

-- Fix 9: Create triggers for automatic view refresh on data changes
CREATE OR REPLACE FUNCTION trigger_refresh_overviews()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM refresh_user_overviews();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for automatic refresh
DROP TRIGGER IF EXISTS refresh_on_field_change ON public.fields;
CREATE TRIGGER refresh_on_field_change
    AFTER INSERT OR UPDATE OR DELETE ON public.fields
    FOR EACH STATEMENT EXECUTE FUNCTION trigger_refresh_overviews();

DROP TRIGGER IF EXISTS refresh_on_scan_change ON public.scans;
CREATE TRIGGER refresh_on_scan_change
    AFTER INSERT OR UPDATE OR DELETE ON public.scans
    FOR EACH STATEMENT EXECUTE FUNCTION trigger_refresh_overviews();

-- Fix 10: Add RLS policies for new tables
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_health_snapshots ENABLE ROW LEVEL SECURITY;

-- Alerts policies
CREATE POLICY "Users can view their own alerts"
    ON public.alerts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
    ON public.alerts FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
    ON public.alerts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Farm health snapshots policies
CREATE POLICY "Users can view their own health snapshots"
    ON public.farm_health_snapshots FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health snapshots"
    ON public.farm_health_snapshots FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Fix 11: Create composite indexes for complex joins
CREATE INDEX IF NOT EXISTS idx_fields_farm_user ON public.fields(farm_id, user_id);
CREATE INDEX IF NOT EXISTS idx_scans_field_user ON public.scans(field_id, user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_type ON public.alerts(user_id, type);
CREATE INDEX IF NOT EXISTS idx_farm_health_user_created ON public.farm_health_snapshots(user_id, created_at);

-- Fix 12: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL VIEWS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Add comments for documentation
COMMENT ON VIEW public.dashboard_fields IS 'Optimized view for dashboard field queries with join data';
COMMENT ON VIEW public.dashboard_scans IS 'Optimized view for dashboard scan queries with join data';
COMMENT ON MATERIALIZED VIEW public.user_fields_overview IS 'Pre-computed user fields with all necessary join data';
COMMENT ON MATERIALIZED VIEW public.user_scans_overview IS 'Pre-computed user scans with all necessary join data';