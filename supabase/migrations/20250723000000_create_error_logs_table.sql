-- =====================================================
-- 🚀 INFINITY IQ ERROR LOGGING INFRASTRUCTURE
-- =====================================================
-- PRODUCTION-READY error logging table with advanced features
-- - Structured error categorization and severity levels
-- - Real-time error aggregation and deduplication
-- - Performance metrics and error analytics
-- - Intelligent indexing for high-performance queries
-- =====================================================

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'unknown',
    severity TEXT NOT NULL DEFAULT 'medium',
    context JSONB DEFAULT '{}',
    count INTEGER DEFAULT 1,
    first_occurrence TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_occurrence TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Performance constraints
    CONSTRAINT error_logs_severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT error_logs_category_check CHECK (category IN (
        'database', 'api', 'component', 'network', 'authentication', 
        'validation', 'business_logic', 'external_service', 'unknown'
    ))
);

-- Create high-performance indexes
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_category ON error_logs(category);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_last_occurrence ON error_logs(last_occurrence DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_count ON error_logs(count DESC);

-- GIN index for JSONB context and tags array
CREATE INDEX IF NOT EXISTS idx_error_logs_context_gin ON error_logs USING GIN(context);
CREATE INDEX IF NOT EXISTS idx_error_logs_tags_gin ON error_logs USING GIN(tags);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_error_logs_severity_resolved ON error_logs(severity, resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_category_severity ON error_logs(category, severity);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_error_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_error_logs_updated_at
    BEFORE UPDATE ON error_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_error_logs_updated_at();

-- Create error aggregation view for analytics
CREATE OR REPLACE VIEW error_analytics AS
SELECT 
    category,
    severity,
    COUNT(*) as total_errors,
    SUM(count) as total_occurrences,
    COUNT(CASE WHEN resolved = false THEN 1 END) as unresolved_errors,
    AVG(count) as avg_occurrences_per_error,
    MIN(first_occurrence) as earliest_error,
    MAX(last_occurrence) as latest_error,
    EXTRACT(EPOCH FROM (MAX(last_occurrence) - MIN(first_occurrence))) / 3600 as error_span_hours
FROM error_logs
GROUP BY category, severity
ORDER BY total_occurrences DESC;

-- Create function for error deduplication
CREATE OR REPLACE FUNCTION upsert_error_log(
    p_id UUID,
    p_message TEXT,
    p_category TEXT,
    p_severity TEXT,
    p_context JSONB,
    p_tags TEXT[]
) RETURNS UUID AS $$
DECLARE
    result_id UUID;
BEGIN
    INSERT INTO error_logs (id, message, category, severity, context, tags)
    VALUES (p_id, p_message, p_category, p_severity, p_context, p_tags)
    ON CONFLICT (id) DO UPDATE SET
        count = error_logs.count + 1,
        last_occurrence = NOW(),
        context = p_context,
        tags = p_tags,
        updated_at = NOW()
    RETURNING id INTO result_id;
    
    RETURN result_id;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS (Row Level Security)
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON error_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON error_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON error_logs
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create function to clean old resolved errors (data retention)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM error_logs 
    WHERE resolved = true 
    AND updated_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-error-logs', '0 2 * * *', 'SELECT cleanup_old_error_logs();');

COMMENT ON TABLE error_logs IS 'INFINITY IQ Error Logging System - Production-ready error tracking and analytics';
COMMENT ON FUNCTION upsert_error_log IS 'Intelligent error deduplication and aggregation function';
COMMENT ON FUNCTION cleanup_old_error_logs IS 'Automated cleanup of old resolved errors for data retention';
