-- Enhanced Crop Scans Table for Gemini-2.5-Flash Integration
-- Supports real-time disease detection with GPS location and comprehensive analysis

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS public.crop_scans CASCADE;

-- Create enhanced crop_scans table
CREATE TABLE public.crop_scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Crop and scan information
    crop_type TEXT NOT NULL,
    disease_name TEXT NOT NULL,
    scientific_name TEXT,
    confidence_score DECIMAL(5,4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    affected_area_percentage INTEGER CHECK (affected_area_percentage >= 0 AND affected_area_percentage <= 100),
    
    -- Image and processing data
    image_url TEXT,
    processing_time_ms INTEGER,
    source_api TEXT DEFAULT 'gemini-2.5-flash',
    
    -- Location data (GPS coordinates)
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_country TEXT,
    location_region TEXT,
    
    -- AI analysis results
    symptoms JSONB DEFAULT '[]'::jsonb,
    ai_recommendations JSONB DEFAULT '[]'::jsonb,
    immediate_actions JSONB DEFAULT '[]'::jsonb,
    preventive_measures JSONB DEFAULT '[]'::jsonb,
    organic_solutions JSONB DEFAULT '[]'::jsonb,
    inorganic_solutions JSONB DEFAULT '[]'::jsonb,
    recommended_products JSONB DEFAULT '[]'::jsonb,
    
    -- Economic impact analysis
    yield_loss_percentage INTEGER CHECK (yield_loss_percentage >= 0 AND yield_loss_percentage <= 100),
    revenue_loss_usd DECIMAL(10, 2),
    treatment_cost_usd DECIMAL(10, 2),
    
    -- Treatment and follow-up
    recovery_timeline TEXT,
    spread_risk TEXT CHECK (spread_risk IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'treated', 'resolved', 'critical')),
    
    -- Complete result data for future reference
    result_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_crop_scans_user_id ON public.crop_scans(user_id);
CREATE INDEX idx_crop_scans_created_at ON public.crop_scans(created_at DESC);
CREATE INDEX idx_crop_scans_crop_type ON public.crop_scans(crop_type);
CREATE INDEX idx_crop_scans_disease_name ON public.crop_scans(disease_name);
CREATE INDEX idx_crop_scans_severity ON public.crop_scans(severity);
CREATE INDEX idx_crop_scans_status ON public.crop_scans(status);
CREATE INDEX idx_crop_scans_location ON public.crop_scans(location_lat, location_lng);

-- Create GIN index for JSONB columns for fast searching
CREATE INDEX idx_crop_scans_symptoms_gin ON public.crop_scans USING GIN(symptoms);
CREATE INDEX idx_crop_scans_recommendations_gin ON public.crop_scans USING GIN(ai_recommendations);
CREATE INDEX idx_crop_scans_result_data_gin ON public.crop_scans USING GIN(result_data);

-- Enable Row Level Security
ALTER TABLE public.crop_scans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own crop scans" ON public.crop_scans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own crop scans" ON public.crop_scans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crop scans" ON public.crop_scans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crop scans" ON public.crop_scans
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_crop_scans_updated_at 
    BEFORE UPDATE ON public.crop_scans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for dashboard analytics
CREATE OR REPLACE VIEW public.crop_scan_analytics AS
SELECT 
    user_id,
    crop_type,
    disease_name,
    severity,
    AVG(confidence_score) as avg_confidence,
    COUNT(*) as scan_count,
    AVG(processing_time_ms) as avg_processing_time,
    DATE_TRUNC('day', created_at) as scan_date
FROM public.crop_scans
GROUP BY user_id, crop_type, disease_name, severity, DATE_TRUNC('day', created_at);

-- Grant permissions
GRANT ALL ON public.crop_scans TO authenticated;
GRANT SELECT ON public.crop_scan_analytics TO authenticated;

-- Create storage bucket for crop images (ensure it exists)
DO $$
BEGIN
    -- Check if bucket exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'crop-images') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
        VALUES (
            'crop-images', 
            'crop-images', 
            true,
            10485760, -- 10MB limit
            ARRAY['image/jpeg', 'image/png', 'image/webp']
        );
    END IF;
END $$;

-- Create storage policy for crop images
CREATE POLICY "Users can upload crop images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'crop-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view crop images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'crop-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Add helpful comments
COMMENT ON TABLE public.crop_scans IS 'Stores crop disease detection results from Gemini-2.5-Flash AI analysis';
COMMENT ON COLUMN public.crop_scans.confidence_score IS 'AI confidence score as decimal (0.0 to 1.0)';
COMMENT ON COLUMN public.crop_scans.processing_time_ms IS 'Time taken for AI analysis in milliseconds';
COMMENT ON COLUMN public.crop_scans.result_data IS 'Complete JSON result from AI analysis for future reference';
COMMENT ON COLUMN public.crop_scans.location_lat IS 'GPS latitude coordinate';
COMMENT ON COLUMN public.crop_scans.location_lng IS 'GPS longitude coordinate';