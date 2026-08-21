import { generateObject } from "ai";
import { getLightModel, getGroqModel } from "@/lib/ai-model";
import { DesignSpecification, DesignSpecificationSchema } from "@/lib/schema/layout-dsl";
import { ConceptItem } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";

export class LayoutPlannerAgent {
  /**
   * Compiles a high-level ConceptItem into a deterministic Semantic Design Specification.
   */
  static async compileLayout(
    concept: ConceptItem,
    brand: BrandProfile,
    platform: "instagram" | "linkedin" = "instagram"
  ): Promise<DesignSpecification> {
    const brandColors = brand.visual_identity?.primary_colors || ["#09090b", "#FAF7F2"];
    const accentColor = brand.visual_identity?.secondary_colors?.[0] || "#D97757";

    const systemPrompt = `You are Sapphire's Layout Planner Agent.
Convert the provided concept into a strict Semantic Layout DSL (DesignSpecification).

RULES:
1. CANVAS: 1080x1350 vertical (4:5 portrait).
2. LAYOUT TREE:
   - Must include an "eyebrow" text node or pill_badge (1-3 words).
   - Must include a "hook" text node with the punchy headline (2-7 words).
   - Must include a "subheadline" text node if relevant.
   - May include 2-3 value_card nodes for structured takeaways.
   - Must include a "cta" text node.
   - Must include a scrim_overlay node for contrast protection.
3. BRAND DESIGN TOKENS:
   - Primary: "${brandColors[1] || "#FAF7F2"}"
   - Surface: "#18181b"
   - Accent: "${accentColor}"
   - Brand Name: "${brand.name}"
   - Social Handle: "@${brand.name.toLowerCase().replace(/[^a-z0-9]/g, "")}"`;

    const userPrompt = `Creative Direction: "${concept.creative_direction}"
Visual Style: "${concept.visual_style}"
Composition: "${concept.composition}"
Image Prompt: "${concept.image_prompt}"
Platform: ${platform}`;

    try {
      const model = getLightModel();
      const result = await generateObject({
        model,
        schema: DesignSpecificationSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
      return result.object;
    } catch (err) {
      console.warn("Layout Planner primary model failed, falling back to Groq Llama 3.3:", err);
      const fallbackModel = getGroqModel("llama-3.3-70b-versatile");
      const result = await generateObject({
        model: fallbackModel,
        schema: DesignSpecificationSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
      return result.object;
    }
  }
}
