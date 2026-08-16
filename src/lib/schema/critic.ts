import { z } from "zod";

export const CriticResultSchema = z.object({
  brand_alignment_score: z.number().min(0).max(100).default(90),
  voice_compliance: z.boolean().default(true),
  forbidden_phrases_found: z.array(z.string()).default([]),
  visual_score: z.number().min(0).max(100).default(90),
  critique_notes: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
});

export const PreferenceDecompositionSchema = z.object({
  preference_key: z.string(),
  preference_value: z.string(),
  confidence_delta: z.number().default(0.1),
  source: z.enum(["explicit_feedback", "selection_pattern", "rejection_pattern"]),
  evidence_notes: z.string(),
});

export type CriticResult = z.infer<typeof CriticResultSchema>;
export type PreferenceDecomposition = z.infer<typeof PreferenceDecompositionSchema>;
