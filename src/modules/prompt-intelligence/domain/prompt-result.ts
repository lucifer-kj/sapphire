import { z } from "zod";
import { PlatformSchema, PostTypeSchema } from "./prompt-intent";
import { DesignArchetypeSchema } from "@/lib/design-system/archetypes";
import { ModelRecommendationSchema, SupportedModelFamilySchema } from "./model-strategy";
import { ReferenceStrategySchema } from "./visual-strategy";
import { PromptSpecificationSchema } from "./prompt-spec";

export const PromptCriticRubricSchema = z.object({
  score: z.number().min(0).max(100),
  intent_fidelity: z.number().min(0).max(20),
  platform_native_fit: z.number().min(0).max(15),
  brand_alignment: z.number().min(0).max(15),
  visual_specificity: z.number().min(0).max(15),
  composition_coherence: z.number().min(0).max(10),
  model_compatibility: z.number().min(0).max(10),
  reference_strategy_score: z.number().min(0).max(5),
  constraint_clarity: z.number().min(0).max(5),
  originality_score: z.number().min(0).max(5),
  strengths: z.array(z.string()),
  issues: z.array(z.string()).default([]),
  pass: z.boolean(),
});
export type PromptCriticRubric = z.infer<typeof PromptCriticRubricSchema>;

export const StrategicRationaleSchema = z.object({
  creative_direction_reason: z.string().describe("Why this visual concept was selected for the topic"),
  platform_psychology_reason: z.string().describe("Why this framing works on the target platform"),
  model_selection_reason: z.string().describe("Why this model family is optimal for this rendering"),
  anti_cliche_guardrails: z.array(z.string()).describe("Generic AI clichés explicitly excluded"),
});
export type StrategicRationale = z.infer<typeof StrategicRationaleSchema>;

export const PromptSyntaxTokenSchema = z.object({
  category: z.enum([
    "subject",
    "environment",
    "lighting",
    "camera_optics",
    "materials_texture",
    "archetype",
    "brand_token",
    "negative_exclusion",
  ]),
  label: z.string(),
  value: z.string(),
});
export type PromptSyntaxToken = z.infer<typeof PromptSyntaxTokenSchema>;

export const FormattedModelOutputSchema = z.object({
  finalPrompt: z.string(),
  negativePrompt: z.string().optional(),
  copyablePrompt: z.string(),
});
export type FormattedModelOutput = z.infer<typeof FormattedModelOutputSchema>;

export const PromptResultSchema = z.object({
  id: z.string(),
  mode: z.literal("prompt_only"),
  platform: PlatformSchema,
  post_type: PostTypeSchema,
  archetype: DesignArchetypeSchema,
  interpreted_direction: z.string().describe("Concise creative concept direction"),
  model_recommendation: ModelRecommendationSchema,
  aspect_ratio: z.string(),
  reference_strategy: ReferenceStrategySchema,
  final_prompt: z.string().describe("The production-ready, model-tuned generation prompt"),
  negative_prompt: z.string().optional().describe("Exclusions / negative constraints where supported"),
  all_model_formats: z.record(FormattedModelOutputSchema).optional(),
  syntax_tokens: z.array(PromptSyntaxTokenSchema).optional(),
  specification: PromptSpecificationSchema,
  critic_evaluation: PromptCriticRubricSchema,
  rationale: StrategicRationaleSchema,
  version: z.number().default(1),
  parent_version_id: z.string().optional(),
  created_at: z.string(),
});

export type PromptResult = z.infer<typeof PromptResultSchema>;
