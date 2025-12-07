-- Migration: 006_applicant_tracker.sql
-- Description: Applicant's personal job search tracker

-- ============================================================================
-- APPLICANT TRACKER ENTRIES
-- ============================================================================

CREATE TABLE applicant_tracker_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id uuid NOT NULL REFERENCES applicants(user_id) ON DELETE CASCADE,
    
    -- Job info (manually entered or linked)
    job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,  -- NULL if external job
    
    -- External job details (when job_id is NULL)
    company_name text NOT NULL,
    company_logo_url text,
    job_title text NOT NULL,
    job_url text,
    
    -- Location
    location text,
    location_type location_type,
    
    -- Compensation (for candidate's reference)
    salary_min integer,
    salary_max integer,
    salary_notes text,  -- e.g., "Plus equity, mentioned in interview"
    
    -- Tracking
    status tracker_status NOT NULL DEFAULT 'saved',
    source tracker_source NOT NULL DEFAULT 'external',
    
    -- Key dates
    saved_at timestamptz DEFAULT now(),
    applied_at timestamptz,
    
    -- Contact info
    contact_name text,
    contact_email text,
    contact_phone text,
    contact_role text,  -- e.g., "Recruiter", "Hiring Manager"
    
    -- Notes (rich text)
    notes jsonb,
    
    -- Next steps
    next_step_date timestamptz,
    next_step_description text,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracker_entries_applicant ON applicant_tracker_entries(applicant_id);
CREATE INDEX idx_tracker_entries_status ON applicant_tracker_entries(applicant_id, status);
CREATE INDEX idx_tracker_entries_job ON applicant_tracker_entries(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX idx_tracker_entries_next_step ON applicant_tracker_entries(applicant_id, next_step_date) 
    WHERE next_step_date IS NOT NULL;

CREATE TRIGGER applicant_tracker_entries_updated_at
    BEFORE UPDATE ON applicant_tracker_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

ALTER TABLE applicant_tracker_entries ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- APPLICANT TRACKER HISTORY
-- ============================================================================

CREATE TABLE applicant_tracker_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id uuid NOT NULL REFERENCES applicant_tracker_entries(id) ON DELETE CASCADE,
    
    -- What changed
    previous_status tracker_status,
    new_status tracker_status NOT NULL,
    
    -- Optional note about this change
    note text,
    
    -- When
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracker_history_entry ON applicant_tracker_history(entry_id);

ALTER TABLE applicant_tracker_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: Tracker Entries
-- ============================================================================

CREATE POLICY tracker_entries_select ON applicant_tracker_entries
    FOR SELECT USING (applicant_id = auth.uid());

CREATE POLICY tracker_entries_insert ON applicant_tracker_entries
    FOR INSERT WITH CHECK (applicant_id = auth.uid());

CREATE POLICY tracker_entries_update ON applicant_tracker_entries
    FOR UPDATE USING (applicant_id = auth.uid());

CREATE POLICY tracker_entries_delete ON applicant_tracker_entries
    FOR DELETE USING (applicant_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: Tracker History
-- ============================================================================

CREATE POLICY tracker_history_select ON applicant_tracker_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM applicant_tracker_entries e
            WHERE e.id = entry_id
            AND e.applicant_id = auth.uid()
        )
    );

CREATE POLICY tracker_history_insert ON applicant_tracker_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM applicant_tracker_entries e
            WHERE e.id = entry_id
            AND e.applicant_id = auth.uid()
        )
    );

-- ============================================================================
-- FUNCTION: Save job to tracker
-- ============================================================================

