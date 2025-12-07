-- Migration: 005_applicants.sql
-- Description: Applicants, applicant files, applications, application notes

-- ============================================================================
-- APPLICANTS (extends profiles for job seekers)
-- ============================================================================

CREATE TABLE applicants (
    -- Same ID as profiles (1:1 relationship)
    user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Contact info
    phone text,
    location text,
    
    -- Profile
    headline text,  -- e.g., "Senior Software Engineer"
    bio text,
    
    -- Links
    linkedin_url text,
    github_url text,
    portfolio_url text,
    website_url text,
    
    -- Profile completeness
    is_profile_complete boolean DEFAULT false,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER applicants_updated_at
    BEFORE UPDATE ON applicants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- APPLICANT FILES (resumes, cover letters, etc.)
-- ============================================================================

CREATE TABLE applicant_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id uuid NOT NULL REFERENCES applicants(user_id) ON DELETE CASCADE,
    
    -- File info
    file_name text NOT NULL,
    file_type file_type NOT NULL,
    mime_type text,
    size_bytes integer,
    storage_path text NOT NULL,  -- Path in Supabase Storage
    
    -- Resume parsing (populated by AI)
    parsed_resume_data jsonb,
    
    -- Default resume flag (only one per applicant)
    is_default_resume boolean DEFAULT false,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_applicant_files_applicant ON applicant_files(applicant_id);
CREATE INDEX idx_applicant_files_default ON applicant_files(applicant_id) 
    WHERE is_default_resume = true;

CREATE TRIGGER applicant_files_updated_at
    BEFORE UPDATE ON applicant_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

ALTER TABLE applicant_files ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- APPLICATIONS (applicant applies to job)
-- ============================================================================

CREATE TABLE applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Links
    job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_id uuid NOT NULL REFERENCES applicants(user_id) ON DELETE CASCADE,
    
    -- Pipeline tracking
    current_stage_id uuid REFERENCES pipeline_stages(id) ON DELETE SET NULL,
    
    -- Status (denormalized from stage for quick filtering)
    status application_status NOT NULL DEFAULT 'new',
    
    -- Application data (form responses)
    form_data jsonb DEFAULT '{}',
    
    -- Resume used for this application
    resume_file_id uuid REFERENCES applicant_files(id) ON DELETE SET NULL,
    
    -- Scoring (for later AI features)
    score integer,
    
    -- Email for notifications (denormalized for convenience)
    applicant_email text,
    
    -- Rejection tracking
    rejected_at timestamptz,
    rejection_reason text,
    rejection_email_sent_at timestamptz,
    
    -- Timestamps
    applied_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- One application per applicant per job
    UNIQUE(job_id, applicant_id)
);

CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_applicant ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_stage ON applications(current_stage_id);
CREATE INDEX idx_applications_job_status ON applications(job_id, status);

CREATE TRIGGER applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- APPLICATION NOTES
-- ============================================================================

CREATE TABLE application_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    
    -- Author (org member)
    author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Content (rich text from editor)
    content jsonb NOT NULL,
    
    -- Optional: link note to a specific stage
    stage_id uuid REFERENCES pipeline_stages(id) ON DELETE SET NULL,
    
    -- Note type for filtering
    note_type text DEFAULT 'general',  -- general, interview, feedback, etc.
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_application_notes_application ON application_notes(application_id);
CREATE INDEX idx_application_notes_author ON application_notes(author_id);

CREATE TRIGGER application_notes_updated_at
    BEFORE UPDATE ON application_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: Applicants
-- ============================================================================

-- Applicants can view and update their own profile
CREATE POLICY applicants_select_own ON applicants
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY applicants_insert_own ON applicants
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY applicants_update_own ON applicants
    FOR UPDATE USING (user_id = auth.uid());

-- Org members can view applicants who applied to their jobs
CREATE POLICY applicants_select_org ON applicants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM applications a
            JOIN jobs j ON j.id = a.job_id
            WHERE a.applicant_id = applicants.user_id
            AND is_org_member(j.organization_id)
        )
    );

-- ============================================================================
-- RLS POLICIES: Applicant Files
-- ============================================================================

-- Applicants can manage their own files
CREATE POLICY applicant_files_select_own ON applicant_files
    FOR SELECT USING (applicant_id = auth.uid());

CREATE POLICY applicant_files_insert_own ON applicant_files
    FOR INSERT WITH CHECK (applicant_id = auth.uid());

CREATE POLICY applicant_files_update_own ON applicant_files
    FOR UPDATE USING (applicant_id = auth.uid());

CREATE POLICY applicant_files_delete_own ON applicant_files
    FOR DELETE USING (applicant_id = auth.uid());

-- Org members can view files attached to applications for their jobs
CREATE POLICY applicant_files_select_org ON applicant_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM applications a
            JOIN jobs j ON j.id = a.job_id
            WHERE a.applicant_id = applicant_files.applicant_id
            AND is_org_member(j.organization_id)
        )
    );

-- ============================================================================
-- RLS POLICIES: Applications
-- ============================================================================

-- Applicants can view their own applications
CREATE POLICY applications_select_own ON applications
    FOR SELECT USING (applicant_id = auth.uid());

-- Applicants can create applications (apply to jobs)
CREATE POLICY applications_insert_own ON applications
    FOR INSERT WITH CHECK (applicant_id = auth.uid());

-- Applicants can withdraw their applications
CREATE POLICY applications_update_own ON applications
    FOR UPDATE USING (
        applicant_id = auth.uid()
        -- Only allow updating status to withdrawn
    );

