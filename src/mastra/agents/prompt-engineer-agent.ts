import { generateObject } from "ai";
import { z } from "zod";
import { getReasoningModel } from "@/lib/ai-model";
import { BrandProfile } from "@/lib/schema/brand";
import { DesignKnowledgeItem } from "@/services/design-knowledge";
import { KnowledgeBaseService } from "@/services/kb-loader";

export const EngineeredPromptSchema = z.object({
  optimized_image_prompt: z.string().describe("The precise 9-part structured prompt for Modal Qwen-Image / Cloudflare Flux"),
  negative_prompt: z.string().optional().describe("Negative constraints excluding blurred text, extra logos, watermarks"),
  caption_instagram: z.string().describe("High-engagement Instagram caption with strategic hashtags"),
  headline: z.string().describe("The primary verbatim hook rendered in the image"),
  subheadline: z.string().optional().describe("Supporting value prop"),
  theme_applied: z.string().describe("Name of the design theme applied"),
});

export type EngineeredPromptResult = z.infer<typeof EngineeredPromptSchema>;

export interface MoodboardData {
  theme_name: string;
  category_pill?: string;
  headline: string;
  subheadline?: string;
  color_palette: string[];
  typography_style: string;
  graphic_elements: string;
  brand_tagline?: string;
  cta_text?: string;
  placement?: string; // "feed-single" | "story" | "carousel"
}

export class PromptEngineerAgent {
  /**
   * Translates an approved Moodboard + Brand Context + Knowledge Base into
   * a high-fidelity image prompt following Core Doctrine §8 and Qwen-Image patterns.
   */
  static async engineerPrompt(
    moodboard: MoodboardData,
    brand: BrandProfile,
    designKnowledge?: DesignKnowledgeItem[]
  ): Promise<EngineeredPromptResult> {
    const coreDoctrine = KnowledgeBaseService.getCoreDoctrine();
    const qwenPatterns = KnowledgeBaseService.getQwenPromptPatterns();
    const workedExamples = KnowledgeBaseService.getWorkedExamples(moodboard.theme_name);
    const exampleText = workedExamples.length > 0 ? workedExamples[0].content : "";

    const rulesText = designKnowledge && designKnowledge.length > 0
      ? designKnowledge
          .map((k) => `- ${k.theme_name}: ${k.description}\n  Visual Rules: ${k.composition_rules.visual_hierarchy}`)
          .join("\n")
      : "Single clear focal point, 1080x1350px 4:5 vertical framing, 60/30/10 color rule.";

    const systemPrompt = `You are Sapphire's Principal Social Media Art Director and Prompt Engineer.
You write prompts following CORE DOCTRINE §8 for Modal Qwen-Image 3.0 (with Cloudflare Flux fallback).

PROMPT CONSTRUCTION SCHEMA (MANDATORY 9-PART STRUCTURE):
1. Format & Canvas: "1080x1350px portrait image, 4:5 vertical aspect ratio."
2. Composition & Focal Point: Single clear focal point, rule-of-thirds or centered hero.
3. Style & Medium: Flat-graphic, photographic, editorial, or mixed-media per theme (${moodboard.theme_name}).
4. Color Direction: Explicit brand hex palette [${moodboard.color_palette.join(", ")}], 60/30/10 balance.
5. Text Content, Exact: Every word in literal quotes: "${moodboard.headline}" ${moodboard.subheadline ? `and "${moodboard.subheadline}"` : ""}.
6. Typography Direction: Weight, alignment, letter spacing per style (${moodboard.typography_style}).
7. Logo / Wordmark Placement: Small "${brand.name}" wordmark in corner with 8% clear safe margin.
8. Mood & Lighting: Natural, ambient, or studio qualifiers per theme.
9. Negative Guidance: "no watermarks, no duplicate logos, no distorted text, no busy background".

QWEN-IMAGE TECHNICAL PATTERNS:
${qwenPatterns}

REFERENCE WORKED EXAMPLE:
${exampleText}

RELEVANT KB THEME RULES:
${rulesText}`;

    const userPrompt = `BRAND IDENTITY:
- Name: "${brand.name}" (${brand.industry})
- Positioning: ${brand.positioning || "Premium & Authentic"}
- Colors: [${moodboard.color_palette.join(", ")}]

APPROVED MOODBOARD:
- Theme Archetype: ${moodboard.theme_name}
- Headline Text to Render (Verbatim): "${moodboard.headline}"
- Subheadline / Tagline: "${moodboard.subheadline || moodboard.brand_tagline || ""}"
- Typography Style: ${moodboard.typography_style}
- Graphic Elements / Background: ${moodboard.graphic_elements}
- CTA: "${moodboard.cta_text || ""}"

Construct the 9-part master prompt and write the high-engagement Instagram caption.`;

    try {
      const result = await generateObject({
        model: getReasoningModel(),
        schema: EngineeredPromptSchema,
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.1,
      });

      return result.object;
    } catch (err) {
      console.warn("PromptEngineerAgent fallback:", err);
      const headline = moodboard.headline || `${brand.name} Essential`;
      const colors = moodboard.color_palette.join(" and ");

      return {
        optimized_image_prompt: `1080x1350px portrait image, 4:5 vertical aspect ratio. Composition: Single clear focal point in ${moodboard.theme_name} style. Style: Editorial graphic design, clean layout. Color: Solid palette of ${colors}. Text content, exact: "${headline}" centered in ${moodboard.typography_style}. Logo: "${brand.name}" in bottom corner with 8% safe margin. Mood: Refined, high contrast, 8k. Negative prompt: no watermarks, no distorted text, no duplicate logos.`,
        negative_prompt: "no watermarks, no distorted text, no duplicate logos, no blurry typography",
        caption_instagram: `Elevate your ritual. Discover ${headline} with @${brand.name.toLowerCase().replace(/\s+/g, "")}. ✨ #${brand.name.replace(/\s+/g, "")} #Design #Instagram`,
        headline,
        subheadline: moodboard.subheadline,
        theme_applied: moodboard.theme_name,
      };
    }
  }
}
