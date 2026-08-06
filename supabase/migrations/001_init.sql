-- AI Social Content OS — Multi-Tenant Database Schema (v2 Production)
-- RLS Security Enabled with auth.uid() workspace-level isolation

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. workspaces table
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. workspace_members table
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- 3. brand_profiles table
CREATE TABLE brand_profiles (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    company_name TEXT,
    persona TEXT NOT NULL DEFAULT 'Professional Thought Leader',
    tone TEXT NOT NULL DEFAULT 'Informative, engaging, approachable',
    topics TEXT[] DEFAULT '{}',
    example_posts TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ideas table
CREATE TABLE ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    author_id UUID NOT NULL,
    raw_content TEXT NOT NULL,
    normalized_content TEXT,
    image_url TEXT,
    language TEXT DEFAULT 'en',
    status TEXT NOT NULL CHECK (status IN ('new', 'processing', 'drafted', 'discarded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. content_jobs table (tracks async n8n pipeline runs)
CREATE TABLE content_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    n8n_job_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    result_data JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. drafts table
CREATE TABLE drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    platform TEXT NOT NULL DEFAULT 'linkedin',
    variant_index INTEGER NOT NULL,
    text TEXT NOT NULL,
    score NUMERIC,
    score_breakdown JSONB DEFAULT '{}',
    policy_flags JSONB DEFAULT '{}',
    model_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (idea_id, platform, variant_index)
);

-- 7. posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    draft_id UUID REFERENCES drafts(id),
    platform TEXT NOT NULL DEFAULT 'linkedin',
    final_text TEXT NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled')),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    external_post_urn TEXT,
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    version INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. social_accounts table (encrypted OAuth tokens per workspace)
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'instagram', 'twitter')),
    account_name TEXT,
    encrypted_access_token TEXT NOT NULL,
    encrypted_refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scopes TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, platform)
);

-- 9. engagement_snapshots table
CREATE TABLE engagement_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    reposts INTEGER DEFAULT 0,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. voice_profiles table
CREATE TABLE voice_profiles (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    summary JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. rubric_weights table
CREATE TABLE rubric_weights (
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    factor_name TEXT NOT NULL,
    weight NUMERIC NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (workspace_id, factor_name)
);

-- Helper function to check workspace membership in RLS policies
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_id = ws_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubric_weights ENABLE ROW LEVEL SECURITY;

-- Workspaces Policies
CREATE POLICY workspaces_select ON workspaces FOR SELECT USING (is_workspace_member(id) OR owner_id = auth.uid());
CREATE POLICY workspaces_insert ON workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY workspaces_update ON workspaces FOR UPDATE USING (owner_id = auth.uid());

-- Workspace Members Policies
CREATE POLICY members_select ON workspace_members FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY members_insert ON workspace_members FOR INSERT WITH CHECK (is_workspace_member(workspace_id));

-- Workspace-Isolated Resource Policies
CREATE POLICY brand_profiles_all ON brand_profiles FOR ALL USING (is_workspace_member(workspace_id));
CREATE POLICY ideas_all ON ideas FOR ALL USING (is_workspace_member(workspace_id));
CREATE POLICY content_jobs_all ON content_jobs FOR ALL USING (is_workspace_member(workspace_id));
CREATE POLICY drafts_all ON drafts FOR ALL USING (is_workspace_member(workspace_id));
CREATE POLICY posts_all ON posts FOR ALL USING (is_workspace_member(workspace_id));
CREATE POLICY social_accounts_all ON social_accounts FOR ALL USING (is_workspace_member(workspace_id));
CREATE POLICY engagement_snapshots_all ON engagement_snapshots FOR ALL USING (is_workspace_member(workspace_id));
CREATE POLICY voice_profiles_all ON voice_profiles FOR ALL USING (is_workspace_member(workspace_id));
CREATE POLICY rubric_weights_all ON rubric_weights FOR ALL USING (is_workspace_member(workspace_id));

-- Auto-update timestamps triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_jobs_updated_at BEFORE UPDATE ON content_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
