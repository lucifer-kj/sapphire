import { z } from "zod";

export const DesignArchetypeEnum = z.enum([
  "editorial_magazine",
  "conceptual_split",
  "comparison_split",
  "vintage_poster",
  "saas_dotgrid",
]);

export type DesignArchetype = z.infer<typeof DesignArchetypeEnum>;

export const DesignBlueprintSchema = z.object({
  archetype: DesignArchetypeEnum,
  headline: z.string().max(60, "Headline should be concise (max 60 chars)"),
  subheadline: z.string().max(180, "Subheadline should be concise (max 180 chars)"),
  category_pill: z.string().max(30).optional(),
  brand_tagline: z.string().max(60).optional(),
  value_props: z.array(z.string().max(50)).optional(),
  cta_text: z.string().max(30).default("Learn More ➔"),
  social_handle: z.string().max(30).default("@sapphire"),
  brand_name: z.string().max(40).default("Sapphire"),
  font_family_hook: z
    .enum(["Plus Jakarta Sans", "Inter", "Playfair Display", "Outfit"])
    .default("Plus Jakarta Sans"),
  font_family_body: z
    .enum(["Plus Jakarta Sans", "Inter", "Outfit"])
    .default("Plus Jakarta Sans"),
  highlighted_keywords: z.array(z.string()).default([]),
  font_scale: z.enum(["compact", "regular", "large"]).default("regular"),
  scrim_intensity: z.enum(["subtle", "medium", "heavy"]).default("medium"),
  color_tokens: z
    .object({
      primary_text: z.string().default("#FAF7F2"),
      accent: z.string().default("#D97757"),
      canvas_background: z.string().default("#141413"),
      scrim_color: z.string().default("rgba(20,10,5,0.65)"),
    })
    .optional(),
  decorative_elements: z
    .array(
      z.object({
        type: z.enum(["pill_badge", "stamp_badge", "arrow_pill", "starburst", "dots"]),
        text: z.string().optional(),
        position: z.string().optional(),
      })
    )
    .optional(),
  negative_space_directive: z.string(),
});

export type DesignBlueprint = z.infer<typeof DesignBlueprintSchema>;

export const DESIGN_KNOWLEDGE_GRAPH = {
  typography_pairings: {
    editorial_magazine: {
      hookFont: "Playfair Display" as const,
      bodyFont: "Plus Jakarta Sans" as const,
      style: "High-contrast Luxury Editorial Serif + Clean Sans",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-1.5px",
      lineHeight: 1.12,
    },
    conceptual_split: {
      hookFont: "Plus Jakarta Sans" as const,
      bodyFont: "Inter" as const,
      style: "Modern Grotesk Sans + Two-Tone Keyword Highlight",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-2px",
      lineHeight: 1.15,
    },
    comparison_split: {
      hookFont: "Inter" as const,
      bodyFont: "Inter" as const,
      style: "High-Readability Dual Column Sans",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-1px",
      lineHeight: 1.2,
    },
    vintage_poster: {
      hookFont: "Outfit" as const,
      bodyFont: "Plus Jakarta Sans" as const,
      style: "Warm Organic Display + Balanced Sans",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "2px",
      lineHeight: 1.1,
    },
    saas_dotgrid: {
      hookFont: "Plus Jakarta Sans" as const,
      bodyFont: "Inter" as const,
      style: "Sharp B2B Tech Grotesk + Micro-Chrome",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-1.5px",
      lineHeight: 1.15,
    },
  },
  spatial_budgeting: {
    editorial_magazine: {
      voidRegion: "Upper 40% (y: 0% to 40%)",
      subjectPlacement: "Lower-center third (y: 50% to 100%)",
      cameraDirective:
        "Shot on 80mm f/2.2 lens, shallow depth of field, warm ambient bokeh in upper 40%, clean void for headline overlay",
    },
    conceptual_split: {
      voidRegion: "Right 50% (x: 50% to 100%)",
      subjectPlacement: "Left 50% (x: 0% to 50%)",
      cameraDirective:
        "High-key studio shot, subject isolated on left 45%, clean seamless off-white cyclorama backdrop on right 55%",
    },
    comparison_split: {
      voidRegion: "Top 25% and bottom 20% safe zones",
      subjectPlacement: "Dual contrasting subjects split across vertical center line",
      cameraDirective:
        "Commercial studio composition, 50/50 vertical division with neutral seamless background",
    },
    vintage_poster: {
      voidRegion: "150px outer margin borders on all 4 sides",
      subjectPlacement: "Centered hero product/subject",
      cameraDirective:
        "Top-down clean studio flat-lay or 45-degree angle on warm cream background with generous clean margins",
    },
    saas_dotgrid: {
      voidRegion: "Top-left quadrant (x: 0% to 65%, y: 0% to 50%)",
      subjectPlacement: "Bottom-right quadrant (x: 45% to 100%, y: 40% to 100%)",
      cameraDirective:
        "Isometric 3D product showcase angled in lower-right, clean deep slate-navy void in upper-left",
    },
  },
  color_science: {
    distribution: "60% background photo / 30% neutral typography canvas / 10% high-chroma brand accent",
    scrim_multi_stop: {
      subtle:
        "linear-gradient(to bottom, rgba(20,20,19,0.55) 0%, rgba(20,20,19,0.2) 30%, rgba(0,0,0,0) 55%, rgba(20,20,19,0.7) 100%)",
      medium:
        "linear-gradient(to bottom, rgba(20,10,5,0.75) 0%, rgba(20,10,5,0.3) 30%, rgba(0,0,0,0) 50%, rgba(20,10,5,0.4) 75%, rgba(20,10,5,0.9) 100%)",
      heavy:
        "linear-gradient(to bottom, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.55) 35%, rgba(0,0,0,0.1) 60%, rgba(15,23,42,0.95) 100%)",
    },
  },
} as const;

