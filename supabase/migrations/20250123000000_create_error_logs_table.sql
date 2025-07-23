-- Create error_logs table for comprehensive error tracking and monitoring
-- This migration creates a production-grade error logging system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create error_logs table with optimized schema
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('api', 'component', 'database', 'network', 'auth', 'validation', 'system', 'unknown')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    context JSONB DEFAULT '{}',
    count INTEGER DEFAULT 1 CHECK (count > 0),
    first_occurrence TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_occurrence TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    url TEXT,
    user_agent TEXT,
    stack_trace TEXT,
    component_stack TEXT,
    error_hash TEXT GENERATED ALWAYS AS (
        encode(sha256(convert_to(message || COALESCE(stack_trace, ''), 'UTF8')), 'hex')
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create optimized indexes for high-performance querying
CREATE INDEX IF NOT EXISTS error_logs_category_idx ON error_logs(category);
CREATE INDEX IF NOT EXISTS error_logs_severity_idx ON error_logs(severity);
CREATE INDEX IF NOT EXISTS error_logs_resolved_idx ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS error_logs_last_occurrence_idx ON error_logs(last_occurrence DESC);
CREATE INDEX IF NOT EXISTS error_logs_created_at_idx ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS error_logs_user_id_idx ON error_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS error_logs_error_hash_idx ON error_logs(error_hash);
CREATE INDEX IF NOT EXISTS error_logs_tags_idx ON error_logs USING GIN(tags);
CREATE INDEX IF NOT EXISTS error_logs_context_idx ON error_logs USING GIN(context);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS error_logs_severity_resolved_idx ON error_logs(severity, resolved, last_occurrence DESC);
CREATE INDEX IF NOT EXISTS error_logs_category_severity_idx ON error_logs(category, severity, created_at DESC);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_error_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER error_logs_updated_at_trigger
    BEFORE UPDATE ON error_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_error_logs_updated_at();

-- Create function for error deduplication and aggregation
CREATE OR REPLACE FUNCTION upsert_error_log(
    p_message TEXT,
    p_category TEXT,
    p_severity TEXT,
    p_context JSONB DEFAULT '{}',
    p_user_id UUID DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_url TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_stack_trace TEXT DEFAULT NULL,
    p_component_stack TEXT DEFAULT NULL,
    p_tags TEXT[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_error_hash TEXT;
    v_error_id UUID;
    v_existing_id UUID;
BEGIN
    -- Calculate error hash for deduplication
    v_error_hash := encode(sha256(convert_to(p_message || COALESCE(p_stack_trace, ''), 'UTF8')), 'hex');
    
    -- Check if similar error exists (within last 24 hours)
    SELECT id INTO v_existing_id
    FROM error_logs
    WHERE error_hash = v_error_hash
      AND last_occurrence > NOW() - INTERVAL '24 hours'
      AND resolved = FALSE
    ORDER BY last_occurrence DESC
    LIMIT 1;
    
    IF v_existing_id IS NOT NULL THEN
        -- Update existing error
        UPDATE error_logs
        SET count = count + 1,
            last_occurrence = NOW(),
            context = CASE 
                WHEN p_context IS NOT NULL AND p_context != '{}' THEN p_context
                ELSE context
            END,
            tags = CASE
                WHEN p_tags IS NOT NULL AND array_length(p_tags, 1) > 0 THEN 
                    array(SELECT DISTINCT unnest(tags || p_tags))
                ELSE tags
            END,
            updated_at = NOW()
        WHERE id = v_existing_id;
        
        RETURN v_existing_id;
    ELSE
        -- Insert new error
        INSERT INTO error_logs (
            message, category, severity, context, user_id, session_id,
            url, user_agent, stack_trace, component_stack, tags
        ) VALUES (
            p_message, p_category, p_severity, p_context, p_user_id, p_session_id,
            p_url, p_user_agent, p_stack_trace, p_component_stack, p_tags
        ) RETURNING id INTO v_error_id;
        
        RETURN v_error_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up old resolved errors
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Delete resolved errors older than 90 days
    DELETE FROM error_logs
    WHERE resolved = TRUE
      AND updated_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Delete low severity errors older than 30 days
    DELETE FROM error_logs
    WHERE severity = 'low'
      AND created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS v_deleted_count = v_deleted_count + ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up Row Level Security (RLS)
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow authenticated users to read their own errors
CREATE POLICY "Users can view their own errors" ON error_logs
    FOR SELECT
    USING (
        auth.uid() = user_id OR
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'developer'
    );

-- Allow authenticated users to insert errors
CREATE POLICY "Users can insert error logs" ON error_logs
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL OR
        auth.jwt() ->> 'role' IN ('admin', 'developer', 'service')
    );

-- Allow admins and developers to update errors (for resolution)
CREATE POLICY "Admins can update error logs" ON error_logs
    FOR UPDATE
    USING (
        auth.jwt() ->> 'role' IN ('admin', 'developer')
    );

-- Allow admins to delete old errors
CREATE POLICY "Admins can delete error logs" ON error_logs
    FOR DELETE
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Create view for error statistics
CREATE OR REPLACE VIEW error_log_stats AS
SELECT
    category,
    severity,
    COUNT(*) as total_count,
    SUM(count) as total_occurrences,
    COUNT(CASE WHEN resolved = FALSE THEN 1 END) as unresolved_count,
    MAX(last_occurrence) as latest_occurrence,
    MIN(first_occurrence) as earliest_occurrence,
    AVG(count) as avg_occurrences_per_error
FROM error_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY category, severity
ORDER BY total_occurrences DESC;

-- Grant necessary permissions
GRANT SELECT, INSERT ON error_logs TO authenticated;
GRANT SELECT ON error_log_stats TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_error_log TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_error_logs TO postgres;

-- Create scheduled job for cleanup (requires pg_cron extension)
-- This will be handled by application-level cron job if pg_cron is not available
-- SELECT cron.schedule('cleanup-error-logs', '0 2 * * *', 'SELECT cleanup_old_error_logs();');

-- Add comments for documentation
COMMENT ON TABLE error_logs IS 'Comprehensive error logging table for application monitoring and debugging';
COMMENT ON COLUMN error_logs.error_hash IS 'SHA256 hash of message + stack_trace for deduplication';
COMMENT ON COLUMN error_logs.count IS 'Number of times this error has occurred';
COMMENT ON FUNCTION upsert_error_log IS 'Intelligent error insertion with deduplication and aggregation';
COMMENT ON FUNCTION cleanup_old_error_logs IS 'Automated cleanup of old resolved and low-severity errors';