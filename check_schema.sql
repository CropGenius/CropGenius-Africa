-- Check all tables in public schema
SELECT 
    schemaname,
    tablename,
    tableowner,
    tablespace,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_catalog.pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check columns for specific tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('farms', 'fields', 'farm_health_snapshots', 'ai_insights_requests', 'profiles', 'tasks')
ORDER BY table_name, ordinal_position;

-- Check table existence
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = t.table_name
        ) THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM (VALUES 
    ('farms'),
    ('fields'),
    ('farm_health_snapshots'),
    ('ai_insights_requests'),
    ('profiles'),
    ('tasks')
) AS t(table_name);