CREATE OR REPLACE FUNCTION save_job_to_tracker(p_job_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    applicant_user_id uuid;
    job_record record;
    new_entry_id uuid;
BEGIN
    -- Ensure applicant profile exists
    applicant_user_id := ensure_applicant_profile();
    
    -- Get job details
    SELECT 
        j.*,
        o.name as org_name,
        o.logo_url as org_logo
    INTO job_record
    FROM jobs j
    JOIN organizations o ON o.id = j.organization_id
    WHERE j.id = p_job_id
    AND j.status = 'published';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Job not found';
    END IF;
    
    -- Check if already saved
    SELECT id INTO new_entry_id
    FROM applicant_tracker_entries
    WHERE applicant_id = applicant_user_id
    AND job_id = p_job_id;
    
    IF FOUND THEN
        RETURN new_entry_id;  -- Already saved, return existing
    END IF;
    
    -- Create tracker entry
    INSERT INTO applicant_tracker_entries (
        applicant_id,
        job_id,
        company_name,
        company_logo_url,
        job_title,
        location,
        location_type,
        salary_min,
        salary_max,
        status,
        source
    )
    VALUES (
        applicant_user_id,
        p_job_id,
        job_record.org_name,
        job_record.org_logo,
        job_record.title,
        job_record.location,
        job_record.location_type,
        job_record.salary_min,
        job_record.salary_max,
        'saved',
        'platform'
    )
    RETURNING id INTO new_entry_id;
    
    RETURN new_entry_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Add external job to tracker
-- ============================================================================

CREATE OR REPLACE FUNCTION add_external_job_to_tracker(
    p_company_name text,
    p_job_title text,
    p_job_url text DEFAULT NULL,
    p_location text DEFAULT NULL,
    p_location_type location_type DEFAULT NULL,
    p_source tracker_source DEFAULT 'external'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    applicant_user_id uuid;
    new_entry_id uuid;
BEGIN
    -- Ensure applicant profile exists
    applicant_user_id := ensure_applicant_profile();
    
    -- Create tracker entry
    INSERT INTO applicant_tracker_entries (
        applicant_id,
        company_name,
        job_title,
        job_url,
        location,
        location_type,
        status,
        source
    )
    VALUES (
        applicant_user_id,
        p_company_name,
        p_job_title,
        p_job_url,
        p_location,
        p_location_type,
        'saved',
        p_source
    )
    RETURNING id INTO new_entry_id;
    
    RETURN new_entry_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Update tracker entry status
-- ============================================================================

CREATE OR REPLACE FUNCTION update_tracker_status(
    p_entry_id uuid,
    p_new_status tracker_status,
    p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_status tracker_status;
BEGIN
    -- Get current status and verify ownership
    SELECT status INTO current_status
    FROM applicant_tracker_entries
    WHERE id = p_entry_id
    AND applicant_id = auth.uid();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Entry not found or access denied';
    END IF;
    
    -- Record history
    INSERT INTO applicant_tracker_history (entry_id, previous_status, new_status, note)
    VALUES (p_entry_id, current_status, p_new_status, p_note);
    
    -- Update entry
    UPDATE applicant_tracker_entries
    SET status = p_new_status,
        applied_at = CASE 
            WHEN p_new_status = 'applied' AND applied_at IS NULL 
            THEN now() 
            ELSE applied_at 
        END,
        updated_at = now()
    WHERE id = p_entry_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Sync tracker when applying through platform
-- ============================================================================

-- When a user applies to a job via apply_to_job(), update their tracker
CREATE OR REPLACE FUNCTION sync_tracker_on_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    job_record record;
    existing_entry_id uuid;
BEGIN
    -- Get job details
    SELECT 
        j.*,
        o.name as org_name,
        o.logo_url as org_logo
    INTO job_record
    FROM jobs j
    JOIN organizations o ON o.id = j.organization_id
    WHERE j.id = NEW.job_id;
    
    -- Check for existing tracker entry
    SELECT id INTO existing_entry_id
    FROM applicant_tracker_entries
    WHERE applicant_id = NEW.applicant_id
    AND job_id = NEW.job_id;
    
    IF FOUND THEN
        -- Update existing entry
        UPDATE applicant_tracker_entries
        SET status = 'applied',
            applied_at = NEW.applied_at,
            updated_at = now()
        WHERE id = existing_entry_id;
        
        -- Record history
        INSERT INTO applicant_tracker_history (entry_id, previous_status, new_status, note)
        VALUES (existing_entry_id, 'saved', 'applied', 'Applied through platform');
    ELSE
        -- Create new entry
        INSERT INTO applicant_tracker_entries (
            applicant_id,
            job_id,
            company_name,
            company_logo_url,
            job_title,
            location,
            location_type,
            salary_min,
            salary_max,
            status,
            source,
            applied_at
        )
        VALUES (
            NEW.applicant_id,
            NEW.job_id,
            job_record.org_name,
            job_record.org_logo,
            job_record.title,
            job_record.location,
            job_record.location_type,
            job_record.salary_min,
            job_record.salary_max,
            'applied',
            'platform',
            NEW.applied_at
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER applications_sync_tracker
    AFTER INSERT ON applications
    FOR EACH ROW
    EXECUTE FUNCTION sync_tracker_on_application();

-- ============================================================================
-- FUNCTION: Get tracker dashboard stats
-- ============================================================================

CREATE OR REPLACE FUNCTION get_tracker_stats()
RETURNS TABLE (
    total integer,
    saved integer,
    applied integer,
    interviewing integer,
    offers integer,
    rejected integer,
    upcoming_steps integer
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        COUNT(*)::integer as total,
        COUNT(*) FILTER (WHERE status = 'saved')::integer as saved,
        COUNT(*) FILTER (WHERE status = 'applied')::integer as applied,
        COUNT(*) FILTER (WHERE status = 'interviewing')::integer as interviewing,
        COUNT(*) FILTER (WHERE status IN ('offer', 'accepted'))::integer as offers,
        COUNT(*) FILTER (WHERE status = 'rejected')::integer as rejected,
        COUNT(*) FILTER (WHERE next_step_date >= now())::integer as upcoming_steps
    FROM applicant_tracker_entries
    WHERE applicant_id = auth.uid();
$$;