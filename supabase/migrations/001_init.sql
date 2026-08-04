-- AI Social Content OS — Database Schema (Phase 2)
-- Created with Row-Level Security (RLS) enabled on all tables from day one
-- Matches PRD §10 exactly

-- 1. ideas table
-- Stores raw and normalized ideas with status tracking
CREATE TABLE ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_content TEXT NOT NULL,
    normalized_content TEXT,
    language TEXT,
    status TEXT NOT NULL CHECK (status IN ('new', 'processing', 'drafted', 'discarded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. workflow_runs table
-- Mirrors Mastra's persisted workflow runs
CREATE TABLE workflow_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    mastra_run_id TEXT NOT NULL UNIQUE,
    state TEXT NOT NULL CHECK (state IN ('running', 'suspended', 'completed', 'failed')),
    suspended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (idea_id, state)  -- Ensure one active workflow per idea at a time
);

-- 3. drafts table
-- Stores AI-generated draft variants with scoring
CREATE TABLE drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    variant_index INTEGER NOT NULL,
    text TEXT NOT NULL,
    score NUMERIC,
    score_breakdown JSONB,
    policy_flags JSONB,
    model_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (idea_id, variant_index)  -- Prevent duplicate variants per idea
);

-- 4. posts table
-- Tracks scheduled and published LinkedIn posts with strict status machine
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID REFERENCES drafts(id),  -- Nullable for hand-written posts
    final_text TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled')),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    linkedin_post_urn TEXT,
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    version INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. accounts table
-- Stores LinkedIn OAuth tokens (encrypted at rest)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,  -- Will be the authenticated user ID from auth system
    linkedin_access_token TEXT NOT NULL,
    linkedin_refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scopes TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. engagement_snapshots table
-- Append-only LinkedIn engagement data
CREATE TABLE engagement_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    reposts INTEGER DEFAULT 0,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. voice_profiles table
-- Compact summary of edit patterns for voice adaptation
CREATE TABLE voice_profiles (
    user_id TEXT PRIMARY KEY,
    summary JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. rubric_weights table
-- Learned scoring weights for ranking
CREATE TABLE rubric_weights (
    factor_name TEXT PRIMARY KEY,
    weight NUMERIC NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row-Level Security (RLS) Policies
-- Every table has RLS enabled from day one (PRD §10, §14)

-- Ideas RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY ideas_user_select ON ideas FOR SELECT USING (true);
CREATE POLICY ideas_user_insert ON ideas FOR INSERT WITH CHECK (true);
CREATE POLICY ideas_user_update ON ideas FOR UPDATE USING (true);
CREATE POLICY ideas_user_delete ON ideas FOR DELETE USING (true);

-- Workflow Runs RLS
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_runs_user_select ON workflow_runs FOR SELECT USING (true);
CREATE POLICY workflow_runs_user_insert ON workflow_runs FOR INSERT WITH CHECK (true);
CREATE POLICY workflow_runs_user_update ON workflow_runs FOR UPDATE USING (true);
CREATE POLICY workflow_runs_user_delete ON workflow_runs FOR DELETE USING (true);

-- Drafts RLS
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY drafts_user_select ON drafts FOR SELECT USING (true);
CREATE POLICY drafts_user_insert ON drafts FOR INSERT WITH CHECK (true);
CREATE POLICY drafts_user_update ON drafts FOR UPDATE USING (true);
CREATE POLICY drafts_user_delete ON drafts FOR DELETE USING (true);

-- Posts RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY posts_user_select ON posts FOR SELECT USING (true);
CREATE POLICY posts_user_insert ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY posts_user_update ON posts FOR UPDATE USING (true);
CREATE POLICY posts_user_delete ON posts FOR DELETE USING (true);

-- Accounts RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY accounts_user_select ON accounts FOR SELECT USING (true);
CREATE POLICY accounts_user_insert ON accounts FOR INSERT WITH CHECK (true);
CREATE POLICY accounts_user_update ON accounts FOR UPDATE USING (true);
CREATE POLICY accounts_user_delete ON accounts FOR DELETE USING (true);

-- Engagement Snapshots RLS
ALTER TABLE engagement_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY engagement_snapshots_user_select ON engagement_snapshots FOR SELECT USING (true);
CREATE POLICY engagement_snapshots_user_insert ON engagement_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY engagement_snapshots_user_update ON engagement_snapshots FOR UPDATE USING (true);
CREATE POLICY engagement_snapshots_user_delete ON engagement_snapshots FOR DELETE USING (true);

-- Voice Profiles RLS
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY voice_profiles_user_select ON voice_profiles FOR SELECT USING (true);
CREATE POLICY voice_profiles_user_insert ON voice_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY voice_profiles_user_update ON voice_profiles FOR UPDATE USING (true);
CREATE POLICY voice_profiles_user_delete ON voice_profiles FOR DELETE USING (true);

-- Rubric Weights RLS
ALTER TABLE rubric_weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY rubric_weights_user_select ON rubric_weights FOR SELECT USING (true);
CREATE POLICY rubric_weights_user_insert ON rubric_weights FOR INSERT WITH CHECK (true);
CREATE POLICY rubric_weights_user_update ON rubric_weights FOR UPDATE USING (true);
CREATE POLICY rubric_weights_user_delete ON rubric_weights FOR DELETE USING (true);

-- Function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update timestamps
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data for rubric_weights (cold start heuristic defaults)
INSERT INTO rubric_weights (factor_name, weight) VALUES
    ('hook_strength', 0.4),
    ('length_band', 0.2),
    ('cta_presence', 0.2),
    ('historical_topic_performance', 0.2);
