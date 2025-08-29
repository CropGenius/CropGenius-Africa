# RLS SECURITY FIX FOR POSTGIS TABLES

## Issue Description
The Supabase security advisor has identified that the `spatial_ref_sys` table in the public schema does not have Row Level Security (RLS) enabled. This table is part of the PostGIS extension and contains spatial reference system data.

## Root Cause Analysis
1. **PostGIS Extension Table**: The `spatial_ref_sys` table is automatically created when the PostGIS extension is installed
2. **Ownership Issue**: The table is owned by the PostGIS extension, not by the database user
3. **RLS Not Enabled**: RLS was not enabled on this table, creating a potential security exposure
4. **Public Accessibility**: Without RLS, the table could potentially be accessed by unauthorized users

## Security Impact
- **Information Disclosure**: The table contains 8,500+ rows of spatial reference data that could be accessed by unauthorized users
- **Compliance Violation**: Violates security best practices for database access control
- **Potential Enumeration**: Could allow attackers to enumerate spatial reference systems used by the application

## Recommended Solution
Since we cannot directly enable RLS on PostGIS extension tables due to ownership restrictions, we need to implement an alternative approach:

### Option 1: Move PostGIS to Separate Schema (Recommended)
```sql
-- Create a dedicated schema for PostGIS
CREATE SCHEMA postgis;

-- Move PostGIS extension to the dedicated schema
-- Note: This requires admin privileges and may need to be done by Supabase support
ALTER EXTENSION postgis SET SCHEMA postgis;
```

### Option 2: Create View with RLS (Alternative)
```sql
-- Create a view in public schema with RLS enabled
CREATE OR REPLACE VIEW public.spatial_ref_sys_view AS
SELECT srid, auth_name, auth_srid, srtext, proj4text
FROM spatial_ref_sys;

-- Enable RLS on the view
ALTER VIEW public.spatial_ref_sys_view ENABLE ROW LEVEL SECURITY;

-- Create policy for the view
CREATE POLICY "Allow read access to spatial_ref_sys" 
ON public.spatial_ref_sys_view 
FOR SELECT 
TO anon, authenticated 
USING (true);
```

### Option 3: Application-Level Access Control (Immediate Fix)
Update application code to only access spatial reference data through controlled API endpoints rather than direct database queries.

## Implementation Plan

### Immediate Actions (P0)
1. **Verify Current Usage**: Audit how the application currently accesses `spatial_ref_sys`
2. **Implement Access Controls**: Ensure all access to spatial reference data is through controlled endpoints
3. **Document the Issue**: Record this limitation for future reference

### Short-term Actions (P1)
1. **Create Secure View**: Implement Option 2 to provide controlled access
2. **Update Application Code**: Modify code to use the secure view instead of direct table access
3. **Test Thoroughly**: Ensure all spatial functionality still works correctly

### Long-term Actions (P2)
1. **Schema Restructuring**: Work with Supabase support to move PostGIS to dedicated schema
2. **Comprehensive Review**: Audit all PostGIS-related tables and functions
3. **Security Hardening**: Implement comprehensive access controls for all geospatial data

## Verification Steps
1. ✅ Confirm `spatial_ref_sys` table exists in public schema
2. ✅ Verify current RLS status (should be disabled)
3. ✅ Implement chosen solution
4. ✅ Test spatial functionality in application
5. ✅ Re-run Supabase security advisor to confirm issue is resolved

## Risk Assessment
- **Low Risk**: The data in `spatial_ref_sys` is generally not sensitive (standard spatial reference systems)
- **Medium Impact**: Potential for information disclosure and compliance violations
- **Mitigation**: Controlled access through views or API endpoints

## Conclusion
This security issue should be addressed to maintain compliance with database security best practices. While the data itself is not highly sensitive, enabling proper access controls is essential for a production-ready application.