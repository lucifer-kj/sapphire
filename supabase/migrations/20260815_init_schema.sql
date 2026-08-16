-- Sapphire Database Migration: Core Schema
-- Initializes tables for Brands, Campaigns, Concepts, Concept Versions, and Preference Evidence.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Brands Table
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL DEFAULT 'General',
  description TEXT,
  positioning TEXT,
  target_audience TEXT,
  visual_identity JSONB NOT NULL DEFAULT '{}'::jsonb,
  voice JSONB NOT NULL DEFAULT '{}'::jsonb,
  learned_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  reference_image_url TEXT,
  target_platforms JSONB NOT NULL DEFAULT '["instagram", "linkedin"]'::jsonb,
  objective TEXT DEFAULT 'Brand Awareness',
  status TEXT NOT NULL DEFAULT 'draft',
  research_context JSONB DEFAULT '{}'::jsonb,
  creative_brief JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Concepts Table (A/B Concepts)
CREATE TABLE IF NOT EXISTS public.concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  concept_label TEXT NOT NULL, -- e.g. 'Concept A', 'Concept B'
  title TEXT NOT NULL,
  creative_direction TEXT NOT NULL,
  image_url TEXT,
  image_prompt TEXT,
  caption_instagram TEXT,
  caption_linkedin TEXT,
  visual_brief_summary TEXT,
  is_selected BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'generated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Concept Versions Table (Non-destructive version history)
CREATE TABLE IF NOT EXISTS public.concept_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  user_instruction TEXT,
  image_url TEXT,
  caption_instagram TEXT,
  caption_linkedin TEXT,
  modified_aspects JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Preference Evidence Table (Implicit & Explicit Learning)
CREATE TABLE IF NOT EXISTS public.preference_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  preference_key TEXT NOT NULL,
  preference_value TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0.5,
  source TEXT NOT NULL, -- 'explicit_feedback', 'selection_pattern', 'rejection_pattern'
  evidence_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON public.campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_concepts_campaign_id ON public.concepts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_concept_versions_concept_id ON public.concept_versions(concept_id);
CREATE INDEX IF NOT EXISTS idx_preference_evidence_brand_id ON public.preference_evidence(brand_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brands_updated_at
BEFORE UPDATE ON public.brands
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_concepts_updated_at
BEFORE UPDATE ON public.concepts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
