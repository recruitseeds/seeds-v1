-- Migration: 003_jobs.sql
-- Description: Jobs, job templates, application forms

-- ============================================================================
-- JOB TEMPLATES
-- ============================================================================

CREATE TABLE job_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Template metadata
    name text NOT NULL,
    description text,
    is_default boolean DEFAULT false,
    
    -- Template content (same structure as job content)
    content jsonb DEFAULT '{}',
    
    -- Default values when using this template
    department text,
    job_type job_type,
    location_type location_type,
    experience_level experience_level,
    
    -- Tracking
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_templates_org ON job_templates(organization_id);

CREATE TRIGGER job_templates_updated_at
    BEFORE UPDATE ON job_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

ALTER TABLE job_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- APPLICATION FORMS
-- ============================================================================

CREATE TABLE application_forms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Form metadata
    name text NOT NULL,
    description text,
    is_default boolean DEFAULT false,
    
    -- Form fields configuration
    -- Structure: [{ id, type, label, required, options?, placeholder?, ... }]
    fields jsonb NOT NULL DEFAULT '[
        {"id": "resume", "type": "file", "label": "Resume", "required": true, "accept": ".pdf,.doc,.docx"},
        {"id": "cover_letter", "type": "textarea", "label": "Cover Letter", "required": false}
    ]'::jsonb,
    
    -- Tracking
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_application_forms_org ON application_forms(organization_id);

CREATE TRIGGER application_forms_updated_at
    BEFORE UPDATE ON application_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

ALTER TABLE application_forms ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- JOBS
-- ============================================================================

