import { z } from "zod";
import { BrandProfile } from "@/lib/schema/brand";
import { DesignKnowledgeService } from "@/services/design-knowledge";
import { KnowledgeBaseService } from "@/services/kb-loader";

export const MoodboardPresentationSchema = z.object({
  theme_name: z.string().describe("The selected design theme (e.g. 'bold-typographic-quote', 'minimalist-product', 'editorial-lifestyle', 'ugc-style', 'testimonial-card', 'data-stat-post', 'seasonal-promo', 'founder-story', 'before-after')"),
  content_pillar: z.enum([
    "educational",
    "promotional",
    "behind-the-scenes",
    "social-proof",
    "announcement",
    "entertainment",
    "community",
  ]).describe("The core content pillar driving this post"),
  headline: z.string().describe("The 2-7 word punchy hook to be rendered verbatim in the image"),
  subheadline: z.string().optional().describe("Supporting value prop or nuance"),
  color_palette: z.array(z.string()).describe("3-5 hex colors from brand palette enforcing 60/30/10 balance"),
  typography_style: z.string().describe("Font character and styling (e.g. 'Bold geometric sans', 'High-contrast luxury serif')"),
  graphic_elements: z.string().describe("Visual background elements, textures, lighting, and layout pattern"),
  category_pill: z.string().optional().describe("Uppercase category tag"),
  brand_tagline: z.string().optional().describe("Brand tagline or handle"),
  cta_text: z.string().optional().describe("Action button or swipe copy"),
  reasoning: z.string().describe("Strategic rationale explaining the pillar and theme choice for grid consistency"),
});

export type MoodboardPresentation = z.infer<typeof MoodboardPresentationSchema>;

export class StrategistAgent {
  /**
   * Generates the system prompt for the interactive chat strategist,
   * injecting Core Doctrine §1-§3, Brand DNA, and KB content pillar rules.
   */
  static getSystemPrompt(brand: BrandProfile): string {
    const brandColors = brand.visual_identity?.primary_colors?.join(", ") || "#141413, #FAF9F5";
    const accentColors = brand.visual_identity?.secondary_colors?.join(", ") || "#D97757";

    return `You are Sapphire's Senior Social Media Art Director and Design Strategist for "${brand.name}".
You operate under CORE DOCTRINE: producing Instagram posts that could drop into a client's grid unedited.

BRAND CONTEXT:
- Name: "${brand.name}"
- Industry: ${brand.industry}
- Positioning: ${brand.positioning || "Premium & Authentic"}
- Colors: Primary [${brandColors}], Accent [${accentColors}]
- Tone: ${brand.voice?.tone || "Clear, Confident, Warm"}
- Forbidden Words: ${brand.voice?.forbidden_phrases?.join(", ") || "None"}

OPERATING LOOP:
1. CLASSIFY CONTENT PILLAR: Identify the post's job (Educational, Promotional, Behind-the-scenes, Social proof, Announcement, Entertainment, Community).
2. CLASSIFY PLACEMENT: Feed portrait 4:5 (default 1080x1350), square 1:1, or story 9:16.
3. SELECT VISUAL THEME: Query 'search_design_knowledge' to select an archetype (minimalist-product, bold-typographic-quote, editorial-lifestyle, ugc-style, testimonial-card, data-stat-post, seasonal-promo, founder-story, before-after).
4. RESOLVE BRAND CONFIG: Strict adherence to brand colors [${brandColors}] and tone. Never invent colors.
5. TEXT STRATEGY: Ensure headline is short (1-7 words) and legible at thumbnail size.
6. PRESENT MOODBOARD: Fire 'present_moodboard' to render the visual card for user review.`;
  }

  /**
   * Tool definitions for the Vercel AI SDK `streamText` function.
   */
  static getTools(brand: BrandProfile) {
    return {
      search_design_knowledge: {
        description: "Searches the Knowledge Base for content pillars, theme archetypes, and layout patterns.",
        parameters: z.object({
          query: z.string().describe("Search query (e.g. 'educational tips', 'artisanal product launch', 'customer testimonial')"),
          pillar: z.string().optional().describe("Optional content pillar filter (e.g. 'educational', 'promotional')"),
          theme: z.string().optional().describe("Optional theme archetype filter"),
        }),
        execute: async ({ query, pillar, theme }: { query: string; pillar?: string; theme?: string }) => {
          const results = await DesignKnowledgeService.searchKnowledge(query, 3, { pillar, theme });
          return {
            query,
            themes_found: results.map((r) => ({
              theme: r.theme_name,
              description: r.description,
              suggested_colors: r.composition_rules.recommended_color_palette,
              typography: r.composition_rules.typography_rules,
              visual_rules: r.composition_rules.visual_hierarchy,
            })),
          };
        },
      },
      present_moodboard: {
        description: "Presents the final structured Moodboard card to the user for approval.",
        parameters: MoodboardPresentationSchema,
        execute: async (moodboard: MoodboardPresentation) => {
          return {
            status: "ready_for_approval",
            moodboard,
          };
        },
      },
    };
  }
}