-- Org members can view applications for their jobs
CREATE POLICY applications_select_org ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM jobs j
            WHERE j.id = job_id
            AND is_org_member(j.organization_id)
        )
    );

-- Org members can update applications (move stages, reject, etc.)
CREATE POLICY applications_update_org ON applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM jobs j
            WHERE j.id = job_id
            AND has_org_role(j.organization_id, 'member')
        )
    );

-- ============================================================================
-- RLS POLICIES: Application Notes
-- ============================================================================

-- Org members can view notes for applications on their jobs
CREATE POLICY application_notes_select ON application_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM applications a
            JOIN jobs j ON j.id = a.job_id
            WHERE a.id = application_id
            AND is_org_member(j.organization_id)
        )
    );

-- Org members can create notes
CREATE POLICY application_notes_insert ON application_notes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM applications a
            JOIN jobs j ON j.id = a.job_id
            WHERE a.id = application_id
            AND has_org_role(j.organization_id, 'member')
        )
    );

-- Authors can update their own notes
CREATE POLICY application_notes_update ON application_notes
    FOR UPDATE USING (author_id = auth.uid());

-- Authors and admins can delete notes
CREATE POLICY application_notes_delete ON application_notes
    FOR DELETE USING (
        author_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM applications a
            JOIN jobs j ON j.id = a.job_id
            WHERE a.id = application_id
            AND has_org_role(j.organization_id, 'admin')
        )
    );

-- ============================================================================
-- FUNCTION: Ensure applicant profile exists (lazy creation)
-- ============================================================================

CREATE OR REPLACE FUNCTION ensure_applicant_profile()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id uuid;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- Insert if not exists
    INSERT INTO applicants (user_id)
    VALUES (current_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN current_user_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Apply to job
-- ============================================================================

CREATE OR REPLACE FUNCTION apply_to_job(
    p_job_id uuid,
    p_form_data jsonb DEFAULT '{}',
    p_resume_file_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    applicant_user_id uuid;
    job_record record;
    first_stage_id uuid;
    new_application_id uuid;
    applicant_email_value text;
BEGIN
    -- Ensure applicant profile exists
    applicant_user_id := ensure_applicant_profile();
    
    -- Get job and verify it's published
    SELECT j.*, p.id as pipeline_id
    INTO job_record
    FROM jobs j
    LEFT JOIN pipelines p ON p.id = j.pipeline_id
    WHERE j.id = p_job_id
    AND j.status = 'published';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Job not found or not accepting applications';
    END IF;
    
    -- Get first pipeline stage if pipeline exists
    IF job_record.pipeline_id IS NOT NULL THEN
        SELECT id INTO first_stage_id
        FROM pipeline_stages
        WHERE pipeline_id = job_record.pipeline_id
        ORDER BY stage_order
        LIMIT 1;
    END IF;
    
    -- Get applicant email
    SELECT email INTO applicant_email_value
    FROM profiles
    WHERE id = applicant_user_id;
    
    -- Create application
    INSERT INTO applications (
        job_id,
        applicant_id,
        current_stage_id,
        status,
        form_data,
        resume_file_id,
        applicant_email
    )
    VALUES (
        p_job_id,
        applicant_user_id,
        first_stage_id,
        'new',
        p_form_data,
        p_resume_file_id,
        applicant_email_value
    )
    RETURNING id INTO new_application_id;
    
    RETURN new_application_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Move application to stage
-- ============================================================================

CREATE OR REPLACE FUNCTION move_application_to_stage(
    p_application_id uuid,
    p_stage_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    app_record record;
    stage_record record;
BEGIN
    -- Get application and verify access
    SELECT a.*, j.organization_id, j.pipeline_id
    INTO app_record
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE a.id = p_application_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found';
    END IF;
    
    IF NOT has_org_role(app_record.organization_id, 'member') THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    -- Verify stage belongs to the job's pipeline
    SELECT * INTO stage_record
    FROM pipeline_stages
    WHERE id = p_stage_id
    AND pipeline_id = app_record.pipeline_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid stage for this job pipeline';
    END IF;
    
    -- Update application
    UPDATE applications
    SET current_stage_id = p_stage_id,
        updated_at = now()
    WHERE id = p_application_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Reject application
-- ============================================================================

CREATE OR REPLACE FUNCTION reject_application(
    p_application_id uuid,
    p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    app_record record;
BEGIN
    -- Get application and verify access
    SELECT a.*, j.organization_id
    INTO app_record
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE a.id = p_application_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found';
    END IF;
    
    IF NOT has_org_role(app_record.organization_id, 'member') THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    -- Update application
    UPDATE applications
    SET status = 'rejected',
        rejected_at = now(),
        rejection_reason = p_reason,
        updated_at = now()
    WHERE id = p_application_id;
    
    -- Note: Rejection email is sent via Trigger.dev in application code
    -- After sending, update rejection_email_sent_at
END;
$$;

-- ============================================================================
-- FUNCTION: Set default resume
-- ============================================================================

CREATE OR REPLACE FUNCTION set_default_resume(p_file_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Clear existing default
    UPDATE applicant_files
    SET is_default_resume = false
    WHERE applicant_id = auth.uid()
    AND is_default_resume = true;
    
    -- Set new default
    UPDATE applicant_files
    SET is_default_resume = true
    WHERE id = p_file_id
    AND applicant_id = auth.uid()
    AND file_type = 'resume';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Resume file not found or access denied';
    END IF;
END;
$$;