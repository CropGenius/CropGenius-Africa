-- Fix RLS policies for crop_records table to allow users to insert their own records

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own crop records" ON crop_records;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view their own crop records" ON crop_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own crop records" ON crop_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crop records" ON crop_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crop records" ON crop_records
  FOR DELETE USING (auth.uid() = user_id);