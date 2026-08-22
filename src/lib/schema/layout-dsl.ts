import { z } from "zod";

export const SafeZoneSchema = z.object({
  top: z.number(),
  bottom: z.number(),
  left: z.number(),
  right: z.number(),
});

export const CanvasConfigSchema = z.object({
  width: z.number(),
  height: z.number(),
  aspectRatio: z.enum(["4:5", "1:1", "9:16"]),
  backgroundColor: z.string(),
  safeZone: SafeZoneSchema,
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
export type DesignSpecification = z.infer<typeof DesignSpecificationSchema>;
