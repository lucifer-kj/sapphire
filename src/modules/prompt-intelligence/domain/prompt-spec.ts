import { z } from "zod";
import { PlatformSchema, PostTypeSchema } from "./prompt-intent";
import { DesignArchetypeSchema } from "@/lib/design-system/archetypes";
import { SupportedModelFamilySchema } from "./model-strategy";
import { ReferenceStrategySchema } from "./visual-strategy";

export const TypographyLayoutSchema = z.object({
  headline: z.string().describe("Impactful, scroll-stopping headline text"),
  kicker_badge: z.string().optional().describe("Small category or status eyebrow badge"),
  subheadline: z.string().optional().describe("Supporting contextual text"),
  cta_text: z.string().describe("Clear social engagement or conversion call to action"),
  brand_watermark: z.string().describe("Brand signature or handle"),
  font_pairing_recommendation: z.string().describe("Suggested typography pairing (e.g. Playfair Display + Inter)"),
  text_placement_zone: z.enum(["top_third", "bottom_third", "split_center", "sidebar_margin"]).default("top_third"),
});
export type TypographyLayout = z.infer<typeof TypographyLayoutSchema>;

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
  typography_layout: TypographyLayoutSchema,
  caption_text: z.string().describe("Engaging full social media caption tailored to the platform"),
  hashtags: z.array(z.string()).default([]),
  target_model: SupportedModelFamilySchema,
  aspect_ratio: z.string().default("4:5"),
  reference_strategy: ReferenceStrategySchema,
});

export type PromptSpecification = z.infer<typeof PromptSpecificationSchema>;
