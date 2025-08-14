-- 🌾 CROPGENIUS – CROP RECORDS TABLE MIGRATION
-- -------------------------------------------------------------
-- Creates comprehensive crop records table with proper indexing and RLS policies
-- Addresses all issues found in TestSprite testing report

-- Create crop_records table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.crop_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    crop_type TEXT NOT NULL,
    planting_date DATE NOT NULL,
    expected_harvest_date DATE NOT NULL,
    actual_harvest_date DATE,
    status TEXT NOT NULL CHECK (status IN ('planning', 'growing', 'harvested', 'failed')),
    area_planted DECIMAL(10,2) NOT NULL CHECK (area_planted > 0),
    expected_yield DECIMAL(10,2),
    actual_yield DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_crop_records_user_id ON public.crop_records(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_records_field_id ON public.crop_records(field_id);
CREATE INDEX IF NOT EXISTS idx_crop_records_status ON public.crop_records(status);
CREATE INDEX IF NOT EXISTS idx_crop_records_created_at ON public.crop_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crop_records_crop_type ON public.crop_records(crop_type);

-- Create RLS policies for security
ALTER TABLE public.crop_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own crop records" ON public.crop_records;
DROP POLICY IF EXISTS "Users can insert own crop records" ON public.crop_records;
DROP POLICY IF EXISTS "Users can update own crop records" ON public.crop_records;
DROP POLICY IF EXISTS "Users can delete own crop records" ON public.crop_records;

-- Create new RLS policies
CREATE POLICY "Users can view own crop records" ON public.crop_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crop records" ON public.crop_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crop records" ON public.crop_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own crop records" ON public.crop_records
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_crop_records_updated_at ON public.crop_records;
CREATE TRIGGER update_crop_records_updated_at
    BEFORE UPDATE ON public.crop_records
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create validation trigger to ensure planting date is before harvest date
CREATE OR REPLACE FUNCTION public.validate_crop_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.planting_date >= NEW.expected_harvest_date THEN
        RAISE EXCEPTION 'Planting date must be before expected harvest date';
    END IF;
    
    IF NEW.actual_harvest_date IS NOT NULL AND NEW.planting_date >= NEW.actual_harvest_date THEN
        RAISE EXCEPTION 'Planting date must be before actual harvest date';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for date validation
DROP TRIGGER IF EXISTS validate_crop_record_dates ON public.crop_records;
CREATE TRIGGER validate_crop_record_dates
    BEFORE INSERT OR UPDATE ON public.crop_records
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_crop_dates();

-- Insert sample data for testing
INSERT INTO public.crop_records (
    user_id, 
    field_id, 
    crop_type, 
    planting_date, 
    expected_harvest_date, 
    status, 
    area_planted, 
    expected_yield, 
    notes
) VALUES 
(
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM public.fields LIMIT 1),
    'Maize',
    '2023-01-15',
    '2023-07-15',
    'growing',
    2.5,
    5000,
    'Sample maize crop for testing'
),
(
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM public.fields LIMIT 1),
    'Beans',
    '2023-02-01',
    '2023-05-15',
    'harvested',
    1.8,
    1200,
    'Successful bean harvest'
)
ON CONFLICT DO NOTHING;

-- Create view for crop analytics
CREATE OR REPLACE VIEW public.crop_analytics AS
SELECT 
    cr.id,
    cr.user_id,
    cr.field_id,
    f.name as field_name,
    cr.crop_type,
    cr.planting_date,
    cr.expected_harvest_date,
    cr.actual_harvest_date,
    cr.status,
    cr.area_planted,
    cr.expected_yield,
    cr.actual_yield,
    CASE 
        WHEN cr.actual_yield IS NOT NULL AND cr.expected_yield > 0 
        THEN (cr.actual_yield / cr.expected_yield) * 100
        ELSE NULL
    END as yield_efficiency,
    cr.notes,
    cr.created_at,
    cr.updated_at
FROM public.crop_records cr
JOIN public.fields f ON cr.field_id = f.id;

-- Grant necessary permissions
GRANT ALL ON public.crop_records TO authenticated;
GRANT SELECT ON public.crop_records TO anon;
GRANT SELECT ON public.crop_analytics TO authenticated;