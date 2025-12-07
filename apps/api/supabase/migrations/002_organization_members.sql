-- Migration: 002_organization_members.sql
-- Description: Organization members, invitations, RLS policies, helper functions

-- ============================================================================
-- ORGANIZATION MEMBERS
-- ============================================================================

CREATE TABLE organization_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role member_role NOT NULL DEFAULT 'member',
    
    -- Denormalized for convenience (avoids joins for display)
    display_name text,
    
    -- Invitation tracking
    invited_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    joined_at timestamptz,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- One membership per user per org
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);

CREATE TRIGGER organization_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ORGANIZATION INVITATIONS
-- ============================================================================

CREATE TABLE organization_invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Invitation details
    email text NOT NULL,
    role member_role NOT NULL DEFAULT 'member',
    token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    
    -- Tracking
    invited_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
    accepted_at timestamptz,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- One pending invite per email per org
    UNIQUE(organization_id, email)
);

CREATE INDEX idx_org_invitations_token ON organization_invitations(token);
CREATE INDEX idx_org_invitations_email ON organization_invitations(email);

ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if current user is a member of an organization
CREATE OR REPLACE FUNCTION is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM organization_members 
        WHERE organization_id = org_id 
        AND user_id = auth.uid()
    );
$$;

-- Check if current user has a specific role (or higher) in an organization
CREATE OR REPLACE FUNCTION has_org_role(org_id uuid, required_role member_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM organization_members 
        WHERE organization_id = org_id 
        AND user_id = auth.uid()
        AND (
            role = 'owner'
            OR (role = 'admin' AND required_role IN ('admin', 'member'))
            OR (role = 'member' AND required_role = 'member')
        )
    );
$$;

-- Get current user's role in an organization (returns null if not a member)
CREATE OR REPLACE FUNCTION get_org_role(org_id uuid)
RETURNS member_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT role 
    FROM organization_members 
    WHERE organization_id = org_id 
    AND user_id = auth.uid();
$$;

-- ============================================================================
-- RLS POLICIES: Organizations
-- ============================================================================

-- Members can view their organizations
CREATE POLICY organizations_select ON organizations
    FOR SELECT USING (is_org_member(id));

-- Any authenticated user can create an organization (they become owner)
CREATE POLICY organizations_insert ON organizations
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Only owners and admins can update organization details
CREATE POLICY organizations_update ON organizations
    FOR UPDATE USING (has_org_role(id, 'admin'));

-- Only owners can delete an organization
CREATE POLICY organizations_delete ON organizations
    FOR DELETE USING (has_org_role(id, 'owner'));

-- ============================================================================
-- RLS POLICIES: Organization Members
-- ============================================================================

-- Members can view other members in their org
CREATE POLICY org_members_select ON organization_members
    FOR SELECT USING (is_org_member(organization_id));

-- Owners and admins can add members
CREATE POLICY org_members_insert ON organization_members
    FOR INSERT WITH CHECK (has_org_role(organization_id, 'admin'));

-- Owners and admins can update members (but not promote above their own level)
CREATE POLICY org_members_update ON organization_members
    FOR UPDATE USING (
        has_org_role(organization_id, 'admin')
        AND (
            -- Owners can do anything
            get_org_role(organization_id) = 'owner'
            -- Admins can't modify owners
            OR role != 'owner'
        )
    );

-- Owners can remove anyone; admins can remove members; users can remove themselves
CREATE POLICY org_members_delete ON organization_members
    FOR DELETE USING (
        get_org_role(organization_id) = 'owner'
        OR (get_org_role(organization_id) = 'admin' AND role = 'member')
        OR user_id = auth.uid()
    );

-- ============================================================================
-- RLS POLICIES: Organization Invitations
-- ============================================================================

-- Members can view invitations for their org
CREATE POLICY org_invitations_select ON organization_invitations
    FOR SELECT USING (is_org_member(organization_id));

-- Owners and admins can create invitations
CREATE POLICY org_invitations_insert ON organization_invitations
    FOR INSERT WITH CHECK (has_org_role(organization_id, 'admin'));

-- Owners and admins can delete (cancel) invitations
CREATE POLICY org_invitations_delete ON organization_invitations
    FOR DELETE USING (has_org_role(organization_id, 'admin'));

-- Public: Anyone can view an invitation by token (for accepting)
-- This needs to be a separate function since we can't use RLS for unauthenticated
CREATE OR REPLACE FUNCTION get_invitation_by_token(invite_token text)
RETURNS TABLE (
    id uuid,
    organization_id uuid,
    organization_name text,
    email text,
    role member_role,
    expires_at timestamptz,
    accepted_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        i.id,
        i.organization_id,
        o.name as organization_name,
        i.email,
        i.role,
        i.expires_at,
        i.accepted_at
    FROM organization_invitations i
    JOIN organizations o ON o.id = i.organization_id
    WHERE i.token = invite_token
    AND i.expires_at > now()
    AND i.accepted_at IS NULL;
$$;

-- ============================================================================
-- FUNCTION: Create organization with owner
-- ============================================================================

-- When creating an org, automatically add the creator as owner
CREATE OR REPLACE FUNCTION create_organization(
    org_name text,
    org_slug text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_org_id uuid;
    final_slug text;
BEGIN
    -- Generate slug if not provided
    IF org_slug IS NULL THEN
        final_slug := generate_slug(org_name);
    ELSE
        final_slug := org_slug;
    END IF;
    
    -- Create the organization
    INSERT INTO organizations (name, slug)
    VALUES (org_name, final_slug)
    RETURNING id INTO new_org_id;
    
    -- Add creator as owner
    INSERT INTO organization_members (organization_id, user_id, role, joined_at)
    VALUES (new_org_id, auth.uid(), 'owner', now());
    
    RETURN new_org_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Accept invitation
-- ============================================================================

CREATE OR REPLACE FUNCTION accept_invitation(invite_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invitation record;
    new_member_id uuid;
BEGIN
    -- Get and validate invitation
    SELECT * INTO invitation
    FROM organization_invitations
    WHERE token = invite_token
    AND expires_at > now()
    AND accepted_at IS NULL;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired invitation';
    END IF;
    
    -- Verify email matches (optional but recommended)
    IF invitation.email != (SELECT email FROM profiles WHERE id = auth.uid()) THEN
        RAISE EXCEPTION 'Invitation email does not match your account';
    END IF;
    
    -- Create membership
    INSERT INTO organization_members (organization_id, user_id, role, invited_by, joined_at)
    VALUES (invitation.organization_id, auth.uid(), invitation.role, invitation.invited_by, now())
    RETURNING id INTO new_member_id;
    
    -- Mark invitation as accepted
    UPDATE organization_invitations
    SET accepted_at = now()
    WHERE id = invitation.id;
    
    RETURN new_member_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Cleanup expired invitations (call via cron)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM organization_invitations
    WHERE expires_at < now()
    AND accepted_at IS NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;