-- Create farmer_interactions table for WhatsApp integration tracking
-- This table stores all farmer interactions for analytics and support

CREATE TABLE IF NOT EXISTS farmer_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound', 'whatsapp_activation')),
    message TEXT NOT NULL,
    category TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_farmer_interactions_user_id ON farmer_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_farmer_interactions_phone ON farmer_interactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_farmer_interactions_timestamp ON farmer_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_farmer_interactions_category ON farmer_interactions(category);

-- Enable RLS (Row Level Security)
ALTER TABLE farmer_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own interactions" ON farmer_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions" ON farmer_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create farmer_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS farmer_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT UNIQUE,
    name TEXT,
    crops TEXT[] DEFAULT ARRAY['maize'],
    location JSONB,
    field_coordinates JSONB,
    preferred_language TEXT DEFAULT 'en',
    last_interaction TIMESTAMPTZ DEFAULT NOW(),
    interaction_count INTEGER DEFAULT 0,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium')),
    credits_balance INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for farmer_profiles
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_user_id ON farmer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_phone ON farmer_profiles(phone_number);

-- Enable RLS for farmer_profiles
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for farmer_profiles
CREATE POLICY "Users can view their own profile" ON farmer_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON farmer_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON farmer_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically create farmer profile when user signs up
CREATE OR REPLACE FUNCTION create_farmer_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO farmer_profiles (user_id, phone_number, name)
    VALUES (
        NEW.id,
        NEW.phone,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create farmer profile
DROP TRIGGER IF EXISTS on_auth_user_created_farmer_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_farmer_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_farmer_profile();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON farmer_interactions TO authenticated;
GRANT ALL ON farmer_profiles TO authenticated;