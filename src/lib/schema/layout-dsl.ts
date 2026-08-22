import { z } from "zod";

export const SafeZoneSchema = z.object({
  top: z.number().default(80),
  bottom: z.number().default(80),
  left: z.number().default(60),
  right: z.number().default(60),
});

export const CanvasConfigSchema = z.object({
  width: z.number().default(1080),
  height: z.number().default(1350),
  aspectRatio: z.enum(["4:5", "1:1", "9:16"]).default("4:5"),
  backgroundColor: z.string().default("#09090b"),
  safeZone: SafeZoneSchema.default({ top: 80, bottom: 80, left: 60, right: 60 }),
});

export const BrandDesignTokensSchema = z.object({
  primaryColor: z.string(),
  surfaceColor: z.string(),
  accentColor: z.string(),
  mutedColor: z.string(),
  fontFamilyHeading: z.enum(["Outfit", "Playfair Display", "Plus Jakarta Sans", "Inter"]),
  fontFamilyBody: z.enum(["Plus Jakarta Sans", "Inter", "Outfit"]),
  brandName: z.string(),
  socialHandle: z.string(),
});

export const LayoutItemSchema = z.object({
  type: z.enum(["text", "pill_badge", "value_card", "scrim_overlay", "cta"]),
  role: z.enum(["eyebrow", "hook", "subheadline", "cta", "body", "none"]),
  content: z.string(),
  label: z.string(),
  title: z.string(),
  description: z.string(),
  indexNumber: z.string(),
});

/**
 * Concise LLM Generation Schema for Layout Planning.
 */
export const LayoutPlanGenerationSchema = z.object({
  archetype: z.enum([
    "editorial_magazine",
    "conceptual_split",
    "comparison_split",
    "vintage_poster",
    "saas_dotgrid",
    "maximalism_bold",
    "minimal_authority",
  ]),
  eyebrow: z.string().describe("1-3 words category pill badge, e.g. MILAN RITUAL"),
  hook: z.string().describe("2-7 words punchy headline, e.g. The Secret Espresso of Brera"),
  subheadline: z.string().describe("1 short sentence supporting copy"),
  cta: z.string().describe("Call to action button text, e.g. Discover Hidden Cafés →"),
  value_cards: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ).describe("2-3 value takeaway cards"),
  photoPrompt: z.string().describe("Realistic 35mm editorial photography prompt with clean negative space upper 40%"),
  negativePrompt: z.string().describe("Negative prompt"),
});

export const DesignSpecificationSchema = z.object({
  id: z.string(),
  version: z.literal("2.0"),
  platform: z.enum(["instagram", "linkedin"]),
  archetype: z.enum([
    "editorial_magazine",
    "conceptual_split",
    "comparison_split",
    "vintage_poster",
    "saas_dotgrid",
    "maximalism_bold",
    "minimal_authority",
  ]),
  canvas: CanvasConfigSchema,
  brandTokens: BrandDesignTokensSchema,
  layoutTree: z.array(LayoutItemSchema),
  photoPrompt: z.string(),
  negativePrompt: z.string(),
});

export type SafeZone = z.infer<typeof SafeZoneSchema>;
export type CanvasConfig = z.infer<typeof CanvasConfigSchema>;
export type BrandDesignTokens = z.infer<typeof BrandDesignTokensSchema>;
export type LayoutNode = z.infer<typeof LayoutItemSchema>;
export type LayoutPlanGeneration = z.infer<typeof LayoutPlanGenerationSchema>;
export type DesignSpecification = z.infer<typeof DesignSpecificationSchema>;
