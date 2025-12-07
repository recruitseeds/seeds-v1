-- Migration: 007_views_and_extras.sql
-- Description: Saved jobs, useful views, additional indexes, and cleanup

-- ============================================================================
-- SAVED JOBS (quick save without full tracker entry)
-- ============================================================================

CREATE TABLE saved_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    created_at timestamptz NOT NULL DEFAULT now(),
    
    UNIQUE(job_id, user_id)
);

CREATE INDEX idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX idx_saved_jobs_job ON saved_jobs(job_id);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY saved_jobs_select ON saved_jobs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY saved_jobs_insert ON saved_jobs
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY saved_jobs_delete ON saved_jobs
    FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTION: Toggle saved job
-- ============================================================================

CREATE OR REPLACE FUNCTION toggle_saved_job(p_job_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    was_saved boolean;
BEGIN
    -- Check if already saved
    DELETE FROM saved_jobs
    WHERE job_id = p_job_id
    AND user_id = auth.uid()
    RETURNING true INTO was_saved;
    
    IF was_saved THEN
        RETURN false;  -- Was saved, now unsaved
    END IF;
    
    -- Not saved, save it
    INSERT INTO saved_jobs (job_id, user_id)
    VALUES (p_job_id, auth.uid());
    
    RETURN true;  -- Now saved
END;
$$;

-- ============================================================================
-- VIEW: Organization dashboard stats
-- ============================================================================

CREATE OR REPLACE VIEW organization_stats AS
SELECT 
    o.id as organization_id,
    COUNT(DISTINCT j.id) FILTER (WHERE j.status = 'published') as active_jobs,
    COUNT(DISTINCT j.id) FILTER (WHERE j.status = 'draft') as draft_jobs,
    COUNT(DISTINCT j.id) FILTER (WHERE j.status = 'closed') as closed_jobs,
    COUNT(DISTINCT a.id) as total_applications,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'new') as new_applications,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'reviewing') as reviewing_applications,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'interviewing') as interviewing_applications,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'offered') as offered_applications,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'hired') as hired_applications,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'rejected') as rejected_applications
FROM organizations o
LEFT JOIN jobs j ON j.organization_id = o.id
LEFT JOIN applications a ON a.job_id = j.id
GROUP BY o.id;

-- ============================================================================
-- VIEW: Job listing with application counts
-- ============================================================================

CREATE OR REPLACE VIEW jobs_with_stats AS
SELECT 
    j.*,
    o.name as organization_name,
    o.slug as organization_slug,
    o.logo_url as organization_logo,
    COUNT(a.id) as total_applications,
    COUNT(a.id) FILTER (WHERE a.status = 'new') as new_applications,
    COUNT(a.id) FILTER (WHERE a.status NOT IN ('rejected', 'withdrawn', 'hired')) as active_applications
FROM jobs j
JOIN organizations o ON o.id = j.organization_id
LEFT JOIN applications a ON a.job_id = j.id
GROUP BY j.id, o.id;

-- ============================================================================
-- VIEW: Application with full details
-- ============================================================================

CREATE OR REPLACE VIEW applications_detailed AS
SELECT 
    a.*,
    -- Job info
    j.title as job_title,
    j.slug as job_slug,
    j.department as job_department,
    j.location as job_location,
    j.organization_id,
    -- Organization info
    o.name as organization_name,
    o.slug as organization_slug,
    -- Applicant info
    p.full_name as applicant_name,
    p.email as applicant_email_from_profile,
    p.avatar_url as applicant_avatar,
    ap.headline as applicant_headline,
    ap.location as applicant_location,
    ap.linkedin_url as applicant_linkedin,
    -- Stage info
    ps.name as current_stage_name,
    ps.color as current_stage_color,
    ps.stage_order as current_stage_order,
    -- Resume info
    af.file_name as resume_file_name,
    af.storage_path as resume_storage_path,
    af.parsed_resume_data
FROM applications a
JOIN jobs j ON j.id = a.job_id
JOIN organizations o ON o.id = j.organization_id
JOIN profiles p ON p.id = a.applicant_id
LEFT JOIN applicants ap ON ap.user_id = a.applicant_id
LEFT JOIN pipeline_stages ps ON ps.id = a.current_stage_id
LEFT JOIN applicant_files af ON af.id = a.resume_file_id;

-- ============================================================================
-- VIEW: Pipeline stage counts for a job
-- ============================================================================

CREATE OR REPLACE VIEW job_pipeline_stats AS
SELECT 
    j.id as job_id,
    j.pipeline_id,
    ps.id as stage_id,
    ps.name as stage_name,
    ps.color as stage_color,
    ps.stage_order,
    COUNT(a.id) as application_count
FROM jobs j
JOIN pipelines p ON p.id = j.pipeline_id
JOIN pipeline_stages ps ON ps.pipeline_id = p.id
LEFT JOIN applications a ON a.job_id = j.id AND a.current_stage_id = ps.id
GROUP BY j.id, j.pipeline_id, ps.id
ORDER BY j.id, ps.stage_order;

-- ============================================================================
-- ADDITIONAL INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Fast lookup for user's organizations
CREATE INDEX idx_org_members_user_role ON organization_members(user_id, role);

