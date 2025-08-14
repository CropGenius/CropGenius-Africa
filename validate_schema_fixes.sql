-- Schema Validation Script
-- Run this to verify all database schema fixes are working correctly

-- Test 1: Verify column existence
SELECT 
    'scans' as table_name,
    CASE WHEN column_name IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as created_by_exists
FROM information_schema.columns 
WHERE table_name = 'scans' AND column_name = 'created_by'
UNION ALL
SELECT 
    'fields' as table_name,
    CASE WHEN column_name IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as created_by_exists
FROM information_schema.columns 
WHERE table_name = 'fields' AND column_name = 'created_by'
UNION ALL
SELECT 
    'fields' as table_name,
    CASE WHEN column_name IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as user_id_exists
FROM information_schema.columns 
WHERE table_name = 'fields' AND column_name = 'user_id'
UNION ALL
SELECT 
    'farms' as table_name,
    CASE WHEN column_name IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as created_by_exists
FROM information_schema.columns 
WHERE table_name = 'farms' AND column_name = 'created_by';

-- Test 2: Verify foreign key relationships
SELECT 
    tc.table_name,
    tc.constraint_name,
    CASE WHEN tc.constraint_type = 'FOREIGN KEY' THEN 'PASS' ELSE 'FAIL' END as fk_exists
FROM information_schema.table_constraints tc
WHERE tc.table_name IN ('scans', 'fields', 'farms', 'alerts', 'farm_health_snapshots')
AND tc.constraint_type = 'FOREIGN KEY';

-- Test 3: Verify indexes exist
SELECT 
    tablename,
    indexname,
    CASE WHEN indexname IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as index_exists
FROM pg_indexes 
WHERE tablename IN ('scans', 'fields', 'farms', 'alerts', 'farm_health_snapshots')
AND indexname LIKE 'idx_%_user_id%';

-- Test 4: Verify views exist and are accessible
SELECT 
    schemaname,
    matviewname as view_name,
    CASE WHEN schemaname IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as view_exists
FROM pg_matviews 
WHERE matviewname IN ('user_fields_overview', 'user_scans_overview');

SELECT 
    table_schema,
    table_name,
    CASE WHEN table_name IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as view_exists
FROM information_schema.views 
WHERE table_name IN ('dashboard_fields', 'dashboard_scans');

-- Test 5: Verify RLS policies are active
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE WHEN rowsecurity = true THEN 'PASS' ELSE 'FAIL' END as rls_enabled
FROM pg_tables 
WHERE tablename IN ('scans', 'fields', 'farms', 'alerts', 'farm_health_snapshots')
ORDER BY tablename;

-- Test 6: Test basic queries that were failing before
-- This should work without 406 errors now
SELECT COUNT(*) as test_query_1 FROM public.scans WHERE user_id IS NOT NULL;
SELECT COUNT(*) as test_query_2 FROM public.fields WHERE user_id IS NOT NULL;
SELECT COUNT(*) as test_query_3 FROM public.farms WHERE user_id IS NOT NULL;

-- Test 7: Test complex joins
SELECT 
    COUNT(*) as complex_join_test
FROM public.fields f
JOIN public.farms fm ON f.farm_id = fm.id
JOIN public.scans s ON f.id = s.field_id
WHERE f.user_id IS NOT NULL
LIMIT 10;

-- Test 8: Test dashboard views
SELECT COUNT(*) as dashboard_fields_test FROM public.dashboard_fields;
SELECT COUNT(*) as dashboard_scans_test FROM public.dashboard_scans;

-- Test 9: Verify JSONB columns work
SELECT 
    table_name,
    column_name,
    data_type,
    CASE WHEN data_type = 'jsonb' THEN 'PASS' ELSE 'FAIL' END as jsonb_exists
FROM information_schema.columns 
WHERE table_name IN ('scans', 'alerts', 'farm_health_snapshots')
AND column_name IN ('analysis', 'metadata', 'risk_factors');

-- Test 10: Check for any remaining schema issues
SELECT 
    table_name,
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('scans', 'fields', 'farms')
ORDER BY table_name, ordinal_position;