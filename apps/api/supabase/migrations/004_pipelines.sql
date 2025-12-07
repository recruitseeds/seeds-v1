-- Migration: 004_pipelines.sql
-- Description: Pipelines, pipeline stages, and linking to jobs

-- ============================================================================
-- PIPELINES
-- ============================================================================

CREATE TABLE pipelines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Pipeline info
    name text NOT NULL,
    description text,
    
    -- Template functionality (pipelines can be marked as templates for reuse)
    is_template boolean DEFAULT false,
    
    -- Tracking
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pipelines_org ON pipelines(organization_id);
CREATE INDEX idx_pipelines_templates ON pipelines(organization_id) WHERE is_template = true;

CREATE TRIGGER pipelines_updated_at
    BEFORE UPDATE ON pipelines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PIPELINE STAGES
-- ============================================================================

CREATE TABLE pipeline_stages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id uuid NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    
    -- Stage info
    name text NOT NULL,
    description text,
    color text,  -- For UI display, e.g., '#10B981'
    
    -- Ordering
    stage_order integer NOT NULL,
    
    -- Optional: expected duration for this stage
    duration_days integer,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Unique order per pipeline
    UNIQUE(pipeline_id, stage_order)
);

CREATE INDEX idx_pipeline_stages_pipeline ON pipeline_stages(pipeline_id);

CREATE TRIGGER pipeline_stages_updated_at
    BEFORE UPDATE ON pipeline_stages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- LINK JOBS TO PIPELINES
-- ============================================================================

ALTER TABLE jobs
    ADD CONSTRAINT jobs_pipeline_fk 
    FOREIGN KEY (pipeline_id) 
    REFERENCES pipelines(id) 
    ON DELETE SET NULL;

CREATE INDEX idx_jobs_pipeline ON jobs(pipeline_id);

-- ============================================================================
-- RLS POLICIES: Pipelines
-- ============================================================================

CREATE POLICY pipelines_select ON pipelines
    FOR SELECT USING (is_org_member(organization_id));

CREATE POLICY pipelines_insert ON pipelines
    FOR INSERT WITH CHECK (has_org_role(organization_id, 'member'));

CREATE POLICY pipelines_update ON pipelines
    FOR UPDATE USING (has_org_role(organization_id, 'member'));

CREATE POLICY pipelines_delete ON pipelines
    FOR DELETE USING (has_org_role(organization_id, 'admin'));

-- ============================================================================
-- RLS POLICIES: Pipeline Stages
-- ============================================================================

-- Stages inherit access from their pipeline
CREATE POLICY pipeline_stages_select ON pipeline_stages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pipelines p
            WHERE p.id = pipeline_id
            AND is_org_member(p.organization_id)
        )
    );

CREATE POLICY pipeline_stages_insert ON pipeline_stages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pipelines p
            WHERE p.id = pipeline_id
            AND has_org_role(p.organization_id, 'member')
        )
    );

CREATE POLICY pipeline_stages_update ON pipeline_stages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pipelines p
            WHERE p.id = pipeline_id
            AND has_org_role(p.organization_id, 'member')
        )
    );

CREATE POLICY pipeline_stages_delete ON pipeline_stages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM pipelines p
            WHERE p.id = pipeline_id
            AND has_org_role(p.organization_id, 'admin')
        )
    );

-- ============================================================================
-- FUNCTION: Create default pipeline for organization
-- ============================================================================

CREATE OR REPLACE FUNCTION create_default_pipeline(p_organization_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_pipeline_id uuid;
BEGIN
    -- Verify access
    IF NOT has_org_role(p_organization_id, 'member') THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    -- Create pipeline
    INSERT INTO pipelines (organization_id, name, description, is_template, created_by)
    VALUES (
        p_organization_id,
        'Default Pipeline',
        'Standard hiring pipeline',
        true,
        auth.uid()
    )
    RETURNING id INTO new_pipeline_id;
    
    -- Create default stages
    INSERT INTO pipeline_stages (pipeline_id, name, stage_order, color) VALUES
        (new_pipeline_id, 'New', 1, '#6B7280'),
        (new_pipeline_id, 'Screening', 2, '#3B82F6'),
        (new_pipeline_id, 'Interview', 3, '#8B5CF6'),
        (new_pipeline_id, 'Offer', 4, '#F59E0B'),
        (new_pipeline_id, 'Hired', 5, '#10B981');
    
    RETURN new_pipeline_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Clone pipeline (from template or existing)
-- ============================================================================

CREATE OR REPLACE FUNCTION clone_pipeline(
    p_source_pipeline_id uuid,
    p_new_name text DEFAULT NULL,
    p_as_template boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    source_pipeline record;
    new_pipeline_id uuid;
    final_name text;
BEGIN
    -- Get source pipeline
    SELECT * INTO source_pipeline
    FROM pipelines
    WHERE id = p_source_pipeline_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pipeline not found';
    END IF;
    
    -- Verify access
    IF NOT has_org_role(source_pipeline.organization_id, 'member') THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    -- Determine name
    IF p_new_name IS NULL THEN
        final_name := source_pipeline.name || ' (Copy)';
    ELSE
        final_name := p_new_name;
    END IF;
    
    -- Create new pipeline
    INSERT INTO pipelines (organization_id, name, description, is_template, created_by)
    VALUES (
        source_pipeline.organization_id,
        final_name,
        source_pipeline.description,
        p_as_template,
        auth.uid()
    )
    RETURNING id INTO new_pipeline_id;
    
    -- Clone stages
    INSERT INTO pipeline_stages (pipeline_id, name, description, color, stage_order, duration_days)
    SELECT 
        new_pipeline_id,
        name,
        description,
        color,
        stage_order,
        duration_days
    FROM pipeline_stages
    WHERE pipeline_id = p_source_pipeline_id
    ORDER BY stage_order;
    
    RETURN new_pipeline_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Reorder pipeline stages
-- ============================================================================

CREATE OR REPLACE FUNCTION reorder_pipeline_stages(
    p_pipeline_id uuid,
    p_stage_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    pipeline_org_id uuid;
    i integer;
BEGIN
    -- Get org and verify access
    SELECT organization_id INTO pipeline_org_id
    FROM pipelines
    WHERE id = p_pipeline_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pipeline not found';
    END IF;
    
    IF NOT has_org_role(pipeline_org_id, 'member') THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    -- Update stage orders
    FOR i IN 1..array_length(p_stage_ids, 1) LOOP
        UPDATE pipeline_stages
        SET stage_order = i
        WHERE id = p_stage_ids[i]
        AND pipeline_id = p_pipeline_id;
    END LOOP;
END;
$$;

-- ============================================================================
-- FUNCTION: Get pipeline with stages
-- ============================================================================

CREATE OR REPLACE FUNCTION get_pipeline_with_stages(p_pipeline_id uuid)
RETURNS TABLE (
    pipeline_id uuid,
    pipeline_name text,
    pipeline_description text,
    is_template boolean,
    stage_id uuid,
    stage_name text,
    stage_description text,
    stage_color text,
    stage_order integer,
    stage_duration_days integer
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        p.id as pipeline_id,
        p.name as pipeline_name,
        p.description as pipeline_description,
        p.is_template,
        s.id as stage_id,
        s.name as stage_name,
        s.description as stage_description,
        s.color as stage_color,
        s.stage_order,
        s.duration_days as stage_duration_days
    FROM pipelines p
    LEFT JOIN pipeline_stages s ON s.pipeline_id = p.id
    WHERE p.id = p_pipeline_id
    AND is_org_member(p.organization_id)
    ORDER BY s.stage_order;
$$;