-- Applications by date for reporting
CREATE INDEX idx_applications_applied_at ON applications(applied_at DESC);

-- Jobs by published date for job board
CREATE INDEX idx_jobs_published_at ON jobs(published_at DESC) WHERE status = 'published';

-- Applicant files by type
CREATE INDEX idx_applicant_files_type ON applicant_files(applicant_id, file_type);

-- ============================================================================
-- FUNCTION: Get user's organizations with role
-- ============================================================================

CREATE OR REPLACE FUNCTION get_my_organizations()
RETURNS TABLE (
    organization_id uuid,
    organization_name text,
    organization_slug text,
    organization_logo text,
    role member_role,
    joined_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        o.id as organization_id,
        o.name as organization_name,
        o.slug as organization_slug,
        o.logo_url as organization_logo,
        om.role,
        om.joined_at
    FROM organization_members om
    JOIN organizations o ON o.id = om.organization_id
    WHERE om.user_id = auth.uid()
    ORDER BY om.joined_at DESC;
$$;

-- ============================================================================
-- FUNCTION: Get job applications for kanban board
-- ============================================================================

CREATE OR REPLACE FUNCTION get_job_applications_kanban(p_job_id uuid)
RETURNS TABLE (
    application_id uuid,
    applicant_id uuid,
    applicant_name text,
    applicant_email text,
    applicant_avatar text,
    applicant_headline text,
    stage_id uuid,
    stage_name text,
    stage_color text,
    stage_order integer,
    status application_status,
    applied_at timestamptz,
    score integer
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        a.id as application_id,
        a.applicant_id,
        p.full_name as applicant_name,
        COALESCE(a.applicant_email, p.email) as applicant_email,
        p.avatar_url as applicant_avatar,
        ap.headline as applicant_headline,
        ps.id as stage_id,
        ps.name as stage_name,
        ps.color as stage_color,
        ps.stage_order,
        a.status,
        a.applied_at,
        a.score
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    JOIN profiles p ON p.id = a.applicant_id
    LEFT JOIN applicants ap ON ap.user_id = a.applicant_id
    LEFT JOIN pipeline_stages ps ON ps.id = a.current_stage_id
    WHERE a.job_id = p_job_id
    AND is_org_member(j.organization_id)
    ORDER BY ps.stage_order, a.applied_at;
$$;

-- ============================================================================
-- FUNCTION: Search jobs (public)
-- ============================================================================

CREATE OR REPLACE FUNCTION search_public_jobs(
    p_query text DEFAULT NULL,
    p_location_type location_type DEFAULT NULL,
    p_job_type job_type DEFAULT NULL,
    p_experience_level experience_level DEFAULT NULL,
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    title text,
    slug text,
    department text,
    job_type job_type,
    location_type location_type,
    location text,
    experience_level experience_level,
    salary_min integer,
    salary_max integer,
    salary_type salary_type,
    published_at timestamptz,
    organization_id uuid,
    organization_name text,
    organization_slug text,
    organization_logo text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        j.id,
        j.title,
        j.slug,
        j.department,
        j.job_type,
        j.location_type,
        j.location,
        j.experience_level,
        j.salary_min,
        j.salary_max,
        j.salary_type,
        j.published_at,
        o.id as organization_id,
        o.name as organization_name,
        o.slug as organization_slug,
        o.logo_url as organization_logo
    FROM jobs j
    JOIN organizations o ON o.id = j.organization_id
    WHERE j.status = 'published'
    AND (p_query IS NULL OR j.title ILIKE '%' || p_query || '%' OR o.name ILIKE '%' || p_query || '%')
    AND (p_location_type IS NULL OR j.location_type = p_location_type)
    AND (p_job_type IS NULL OR j.job_type = p_job_type)
    AND (p_experience_level IS NULL OR j.experience_level = p_experience_level)
    ORDER BY j.published_at DESC
    LIMIT p_limit
    OFFSET p_offset;
$$;

-- ============================================================================
-- FUNCTION: Mark rejection email sent
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_rejection_email_sent(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    app_org_id uuid;
BEGIN
    -- Get org and verify access
    SELECT j.organization_id INTO app_org_id
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE a.id = p_application_id;
    
    IF NOT has_org_role(app_org_id, 'member') THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    UPDATE applications
    SET rejection_email_sent_at = now()
    WHERE id = p_application_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Get pending rejection emails (for Trigger.dev)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_pending_rejection_emails(p_organization_id uuid)
RETURNS TABLE (
    application_id uuid,
    applicant_email text,
    applicant_name text,
    job_title text,
    rejected_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        a.id as application_id,
        COALESCE(a.applicant_email, p.email) as applicant_email,
        p.full_name as applicant_name,
        j.title as job_title,
        a.rejected_at
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    JOIN profiles p ON p.id = a.applicant_id
    WHERE j.organization_id = p_organization_id
    AND a.status = 'rejected'
    AND a.rejected_at IS NOT NULL
    AND a.rejection_email_sent_at IS NULL
    AND has_org_role(p_organization_id, 'member')
    ORDER BY a.rejected_at;
$$;