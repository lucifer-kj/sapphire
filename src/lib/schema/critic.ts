import { z } from "zod";

export const ContentMatchSchema = z.object({
  passed: z
    .boolean()
    .describe("Whether the rendered image contains the specific subject, props, and setting requested in the user prompt/brief"),
  detected_elements: z
    .array(z.string())
    .describe("Concrete physical objects, subjects, props, and environments visibly detected in the image"),
  missing_elements: z
    .array(z.string())
    .describe("Mandatory subjects, hero props, or context items requested in the user prompt/brief that are missing in the image"),
  reasoning: z
    .string()
    .describe("Detailed explanation of what specific elements were matched or missed"),
});

export const CriticResultSchema = z.object({
  content_match: ContentMatchSchema,
  brand_alignment_score: z.number().min(0).max(100),
  voice_compliance: z.boolean(),
  forbidden_phrases_found: z.array(z.string()),
  visual_score: z.number().min(0).max(100),
  critique_notes: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export const PreferenceDecompositionSchema = z.object({
  preference_key: z.string(),
  preference_value: z.string(),
  confidence_delta: z.number().default(0.1),
  source: z.enum(["explicit_feedback", "selection_pattern", "rejection_pattern"]),
  evidence_notes: z.string(),
});

export type ContentMatch = z.infer<typeof ContentMatchSchema>;
export type CriticResult = z.infer<typeof CriticResultSchema>;
export type PreferenceDecomposition = z.infer<typeof PreferenceDecompositionSchema>;