CREATE TABLE jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic info
    title text NOT NULL,
    slug text NOT NULL,
    department text,
    
    -- Job details
    job_type job_type NOT NULL DEFAULT 'full_time',
    location_type location_type NOT NULL DEFAULT 'onsite',
    location text,  -- Display text, e.g., "San Francisco, CA"
    experience_level experience_level,
    
    -- Content (rich text from editor)
    content jsonb DEFAULT '{}',
    
    -- Compensation (optional, for transparency)
    salary_min integer,
    salary_max integer,
    salary_type salary_type,
    
    -- Status and publishing
    status job_status NOT NULL DEFAULT 'draft',
    published_at timestamptz,
    closed_at timestamptz,
    
    -- Linked resources
    application_form_id uuid REFERENCES application_forms(id) ON DELETE SET NULL,
    pipeline_id uuid,  -- FK added in migration 004
    
    -- Tracking
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    hiring_manager_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Unique slug per organization
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_jobs_org ON jobs(organization_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_org_status ON jobs(organization_id, status);
CREATE INDEX idx_jobs_slug ON jobs(organization_id, slug);

-- Index for public job listings (published jobs only)
CREATE INDEX idx_jobs_published ON jobs(organization_id, published_at) 
    WHERE status = 'published';

CREATE TRIGGER jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: Job Templates
-- ============================================================================

CREATE POLICY job_templates_select ON job_templates
    FOR SELECT USING (is_org_member(organization_id));

CREATE POLICY job_templates_insert ON job_templates
    FOR INSERT WITH CHECK (has_org_role(organization_id, 'member'));

CREATE POLICY job_templates_update ON job_templates
    FOR UPDATE USING (has_org_role(organization_id, 'member'));

CREATE POLICY job_templates_delete ON job_templates
    FOR DELETE USING (has_org_role(organization_id, 'admin'));

-- ============================================================================
-- RLS POLICIES: Application Forms
-- ============================================================================

CREATE POLICY application_forms_select ON application_forms
    FOR SELECT USING (is_org_member(organization_id));

CREATE POLICY application_forms_insert ON application_forms
    FOR INSERT WITH CHECK (has_org_role(organization_id, 'member'));

CREATE POLICY application_forms_update ON application_forms
    FOR UPDATE USING (has_org_role(organization_id, 'member'));

CREATE POLICY application_forms_delete ON application_forms
    FOR DELETE USING (has_org_role(organization_id, 'admin'));

-- ============================================================================
-- RLS POLICIES: Jobs
-- ============================================================================

-- Org members can view all their jobs
CREATE POLICY jobs_select_internal ON jobs
    FOR SELECT USING (is_org_member(organization_id));

-- Public can view published jobs (for job board)
CREATE POLICY jobs_select_public ON jobs
    FOR SELECT USING (status = 'published');

-- Members can create jobs
CREATE POLICY jobs_insert ON jobs
    FOR INSERT WITH CHECK (has_org_role(organization_id, 'member'));

-- Members can update jobs
CREATE POLICY jobs_update ON jobs
    FOR UPDATE USING (has_org_role(organization_id, 'member'));

-- Admins can delete jobs
CREATE POLICY jobs_delete ON jobs
    FOR DELETE USING (has_org_role(organization_id, 'admin'));

-- ============================================================================
-- FUNCTION: Create job from template
-- ============================================================================

CREATE OR REPLACE FUNCTION create_job_from_template(
    p_organization_id uuid,
    p_template_id uuid,
    p_title text,
    p_slug text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    template record;
    new_job_id uuid;
    final_slug text;
BEGIN
    -- Verify user has access
    IF NOT has_org_role(p_organization_id, 'member') THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    -- Get template
    SELECT * INTO template
    FROM job_templates
    WHERE id = p_template_id
    AND organization_id = p_organization_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template not found';
    END IF;
    
    -- Generate slug if not provided
    IF p_slug IS NULL THEN
        final_slug := generate_slug(p_title);
    ELSE
        final_slug := p_slug;
    END IF;
    
    -- Create job from template
    INSERT INTO jobs (
        organization_id,
        title,
        slug,
        department,
        job_type,
        location_type,
        experience_level,
        content,
        created_by
    )
    VALUES (
        p_organization_id,
        p_title,
        final_slug,
        template.department,
        template.job_type,
        template.location_type,
        template.experience_level,
        template.content,
        auth.uid()
    )
    RETURNING id INTO new_job_id;
    
    RETURN new_job_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Publish job
-- ============================================================================

CREATE OR REPLACE FUNCTION publish_job(p_job_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    job_org_id uuid;
BEGIN
    -- Get org and verify access
    SELECT organization_id INTO job_org_id
    FROM jobs
    WHERE id = p_job_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Job not found';
    END IF;
    
    IF NOT has_org_role(job_org_id, 'member') THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    -- Publish
    UPDATE jobs
    SET status = 'published',
        published_at = now()
    WHERE id = p_job_id
    AND status = 'draft';
END;
$$;

-- ============================================================================
-- FUNCTION: Close job
-- ============================================================================

CREATE OR REPLACE FUNCTION close_job(p_job_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    job_org_id uuid;
BEGIN
    SELECT organization_id INTO job_org_id
    FROM jobs
    WHERE id = p_job_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Job not found';
    END IF;
    
    IF NOT has_org_role(job_org_id, 'member') THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    UPDATE jobs
    SET status = 'closed',
        closed_at = now()
    WHERE id = p_job_id
    AND status = 'published';
END;
$$;

-- ============================================================================
-- FUNCTION: Get public job by slug (for job board)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_public_job(p_org_slug text, p_job_slug text)
RETURNS TABLE (
    id uuid,
    title text,
    slug text,
    department text,
    job_type job_type,
    location_type location_type,
    location text,
    experience_level experience_level,
    content jsonb,
    salary_min integer,
    salary_max integer,
    salary_type salary_type,
    published_at timestamptz,
    organization_id uuid,
    organization_name text,
    organization_logo text,
    application_form_id uuid
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
        j.content,
        j.salary_min,
        j.salary_max,
        j.salary_type,
        j.published_at,
        o.id as organization_id,
        o.name as organization_name,
        o.logo_url as organization_logo,
        j.application_form_id
    FROM jobs j
    JOIN organizations o ON o.id = j.organization_id
    WHERE o.slug = p_org_slug
    AND j.slug = p_job_slug
    AND j.status = 'published';
$$;

-- ============================================================================
-- FUNCTION: List public jobs for an organization
-- ============================================================================

CREATE OR REPLACE FUNCTION get_public_jobs(p_org_slug text)
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
    published_at timestamptz
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
        j.published_at
    FROM jobs j
    JOIN organizations o ON o.id = j.organization_id
    WHERE o.slug = p_org_slug
    AND j.status = 'published'
    ORDER BY j.published_at DESC;
$$;