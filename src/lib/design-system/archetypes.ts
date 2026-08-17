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
  headline: z.string(),
  subheadline: z.string(),
  category_pill: z.string().optional(),
  brand_tagline: z.string().optional(),
  value_props: z.array(z.string()).optional(),
  cta_text: z.string().default("Learn More ➔"),
  social_handle: z.string().default("@sapphire"),
  brand_name: z.string().default("Sapphire"),
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

export const DEFAULT_ARCHETYPE_CONFIGS: Record<
  DesignArchetype,
  {
    name: string;
    negativeSpaceDirective: string;
    suggestedFont: string;
    scrimGradient: string;
  }
> = {
  editorial_magazine: {
    name: "Editorial Magazine Cover",
    negativeSpaceDirective:
      "Subject positioned in the lower-center third, leaving the upper 40% clean and uncluttered with ambient background bokeh for typography.",
    suggestedFont: "Plus Jakarta Sans",
    scrimGradient:
      "linear-gradient(to bottom, rgba(20,10,5,0.7) 0%, rgba(20,10,5,0.15) 25%, rgba(0,0,0,0) 45%, rgba(0,0,0,0) 65%, rgba(20,10,5,0.8) 100%)",
  },
  conceptual_split: {
    name: "Conceptual Asymmetric Split",
    negativeSpaceDirective:
      "Visual subject positioned strictly on the left 50% on a clean seamless light backdrop, leaving the right 50% completely empty for typography.",
    suggestedFont: "Plus Jakarta Sans",
    scrimGradient:
      "linear-gradient(to right, rgba(0,0,0,0) 40%, rgba(20,20,19,0.7) 70%, rgba(20,20,19,0.95) 100%)",
  },
  comparison_split: {
    name: "Side-by-Side Comparison",
    negativeSpaceDirective:
      "Split composition with two contrasting subjects on the left and right halves against clean seamless backgrounds.",
    suggestedFont: "Inter",
    scrimGradient:
      "linear-gradient(to bottom, rgba(20,20,19,0.6) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(20,20,19,0.85) 100%)",
  },
  vintage_poster: {
    name: "Neo-Vintage Poster",
    negativeSpaceDirective:
      "Clean studio shot centered on warm cream seamless background with generous 150px clean margins on all sides.",
    suggestedFont: "Plus Jakarta Sans",
    scrimGradient:
      "linear-gradient(to bottom, rgba(30,15,10,0.4) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(30,15,10,0.6) 100%)",
  },
  saas_dotgrid: {
    name: "Modern SaaS Dot-Grid",
    negativeSpaceDirective:
      "Product UI cards angled in the bottom-right quadrant with clean open space in the top-left quadrant for headline and subtext.",
    suggestedFont: "Inter",
    scrimGradient:
      "linear-gradient(to bottom, rgba(15,23,42,0.6) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(15,23,42,0.85) 100%)",
  },
};
