-- 🚀💪 INFINITY GOD MODE AUDIT SYSTEM DATABASE SCHEMA
-- -------------------------------------------------------------
-- PRODUCTION-READY Audit System Tables for Platform Monitoring
-- Built for 100 million African farmers with military-grade precision!

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create audit_reports table
CREATE TABLE IF NOT EXISTS audit_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed', 'cancelled')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- milliseconds
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    total_findings INTEGER DEFAULT 0,
    critical_findings INTEGER DEFAULT 0,
    resolved_findings INTEGER DEFAULT 0,
    summary TEXT,
    recommendations TEXT[],
    phases JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_findings table for detailed findings
CREATE TABLE IF NOT EXISTS audit_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audit_reports(id) ON DELETE CASCADE,
    phase TEXT NOT NULL CHECK (phase IN ('health_performance', 'intelligence_features', 'security_scalability', 'verification_testing')),
    category TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    impact TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    component TEXT,
    metadata JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_reports_status ON audit_reports(status);
CREATE INDEX IF NOT EXISTS idx_audit_reports_created_at ON audit_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_reports_overall_score ON audit_reports(overall_score);
CREATE INDEX IF NOT EXISTS idx_audit_reports_created_by ON audit_reports(created_by);

CREATE INDEX IF NOT EXISTS idx_audit_findings_audit_id ON audit_findings(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_phase ON audit_findings(phase);
CREATE INDEX IF NOT EXISTS idx_audit_findings_severity ON audit_findings(severity);
CREATE INDEX IF NOT EXISTS idx_audit_findings_resolved ON audit_findings(resolved);
CREATE INDEX IF NOT EXISTS idx_audit_findings_created_at ON audit_findings(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_audit_reports_updated_at()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER audit_reports_updated_at_trigger
    BEFORE UPDATE ON audit_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_audit_reports_updated_at();

-- Enable Row Level Security
ALTER TABLE audit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_reports
CREATE POLICY "Admins can view all audit reports" ON audit_reports
    FOR SELECT
    USING (
        auth.jwt() ->> 'role' IN ('admin', 'developer') OR
        auth.uid() = created_by
    );

CREATE POLICY "Admins can create audit reports" ON audit_reports
    FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'role' IN ('admin', 'developer', 'service')
    );

CREATE POLICY "Admins can update audit reports" ON audit_reports
    FOR UPDATE
    USING (
        auth.jwt() ->> 'role' IN ('admin', 'developer')
    );

-- RLS Policies for audit_findings
CREATE POLICY "Admins can view audit findings" ON audit_findings
    FOR SELECT
    USING (
        auth.jwt() ->> 'role' IN ('admin', 'developer') OR
        EXISTS (
            SELECT 1 FROM audit_reports 
            WHERE id = audit_findings.audit_id 
            AND created_by = auth.uid()
        )
    );

CREATE POLICY "Admins can create audit findings" ON audit_findings
    FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'role' IN ('admin', 'developer', 'service')
    );

CREATE POLICY "Admins can update audit findings" ON audit_findings
    FOR UPDATE
    USING (
        auth.jwt() ->> 'role' IN ('admin', 'developer')
    );

-- Create view for audit statistics
CREATE OR REPLACE VIEW audit_stats AS
SELECT
    COUNT(*) as total_audits,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_audits,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_audits,
    AVG(overall_score) as average_score,
    SUM(total_findings) as total_findings_all_audits,
    SUM(critical_findings) as total_critical_findings,
    MAX(created_at) as last_audit_date
FROM audit_reports
WHERE created_at > NOW() - INTERVAL '30 days';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON audit_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE ON audit_findings TO authenticated;
GRANT SELECT ON audit_stats TO authenticated;

-- Add helpful comments
COMMENT ON TABLE audit_reports IS 'Comprehensive platform audit reports with scores and findings';
COMMENT ON TABLE audit_findings IS 'Detailed findings from platform audits with resolution tracking';
COMMENT ON VIEW audit_stats IS 'Aggregated statistics for platform audits over the last 30 days';

COMMENT ON COLUMN audit_reports.phases IS 'JSON array containing detailed results for each audit phase';
COMMENT ON COLUMN audit_reports.overall_score IS 'Overall audit score from 0-100 based on findings severity';
COMMENT ON COLUMN audit_findings.metadata IS 'Additional metadata and context for the finding';