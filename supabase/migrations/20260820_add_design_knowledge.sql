-- Sapphire Database Migration: Vector Knowledge Engine for Design Rules & Themes
CREATE EXTENSION IF NOT EXISTS vector;

-- Design Knowledge Base for RAG Theme & Layout Generation
CREATE TABLE IF NOT EXISTS public.design_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'aesthetic', -- 'aesthetic', 'composition', 'color_harmony', 'typography'
  description TEXT NOT NULL,
  prompt_keywords TEXT NOT NULL,
  composition_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding VECTOR(768), -- Dimensions for Gemini text-embedding-004
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vector Similarity Search Function
CREATE OR REPLACE FUNCTION match_design_knowledge(
  query_embedding VECTOR(768),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 4
)
RETURNS TABLE (
  id UUID,
  theme_name TEXT,
  category TEXT,
  description TEXT,
  prompt_keywords TEXT,
  composition_rules JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dk.id,
    dk.theme_name,
    dk.category,
    dk.description,
    dk.prompt_keywords,
    dk.composition_rules,
    (1 - (dk.embedding <=> query_embedding))::FLOAT AS similarity
  FROM public.design_knowledge dk
  WHERE dk.embedding IS NOT NULL AND (1 - (dk.embedding <=> query_embedding)) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
