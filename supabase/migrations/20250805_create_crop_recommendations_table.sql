-- 🔥 INFINITY IQ GENIUS MODE: CREATE MISSING CROP_RECOMMENDATIONS TABLE
-- This migration creates the missing crop_recommendations table that's referenced throughout the codebase
-- but was never actually created in the database. This is a CRITICAL fix for the AI Field Insights feature.

-- Create the crop_recommendations table with comprehensive schema
CREATE TABLE IF NOT EXISTS crop_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid REFERENCES fields(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendations jsonb NOT NULL,
  confidence_score decimal(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_analysis_data jsonb DEFAULT '{}'::jsonb,
  satellite_data jsonb DEFAULT '{}'::jsonb,
  weather_data jsonb DEFAULT '{}'::jsonb,
  soil_analysis jsonb DEFAULT '{}'::jsonb,
  market_data jsonb DEFAULT '{}'::jsonb,
  crop_rotation_data jsonb DEFAULT '{}'::jsonb,
  disease_risk_data jsonb DEFAULT '{}'::jsonb,
  yield_prediction jsonb DEFAULT '{}'::jsonb,
  analysis_type text DEFAULT 'general' CHECK (analysis_type IN ('general', 'satellite', 'economic', 'rotation')),
  generated_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create performance indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_field_id ON crop_recommendations(field_id);
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_user_id ON crop_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_generated_at ON crop_recommendations(generated_at);
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_expires_at ON crop_recommendations(expires_at);
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_analysis_type ON crop_recommendations(analysis_type);
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_confidence ON crop_recommendations(confidence_score);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_user_field ON crop_recommendations(user_id, field_id);
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_field_generated ON crop_recommendations(field_id, generated_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE crop_recommendations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own crop recommendations
CREATE POLICY "Users can view their own crop recommendations" ON crop_recommendations
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own crop recommendations
CREATE POLICY "Users can insert their own crop recommendations" ON crop_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own crop recommendations
CREATE POLICY "Users can update their own crop recommendations" ON crop_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own crop recommendations
CREATE POLICY "Users can delete their own crop recommendations" ON crop_recommendations
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_crop_recommendations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crop_recommendations_updated_at
  BEFORE UPDATE ON crop_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_crop_recommendations_updated_at();

-- Add automatic cleanup of expired recommendations
CREATE OR REPLACE FUNCTION cleanup_expired_crop_recommendations()
RETURNS void AS $$
BEGIN
  DELETE FROM crop_recommendations 
  WHERE expires_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;

-- Add enhanced columns to existing field_insights table for better AI data storage
ALTER TABLE field_insights ADD COLUMN IF NOT EXISTS ai_confidence_score decimal(3,2) CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1);
ALTER TABLE field_insights ADD COLUMN IF NOT EXISTS satellite_analysis jsonb DEFAULT '{}'::jsonb;
ALTER TABLE field_insights ADD COLUMN IF NOT EXISTS disease_risk_data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE field_insights ADD COLUMN IF NOT EXISTS weather_impact_data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE field_insights ADD COLUMN IF NOT EXISTS soil_health_data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE field_insights ADD COLUMN IF NOT EXISTS crop_rotation_suggestions jsonb DEFAULT '{}'::jsonb;
ALTER TABLE field_insights ADD COLUMN IF NOT EXISTS yield_predictions jsonb DEFAULT '{}'::jsonb;
ALTER TABLE field_insights ADD COLUMN IF NOT EXISTS analysis_source text DEFAULT 'field-ai-insights';
ALTER TABLE field_insights ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT (now() + interval '7 days');

-- Add indexes for the new field_insights columns
CREATE INDEX IF NOT EXISTS idx_field_insights_confidence ON field_insights(ai_confidence_score);
CREATE INDEX IF NOT EXISTS idx_field_insights_expires_at ON field_insights(expires_at);
CREATE INDEX IF NOT EXISTS idx_field_insights_analysis_source ON field_insights(analysis_source);

-- Add comment to document the table purpose
COMMENT ON TABLE crop_recommendations IS 'INFINITY IQ GENIUS MODE: Stores AI-powered crop recommendations generated by the field-ai-insights Edge Function. This table was missing from the database but referenced throughout the codebase, causing the AI Field Insights feature to be completely broken.';

-- Add comments to key columns
COMMENT ON COLUMN crop_recommendations.recommendations IS 'JSONB array of AI-generated crop recommendations with confidence scores and reasoning';
COMMENT ON COLUMN crop_recommendations.ai_analysis_data IS 'Complete AI analysis data from Gemini AI including reasoning and factors';
COMMENT ON COLUMN crop_recommendations.satellite_data IS 'Sentinel Hub satellite analysis data (NDVI, EVI, SAVI, moisture)';
COMMENT ON COLUMN crop_recommendations.confidence_score IS 'Overall confidence score from AI analysis (0.0 to 1.0)';
COMMENT ON COLUMN crop_recommendations.analysis_type IS 'Type of analysis performed: general, satellite, economic, or rotation';