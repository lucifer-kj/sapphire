import { z } from "zod";
import { DesignBlueprintSchema } from "../design-system/archetypes";

export const UserIntentSchema = z.object({
  event: z.string().default("General Promotion"),
  industry: z.string().default("Travel"),
  objective: z.string().default("Brand Awareness & Engagement"),
  target_platforms: z.array(z.string()).default(["instagram", "linkedin"]),
  cultural_elements: z.array(z.string()).default([]),
  creative_opportunity: z.string().default("Authentic storytelling aligned with brand positioning"),
});

export const ResearchContextSchema = z.object({
  search_queries: z.array(z.string()).default([]),
  key_trends: z.array(z.string()).default([]),
  visual_motifs: z.array(z.string()).default([]),
  overused_patterns_to_avoid: z.array(z.string()).default([]),
  summary: z.string().default("Research complete."),
});

import { LockedShotListSchema } from "./shot-list";
import { DesignSpecificationSchema } from "./layout-dsl";

export const ConceptItemSchema = z.object({
  label: z.string(),
  creative_direction: z.string(),
  visual_style: z.string(),
  composition: z.string(),
  lighting: z.string(),
  color_palette: z.array(z.string()),
  image_prompt: z.string(),
  optimized_image_prompt: z.string().optional(),
  negative_prompt: z.string().optional(),
  image_url: z.string().optional(),
  caption_instagram: z.string(),
  caption_linkedin: z.string(),
  design_blueprint: DesignBlueprintSchema.optional(),
  dsl_spec: DesignSpecificationSchema.optional(),
  locked_shot_list: LockedShotListSchema.optional(),
});

export const CreativeBriefSchema = z.object({
  campaign_title: z.string(),
  concept_a: ConceptItemSchema,
  concept_b: ConceptItemSchema,
});

export type UserIntent = z.infer<typeof UserIntentSchema>;
export type ResearchContext = z.infer<typeof ResearchContextSchema>;
export type ConceptItem = z.infer<typeof ConceptItemSchema>;
export type CreativeBrief = z.infer<typeof CreativeBriefSchema>;
