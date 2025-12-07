-- Migration: 001_foundation.sql
-- Description: Core foundation - enums, profiles, organizations

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member');

CREATE TYPE job_status AS ENUM ('draft', 'published', 'closed', 'archived');
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'temporary', 'volunteer');
CREATE TYPE location_type AS ENUM ('remote', 'onsite', 'hybrid');
CREATE TYPE salary_type AS ENUM ('hourly', 'monthly', 'yearly');
CREATE TYPE experience_level AS ENUM ('entry', 'mid', 'senior', 'lead', 'executive');

CREATE TYPE application_status AS ENUM ('new', 'reviewing', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn');

CREATE TYPE file_type AS ENUM ('resume', 'cover_letter', 'portfolio', 'other');

CREATE TYPE tracker_status AS ENUM ('saved', 'applied', 'interviewing', 'offer', 'rejected', 'accepted', 'withdrawn');
CREATE TYPE tracker_source AS ENUM ('platform', 'external', 'referral', 'recruiter');

-- ============================================================================
-- HELPER FUNCTION: updated_at trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    new.updated_at = now();
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PROFILES (base user data, linked to auth.users)
-- ============================================================================

CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text,
    avatar_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data ->> 'full_name'
    );
    RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- HELPER FUNCTION: Slug generation
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    slug text;
BEGIN
    slug := lower(trim(input_text));
    slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
    slug := regexp_replace(slug, '[\s-]+', '-', 'g');
    slug := trim(both '-' from slug);
    slug := slug || '-' || substr(gen_random_uuid()::text, 1, 8);
    RETURN slug;
END;
$$;

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

CREATE TABLE organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    domain text UNIQUE,
    logo_url text,
    settings jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

CREATE TRIGGER organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- RLS policies for organizations added in migration 002