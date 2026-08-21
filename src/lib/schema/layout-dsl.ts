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
  primaryColor: z.string().default("#FAF7F2"),
  surfaceColor: z.string().default("#18181b"),
  accentColor: z.string().default("#D97757"),
  mutedColor: z.string().default("#A1A1AA"),
  fontFamilyHeading: z.enum(["Outfit", "Playfair Display", "Plus Jakarta Sans", "Inter"]).default("Outfit"),
  fontFamilyBody: z.enum(["Plus Jakarta Sans", "Inter", "Outfit"]).default("Plus Jakarta Sans"),
  logoUrl: z.string().optional(),
  brandName: z.string().default("Sapphire"),
  socialHandle: z.string().default("@sapphire"),
});

export const TextNodeSchema = z.object({
  type: z.literal("text"),
  role: z.enum(["eyebrow", "hook", "subheadline", "body", "cta", "author_badge", "footer"]),
  content: z.string(),
  styling: z.object({
    maxLines: z.number().optional(),
    textTransform: z.enum(["uppercase", "lowercase", "capitalize", "none"]).default("none"),
    weight: z.enum(["regular", "medium", "bold", "extrabold", "black"]).default("bold"),
    relativeScale: z.number().default(1.0),
    color: z.string().optional(),
    letterSpacing: z.string().optional(),
    lineHeight: z.number().optional(),
  }).default({ weight: "bold", relativeScale: 1.0 }),
  alignment: z.enum(["left", "center", "right"]).default("left"),
});

export const PillBadgeNodeSchema = z.object({
  type: z.literal("pill_badge"),
  label: z.string(),
  icon: z.enum(["sparkle", "zap", "shield", "star", "globe", "arrow", "dot"]).default("sparkle"),
  variant: z.enum(["accent_solid", "frosted_glass", "outline_subtle"]).default("accent_solid"),
});

export const ValueCardNodeSchema = z.object({
  type: z.literal("value_card"),
  indexNumber: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
});

export const DiagramNodeSchema = z.object({
  type: z.literal("diagram"),
  layoutStyle: z.enum(["linear_flow", "comparison_matrix", "metric_grid"]).default("linear_flow"),
  items: z.array(
    z.object({
      step: z.string(),
      label: z.string(),
      highlight: z.boolean().default(false),
    })
  ),
});

export const ScrimOverlaySchema = z.object({
  type: z.literal("scrim_overlay"),
  intensity: z.enum(["subtle", "medium", "dramatic"]).default("medium"),
  direction: z.enum(["bottom_to_top", "top_and_bottom", "radial_vignette"]).default("bottom_to_top"),
  baseColor: z.string().default("rgba(9, 9, 11, 0.75)"),
});

export const LayoutNodeSchema = z.discriminatedUnion("type", [
  TextNodeSchema,
  PillBadgeNodeSchema,
  ValueCardNodeSchema,
  DiagramNodeSchema,
  ScrimOverlaySchema,
]);

export const DesignSpecificationSchema = z.object({
  id: z.string().default(() => `spec_${Date.now()}`),
  version: z.literal("2.0").default("2.0"),
  platform: z.enum(["instagram", "linkedin"]).default("instagram"),
  archetype: z.enum([
    "editorial_magazine",
    "conceptual_split",
    "comparison_split",
    "vintage_poster",
    "saas_dotgrid",
    "maximalism_bold",
    "minimal_authority",
  ]).default("editorial_magazine"),
  canvas: CanvasConfigSchema.default({
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
    backgroundColor: "#09090b",
    safeZone: { top: 80, bottom: 80, left: 60, right: 60 },
  }),
  brandTokens: BrandDesignTokensSchema.default({
    primaryColor: "#FAF7F2",
    surfaceColor: "#18181b",
    accentColor: "#D97757",
    mutedColor: "#A1A1AA",
    fontFamilyHeading: "Outfit",
    fontFamilyBody: "Plus Jakarta Sans",
    brandName: "Sapphire",
    socialHandle: "@sapphire",
  }),
  layoutTree: z.array(LayoutNodeSchema),
  photoPrompt: z.string().describe("Negative-space-budgeted background prompt for Flux"),
  negativePrompt: z.string().optional(),
});

export type SafeZone = z.infer<typeof SafeZoneSchema>;
export type CanvasConfig = z.infer<typeof CanvasConfigSchema>;
export type BrandDesignTokens = z.infer<typeof BrandDesignTokensSchema>;
export type TextNode = z.infer<typeof TextNodeSchema>;
export type PillBadgeNode = z.infer<typeof PillBadgeNodeSchema>;
export type ValueCardNode = z.infer<typeof ValueCardNodeSchema>;
export type DiagramNode = z.infer<typeof DiagramNodeSchema>;
export type ScrimOverlay = z.infer<typeof ScrimOverlaySchema>;
export type LayoutNode = z.infer<typeof LayoutNodeSchema>;
export type DesignSpecification = z.infer<typeof DesignSpecificationSchema>;
