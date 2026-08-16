import { z } from "zod";

export const VisualIdentitySchema = z.object({
  logo: z.string().optional(),
  logo_variants: z.array(z.string()).default([]),
  primary_colors: z.array(z.string()).default(["#141413", "#FAF9F5"]),
  secondary_colors: z.array(z.string()).default(["#D97757", "#6A9BCC", "#788C5D"]),
  fonts: z.object({
    heading: z.string().default("Inter"),
    body: z.string().default("Inter"),
    serif: z.string().default("Georgia"),
  }).default({}),
  typography_rules: z.array(z.string()).default([]),
  photography_style: z.string().default("Editorial, authentic, natural lighting"),
  graphic_style: z.string().default("Clean, minimal, restrained elements"),
  image_preferences: z.array(z.string()).default([]),
});

export const BrandVoiceSchema = z.object({
  tone: z.string().default("Professional, inspiring, clear"),
  vocabulary: z.array(z.string()).default([]),
  sentence_style: z.string().default("Concise, impactful"),
  cta_style: z.string().default("Subtle, engaging"),
  forbidden_phrases: z.array(z.string()).default([]),
  preferred_phrases: z.array(z.string()).default([]),
});

export const PreferenceItemSchema = z.object({
  value: z.string(),
  confidence: z.number().min(0).max(1).default(0.5),
  evidence_count: z.number().default(1),
  source: z.enum(["explicit_feedback", "selection_pattern", "rejection_pattern"]),
  last_updated: z.string().optional(),
});

export const LearnedPreferencesSchema = z.object({
  preferred_visual_styles: z.array(PreferenceItemSchema).default([]),
  preferred_compositions: z.array(PreferenceItemSchema).default([]),
  preferred_hooks: z.array(PreferenceItemSchema).default([]),
  preferred_caption_styles: z.array(PreferenceItemSchema).default([]),
  logo_prominence: PreferenceItemSchema.optional(),
  color_preferences: z.array(PreferenceItemSchema).default([]),
});

export const BrandProfileSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Brand name is required"),
  industry: z.string().default("General"),
  description: z.string().optional(),
  positioning: z.string().optional(),
  target_audience: z.string().optional(),
  visual_identity: VisualIdentitySchema.default({}),
  voice: BrandVoiceSchema.default({}),
  learned_preferences: LearnedPreferencesSchema.default({}),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type VisualIdentity = z.infer<typeof VisualIdentitySchema>;
export type BrandVoice = z.infer<typeof BrandVoiceSchema>;
export type LearnedPreferences = z.infer<typeof LearnedPreferencesSchema>;
export type BrandProfile = z.infer<typeof BrandProfileSchema>;
