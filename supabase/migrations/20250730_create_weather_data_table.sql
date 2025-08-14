-- 🌾 CROPGENIUS – WEATHER DATA TABLE MIGRATION
-- -------------------------------------------------------------
-- Creates comprehensive weather_data table with proper indexing and RLS policies
-- Fixes 406 Not Acceptable errors by ensuring proper table structure

-- Create weather_data table with comprehensive schema
CREATE TABLE IF NOT EXISTS public.weather_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    location_name TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    temperature DECIMAL(5,2),
    humidity INTEGER CHECK (humidity >= 0 AND humidity <= 100),
    wind_speed DECIMAL(5,2),
    wind_direction VARCHAR(3),
    rainfall DECIMAL(5,2) DEFAULT 0,
    condition VARCHAR(50),
    description TEXT,
    icon VARCHAR(10),
    pressure INTEGER,
    visibility INTEGER,
    uv_index INTEGER CHECK (uv_index >= 0 AND uv_index <= 11),
    sunrise TIMESTAMP WITH TIME ZONE,
    sunset TIMESTAMP WITH TIME ZONE,
    forecast_data JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_weather_data_user_id ON public.weather_data(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_field_id ON public.weather_data(field_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_location ON public.weather_data(location);
CREATE INDEX IF NOT EXISTS idx_weather_data_location_name ON public.weather_data(location_name);
CREATE INDEX IF NOT EXISTS idx_weather_data_recorded_at ON public.weather_data(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_data_created_at ON public.weather_data(created_at DESC);

-- Create composite index for location-based queries
CREATE INDEX IF NOT EXISTS idx_weather_data_location_composite ON public.weather_data(latitude, longitude);

-- Create GIN index for JSONB forecast_data
CREATE INDEX IF NOT EXISTS idx_weather_data_forecast ON public.weather_data USING GIN (forecast_data);

-- Create RLS policies for security
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own weather data" ON public.weather_data;
DROP POLICY IF EXISTS "Users can insert own weather data" ON public.weather_data;
DROP POLICY IF EXISTS "Users can update own weather data" ON public.weather_data;
DROP POLICY IF EXISTS "Users can delete own weather data" ON public.weather_data;

-- Create new RLS policies
CREATE POLICY "Users can view own weather data" ON public.weather_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weather data" ON public.weather_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weather data" ON public.weather_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weather data" ON public.weather_data
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_weather_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_weather_data_updated_at ON public.weather_data;
CREATE TRIGGER update_weather_data_updated_at
    BEFORE UPDATE ON public.weather_data
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_weather_updated_at();

-- Create validation trigger for weather data
CREATE OR REPLACE FUNCTION public.validate_weather_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate temperature range
    IF NEW.temperature IS NOT NULL AND (NEW.temperature < -50 OR NEW.temperature > 60) THEN
        RAISE EXCEPTION 'Temperature must be between -50°C and 60°C';
    END IF;
    
    -- Validate humidity range
    IF NEW.humidity IS NOT NULL AND (NEW.humidity < 0 OR NEW.humidity > 100) THEN
        RAISE EXCEPTION 'Humidity must be between 0%% and 100%%';
    END IF;
    
    -- Validate UV index range
    IF NEW.uv_index IS NOT NULL AND (NEW.uv_index < 0 OR NEW.uv_index > 11) THEN
        RAISE EXCEPTION 'UV index must be between 0 and 11';
    END IF;
    
    -- Validate coordinates
    IF NEW.latitude IS NOT NULL AND (NEW.latitude < -90 OR NEW.latitude > 90) THEN
        RAISE EXCEPTION 'Latitude must be between -90 and 90';
    END IF;
    
    IF NEW.longitude IS NOT NULL AND (NEW.longitude < -180 OR NEW.longitude > 180) THEN
        RAISE EXCEPTION 'Longitude must be between -180 and 180';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for data validation
DROP TRIGGER IF EXISTS validate_weather_data ON public.weather_data;
CREATE TRIGGER validate_weather_data
    BEFORE INSERT OR UPDATE ON public.weather_data
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_weather_data();

-- Create view for weather analytics
CREATE OR REPLACE VIEW public.weather_analytics AS
SELECT 
    wd.id,
    wd.user_id,
    wd.field_id,
    f.name as field_name,
    wd.location_name,
    wd.latitude,
    wd.longitude,
    wd.temperature,
    wd.humidity,
    wd.wind_speed,
    wd.wind_direction,
    wd.rainfall,
    wd.condition,
    wd.description,
    wd.uv_index,
    wd.pressure,
    wd.visibility,
    wd.sunrise,
    wd.sunset,
    wd.recorded_at,
    wd.created_at,
    wd.updated_at,
    CASE 
        WHEN wd.temperature > 35 THEN 'Hot'
        WHEN wd.temperature < 10 THEN 'Cold'
        ELSE 'Moderate'
    END as temperature_category,
    CASE 
        WHEN wd.humidity > 80 THEN 'High'
        WHEN wd.humidity < 30 THEN 'Low'
        ELSE 'Moderate'
    END as humidity_category
FROM public.weather_data wd
LEFT JOIN public.fields f ON wd.field_id = f.id;

-- Create function to get latest weather for location
CREATE OR REPLACE FUNCTION public.get_latest_weather(location_name_param TEXT)
RETURNS SETOF public.weather_data AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.weather_data
    WHERE location_name = location_name_param
    ORDER BY recorded_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to get weather history
CREATE OR REPLACE FUNCTION public.get_weather_history(
    user_id_param UUID,
    days_param INTEGER DEFAULT 7
)
RETURNS SETOF public.weather_data AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.weather_data
    WHERE user_id = user_id_param
    AND recorded_at >= NOW() - INTERVAL '1 day' * days_param
    ORDER BY recorded_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert sample weather data for testing
INSERT INTO public.weather_data (
    user_id,
    location,
    location_name,
    latitude,
    longitude,
    temperature,
    humidity,
    wind_speed,
    wind_direction,
    rainfall,
    condition,
    description,
    icon,
    pressure,
    visibility,
    uv_index,
    sunrise,
    sunset,
    forecast_data
) VALUES 
(
    (SELECT id FROM auth.users LIMIT 1),
    '-1.2921,36.8219',
    'Nairobi Farm',
    -1.2921,
    36.8219,
    28.5,
    75,
    15.2,
    'NE',
    0.0,
    'Partly Cloudy',
    'Partly cloudy with gentle breeze',
    '02d',
    1013,
    10,
    6,
    NOW() - INTERVAL '6 hours',
    NOW() + INTERVAL '6 hours',
    '{"daily": [{"temp": {"min": 20, "max": 29}, "rain": 0, "condition": "Sunny"}]}'::jsonb
),
(
    (SELECT id FROM auth.users LIMIT 1),
    '-0.0236,37.9062',
    'Kiambu Field',
    -0.0236,
    37.9062,
    26.8,
    68,
    12.5,
    'E',
    0.5,
    'Light Rain',
    'Light rain showers expected',
    '10d',
    1010,
    8,
    5,
    NOW() - INTERVAL '6 hours',
    NOW() + INTERVAL '6 hours',
    '{"daily": [{"temp": {"min": 19, "max": 27}, "rain": 2.5, "condition": "Rainy"}]}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON public.weather_data TO authenticated;
GRANT SELECT ON public.weather_data TO anon;
GRANT SELECT ON public.weather_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_latest_weather(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_weather_history(UUID, INTEGER) TO authenticated;