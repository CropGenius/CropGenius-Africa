-- Create missing tables for CropGenius

-- Create crop_scans table
CREATE TABLE IF NOT EXISTS crop_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  disease_name TEXT,
  confidence DECIMAL,
  treatment_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on crop_scans
ALTER TABLE crop_scans ENABLE ROW LEVEL SECURITY;

-- Create policy for crop_scans
CREATE POLICY "Users can view their own crop scans" ON crop_scans
  FOR ALL USING (auth.uid() = user_id);

-- Add credits column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 1000;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS crop_scans_user_id_idx ON crop_scans(user_id);
CREATE INDEX IF NOT EXISTS crop_scans_created_at_idx ON crop_scans(created_at);

-- Insert some sample data to prevent empty state errors
INSERT INTO crop_scans (user_id, image_url, disease_name, confidence, treatment_plan)
SELECT 
  id,
  'https://example.com/sample-crop.jpg',
  'Healthy Crop',
  0.95,
  'Continue current care routine'
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM crop_scans WHERE user_id = auth.users.id)
LIMIT 1;