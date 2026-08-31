import { z } from "zod";
import { DesignBlueprintSchema } from "../design-system/archetypes";
import { LockedShotListSchema } from "./shot-list";
import { DesignSpecificationSchema } from "./layout-dsl";

export const UserIntentSchema = z.object({
  event: z.string(),
  industry: z.string(),
  objective: z.string(),
  target_platforms: z.array(z.string()),
  cultural_elements: z.array(z.string()),
  creative_opportunity: z.string(),
});

export const ResearchContextSchema = z.object({
  search_queries: z.array(z.string()),
  key_trends: z.array(z.string()),
  visual_motifs: z.array(z.string()),
  overused_patterns_to_avoid: z.array(z.string()),
  summary: z.string(),
});

export const ConceptBriefSchema = z.object({
  label: z.string(),
  creative_direction: z.string(),
  visual_style: z.string(),
  composition: z.string(),
  lighting: z.string(),
  color_palette: z.array(z.string()),
  image_prompt: z.string(),
  caption_instagram: z.string(),
  caption_linkedin: z.string(),
});

export const ConceptItemSchema = ConceptBriefSchema.extend({
  optimized_image_prompt: z.string().optional(),
  negative_prompt: z.string().optional(),
  image_url: z.string().optional(),
  design_blueprint: DesignBlueprintSchema.optional(),
  dsl_spec: DesignSpecificationSchema.optional(),
  locked_shot_list: LockedShotListSchema.optional(),
});

export const CreativeBriefGenerationSchema = z.object({
  campaign_title: z.string(),
  concept_a: ConceptBriefSchema,
  concept_b: ConceptBriefSchema,
});

export const CreativeBriefSchema = z.object({
  campaign_title: z.string(),
  concept_a: ConceptItemSchema,
  concept_b: ConceptItemSchema,
});

export const GenerationModeSchema = z.enum(["campaign", "prompt_only"]);
export type GenerationMode = z.infer<typeof GenerationModeSchema>;

export type UserIntent = z.infer<typeof UserIntentSchema>;
export type ResearchContext = z.infer<typeof ResearchContextSchema>;
export type ConceptBrief = z.infer<typeof ConceptBriefSchema>;
export type ConceptItem = z.infer<typeof ConceptItemSchema>;
export type CreativeBriefGeneration = z.infer<typeof CreativeBriefGenerationSchema>;
export type CreativeBrief = z.infer<typeof CreativeBriefSchema>;

