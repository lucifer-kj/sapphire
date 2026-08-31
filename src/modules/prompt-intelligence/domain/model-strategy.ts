import { z } from "zod";

export const SupportedModelFamilySchema = z.enum([
  "flux_1_schnell",
  "flux_1_dev",
  "midjourney_v6",
  "ideogram_v2",
  "dalle_3",
  "stable_diffusion_xl",
]);
export type SupportedModelFamily = z.infer<typeof SupportedModelFamilySchema>;

export const ModelCapabilitySchema = z.object({
  modelId: SupportedModelFamilySchema,
  displayName: z.string(),
  provider: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendedFor: z.array(z.string()),
  aspectRatioSupport: z.array(z.string()),
  negativePromptSupport: z.boolean(),
  referenceImageSupport: z.boolean(),
  typographyCapability: z.enum(["high", "medium", "low"]),
  promptSyntaxGuide: z.string(),
});
export type ModelCapability = z.infer<typeof ModelCapabilitySchema>;

export const ModelRecommendationSchema = z.object({
  recommendedModel: SupportedModelFamilySchema,
  displayName: z.string(),
  provider: z.string(),
  aspectRatio: z.string().describe("Recommended aspect ratio e.g. 4:5 for Instagram, 1:1 or 4:5 for LinkedIn"),
  confidence: z.number().min(0).max(1).describe("Confidence score in model-task fit (0.0 - 1.0)"),
  selectionReason: z.string().describe("Strategic rationale why this model family best executes the concept"),
  fallbackModel: SupportedModelFamilySchema.optional(),
});
export type ModelRecommendation = z.infer<typeof ModelRecommendationSchema>;