export const DEFAULT_ARCHETYPE_CONFIGS: Record<
  DesignArchetype,
  {
    name: string;
    negativeSpaceDirective: string;
    suggestedFont: "Plus Jakarta Sans" | "Inter" | "Playfair Display" | "Outfit";
    suggestedBodyFont: "Plus Jakarta Sans" | "Inter" | "Outfit";
    scrimGradient: string;
  }
> = {
  editorial_magazine: {
    name: "Editorial Magazine Cover",
    negativeSpaceDirective:
      DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.editorial_magazine.cameraDirective,
    suggestedFont: "Playfair Display",
    suggestedBodyFont: "Plus Jakarta Sans",
    scrimGradient: DESIGN_KNOWLEDGE_GRAPH.color_science.scrim_multi_stop.medium,
  },
  conceptual_split: {
    name: "Conceptual Asymmetric Split",
    negativeSpaceDirective:
      DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.conceptual_split.cameraDirective,
    suggestedFont: "Plus Jakarta Sans",
    suggestedBodyFont: "Inter",
    scrimGradient:
      "linear-gradient(to right, rgba(20,20,19,0.15) 0%, rgba(20,20,19,0.75) 45%, rgba(20,20,19,0.96) 100%)",
  },
  comparison_split: {
    name: "Side-by-Side Comparison",
    negativeSpaceDirective:
      DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.comparison_split.cameraDirective,
    suggestedFont: "Inter",
    suggestedBodyFont: "Inter",
    scrimGradient:
      "linear-gradient(to bottom, rgba(250,249,245,0.95) 0%, rgba(250,249,245,0.45) 25%, rgba(0,0,0,0) 50%, rgba(20,20,19,0.88) 100%)",
  },
  vintage_poster: {
    name: "Neo-Vintage Poster",
    negativeSpaceDirective:
      DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.vintage_poster.cameraDirective,
    suggestedFont: "Outfit",
    suggestedBodyFont: "Plus Jakarta Sans",
    scrimGradient:
      "linear-gradient(to bottom, rgba(250,247,238,0.94) 0%, rgba(250,247,238,0.35) 25%, rgba(0,0,0,0) 50%, rgba(250,247,238,0.88) 100%)",
  },
  saas_dotgrid: {
    name: "Modern SaaS Dot-Grid",
    negativeSpaceDirective:
      DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.saas_dotgrid.cameraDirective,
    suggestedFont: "Plus Jakarta Sans",
    suggestedBodyFont: "Inter",
    scrimGradient: DESIGN_KNOWLEDGE_GRAPH.color_science.scrim_multi_stop.heavy,
  },
};

