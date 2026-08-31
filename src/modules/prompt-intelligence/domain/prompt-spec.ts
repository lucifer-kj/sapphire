import { z } from "zod";
import { PlatformSchema, PostTypeSchema } from "./prompt-intent";
import { DesignArchetypeSchema } from "@/lib/design-system/archetypes";
import { SupportedModelFamilySchema } from "./model-strategy";
import { ReferenceStrategySchema } from "./visual-strategy";

export const PromptSpecificationSchema = z.object({
  id: z.string().describe("Unique spec ID"),
  version: z.number().default(1),
  platform: PlatformSchema,
  post_type: PostTypeSchema,
  archetype: DesignArchetypeSchema,
  creative_concept: z.string().describe("Core conceptual hook and metaphor"),
  subject: z.string().describe("Main photographic subject and action details"),
  environment: z.string().describe("Background setting, depth of field, and context"),
  lighting: z.string().describe("Lighting angle, quality, and ambient color temperature"),
  camera_and_optics: z.string().describe("Shot perspective, focal length, framing, and depth"),
  color_and_materials: z.string().describe("Color palette, texture details, and surface finishes"),
  negative_constraints: z.array(z.string()).default([]).describe("Forbidden elements, visual clichés, and unwanted artifacts"),
  brand_tokens: z.object({
    brand_name: z.string(),
    primary_color: z.string().optional(),
    tone: z.string().optional(),
    forbidden_motifs: z.array(z.string()).default([]),
  }),
  target_model: SupportedModelFamilySchema,
  aspect_ratio: z.string().default("4:5"),
  reference_strategy: ReferenceStrategySchema,
});

export type PromptSpecification = z.infer<typeof PromptSpecificationSchema>;
